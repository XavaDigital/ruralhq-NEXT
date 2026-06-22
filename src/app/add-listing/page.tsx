import type { Metadata } from "next";
import { getTopCategories, getTopRegions } from "@/lib/data";
import { AddListingForm } from "@/components/AddListingForm";

export const metadata: Metadata = {
  title: "Add your free listing",
  description:
    "List your rural New Zealand business or service on RuralHQ — free. Submissions are checked before going live.",
};

export default async function AddListingPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="font-heading text-2xl font-bold text-ink">
        Add your free listing
      </h1>
      <p className="mt-1 text-sm text-muted">
        It&apos;s free. We check every submission before it goes live to keep the
        directory spam-free.
      </p>
      <div className="mt-6">
        <AddListingForm
          regions={getTopRegions()}
          categories={getTopCategories()}
        />
      </div>
    </div>
  );
}

