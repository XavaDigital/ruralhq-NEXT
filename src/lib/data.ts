// Data access layer — the ONLY module routes/components import for content.
//
// Two backends behind one API: when DATABASE_URL is set, listing queries hit
// Postgres (db.ts); otherwise they read the committed JSON seed + file-based
// submission store. Regions/categories always come from the JSON taxonomies
// (small, static — used for synchronous name lookups and facet options).

import listingsJson from "@/data/listings.json";
import regionsJson from "@/data/regions.json";
import categoriesJson from "@/data/categories.json";
import type { Article, Listing, ListingType, Term } from "./types";
import { getApprovedSubmissionListings } from "./submissions";
import {
  usingDb,
  dbGetListings,
  dbGetListingBySlug,
  dbGetAllListings,
  dbGetAllListingSlugs,
  dbGetContractorListings,
  dbGetRelated,
} from "./db";

const SEED = listingsJson as unknown as Listing[];

// Live pool = seed listings + any approved user submissions, so a reviewer's
// approval shows up in the directory immediately (in dev). With Supabase this
// becomes a single table query.
async function pool(): Promise<Listing[]> {
  const subs = await getApprovedSubmissionListings();
  return subs.length ? [...subs, ...SEED] : SEED;
}
const REGIONS = regionsJson as Term[];
const CATEGORIES = categoriesJson as Term[];

// Articles weren't migrated (the newsfeed lapsed in 2019). Seed a couple so the
// "Read" section renders; real articles will come from the AI news pipeline.
const ARTICLES: Article[] = [
  {
    slug: "improving-the-value-of-strong-wool",
    title: "Improving the Value of Strong Wool",
    excerpt:
      "Strong wool prices have languished for years — here's what's changing.",
    body: "<p>Industry initiatives are working to lift strong wool returns…</p>",
    publishedAt: "2019-07-11T23:18:53.000Z",
    updatedAt: "2019-07-11T23:18:53.000Z",
  },
];

// ---------------------------------------------------------------------------
// Taxonomy helpers
// ---------------------------------------------------------------------------

export function getRegions(): Term[] {
  return REGIONS;
}

export function getTopRegions(): Term[] {
  return REGIONS.filter((r) => !r.parentSlug);
}

export function getTopCategories(): Term[] {
  return CATEGORIES.filter((c) => !c.parentSlug);
}

const REGION_NAME = new Map(REGIONS.map((r) => [r.slug, r.name]));
const CATEGORY_NAME = new Map(CATEGORIES.map((c) => [c.slug, c.name]));

export function regionName(slug?: string): string | undefined {
  return slug ? REGION_NAME.get(slug) : undefined;
}

export function categoryName(slug?: string): string | undefined {
  return slug ? CATEGORY_NAME.get(slug) : undefined;
}

// The "Contractors" section is businesses tagged with the Rural Contractors
// category tree (root slug "contractors") — matching the live 301 behaviour,
// since the old contractors post type was a duplicate of businesses.
const CONTRACTOR_CATEGORIES: Set<string> = (() => {
  const set = new Set<string>(["contractors"]);
  for (let changed = true; changed; ) {
    changed = false;
    for (const c of CATEGORIES) {
      if (c.parentSlug && set.has(c.parentSlug) && !set.has(c.slug)) {
        set.add(c.slug);
        changed = true;
      }
    }
  }
  return set;
})();

export async function getContractorListings(
  query: { page?: number; perPage?: number } = {},
): Promise<{ items: Listing[]; total: number }> {
  const { page = 1, perPage = 36 } = query;
  if (usingDb) {
    return dbGetContractorListings([...CONTRACTOR_CATEGORIES], page, perPage);
  }
  const items = (await pool()).filter((l) =>
    l.categories.some((c) => CONTRACTOR_CATEGORIES.has(c)),
  );
  const start = (page - 1) * perPage;
  return { items: items.slice(start, start + perPage), total: items.length };
}

