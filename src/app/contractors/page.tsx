// Contractors browse section. Contractor *detail* pages live under /businesses/
// (preserving live URLs); this page is the distinct "Contractors" landing —
// a filtered view of the contractors directory.

import type { Metadata } from "next";
import { getContractorListings } from "@/lib/data";
import { ListingCard } from "@/components/ListingCard";
import { AdSlot } from "@/components/AdSlot";

export const metadata: Metadata = {
  title: "Rural contractors directory",
  description:
    "Find rural contractors across New Zealand — cultivation, baling, spraying, fencing, cartage and more.",
};

// Contractors live under the businesses directory (the old contractors post
// type was a duplicate). This section is businesses in the contractor category
// tree — see getContractorListings.
export default async function ContractorsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const sp = await searchParams;
  const { items, total } = await getContractorListings({
    page: sp.page ? Number(sp.page) : 1,
    perPage: 36,
  });

  return (
    <div className="container-rhq py-8">
      <h1 className="font-slab text-2xl font-bold text-ink">Rural Contractors</h1>
      <p className="mt-1 text-sm text-gray-500">{total} contractors</p>

      <div className="my-6">
        <AdSlot slot="contractors-top" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
