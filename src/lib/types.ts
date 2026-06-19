// Core domain model for RuralHQ.
//
// In the live WordPress site every listing (business, promotion, event, job) is
// a single `job_listing` post type from WP Job Manager, separated by a
// listing-type taxonomy. We mirror that here as one `Listing` shape
// discriminated by `type`, which keeps the migration a near 1:1 mapping.

export type ListingType = "businesses" | "promotions" | "events" | "jobs";

export const LISTING_TYPES: ListingType[] = [
  "businesses",
  "promotions",
  "events",
  "jobs",
];

// Singular labels for UI / schema.org mapping.
export const LISTING_TYPE_LABEL: Record<ListingType, string> = {
  businesses: "Business",
  promotions: "Promotion",
  events: "Event",
  jobs: "Job",
};

// The 16 NZ regions used as the primary location facet (matches the live site).
export const REGIONS = [
  "Northland",
  "Auckland",
  "Waikato",
  "Bay of Plenty",
  "Gisborne",
  "Hawke's Bay",
  "Taranaki",
  "Manawatu-Whanganui",
  "Wellington",
  "Tasman",
  "Nelson",
  "Marlborough",
  "West Coast",
  "Canterbury",
  "Otago",
  "Southland",
] as const;

export type Region = (typeof REGIONS)[number];

export type ModerationStatus = "pending" | "approved" | "rejected" | "flagged";

export interface Category {
  slug: string;
  name: string;
}

export interface Listing {
  id: string;
  type: ListingType;
  slug: string;
  title: string;
  excerpt: string;
  description: string; // HTML or markdown body
  region: Region;
  town?: string;
  categories: string[]; // category slugs
  rating?: number; // aggregate, 0-5
  reviewCount?: number;
  imageUrl?: string;
  phone?: string;
  email?: string;
  website?: string;
  // Event-specific
  startsAt?: string; // ISO
  endsAt?: string;
  // Promotion-specific
  expiresAt?: string;
  // Moderation
  status: ModerationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Article {
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  imageUrl?: string;
  publishedAt: string;
  updatedAt: string;
  // True when produced by the AI news-synopsis pipeline (for disclosure/UI).
  aiGenerated?: boolean;
}
