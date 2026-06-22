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

// The original 2019 newsfeed articles (the feed lapsed after these). New posts
// will come from the AI news-synopsis pipeline.
const ARTICLES: Article[] = [
  {
    slug: "improving-the-value-of-strong-wool",
    title: "Improving the value of strong wool",
    excerpt:
      "The value of strong wool can be increased by breeding programmes that aim to improve selected traits. This article provides some information on 6 of them.",
    body: "<p>The value of strong wool can be increased by breeding programmes that aim to improve selected traits…</p>",
    category: "Farming",
    author: "Jack Holloway",
    publishedAt: "2019-07-12T00:00:00.000Z",
    updatedAt: "2019-07-12T00:00:00.000Z",
  },
  {
    slug: "ai-is-transforming-agriculture",
    title: "How AI is Transforming Agriculture",
    excerpt:
      "Undeniably, agriculture and farming is being reshaped by artificial intelligence — from pasture sensors to flock monitoring.",
    body: "<p>Undeniably, agriculture and farming is being reshaped by artificial intelligence…</p>",
    category: "Farming",
    author: "Jack Holloway",
    publishedAt: "2019-07-08T00:00:00.000Z",
    updatedAt: "2019-07-08T00:00:00.000Z",
  },
  {
    slug: "alternatives-to-radiata-pine-in-new-zealand-forestry",
    title: "Alternatives to Radiata pine in New Zealand Forestry",
    excerpt:
      "I sat down with Pete Gatehouse from the Central Canterbury Farm Forestry Group to talk about some of the less common tree species that have potential.",
    body: "<p>I sat down with Pete Gatehouse from the Central Canterbury Farm Forestry Group…</p>",
    category: "Forestry",
    author: "Jack Holloway",
    publishedAt: "2019-07-04T00:00:00.000Z",
    updatedAt: "2019-07-04T00:00:00.000Z",
  },
  {
    slug: "feeding-dairy-cows-during-the-transition-period",
    title: "Feeding dairy cows during the transition period",
    excerpt:
      "Is more milk produced by improving feeding either before, or after, calving? I investigate the research to see if I can figure it out.",
    body: "<p>Is more milk produced by improving feeding either before, or after, calving?…</p>",
    category: "Farming",
    author: "Jack Holloway",
    publishedAt: "2019-07-03T00:00:00.000Z",
    updatedAt: "2019-07-03T00:00:00.000Z",
  },
  {
    slug: "how-many-stock-units-are-ewe-really-running",
    title: "How many stock units are ewe really running?",
    excerpt:
      "It would be fair to assume that a stock unit is a thoroughly defined, easily applicable measurement. However, when it comes to sheep, there are notable discrepancies in its use.",
    body: "<p>It would be fair to assume that a stock unit is a thoroughly defined, easily applicable measurement…</p>",
    category: "Farming",
    author: "Jack Holloway",
    publishedAt: "2019-07-02T00:00:00.000Z",
    updatedAt: "2019-07-02T00:00:00.000Z",
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

export async function getArticles(query?: string): Promise<Article[]> {
  let items = [...ARTICLES];
  if (query) {
    const q = query.toLowerCase();
    items = items.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q),
    );
  }
  return items.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
}

export function getArticleCategories(): string[] {
  return [...new Set(ARTICLES.map((a) => a.category).filter(Boolean))] as string[];
}

export async function getArticle(slug: string): Promise<Article | null> {
  return ARTICLES.find((a) => a.slug === slug) ?? null;
}

export async function getArticleSlugs(): Promise<string[]> {
  return ARTICLES.map((a) => a.slug);
}
