# RuralHQ — WordPress → Next.js migration spec

Living document. Captures what the live site is, the URL/SEO contract we must
preserve, the target architecture, and the data model. Update as we learn more
(especially once we have database access).

## 1. Source site (as-is)

- **Platform:** WordPress + **My Listing** theme (27collective), built on **WP Job Manager**.
- **SEO plugin:** **Rank Math** (emits schema.org + XML sitemaps).
- **Built by:** Xava Digital (us).
- **Content model:** one `job_listing` post type split by a listing-type
  taxonomy into **businesses, promotions, events, jobs**, plus standard WP
  **posts** for the newsfeed. Organised by **category** and **NZ region**.
- **Why replatform:** My Listing is heavy (page builder + per-request CSS/JS +
  admin-ajax search that caches poorly). For a read-heavy, AdSense-funded
  directory that's the wrong cost/performance profile.

## 2. URL contract (preserve exactly — this protects rankings)

Confirmed from the live sitemaps:

| Content | Pattern | Example |
| --- | --- | --- |
| Business listing | `/businesses/{slug}/` | `/businesses/feed-co/` |
| Event listing | `/events/{slug}/` | (verify exact prefix from DB) |
| Promotion listing | `/promotions/{slug}/` | (verify exact prefix) |
| Job listing | `/jobs/{slug}/` | (verify exact prefix) |
| Article | `/{slug}/` (root level) | `/improving-the-value-of-strong-wool/` |
| Explore hubs | `/explore/explore-businesses/` etc. | |
| Discover hubs | `/discover/featured/`, `/recently-added/`, `/highest-rated/` | |

> ⚠️ The event/promotion/job path prefixes are assumed by analogy to
> `/businesses/`. **Confirm the real rewrite slugs from the DB / a crawl before
> launch** and adjust the route folders if they differ. Every old URL needs a
> 1:1 200 (same path) or 301 to its new home.

Scale: ~14 `job_listing` child sitemaps + 2 listing-category sitemaps ⇒ a few
thousand listings. Newsfeed: **stale since July 2019** (most recent post
lastmod). Listings updated as recently as Jan 2025.

## 3. SEO requirements

- 1:1 URL preservation or 301 map (above).
- Reproduce schema.org: `LocalBusiness`, `Event`, `JobPosting`,
  `BreadcrumbList`, `AggregateRating`, `NewsArticle` — implemented in
  `src/lib/seo.ts`.
- Match titles, meta descriptions, canonical tags, OG tags.
- Dynamic `sitemap.xml` + `robots.txt` (`src/app/sitemap.ts`, `robots.ts`).
- **Pre-launch:** crawl the live site with Screaming Frog to snapshot exactly
  what Google sees (titles/meta/schema/canonicals) and diff against the rebuild.
- Keep layout/format close so behavioural signals don't shift (see §6).

## 4. Target architecture

- **Next.js 16 (App Router) + React 19**, SSR/ISR — real HTML for crawlers and
  AdSense; static-generate listing/article pages, revalidate on edit.
- **Supabase** (Postgres + auth + storage) — public reads via RLS; service-role
  only in server moderation/cron routes.
- **Search:** Postgres full-text to start; add **Meilisearch/Typesense** for
  instant typo-tolerant facet search if needed.
- **AI moderation:** `POST /api/moderate` — Claude classifies legit vs spam on
  submit. Start human-in-the-loop; auto-approve only above a high confidence
  threshold.
- **AI news:** `POST /api/news` (cron) — Claude writes short rural-NZ synopses
  as drafts; human approval before auto-publish initially.
- **AdSense:** `AdSlot` component + library loaded once in layout; works because
  pages are server-rendered.
- **Hosting:** host-agnostic standard Next.js build (decision deferred — Vercel
  vs self-host/Cloudflare). No Vercel-only APIs used.

## 5. Data model (see `src/lib/types.ts`)

`Listing` (discriminated by `type`) · `Article` · `Category` · `Region` (16 NZ
regions) · `ModerationStatus`. The data layer (`src/lib/data.ts`) exposes a
stable query API backed by mock data today; swap the function bodies for
Supabase queries when the DB lands — nothing downstream changes.

### WordPress → Postgres ETL (when DB access is available)

1. Export `wp_posts` where `post_type = 'job_listing'` and `post_status =
   'publish'`; join `wp_postmeta` for fields (My Listing stores most listing
   fields as `_case27_*` / job-manager meta keys, often JSON).
2. Map the listing-type taxonomy term → our `ListingType`.
3. Map region + category taxonomies → `region` / `categories`.
4. Export `wp_posts` where `post_type = 'post'` → `Article`.
5. Migrate users/reviews (WP Job Manager reviews or comments) as needed.
6. **Verify:** assert row counts and spot-check field parity vs source; build
   the 301 map from the exported permalinks.

## 6. Frontend parity ("keep styling identical")

Strategy: change the tech, not the look — isolates SEO risk.

1. Lift the compiled My Listing CSS from the live site; keep it largely as-is.
2. Rebuild each of ~6 templates (home, category/archive, listing detail, event,
   article, dashboard) to emit the **same DOM structure + class names** so the
   existing CSS applies unchanged.
3. Visual-diff old vs new per template at multiple breakpoints (pixel, not
   eyeball).
4. Rebuild only the interactive widgets (live search/filter, maps, review forms)
   as real components, styled to match.

Result: indistinguishable to visitors, but lighter (page-builder + dead CSS
stripped). The current scaffold uses placeholder Tailwind styling — the
CSS-lift happens once we can capture real rendered template HTML.

## 7. Open items / next steps

- [ ] Get DB access → run the ETL, confirm real URL prefixes, build 301 map.
- [ ] Screaming Frog crawl → SEO snapshot for diffing.
- [ ] Capture real template HTML → lift CSS for pixel parity.
- [ ] Decide hosting.
- [ ] Wire Supabase (replace mock data layer).
- [ ] Wire Anthropic into `/api/moderate` and `/api/news`.
- [ ] Build the authenticated "Add Listing" submission flow + review queue.
