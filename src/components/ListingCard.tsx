import Link from "next/link";
import type { Listing } from "@/lib/types";
import { listingPath } from "@/lib/seo";
import { categoryName, regionName } from "@/lib/data";

// Listing card, matching the My Listing "listing-preview" grid item: cover/logo
// area (with a placeholder when none), featured ribbon, category, slab title,
// tagline, and a location row.

export function ListingCard({ listing }: { listing: Listing }) {
  const location = [listing.town, regionName(listing.regionSlug)]
    .filter(Boolean)
    .join(", ");
  const primaryCategory = listing.categories[0]
    ? categoryName(listing.categories[0])
    : null;

  return (
    <Link
      href={listingPath(listing)}
      className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md"
    >
      <div className="relative h-36 overflow-hidden">
        {listing.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand/15 to-ink/10">
            <span className="font-slab text-3xl font-bold text-brand/50">
              {listing.title.slice(0, 1)}
            </span>
          </div>
        )}
        {listing.featured ? (
          <span className="absolute left-0 top-3 rounded-r bg-brand px-2 py-0.5 text-xs font-semibold text-white shadow">
            Featured
          </span>
        ) : null}
        {listing.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.logoUrl}
            alt=""
            className="absolute -bottom-5 right-3 h-12 w-12 rounded-full border-2 border-white bg-white object-contain shadow"
          />
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        {primaryCategory ? (
          <span className="text-xs font-medium uppercase tracking-wide text-brand-dark">
            {primaryCategory}
          </span>
        ) : null}
        <h3 className="mt-1 font-slab font-semibold text-ink group-hover:text-brand">
          {listing.title}
        </h3>
        {listing.tagline || listing.excerpt ? (
          <p className="mt-1 line-clamp-2 text-sm text-body">
            {listing.tagline || listing.excerpt}
          </p>
        ) : null}
        <div className="mt-auto flex items-center justify-between pt-3 text-xs text-muted">
          {location ? (
            <span className="inline-flex items-center gap-1">
              <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5 text-brand">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z" />
              </svg>
              {location}
            </span>
          ) : (
            <span />
          )}
          {listing.rating && listing.rating <= 5 && listing.reviewCount ? (
            <span>
              <span className="text-brand">★</span> {listing.rating.toFixed(1)}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
