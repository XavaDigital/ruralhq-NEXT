import type { Listing } from "@/lib/types";
import { LISTING_TYPE_LABEL } from "@/lib/types";
import { categoryName, regionName } from "@/lib/data";
import { AdSlot } from "./AdSlot";

// Single-listing template for businesses and contractors. The two share a
// layout; contractors simply carry fewer fields (no tagline/logo/social), which
// degrade gracefully.

export function ListingDetail({ listing }: { listing: Listing }) {
  const location = [listing.town, regionName(listing.regionSlug)]
    .filter(Boolean)
    .join(", ");

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      {listing.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={listing.coverUrl}
          alt=""
          className="mb-6 h-56 w-full rounded-lg object-cover"
        />
      ) : null}

      <div className="flex items-start gap-4">
        {listing.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.logoUrl}
            alt=""
            className="h-16 w-16 shrink-0 rounded border border-gray-200 object-contain"
          />
        ) : null}
        <div>
          <span className="rounded bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand-dark">
            {LISTING_TYPE_LABEL[listing.type]}
          </span>
          <h1 className="mt-2 font-slab text-3xl font-bold text-ink">
            {listing.title}
          </h1>
          {listing.tagline ? (
            <p className="mt-1 text-body">{listing.tagline}</p>
          ) : null}
          {location ? (
            <p className="mt-1 text-sm text-muted">{location}</p>
          ) : null}
          {listing.rating && listing.reviewCount ? (
            <p className="mt-1 text-sm text-body">
              <span className="text-brand">★</span> {listing.rating.toFixed(1)}{" "}
              from {listing.reviewCount} reviews
            </p>
          ) : null}
        </div>
      </div>

      {listing.categories.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {listing.categories.slice(0, 8).map((slug) => (
            <span
              key={slug}
              className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600"
            >
              {categoryName(slug) ?? slug}
            </span>
          ))}
        </div>
      ) : null}

      <div className="my-6">
        <AdSlot slot="listing-top" />
      </div>

      {listing.description ? (
        <div
          className="prose prose-sm max-w-none text-gray-800"
          dangerouslySetInnerHTML={{ __html: listing.description }}
        />
      ) : null}

      <div className="mt-8 rounded-lg border border-gray-200 p-4 text-sm">
        <h2 className="font-semibold text-gray-900">Contact</h2>
        {listing.address && <p className="mt-1">{listing.address}</p>}
        {listing.phone && <p className="mt-1">Phone: {listing.phone}</p>}
        {listing.email && <p className="mt-1">Email: {listing.email}</p>}
        {listing.website && (
          <p className="mt-1">
            <a
              href={listing.website}
              rel="nofollow noopener"
              target="_blank"
              className="text-brand-dark underline"
            >
              Visit website
            </a>
          </p>
        )}
        {listing.social && listing.social.length > 0 ? (
          <p className="mt-2 flex gap-3">
            {listing.social.map((s) => (
              <a
                key={s.url}
                href={s.url}
                rel="nofollow noopener"
                target="_blank"
                className="text-brand-dark underline"
              >
                {s.network}
              </a>
            ))}
          </p>
        ) : null}
      </div>
    </article>
  );
}
