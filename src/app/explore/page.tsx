// Faceted directory search. Filters live in the URL query string so the page is
// fully server-rendered for every filter combination — crawlable, shareable,
// and AdSense-friendly. The ExploreFilters client component only updates the
// URL; the server does the querying and rendering.

import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { getListings, getTopCategories, getTopRegions } from "@/lib/data";
import type { ListingType } from "@/lib/types";
import { ExploreFilters } from "@/components/ExploreFilters";
import { ListingCard } from "@/components/ListingCard";
import { AdSlot } from "@/components/AdSlot";

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
    <div>
      {/* Search hero */}
      <section className="bg-ink text-white">
        <div className="container-rhq py-10">
          <h1 className="font-slab text-2xl font-bold text-white sm:text-3xl">
            What are you looking for?
          </h1>
          <p className="mt-1 text-sm text-gray-300">
            Search {total.toLocaleString()} rural businesses and contractors.
          </p>
          <div className="mt-5">
            <Suspense fallback={null}>
              <ExploreFilters regions={regions} categories={categories} />
            </Suspense>
          </div>
        </div>
      </section>

      <div className="container-rhq py-8">
        <AdSlot slot="explore-top" className="mb-6" />

        {items.length === 0 ? (
          <p className="py-12 text-center text-muted">
            There are no listings matching your search.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}

        {/* Can't find what you're looking for? */}
        <section className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 px-6 py-10 text-center">
          <h2 className="font-slab text-xl font-bold text-ink">
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
    </div>
  );
}
