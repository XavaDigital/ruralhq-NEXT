// SEO helpers: schema.org JSON-LD builders + canonical site config.
//
// Matching the live site's structured data is critical for preserving rankings
// and rich results. Rank Math currently emits LocalBusiness / Event /
// JobPosting / BreadcrumbList / AggregateRating — we reproduce equivalents here.

import type { Article, Listing } from "./types";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://ruralhq.co.nz";
export const SITE_NAME = "RuralHQ";

export function absoluteUrl(path: string) {
  return new URL(path, SITE_URL).toString();
}

export function listingPath(listing: Pick<Listing, "type" | "slug">) {
  return `/${listing.type}/${listing.slug}`;
}

/** Map a listing to the appropriate schema.org type. */
export function listingJsonLd(listing: Listing) {
  const url = absoluteUrl(listingPath(listing));
  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    name: listing.title,
    description: listing.excerpt,
    url,
    ...(listing.imageUrl ? { image: listing.imageUrl } : {}),
  };

  if (listing.rating && listing.reviewCount) {
    base.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: listing.rating,
      reviewCount: listing.reviewCount,
    };
  }

  switch (listing.type) {
    case "events":
      return {
        ...base,
        "@type": "Event",
        startDate: listing.startsAt,
        endDate: listing.endsAt,
        eventStatus: "https://schema.org/EventScheduled",
        location: {
          "@type": "Place",
          name: listing.town ?? listing.region,
          address: { "@type": "PostalAddress", addressRegion: listing.region },
        },
      };
    case "jobs":
      return {
        ...base,
        "@type": "JobPosting",
        title: listing.title,
        datePosted: listing.createdAt,
        jobLocation: {
          "@type": "Place",
          address: { "@type": "PostalAddress", addressRegion: listing.region },
        },
      };
    default:
      return {
        ...base,
        "@type": "LocalBusiness",
        telephone: listing.phone,
        address: {
          "@type": "PostalAddress",
          addressLocality: listing.town,
          addressRegion: listing.region,
          addressCountry: "NZ",
        },
      };
  }
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
