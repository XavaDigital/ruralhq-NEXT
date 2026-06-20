#!/usr/bin/env python3
"""Transform the WordPress dump into seed JSON for the Next.js app.

Emits into src/data/:
  - regions.json      hierarchical region terms (16 + districts)
  - categories.json   hierarchical job_listing_category terms (~249)
  - listings.json     a representative SAMPLE of real listings (businesses +
                      contractors), enough to make the directory/search feel
                      real. The full migration target is Supabase, not this file.

Usage: python migration/etl.py [dump.sql]

Notes
- Listing meta values are PHP-serialized; we extract URLs/social links with
  small regexes rather than a full unserializer (good enough for seed data).
- Decisions baked in (see chat): businesses-only from job_listing, contractors
  kept as their own type, full region hierarchy, published only.
"""

import html
import json
import os
import re
import sys
from collections import defaultdict

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from inspect_dump import iter_rows, PREFIX  # noqa: E402

DUMP = sys.argv[1] if len(sys.argv) > 1 else "pbyacgvpat.sql"
OUT_DIR = os.path.join("src", "data")
SAMPLE = {"businesses": 200, "contractors": 80}

# PHP-serialized string value: s:<len>:"....."
_PHP_STR = re.compile(r's:\d+:"((?:[^"\\]|\\.)*)"')
_URL = re.compile(r'https?://[^\s"\']+')


def clean(s):
    return html.unescape(s).strip() if s else s


def first_url(blob):
    if not blob:
        return None
    m = _URL.search(blob)
    return m.group(0) if m else None


def parse_links(blob):
    """_links: a:N:{i:0;a:2:{s:7:"network";s:..:"X";s:3:"url";s:..:"Y";}...}"""
    if not blob:
        return []
    parts = _PHP_STR.findall(blob)
    out, i = [], 0
    # parts is a flat list like [network,"Facebook","url","https://..", ...]
    while i < len(parts) - 1:
        if parts[i] == "network" and i + 3 < len(parts) and parts[i + 2] == "url":
            net, url = parts[i + 1], parts[i + 3]
            if url.startswith("http"):
                out.append({"network": net, "url": url})
            i += 4
        else:
            i += 1
    return out


