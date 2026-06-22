import Link from "next/link";
import type { Listing } from "@/lib/types";
import { LISTING_TYPE_LABEL } from "@/lib/types";
import { listingPath } from "@/lib/seo";
import { regionName } from "@/lib/data";

export function ListingCard({ listing }: { listing: Listing }) {
  const location = [listing.town, regionName(listing.regionSlug)]
    .filter(Boolean)
    .join(", ");

  return (
    <Link
      href={listingPath(listing)}
      className="group block overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:border-brand/40 hover:shadow-md"
    >
      {listing.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={listing.imageUrl}
          alt=""
          className="h-32 w-full object-cover"
        />
      ) : null}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className="rounded bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand-dark">
            {LISTING_TYPE_LABEL[listing.type]}
          </span>
          {listing.rating && listing.rating <= 5 && listing.reviewCount ? (
            <span className="text-xs text-muted">
              <span className="text-brand">★</span> {listing.rating.toFixed(1)} (
              {listing.reviewCount})
            </span>
          ) : null}
        </div>
        <h3 className="mt-2 font-slab font-semibold text-ink group-hover:text-brand">
          {listing.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-body">
          {listing.tagline || listing.excerpt}
        </p>
        {location ? (
          <p className="mt-2 text-xs text-muted">{location}</p>
        ) : null}
      </div>
    </Link>
  );
}
