// Data access layer.
//
// This is the ONLY module routes/components should import for content. Today it
// returns in-memory mock data so the skeleton renders end-to-end without a DB.
// When the Supabase migration lands, swap the bodies of these functions for SQL
// queries (see src/lib/supabase.ts) — the signatures stay the same, so nothing
// downstream changes.

import type { Article, Listing, ListingType, Region } from "./types";

// ---------------------------------------------------------------------------
// Mock seed data. Slugs match real live-site URLs so routes resolve to the same
// paths we must 301-preserve (e.g. /businesses/feed-co).
// ---------------------------------------------------------------------------

const now = "2025-01-30T00:00:00.000Z";

const LISTINGS: Listing[] = [
  {
    id: "1",
    type: "businesses",
    slug: "feed-co",
    title: "Feed Co",
    excerpt: "Stock feed and nutrition supplier serving Canterbury farms.",
    description:
      "<p>Feed Co supplies quality stock feed and nutrition advice to farmers across the South Island.</p>",
    region: "Canterbury",
    town: "Ashburton",
    categories: ["farm-supplies-services", "livestock-pets"],
    rating: 4.8,
    reviewCount: 12,
    phone: "03 555 0100",
    website: "https://example.com",
    status: "approved",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "2",
    type: "businesses",
    slug: "farmgard",
    title: "Farmgard",
    excerpt: "General and electric fencing specialists.",
    description: "<p>Farmgard installs and services rural fencing nationwide.</p>",
    region: "Waikato",
    town: "Hamilton",
    categories: ["general-electric-fencing", "farm-supplies-services"],
    rating: 4.6,
    reviewCount: 8,
    status: "approved",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "3",
    type: "businesses",
    slug: "the-mower-shop-ashburton",
    title: "The Mower Shop Ashburton",
    excerpt: "Sales and service of ride-on mowers and machinery.",
    description: "<p>Your local machinery and implements specialist.</p>",
    region: "Canterbury",
    town: "Ashburton",
    categories: ["machinery-implements", "vehicles-machines"],
    rating: 4.9,
    reviewCount: 21,
    status: "approved",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "4",
    type: "events",
    slug: "canterbury-aamp-p-show-2025",
    title: "Canterbury A&P Show 2025",
    excerpt: "The South Island's premier agricultural show.",
    description: "<p>Three days of livestock, machinery and rural community.</p>",
    region: "Canterbury",
    town: "Christchurch",
    categories: ["events"],
    startsAt: "2025-11-12T09:00:00.000Z",
    endsAt: "2025-11-14T17:00:00.000Z",
    status: "approved",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "5",
    type: "promotions",
    slug: "autumn-fencing-deal",
    title: "Autumn Fencing Deal — 15% off",
    excerpt: "15% off all electric fencing units this autumn.",
    description: "<p>Limited-time discount on fencing energizers.</p>",
    region: "Waikato",
    categories: ["general-electric-fencing"],
    expiresAt: "2025-05-31T00:00:00.000Z",
    status: "approved",
    createdAt: now,
    updatedAt: now,
  },
];

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
  {
    slug: "ai-is-transforming-agriculture",
    title: "AI is Transforming Agriculture",
    excerpt: "From pasture sensors to flock monitoring, AI is reaching the farm.",
    body: "<p>Artificial intelligence is steadily entering rural NZ…</p>",
    publishedAt: "2019-07-08T06:54:55.000Z",
    updatedAt: "2019-07-08T06:54:55.000Z",
  },
];

// ---------------------------------------------------------------------------
// Query API — keep these signatures stable across the DB migration.
// ---------------------------------------------------------------------------

export interface ListingQuery {
  type?: ListingType;
  region?: Region;
  category?: string;
  search?: string;
  page?: number;
  perPage?: number;
}

function isApproved(l: Listing) {
  return l.status === "approved";
}

export async function getListings(query: ListingQuery = {}): Promise<{
  items: Listing[];
  total: number;
}> {
  const { type, region, category, search, page = 1, perPage = 24 } = query;
  let items = LISTINGS.filter(isApproved);

  if (type) items = items.filter((l) => l.type === type);
  if (region) items = items.filter((l) => l.region === region);
  if (category) items = items.filter((l) => l.categories.includes(category));
  if (search) {
    const q = search.toLowerCase();
    items = items.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        l.excerpt.toLowerCase().includes(q),
    );
  }

  const total = items.length;
  const start = (page - 1) * perPage;
  return { items: items.slice(start, start + perPage), total };
}

export async function getListing(
  type: ListingType,
  slug: string,
): Promise<Listing | null> {
  return (
    LISTINGS.find((l) => l.type === type && l.slug === slug && isApproved(l)) ??
    null
  );
}

// All slugs of a type, for generateStaticParams / sitemap.
export async function getListingSlugs(type: ListingType): Promise<string[]> {
  return LISTINGS.filter((l) => l.type === type && isApproved(l)).map(
    (l) => l.slug,
  );
}

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