// Slugs of a region's descendants (so filtering by a top region includes its
// districts).
function regionWithDescendants(slug: string): Set<string> {
  const out = new Set([slug]);
  for (const r of REGIONS) {
    if (r.parentSlug && out.has(r.parentSlug)) out.add(r.slug);
  }
  return out;
}

// ---------------------------------------------------------------------------
// Listing query API
// ---------------------------------------------------------------------------

export type ListingOrder = "featured" | "newest" | "rating";

export interface ListingQuery {
  type?: ListingType;
  region?: string; // region slug
  category?: string; // category slug
  search?: string;
  order?: ListingOrder;
  page?: number;
  perPage?: number;
}

export async function getListings(query: ListingQuery = {}): Promise<{
  items: Listing[];
  total: number;
}> {
  const { type, region, category, search, order = "featured", page = 1, perPage = 24 } = query;
  if (usingDb) {
    return dbGetListings({
      type,
      category,
      search,
      order,
      page,
      perPage,
      regionSlugs: region ? [...regionWithDescendants(region)] : undefined,
    });
  }

  let items = await pool();

  if (type) items = items.filter((l) => l.type === type);
  if (region) {
    const allowed = regionWithDescendants(region);
    items = items.filter((l) => l.regionSlug && allowed.has(l.regionSlug));
  }
  if (category) items = items.filter((l) => l.categories.includes(category));
  if (search) {
    const q = search.toLowerCase();
    items = items.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        (l.tagline ?? "").toLowerCase().includes(q) ||
        l.excerpt.toLowerCase().includes(q),
    );
  }

  items = sortListings(items, order);
  const total = items.length;
  const start = (page - 1) * perPage;
  return { items: items.slice(start, start + perPage), total };
}

function sortListings(items: Listing[], order: ListingOrder): Listing[] {
  const copy = [...items];
  if (order === "newest") {
    copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } else if (order === "rating") {
    copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
  } else {
    copy.sort(
      (a, b) =>
        Number(b.featured) - Number(a.featured) ||
        (b.rating ?? 0) - (a.rating ?? 0) ||
        (b.reviewCount ?? 0) - (a.reviewCount ?? 0),
    );
  }
  return copy;
}

// Both businesses and contractors share the /businesses/{slug} URL base, so the
// detail route resolves by slug alone.
export async function getListingBySlug(slug: string): Promise<Listing | null> {
  if (usingDb) return dbGetListingBySlug(slug);
  return (await pool()).find((l) => l.slug === slug) ?? null;
}

export async function getAllListingSlugs(): Promise<string[]> {
  // Used for static params. Approved submissions render on-demand
  // (dynamicParams), so the seed/DB-approved slugs are enough to prebuild.
  if (usingDb) return dbGetAllListingSlugs();
  return SEED.map((l) => l.slug);
}

export async function getAllListings(): Promise<Listing[]> {
  if (usingDb) return dbGetAllListings();
  return pool();
}

// "You May Also Be Interested In" — same type, sharing a category or region,
// nearest first by shared categories.
export async function getRelatedListings(
  listing: Listing,
  limit = 3,
): Promise<Listing[]> {
  if (usingDb) return dbGetRelated(listing, limit);
  const cats = new Set(listing.categories);
  return SEED.filter((l) => l.id !== listing.id && l.type === listing.type)
    .map((l) => ({
      l,
      score:
        l.categories.filter((c) => cats.has(c)).length +
        (l.regionSlug && l.regionSlug === listing.regionSlug ? 1 : 0),
    }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.l);
}

// ---------------------------------------------------------------------------
// Articles
// ---------------------------------------------------------------------------

export async function getArticles(): Promise<Article[]> {
  return [...ARTICLES].sort((a, b) =>
    b.publishedAt.localeCompare(a.publishedAt),
  );
}

export async function getArticle(slug: string): Promise<Article | null> {
  return ARTICLES.find((a) => a.slug === slug) ?? null;
}

export async function getArticleSlugs(): Promise<string[]> {
  return ARTICLES.map((a) => a.slug);
}
