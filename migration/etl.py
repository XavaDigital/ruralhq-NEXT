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

    # 6a) Fold contractors into businesses. The `contractors` post type is ~98%
    # duplicate of businesses (same entities — the live site 301s
    # /contractors/{slug} -> /businesses/{slug}). So we drop the duplicates and
    # keep only the genuinely-unique contractors, imported as businesses. The
    # "Contractors" section is a category-filtered view of businesses, matching
    # the live behaviour. (Contractor *categories* already live on businesses.)
    # Match on normalized title: ~511 dupes share an exact slug, but ~1,022
    # share the same entity title (slug variants), so title is the true key.
    biz_titles = {x["title"].strip().lower() for x in listings["businesses"]}
    unique_contractors = [
        c for c in listings["contractors"]
        if c["title"].strip().lower() not in biz_titles
    ]
    for c in unique_contractors:
        c["type"] = "businesses"
    listings["businesses"].extend(unique_contractors)
    print(f"dropped {len(listings['contractors']) - len(unique_contractors)} "
          f"duplicate contractors; folded {len(unique_contractors)} unique ones "
          f"into businesses")
    listings["contractors"] = []

    # 6b) Safety net: ensure globally-unique slugs (should be a no-op now).
    seen, collisions = set(), 0
    for x in listings["businesses"] + listings["contractors"]:
        if x["slug"] in seen:
            n = 2
            while f"{x['slug']}-{n}" in seen:
                n += 1
            x["slug"] = f"{x['slug']}-{n}"
            collisions += 1
        seen.add(x["slug"])
    if collisions:
        print(f"resolved {collisions} slug collision(s)")

    # 7) Sample for the app seed. Split between contractor-category and other
    # businesses so the /contractors section has content in the prototype.
    parent_of = {c["slug"]: c["parentSlug"] for c in tax_terms["job_listing_category"]}

    def is_contractor_cat(slug):
        seen = set()
        while slug and slug not in seen:
            if slug == "contractors":
                return True
            seen.add(slug)
            slug = parent_of.get(slug)
        return False

    contractor_cats = {s for s in parent_of if is_contractor_cat(s)}
    biz = listings["businesses"]
    biz.sort(key=lambda x: (x["featured"], x["rating"] or 0,
                            x["reviewCount"] or 0), reverse=True)
    contractor_biz, other_biz = [], []
    for b in biz:
        (contractor_biz if any(c in contractor_cats for c in b["categories"])
         else other_biz).append(b)
    out = contractor_biz[:140] + other_biz[:140]
    _write("listings.json", out)

    # Full dataset -> Supabase seed SQL (gitignored; regenerate from the dump).
    emit_sql(listings, tax_terms)

    print(f"businesses (incl. folded unique contractors): {len(biz)}")
    print(f"sample: {len(out)} ({len(contractor_biz[:140])} contractor-category "
          f"+ {len(other_biz[:140])} other)")
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


# ---------------------------------------------------------------------------
# Supabase seed SQL (full dataset). Postgres standard_conforming_strings is on
# by default, so backslashes are literal — we only double single quotes.
# ---------------------------------------------------------------------------
SEED_SQL = os.path.join("supabase", "seed.sql")
LISTING_COLS = (
    "id,type,slug,title,tagline,excerpt,description,address,region_slug,town,"
    "lat,lng,categories,phone,email,website,social,logo_url,cover_url,image_url,"
    "rating,review_count,featured,claimed,status,created_at,updated_at"
)


def _q(v):
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int, float)):
        return repr(v)
    return "'" + str(v).replace("'", "''") + "'"


def _q_ts(v):
    if not v or str(v).startswith("0000"):
        return "now()"
    return "'" + str(v).replace("'", "''") + "'"


def _q_arr(items):
    # slugs are [a-z0-9-], safe to embed in a text[] literal
    return "'{}'" if not items else "'{" + ",".join(f'"{i}"' for i in items) + "}'"


def _q_jsonb(obj):
    return "'" + json.dumps(obj, ensure_ascii=False).replace("'", "''") + "'::jsonb"


def emit_sql(listings, tax_terms):
    os.makedirs("supabase", exist_ok=True)
    with open(SEED_SQL, "w", encoding="utf-8") as fh:
        fh.write("-- Generated by migration/etl.py — full dataset. Do not edit.\n")
        fh.write("begin;\n\n")

        fh.write("insert into regions (slug, name, parent_slug) values\n")
        fh.write(",\n".join(
            f"({_q(r['slug'])},{_q(r['name'])},{_q(r['parentSlug'])})"
            for r in tax_terms["region"]
        ) + "\non conflict (slug) do nothing;\n\n")

        fh.write("insert into categories (slug, name, parent_slug) values\n")
        fh.write(",\n".join(
            f"({_q(c['slug'])},{_q(c['name'])},{_q(c['parentSlug'])})"
            for c in tax_terms["job_listing_category"]
        ) + "\non conflict (slug) do nothing;\n\n")

        rows = listings["businesses"] + listings["contractors"]
        for i in range(0, len(rows), 500):
            fh.write(f"insert into listings ({LISTING_COLS}) values\n")
            fh.write(",\n".join(
                "(" + ",".join([
                    _q(x["id"]), _q(x["type"]), _q(x["slug"]), _q(x["title"]),
                    _q(x["tagline"]), _q(x["excerpt"]), _q(x["description"]),
                    _q(x["address"]), _q(x["regionSlug"]), _q(x["town"]),
                    _q(x["lat"]), _q(x["lng"]), _q_arr(x["categories"]),
                    _q(x["phone"]), _q(x["email"]), _q(x["website"]),
                    _q_jsonb(x["social"]), _q(x["logoUrl"]), _q(x["coverUrl"]),
                    _q(x["imageUrl"]), _q(x["rating"]), _q(x["reviewCount"] or 0),
                    _q(x["featured"]), _q(x["claimed"]), _q(x["status"]),
                    _q_ts(x["createdAt"]), _q_ts(x["updatedAt"]),
                ]) + ")"
                for x in rows[i:i + 500]
            ) + "\non conflict (id) do nothing;\n\n")

        fh.write("commit;\n")


if __name__ == "__main__":
    main()
