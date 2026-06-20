// Faceted directory search. Filters live in the URL query string so the page is
// fully server-rendered for every filter combination — crawlable, shareable,
// and AdSense-friendly. The ExploreFilters client component only updates the
// URL; the server does the querying and rendering.

import type { Metadata } from "next";
import { Suspense } from "react";
import { getListings, getTopCategories, getTopRegions } from "@/lib/data";
import type { ListingType } from "@/lib/types";
import { ExploreFilters } from "@/components/ExploreFilters";
import { ListingCard } from "@/components/ListingCard";
import { AdSlot } from "@/components/AdSlot";

export const metadata: Metadata = {
  title: "Explore rural businesses, deals, events & jobs",
  description:
    "Search the RuralHQ directory of rural New Zealand businesses, promotions, events and jobs by category and region.",
};

type SearchParams = Promise<{
  type?: string;
  region?: string;
  category?: string;
  q?: string;
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
    page: sp.page ? Number(sp.page) : 1,
  });
  const regions = getTopRegions();
  const categories = getTopCategories();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Explore</h1>
      <p className="mt-1 text-sm text-gray-500">{total} listings</p>

      <div className="mt-6">
        <Suspense fallback={null}>
          <ExploreFilters regions={regions} categories={categories} />
        </Suspense>
      </div>

      <div className="my-6">
        <AdSlot slot="explore-top" />
      </div>

      {items.length === 0 ? (
        <p className="py-12 text-center text-gray-500">
          There are no listings matching your search.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
