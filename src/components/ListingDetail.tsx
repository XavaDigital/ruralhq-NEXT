import type { Listing } from "@/lib/types";
import { categoryName, getRelatedListings, regionName } from "@/lib/data";
import { AdSlot } from "./AdSlot";
import { ListingCard } from "./ListingCard";
import { ListingTabs } from "./ListingTabs";

// Single-listing template, reproducing the live My Listing layout: dark cover
// hero → title + primary (Review/Share/Bookmark) buttons → Profile/Reviews/
// Related tabs → outlined contact-action row → Description card. Clean markup,
// brand styling lifted from the original — no Elementor DOM.

const ICON = {
  star: "M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
  share:
    "M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z",
  bookmark: "M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z",
  directions:
    "M21.71 11.29 12.71 2.29a.996.996 0 0 0-1.41 0l-9 9a.996.996 0 0 0 0 1.41l9 9c.39.39 1.02.39 1.41 0l9-9a.996.996 0 0 0 0-1.41zM14 14.5V12h-4v3H8v-4c0-.55.45-1 1-1h5V7.5l3.5 3.5z",
  phone:
    "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02z",
  globe:
    "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zm6.93 6h-2.95a15.65 15.65 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.92 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14a7.8 7.8 0 0 1 0-4h3.38a16.5 16.5 0 0 0 0 4zm.82 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.99 7.99 0 0 1 5.08 16zm2.95-8H5.08a7.99 7.99 0 0 1 4.33-3.56A15.65 15.65 0 0 0 8.03 8zM12 19.96c-.83-1.2-1.48-2.53-1.91-3.96h3.82c-.43 1.43-1.08 2.76-1.91 3.96zM14.34 14H9.66a14.7 14.7 0 0 1 0-4h4.68a14.7 14.7 0 0 1 0 4zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56zM16.36 14a16.5 16.5 0 0 0 0-4h3.38a7.8 7.8 0 0 1 0 4z",
  list: "M3 13h2v-2H3zm0 4h2v-2H3zm0-8h2V7H3zm4 4h14v-2H7zm0 4h14v-2H7zM7 7v2h14V7z",
  pin: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z",
};

function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d={d} />
    </svg>
  );
}

