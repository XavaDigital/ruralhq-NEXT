#!/usr/bin/env python3
"""Inspect a WordPress mysqldump without a running DB.

Streams the .sql file and extracts only what we need for the RuralHQ migration:
- post_type / post_status counts (what content actually exists)
- postmeta key inventory attributed to listings (the real Listing field shape)
- taxonomies with term counts (regions, listing categories, listing types)
- existing redirects (Redirection + Rank Math) — must be preserved
- one full sample listing's meta

Usage: python migration/inspect_dump.py path/to/dump.sql
"""

import sys
from collections import Counter, defaultdict

DUMP = sys.argv[1] if len(sys.argv) > 1 else "pbyacgvpat.sql"
PREFIX = "wpnd_"  # live table prefix

# mysqldump backslash escape sequences -> real characters.
_ESCAPES = {"n": "\n", "r": "\r", "t": "\t", "0": "\0", "b": "\b", "Z": "\x1a"}


def iter_rows(path, table):
    """Yield each row (list of str/None) for `table`. Handles phpMyAdmin-style
    column-qualified, multi-line INSERTs where a single quoted value (e.g.
    post_content) may span many physical lines."""
    start = f"INSERT INTO `{table}` "
    with open(path, "r", encoding="utf-8", errors="replace") as fh:
        line = fh.readline()
        while line:
            if line.startswith(start):
                idx = line.find(" VALUES")
                remainder = line[idx + 7:] if idx != -1 else ""
                yield from _consume(fh, remainder)
            line = fh.readline()


def _fieldval(field, was_str):
    if was_str:
        return "".join(field)
    tok = "".join(field).strip()
    return None if tok == "" or tok.upper() == "NULL" else tok


def _consume(fh, first):
    """Stream characters from `first` + subsequent file lines, parsing tuples
    until a top-level ';' ends the statement. Maintains string/escape state
    across line boundaries."""
    in_str = esc = was_str = in_tuple = False
    row, field = [], []
    buf = first
    while True:
        for ch in buf:
            if in_str:
                if esc:
                    field.append(_ESCAPES.get(ch, ch))
                    esc = False
                elif ch == "\\":
                    esc = True
                elif ch == "'":
                    in_str = False
                else:
                    field.append(ch)
                continue
            if ch == "'":
                in_str = True
                was_str = True
                field = []  # discard any inter-field whitespace before the quote
            elif ch == "(" and not in_tuple:
                in_tuple = True
                row, field, was_str = [], [], False
            elif ch == "," and in_tuple:
                row.append(_fieldval(field, was_str))
                field, was_str = [], False
            elif ch == ")" and in_tuple:
                row.append(_fieldval(field, was_str))
                yield row
                in_tuple = False
            elif ch == ";" and not in_tuple:
                return
            elif in_tuple:
                field.append(ch)
        buf = fh.readline()
        if not buf:
            return


LISTING_TYPES = ("job_listing", "contractors")  # the two directory post types


def main():
    # --- Pass 1: posts (id -> type), counts, taxonomies, redirects -----------
    post_type = {}
    type_status = Counter()
    type_defs = []           # case27_listing_type definitions (title, slug)
    sample = {t: None for t in LISTING_TYPES}  # one publish sample per type
    for r in iter_rows(DUMP, f"{PREFIX}posts"):
        # 0=ID 5=title 7=status 11=name 18=guid 20=post_type
        pid, title, status, name, guid, ptype = r[0], r[5], r[7], r[11], r[18], r[20]
        post_type[pid] = ptype
        type_status[(ptype, status)] += 1
        if ptype == "case27_listing_type":
            type_defs.append((title, name))
        if ptype in sample and status == "publish" and sample[ptype] is None:
            sample[ptype] = (pid, title, name, guid)

    print("=== post_type / post_status counts ===")
    for (ptype, status), n in sorted(type_status.items(), key=lambda x: -x[1]):
        print(f"{n:>7}  {ptype:<24} {status}")

    print("\n=== case27_listing_type definitions (the listing 'types') ===")
    for title, slug in type_defs:
        print(f"   {slug:<28} {title}")

    print("\n=== sample post per directory type (id | title | slug | guid) ===")
    for t, s in sample.items():
        print(f"   {t}: {s}")

    # terms & taxonomy
    term_name, term_slug = {}, {}
    for r in iter_rows(DUMP, f"{PREFIX}terms"):
        term_name[r[0]] = r[1]
        term_slug[r[0]] = r[2]
    tax_terms = defaultdict(list)
    for r in iter_rows(DUMP, f"{PREFIX}term_taxonomy"):
        # 0=tt_id 1=term_id 2=taxonomy 4=parent 5=count
        tax_terms[r[2]].append((term_name.get(r[1], "?"), term_slug.get(r[1], "?"), r[5], r[4]))

    print("\n=== taxonomies (term count) ===")
    for tax, terms in sorted(tax_terms.items(), key=lambda x: -len(x[1])):
        print(f"\n-- {tax}  ({len(terms)} terms)")
        for name, slug, cnt, parent in sorted(terms, key=lambda t: -int(t[2] or 0))[:40]:
            par = "" if parent in (None, "0") else f"  (child of {parent})"
            print(f"   {cnt:>5}  {slug:<40} {name}{par}")

    # redirects
    print("\n=== redirects: wpnd_redirection_items (source -> target) ===")
    n = 0
    for r in iter_rows(DUMP, f"{PREFIX}redirection_items"):
        # id,url,regex,position,last_count,last_access,group_id,status,action_type,action_code,action_data,...
        src, target = r[1], r[10]
        if n < 25:
            print(f"   {src}  ->  {target}")
        n += 1
    print(f"   ...total redirection_items rows: {n}")

    n_rm = sum(1 for _ in iter_rows(DUMP, f"{PREFIX}rank_math_redirections"))
    print(f"   rank_math_redirections rows: {n_rm}")

    # --- Pass 2: postmeta keys attributed to each directory type ------------
    type_of = {pid: t for pid, t in post_type.items() if t in LISTING_TYPES}
    counts = {t: Counter() for t in LISTING_TYPES}
    n_by_type = Counter(type_of.values())
    sample_ids = {s[0]: t for t, s in sample.items() if s}
    sample_meta = defaultdict(list)
    for r in iter_rows(DUMP, f"{PREFIX}postmeta"):
        post_id, key, val = r[1], r[2], r[3]
        t = type_of.get(post_id)
        if t:
            counts[t][key] += 1
        if post_id in sample_ids:
            sample_meta[post_id].append((key, (val or "")[:140]))

    for t in LISTING_TYPES:
        print(f"\n=== postmeta keys on {t} ({n_by_type[t]} posts) ===")
        for key, cnt in counts[t].most_common(70):
            print(f"   {cnt:>6}  {key}")

    for pid, t in sample_ids.items():
        print(f"\n=== sample {t} meta (post {pid}) ===")
        for key, val in sample_meta[pid]:
            print(f"   {key} = {val}")


if __name__ == "__main__":
    main()
