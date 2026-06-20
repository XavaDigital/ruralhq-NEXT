import type { Listing } from "@/lib/types";
import { LISTING_TYPE_LABEL } from "@/lib/types";
import { categoryName, getRelatedListings, regionName } from "@/lib/data";
import { AdSlot } from "./AdSlot";
import { ListingCard } from "./ListingCard";

// Single-listing template — mirrors the live My Listing layout: cover banner +
// overlapping header card (logo/title/rating/actions), a two-column body
// (description + contact/map sidebar) and a "You May Also Be Interested In"
// related-listings row. Businesses and contractors share it; missing fields
// degrade gracefully.

export async function ListingDetail({ listing }: { listing: Listing }) {
  const related = await getRelatedListings(listing, 3);
  const location = [listing.town, regionName(listing.regionSlug)]
    .filter(Boolean)
    .join(", ");
  const hasGeo =
    typeof listing.lat === "number" && typeof listing.lng === "number";
  const mapSrc = hasGeo
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${listing.lng! - 0.02}%2C${listing.lat! - 0.02}%2C${listing.lng! + 0.02}%2C${listing.lat! + 0.02}&layer=mapnik&marker=${listing.lat}%2C${listing.lng}`
    : null;
  const directions = hasGeo
    ? `https://www.google.com/maps/dir/?api=1&destination=${listing.lat},${listing.lng}`
    : null;

  return (
    <article>
      {/* Cover banner */}
      {listing.coverUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={listing.coverUrl}
          alt=""
          className="h-48 w-full object-cover sm:h-64"
        />
      ) : (
        <div className="h-24 bg-gradient-to-r from-brand to-brand-dark sm:h-32" />
      )}

      <div className="container-rhq">
        {/* Header card overlapping the banner */}
        <div className="-mt-12 flex flex-col gap-4 rounded-lg border border-gray-200 bg-white p-5 shadow-sm sm:-mt-16 sm:flex-row sm:items-end">
          {listing.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.logoUrl}
              alt=""
              className="h-20 w-20 shrink-0 rounded-lg border border-gray-200 bg-white object-contain p-1"
            />
          ) : null}
          <div className="flex-1">
            <span className="rounded bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand-dark">
              {LISTING_TYPE_LABEL[listing.type]}
            </span>
            <h1 className="mt-2 font-slab text-2xl font-bold text-ink sm:text-3xl">
              {listing.title}
            </h1>
            {listing.tagline ? (
              <p className="mt-1 text-body">{listing.tagline}</p>
            ) : null}
            <div className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-muted">
              {location ? <span>{location}</span> : null}
              {listing.rating && listing.reviewCount ? (
                <span>
                  <span className="text-brand">★</span>{" "}
                  {listing.rating.toFixed(1)} ({listing.reviewCount})
                </span>
              ) : null}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {listing.phone ? (
              <a
                href={`tel:${listing.phone.replace(/\s+/g, "")}`}
                className="rounded bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Call
              </a>
            ) : null}
            {listing.website ? (
              <a
                href={listing.website}
                rel="nofollow noopener"
                target="_blank"
                className="rounded border border-brand px-4 py-2 text-sm font-semibold text-brand-dark hover:bg-brand/5"
              >
                Website
              </a>
            ) : null}
            {directions ? (
              <a
                href={directions}
                rel="noopener"
                target="_blank"
                className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold text-ink hover:bg-gray-50"
              >
                Directions
              </a>
            ) : null}
          </div>
        </div>

        {/* Body: content + sidebar */}
        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <main className="lg:col-span-2">
            {listing.categories.length > 0 ? (
              <div className="mb-6 flex flex-wrap gap-2">
                {listing.categories.slice(0, 10).map((slug) => (
                  <span
                    key={slug}
                    className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600"
                  >
                    {categoryName(slug) ?? slug}
                  </span>
                ))}
              </div>
            ) : null}

            {listing.description ? (
              <>
                <h2 className="font-slab text-lg font-bold text-ink">About</h2>
                <div
                  className="mt-2 max-w-none text-body leading-relaxed [&_a]:text-brand-dark [&_a]:underline [&>p]:mb-3"
                  dangerouslySetInnerHTML={{ __html: listing.description }}
                />
              </>
            ) : null}

            <div className="my-8">
              <AdSlot slot="listing-mid" />
            </div>
          </main>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
            <div className="rounded-lg border border-gray-200 p-4 text-sm">
              <h2 className="font-slab font-bold text-ink">Get in touch</h2>
              {listing.address && (
                <p className="mt-2 text-body">{listing.address}</p>
              )}
              {listing.phone && (
                <p className="mt-2">
                  <span className="text-muted">Phone: </span>
                  <a
                    href={`tel:${listing.phone.replace(/\s+/g, "")}`}
                    className="text-brand-dark"
                  >
                    {listing.phone}
                  </a>
                </p>
              )}
              {listing.email && (
                <p className="mt-1">
                  <span className="text-muted">Email: </span>
                  <a href={`mailto:${listing.email}`} className="text-brand-dark">
                    {listing.email}
                  </a>
                </p>
              )}
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
                <p className="mt-3 flex flex-wrap gap-3">
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

            {mapSrc ? (
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <iframe
                  title={`Map of ${listing.title}`}
                  src={mapSrc}
                  loading="lazy"
                  className="h-56 w-full"
                />
              </div>
            ) : null}
          </aside>
        </div>

        {/* Related listings */}
        {related.length > 0 ? (
          <section className="mt-12 border-t border-gray-100 pt-8">
            <h2 className="font-slab text-xl font-bold text-ink">
              You May Also Be Interested In
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </article>
  );
}
