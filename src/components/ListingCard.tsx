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
      className="block overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:shadow-md"
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
          <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
            {LISTING_TYPE_LABEL[listing.type]}
          </span>
          {listing.rating && listing.reviewCount ? (
            <span className="text-xs text-gray-500">
              ★ {listing.rating.toFixed(1)} ({listing.reviewCount})
            </span>
          ) : null}
        </div>
        <h3 className="mt-2 font-semibold text-gray-900">{listing.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-gray-600">
          {listing.tagline || listing.excerpt}
        </p>
        {location ? (
          <p className="mt-2 text-xs text-gray-400">{location}</p>
        ) : null}
      </div>
    </Link>
  );
}
