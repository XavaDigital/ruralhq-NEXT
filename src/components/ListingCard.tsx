import Link from "next/link";
import type { Listing } from "@/lib/types";
import { listingPath } from "@/lib/seo";
import { categoryName, regionName } from "@/lib/data";

// Listing card matching the live My Listing "lf-type-2" preview: dark cover with
// a green pin placeholder, a quick-action button, verified check, a green
// category chip with a "+N" overflow count, and zoom/favourite icons. On hover
// the white panel expands OVER the card below to reveal the full description
// (CSS-only — the outer wrapper reserves the collapsed height; the inner panel
// is absolutely positioned and overflows downward with a shadow + raised
// z-index on hover).

const P = {
  pin: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z",
  bolt: "M7 2v11h3v9l7-12h-4l4-8z",
  bookmark: "M17 3H7c-1.1 0-2 .9-2 2v16l7-3 7 3V5c0-1.1-.9-2-2-2z",
  check: "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8z",
  zoom: "M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z",
  heart:
    "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z",
};

function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d={d} />
    </svg>
  );
}

export function ListingCard({ listing }: { listing: Listing }) {
  const location = [listing.town, regionName(listing.regionSlug)]
    .filter(Boolean)
    .join(", ");
  const primaryCategory = listing.categories[0]
    ? categoryName(listing.categories[0])
    : null;
  const extraCount = Math.max(0, listing.categories.length - 1);

  return (
    <Link
      href={listingPath(listing)}
      className="group relative block h-[300px]"
    >
      <div className="absolute inset-x-0 top-0 overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow duration-200 group-hover:z-20 group-hover:shadow-2xl">
        {/* Cover */}
        <div className="relative h-40">
          {listing.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.imageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[#1c1d22]">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.3"
                className="h-14 w-14 text-brand/50"
                aria-hidden
              >
                <path d="M12 21s7-7.75 7-13a7 7 0 1 0-14 0c0 5.25 7 13 7 13z" />
                <circle cx="12" cy="9" r="2.5" />
              </svg>
            </div>
          )}
          {/* Quick-action button */}
          <span className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded bg-white/90 text-brand shadow-sm">
            <Icon d={P.bolt} className="h-4 w-4" />
          </span>
          {listing.featured ? (
            <span className="absolute right-3 top-3 rounded bg-brand px-2 py-0.5 text-xs font-semibold text-white shadow">
              Featured
            </span>
          ) : null}
          {listing.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={listing.logoUrl}
              alt=""
              className="absolute -bottom-4 left-3 h-12 w-12 rounded-lg border-2 border-white bg-white object-contain shadow"
            />
          ) : null}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="flex items-center gap-1 font-heading font-semibold text-ink group-hover:text-brand">
            <span className="line-clamp-1">{listing.title}</span>
            {listing.claimed ? (
              <Icon d={P.check} className="h-4 w-4 shrink-0 text-sky" />
            ) : null}
          </h3>
          {listing.tagline || listing.excerpt ? (
            <p className="mt-1 line-clamp-1 text-sm text-muted">
              {listing.tagline || listing.excerpt}
            </p>
          ) : null}

          {/* Description — revealed on hover (expands over the card below) */}
          <p className="mt-2 max-h-0 overflow-hidden text-sm text-body opacity-0 transition-all duration-200 group-hover:max-h-28 group-hover:opacity-100">
            <span className="line-clamp-4">{listing.excerpt}</span>
          </p>

          {/* Footer: category + actions */}
          <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
            <span className="flex min-w-0 items-center gap-2 text-xs text-body">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-white">
                <Icon d={P.bookmark} className="h-3.5 w-3.5" />
              </span>
              <span className="truncate">{primaryCategory ?? "Listing"}</span>
              {extraCount > 0 ? (
                <span className="shrink-0 rounded-full bg-gray-100 px-1.5 py-0.5 text-[11px] text-muted">
                  +{extraCount}
                </span>
              ) : null}
            </span>
            <span className="flex shrink-0 items-center gap-1.5 text-gray-400">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100">
                <Icon d={P.zoom} className="h-3.5 w-3.5" />
              </span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100">
                <Icon d={P.heart} className="h-3.5 w-3.5" />
              </span>
            </span>
          </div>

          {location ? (
            <p className="mt-2 truncate text-xs text-muted">{location}</p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

