// Faceted directory search — 3-column layout (filters sidebar · results · map),
// matching the live explore page. Filters live in the URL query string so the
// page is fully server-rendered, crawlable and shareable; the Google map is a
// client component that activates when an API key is configured.

import type { Metadata } from "next";
import Link from "next/link";
import {
  getListings,
  getTopCategories,
  getTopRegions,
  type ListingOrder,
} from "@/lib/data";
import type { ListingType } from "@/lib/types";
import { ExploreSidebar } from "@/components/ExploreSidebar";
import { ListingCard } from "@/components/ListingCard";
import { ListingMap, type MapPoint } from "@/components/ListingMap";

export const metadata: Metadata = {
  title: "Explore rural businesses & contractors",
  description:
    "Search the RuralHQ directory of rural New Zealand businesses and contractors by category and region.",
};

type SearchParams = Promise<{
  type?: string;
  region?: string;
  category?: string;
  q?: string;
  order?: string;
  page?: string;
}>;

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const { items, total } = await getListings({
    type: sp.type as ListingType | undefined,
    region: sp.region,
    category: sp.category,
    search: sp.q,
    order: sp.order as ListingOrder | undefined,
    page: sp.page ? Number(sp.page) : 1,
  });
  const regions = getTopRegions();
  const categories = getTopCategories();

  const points: MapPoint[] = items
    .filter((l) => typeof l.lat === "number" && typeof l.lng === "number")
    .map((l) => ({ id: l.id, title: l.title, lat: l.lat!, lng: l.lng! }));

  return (
    <div className="lg:grid lg:grid-cols-[280px_minmax(0,1fr)_38%]">
      {/* Filters sidebar */}
      <aside className="border-b border-gray-200 p-5 lg:border-b-0 lg:border-r">
        <ExploreSidebar params={sp} regions={regions} categories={categories} />
      </aside>

      {/* Results */}
      <div className="p-5">
        <div className="flex items-center justify-between text-sm text-muted">
          <span>
            Showing <span className="font-semibold text-ink">{items.length}</span>{" "}
            results out of{" "}
            <span className="font-semibold text-ink">
              {total.toLocaleString()}
            </span>
          </span>
        </div>

        {items.length === 0 ? (
          <p className="py-16 text-center text-muted">
            There are no listings matching your search.
          </p>
        ) : (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {items.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        <section className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 px-6 py-8 text-center">
          <h2 className="font-slab text-lg font-bold text-ink">
            Can&apos;t find what you&apos;re looking for?
          </h2>
          <p className="mt-1 text-sm text-body">
            Add your own listing — or suggest one for us.
          </p>
          <Link
            href="/add-listing"
            className="mt-4 inline-block rounded bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-dark"
          >
            Add a listing
          </Link>
        </section>
      </div>

      {/* Map */}
      <div className="hidden lg:block">
        <div className="sticky top-16 h-[calc(100vh-4rem)]">
          <ListingMap points={points} />
        </div>
      </div>
    </div>
  );
}