def main():
    # 1) terms: term_id -> (name, slug)
    name_by_id, slug_by_id = {}, {}
    for r in iter_rows(DUMP, f"{PREFIX}terms"):
        name_by_id[r[0]] = clean(r[1])
        slug_by_id[r[0]] = r[2]

    # 2) term_taxonomy: build hierarchical term lists + tt_id -> (taxonomy, slug)
    tt_lookup = {}            # tt_id -> (taxonomy, term_slug)
    tax_terms = defaultdict(list)
    for r in iter_rows(DUMP, f"{PREFIX}term_taxonomy"):
        tt_id, term_id, taxonomy, parent = r[0], r[1], r[2], r[4]
        slug = slug_by_id.get(term_id)
        if not slug:
            continue
        tt_lookup[tt_id] = (taxonomy, slug)
        if taxonomy in ("region", "job_listing_category"):
            parent_slug = slug_by_id.get(parent) if parent not in (None, "0") else None
            tax_terms[taxonomy].append(
                {"slug": slug, "name": name_by_id.get(term_id, slug),
                 "parentSlug": parent_slug}
            )

    os.makedirs(OUT_DIR, exist_ok=True)
    _write("regions.json", tax_terms["region"])
    _write("categories.json", tax_terms["job_listing_category"])

    # 3) posts: collect candidate directory posts (published)
    posts = {}
    for r in iter_rows(DUMP, f"{PREFIX}posts"):
        pid, content, title, status, name = r[0], r[4], r[5], r[7], r[11]
        modified, ptype = r[14], r[20]
        if status != "publish" or ptype not in ("job_listing", "contractors"):
            continue
        posts[pid] = {
            "id": pid, "post_type": ptype, "slug": name, "title": clean(title),
            "content": content or "", "createdAt": r[2], "updatedAt": modified,
            "meta": {},
        }

    # 4) postmeta: gather the fields we render
    WANT = {
        "_job_tagline", "_job_description", "_job_phone", "_job_email",
        "_job_website", "_job_location", "_job_logo", "_job_cover",
        "_featured-image", "_links", "geolocation_lat", "geolocation_long",
        "geolocation_city", "_case27_average_rating", "_case27_review_count",
        "_featured", "_claimed", "_case27_listing_type",
    }
    for r in iter_rows(DUMP, f"{PREFIX}postmeta"):
        pid, key, val = r[1], r[2], r[3]
        p = posts.get(pid)
        if p and key in WANT:
            p["meta"][key] = val

    # 5) term_relationships: post -> region/category slugs
    regions_of = defaultdict(list)
    cats_of = defaultdict(list)
    for r in iter_rows(DUMP, f"{PREFIX}term_relationships"):
        obj, tt_id = r[0], r[1]
        if obj not in posts:
            continue
        tax_slug = tt_lookup.get(tt_id)
        if not tax_slug:
            continue
        tax, slug = tax_slug
        if tax == "region":
            regions_of[obj].append(slug)
        elif tax == "job_listing_category":
            cats_of[obj].append(slug)

    # 6) compose Listing records
    listings = {"businesses": [], "contractors": []}
    for pid, p in posts.items():
        m = p["meta"]
        if p["post_type"] == "job_listing":
            if m.get("_case27_listing_type") != "businesses":
                continue  # businesses-only for now
            ltype = "businesses"
        else:
            ltype = "contractors"

        desc = clean(m.get("_job_description")) or p["content"]
        regions = regions_of.get(pid, [])
        listings[ltype].append({
            "id": pid,
            "type": ltype,
            "slug": p["slug"],
            "title": p["title"],
            "tagline": clean(m.get("_job_tagline")) or None,
            "excerpt": _excerpt(desc),
            "description": _as_html(desc),
            "address": clean(m.get("_job_location")) or None,
            "regionSlug": _primary_region(regions),
            "town": clean(m.get("geolocation_city")) or None,
            "lat": _num(m.get("geolocation_lat")),
            "lng": _num(m.get("geolocation_long")),
            "categories": sorted(set(cats_of.get(pid, []))),
            "phone": clean(m.get("_job_phone")) or None,
            "email": clean(m.get("_job_email")) or None,
            "website": clean(m.get("_job_website")) or None,
            "social": parse_links(m.get("_links")),
            "logoUrl": first_url(m.get("_job_logo")),
            "coverUrl": first_url(m.get("_job_cover")),
            "imageUrl": first_url(m.get("_featured-image"))
                        or first_url(m.get("_job_cover")),
            "rating": _num(m.get("_case27_average_rating")) or None,
            "reviewCount": _int(m.get("_case27_review_count")),
            "featured": m.get("_featured") == "1",
            "claimed": m.get("_claimed") == "1",
            "status": "approved",
            "createdAt": p["createdAt"],
            "updatedAt": p["updatedAt"],
        })

    # 7) sample (variety via featured/rating sort) and write
    out = []
    for ltype, n in SAMPLE.items():
        rows = listings[ltype]
        rows.sort(key=lambda x: (x["featured"], x["rating"] or 0,
                                 x["reviewCount"] or 0), reverse=True)
        out.extend(rows[:n])
    _write("listings.json", out)

    print(f"businesses: {len(listings['businesses'])} total, "
          f"{min(len(listings['businesses']), SAMPLE['businesses'])} sampled")
    print(f"contractors: {len(listings['contractors'])} total, "
          f"{min(len(listings['contractors']), SAMPLE['contractors'])} sampled")
    print(f"regions: {len(tax_terms['region'])}, "
          f"categories: {len(tax_terms['job_listing_category'])}")


def _primary_region(slugs):
    # prefer a district (child) over an "all-<region>" umbrella term
    districts = [s for s in slugs if not s.startswith("all")]
    return (districts or slugs or [None])[0]


def _excerpt(text, n=160):
    plain = re.sub(r"<[^>]+>", "", text or "").strip()
    return (plain[: n - 1] + "…") if len(plain) > n else plain


def _as_html(text):
    text = (text or "").strip()
    if not text:
        return ""
    if "<" in text and ">" in text:
        return text
    return "".join(f"<p>{p.strip()}</p>" for p in text.split("\n\n") if p.strip())


def _num(v):
    try:
        return round(float(v), 6)
    except (TypeError, ValueError):
        return None


def _int(v):
    try:
        return int(v)
    except (TypeError, ValueError):
        return None


def _write(name, data):
    with open(os.path.join(OUT_DIR, name), "w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=0)


if __name__ == "__main__":
    main()