export async function ListingDetail({ listing }: { listing: Listing }) {
  const related = await getRelatedListings(listing, 6);
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

  const profilePanel = (
    <div className="space-y-6">
      <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-ink">
          <Icon d={ICON.list} className="h-5 w-5 text-brand" />
          Description
        </h2>
        {listing.description ? (
          <div
            className="mt-3 max-w-none text-body leading-relaxed [&_a]:text-brand-dark [&_a]:underline [&>p]:mb-3"
            dangerouslySetInnerHTML={{ __html: listing.description }}
          />
        ) : (
          <p className="mt-3 text-muted">No description provided.</p>
        )}
      </section>

      {listing.categories.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {listing.categories.slice(0, 12).map((slug) => (
            <span
              key={slug}
              className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-600"
            >
              {categoryName(slug) ?? slug}
            </span>
          ))}
        </div>
      ) : null}

      <AdSlot slot="listing-mid" />

      {(listing.address || listing.email || listing.phone) && (
        <section className="rounded-lg border border-gray-200 bg-white p-5 text-sm shadow-sm">
          <h2 className="font-heading font-bold text-ink">Get in touch</h2>
          {listing.address && <p className="mt-2 text-body">{listing.address}</p>}
          {listing.email && (
            <p className="mt-1">
              <span className="text-muted">Email: </span>
              <a href={`mailto:${listing.email}`} className="text-brand-dark">
                {listing.email}
              </a>
            </p>
          )}
          {listing.social && listing.social.length > 0 ? (
            <p className="mt-2 flex flex-wrap gap-3">
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
        </section>
      )}

      {mapSrc ? (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <iframe
            title={`Map of ${listing.title}`}
            src={mapSrc}
            loading="lazy"
            className="h-64 w-full"
          />
        </div>
      ) : null}
    </div>
  );

  const reviewsPanel =
    listing.rating && listing.rating <= 5 && listing.reviewCount ? (
      <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-3xl font-bold text-ink">
          <span className="text-brand">★</span> {listing.rating.toFixed(1)}
        </p>
        <p className="text-sm text-muted">
          Based on {listing.reviewCount} review
          {listing.reviewCount === 1 ? "" : "s"}.
        </p>
      </div>
    ) : (
      <p className="text-muted">No reviews yet.</p>
    );

  const relatedPanel =
    related.length > 0 ? (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((l) => (
          <ListingCard key={l.id} listing={l} />
        ))}
      </div>
    ) : (
      <p className="text-muted">Nothing related yet.</p>
    );

  return (
    <article>
      {/* Dark cover hero */}
      <div className="relative bg-ink">
        {listing.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.coverUrl}
            alt=""
            className="h-44 w-full object-cover opacity-90 sm:h-60"
          />
        ) : (
          <div className="flex h-32 items-center justify-center sm:h-44">
            <Icon d={ICON.pin} className="h-14 w-14 text-brand/40" />
          </div>
        )}
      </div>

      <div className="container-rhq">
        {/* Title + primary actions */}
        <div className="flex flex-col gap-4 py-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            {listing.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={listing.logoUrl}
                alt=""
                className="-mt-12 h-20 w-20 shrink-0 rounded-lg border border-gray-200 bg-white object-contain p-1 shadow-sm"
              />
            ) : null}
            <div>
              <h1 className="font-heading text-3xl font-bold text-ink">
                {listing.title}
              </h1>
              {listing.tagline ? (
                <p className="mt-1 text-body">{listing.tagline}</p>
              ) : null}
              <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-muted">
                {location ? <span>{location}</span> : null}
                {listing.rating && listing.rating <= 5 && listing.reviewCount ? (
                  <span>
                    <span className="text-brand">★</span>{" "}
                    {listing.rating.toFixed(1)} ({listing.reviewCount})
                  </span>
                ) : null}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2.5">
            <PrimaryButton icon={ICON.star} label="Review" />
            <PrimaryButton icon={ICON.share} label="Share" />
            <PrimaryButton icon={ICON.bookmark} label="Bookmark" />
          </div>
        </div>

        {/* Contact action row (outlined, scrollable on mobile) */}
        <div className="flex gap-3 overflow-x-auto border-t border-gray-100 py-4">
          {directions ? (
            <ActionButton
              icon={ICON.directions}
              label="Get directions"
              href={directions}
            />
          ) : null}
          {listing.phone ? (
            <ActionButton
              icon={ICON.phone}
              label="Call now"
              href={`tel:${listing.phone.replace(/\s+/g, "")}`}
            />
          ) : null}
          {listing.website ? (
            <ActionButton
              icon={ICON.globe}
              label="Website"
              href={listing.website}
              external
            />
          ) : null}
        </div>

        {/* Tabs */}
        <div className="pb-12">
          <ListingTabs
            tabs={[
              { id: "profile", label: "Profile", panel: profilePanel },
              {
                id: "reviews",
                label: `Reviews (${listing.reviewCount ?? 0})`,
                panel: reviewsPanel,
              },
              { id: "related", label: "Related", panel: relatedPanel },
            ]}
          />
        </div>
      </div>
    </article>
  );
}

// Green filled social buttons (Review / Share / Bookmark).
function PrimaryButton({ icon, label }: { icon: string; label: string }) {
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1.5 rounded bg-brand px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
    >
      <Icon d={icon} className="h-4 w-4" />
      {label}
    </button>
  );
}

// Outlined contact buttons (Get directions / Call now / Website).
function ActionButton({
  icon,
  label,
  href,
  external,
}: {
  icon: string;
  label: string;
  href: string;
  external?: boolean;
}) {
  return (
    <a
      href={href}
      {...(external ? { rel: "nofollow noopener", target: "_blank" } : {})}
      className="inline-flex shrink-0 items-center gap-1.5 rounded border border-gray-300 px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand-dark"
    >
      <Icon d={icon} className="h-4 w-4 text-brand" />
      {label}
    </a>
  );
}

