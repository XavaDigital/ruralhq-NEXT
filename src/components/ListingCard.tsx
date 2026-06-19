import Link from "next/link";
import type { Listing } from "@/lib/types";
import { LISTING_TYPE_LABEL } from "@/lib/types";
import { listingPath } from "@/lib/seo";

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <Link
      href={listingPath(listing)}
      className="block rounded-lg border border-gray-200 bg-white p-4 transition hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
          {LISTING_TYPE_LABEL[listing.type]}
        </span>
        {listing.rating ? (
          <span className="text-xs text-gray-500">
            ★ {listing.rating.toFixed(1)} ({listing.reviewCount})
          </span>
        ) : null}
      </div>
      <h3 className="mt-2 font-semibold text-gray-900">{listing.title}</h3>
      <p className="mt-1 text-sm text-gray-600">{listing.excerpt}</p>
      <p className="mt-2 text-xs text-gray-400">
        {[listing.town, listing.region].filter(Boolean).join(", ")}
      </p>
    </Link>
  );
}
