// SEO helpers: schema.org JSON-LD builders + canonical site config.
//
// Matching the live site's structured data is critical for preserving rankings
// and rich results. Rank Math currently emits LocalBusiness / Event /
// JobPosting / BreadcrumbList / AggregateRating — we reproduce equivalents here.

import type { Article, Listing } from "./types";
import { regionName } from "./data";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ruralhq.co.nz";
export const SITE_NAME = "RuralHQ";

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

// On the live site every listing — businesses AND contractors — resolves under
// the /businesses/ base (/contractors/{slug} 301s to /businesses/{slug}). We
// preserve that so existing URLs/rankings are kept; "Contractors" is a browse
// section, not a separate URL namespace.
export function listingPath(listing: Pick<Listing, "slug">) {
  return `/businesses/${listing.slug}`;
}

/** schema.org LocalBusiness for a business/contractor listing. */
export function listingJsonLd(listing: Listing) {
  const url = absoluteUrl(listingPath(listing));
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: listing.title,
    description: listing.tagline || listing.excerpt,
    url,
    ...(listing.imageUrl ? { image: listing.imageUrl } : {}),
    ...(listing.phone ? { telephone: listing.phone } : {}),
    ...(listing.website ? { sameAs: listing.website } : {}),
    address: {
      "@type": "PostalAddress",
      ...(listing.town ? { addressLocality: listing.town } : {}),
      ...(regionName(listing.regionSlug)
        ? { addressRegion: regionName(listing.regionSlug) }
        : {}),
      addressCountry: "NZ",
    },
  };

  if (typeof listing.lat === "number" && typeof listing.lng === "number") {
    data.geo = {
      "@type": "GeoCoordinates",
      latitude: listing.lat,
      longitude: listing.lng,
    };
  }
  if (listing.rating && listing.reviewCount) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: listing.rating,
      reviewCount: listing.reviewCount,
    };
  }
  return data;
}

export function articleJsonLd(article: Article) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    url: absoluteUrl(`/${article.slug}`),
    ...(article.imageUrl ? { image: article.imageUrl } : {}),
    publisher: { "@type": "Organization", name: SITE_NAME },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
