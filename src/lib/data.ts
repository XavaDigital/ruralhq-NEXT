// Data access layer.
//
// Reads real seed data exported from the live WordPress DB by migration/etl.py
// (a representative SAMPLE of listings + the full region/category taxonomies).
// This is the ONLY module routes/components import for content. When the
// Supabase migration lands, swap these function bodies for SQL queries — the
// signatures stay the same.

import listingsJson from "@/data/listings.json";
import regionsJson from "@/data/regions.json";
import categoriesJson from "@/data/categories.json";
import type { Article, Listing, ListingType, Term } from "./types";

const LISTINGS = listingsJson as unknown as Listing[];
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

export interface ListingQuery {
  type?: ListingType;
  region?: string; // region slug
  category?: string; // category slug
  search?: string;
  page?: number;
  perPage?: number;
}

export async function getListings(query: ListingQuery = {}): Promise<{
  items: Listing[];
  total: number;
}> {
  const { type, region, category, search, page = 1, perPage = 24 } = query;
  let items = LISTINGS;

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

  const total = items.length;
  const start = (page - 1) * perPage;
  return { items: items.slice(start, start + perPage), total };
}

// Both businesses and contractors share the /businesses/{slug} URL base, so the
// detail route resolves by slug alone.
export async function getListingBySlug(slug: string): Promise<Listing | null> {
  return LISTINGS.find((l) => l.slug === slug) ?? null;
}

export async function getAllListingSlugs(): Promise<string[]> {
  return LISTINGS.map((l) => l.slug);
}

export async function getAllListings(): Promise<Listing[]> {
  return LISTINGS;
}

// "You May Also Be Interested In" — same type, sharing a category or region,
// nearest first by shared categories.
export async function getRelatedListings(
  listing: Listing,
  limit = 3,
): Promise<Listing[]> {
  const cats = new Set(listing.categories);
  return LISTINGS.filter((l) => l.id !== listing.id && l.type === listing.type)
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
