// Core domain model for RuralHQ, derived from the live WordPress data model
// (My Listing / WP Job Manager). See migration/_report.txt for the field survey.
//
// Two directory post types are carried forward for now:
//   - "businesses"  ← job_listing posts whose _case27_listing_type = businesses
//   - "contractors" ← the separate `contractors` post type
// The other My Listing types (events/promotions/jobs/classifieds) exist but are
// effectively empty, so they're deferred (the model can extend to them later).

export type ListingType = "businesses" | "contractors";

export const LISTING_TYPES: ListingType[] = ["businesses", "contractors"];

export const LISTING_TYPE_LABEL: Record<ListingType, string> = {
  businesses: "Business",
  contractors: "Contractor",
};

export type ModerationStatus = "pending" | "approved" | "rejected" | "flagged";

// A taxonomy term (region or category). Hierarchical: `parentSlug` is null for
// top-level terms. Regions = 16 top-level + district children; categories =
// ~249 terms several levels deep.
export interface Term {
  slug: string;
  name: string;
  parentSlug: string | null;
}

export interface SocialLink {
  network: string; // Facebook, Instagram, Twitter, …
  url: string;
}

export interface Listing {
  id: string;
  type: ListingType;
  slug: string;
  title: string;
  tagline?: string;
  excerpt: string;
  description: string; // HTML

  // Location
  address?: string; // formatted address string (_job_location)
  regionSlug?: string; // primary region
  town?: string;
  lat?: number;
  lng?: number;

  // Taxonomy
  categories: string[]; // category slugs

  // Contact
  phone?: string;
  email?: string;
  website?: string;
  social?: SocialLink[];

  // Media
  logoUrl?: string;
  coverUrl?: string;
  imageUrl?: string; // primary/featured image used on cards
  gallery?: string[];

  // Signals
  rating?: number; // _case27_average_rating, 0-5
  reviewCount?: number;
  featured?: boolean;
  claimed?: boolean;

  // Moderation / lifecycle
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
  aiGenerated?: boolean;
}
