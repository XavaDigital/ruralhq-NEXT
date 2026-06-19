import type { Listing } from "@/lib/types";
import { LISTING_TYPE_LABEL } from "@/lib/types";
import { AdSlot } from "./AdSlot";

// Single-listing template. One component serves all four listing types — the
// type-specific bits (event dates, promo expiry, job/business contact) are
// rendered conditionally, mirroring the shared My Listing detail layout.

export function ListingDetail({ listing }: { listing: Listing }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
        {LISTING_TYPE_LABEL[listing.type]}
      </span>
      <h1 className="mt-3 text-3xl font-bold text-gray-900">{listing.title}</h1>
      <p className="mt-1 text-sm text-gray-500">
        {[listing.town, listing.region].filter(Boolean).join(", ")}
      </p>

      {listing.rating ? (
        <p className="mt-2 text-sm text-gray-600">
          ★ {listing.rating.toFixed(1)} from {listing.reviewCount} reviews
        </p>
      ) : null}

      {listing.type === "events" && listing.startsAt ? (
        <p className="mt-2 text-sm font-medium text-gray-800">
          {new Date(listing.startsAt).toLocaleDateString("en-NZ")}
          {listing.endsAt
            ? ` – ${new Date(listing.endsAt).toLocaleDateString("en-NZ")}`
            : ""}
        </p>
      ) : null}

      {listing.type === "promotions" && listing.expiresAt ? (
        <p className="mt-2 text-sm font-medium text-red-700">
          Expires {new Date(listing.expiresAt).toLocaleDateString("en-NZ")}
        </p>
      ) : null}

      <div className="my-6">
        <AdSlot slot="listing-top" />
      </div>

      <div
        className="prose prose-sm max-w-none text-gray-800"
        dangerouslySetInnerHTML={{ __html: listing.description }}
      />

      {(listing.phone || listing.email || listing.website) && (
        <div className="mt-8 rounded-lg border border-gray-200 p-4 text-sm">
          <h2 className="font-semibold text-gray-900">Contact</h2>
          {listing.phone && <p className="mt-1">Phone: {listing.phone}</p>}
          {listing.email && <p className="mt-1">Email: {listing.email}</p>}
          {listing.website && (
            <p className="mt-1">
              <a
                href={listing.website}
                rel="nofollow noopener"
                className="text-green-700 underline"
              >
                Visit website
              </a>
            </p>
          )}
        </div>
      )}
    </article>
  );
}
