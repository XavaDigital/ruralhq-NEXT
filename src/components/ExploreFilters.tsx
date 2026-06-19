"use client";

// Faceted search controls for /explore. Drives state through the URL query
// string (?type=&region=&category=&q=) so results stay server-rendered and
// shareable/crawlable — the page reads these params and renders matching
// listings on the server. This is the interactive widget that replaces My
// Listing's jQuery/admin-ajax search.

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { LISTING_TYPES, LISTING_TYPE_LABEL, REGIONS } from "@/lib/types";

export function ExploreFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      next.delete("page");
      router.push(`/explore?${next.toString()}`);
    },
    [params, router],
  );

  return (
    <div className="grid gap-3 sm:grid-cols-4">
      <input
        type="search"
        defaultValue={params.get("q") ?? ""}
        placeholder="Search listings…"
        onChange={(e) => update("q", e.target.value)}
        className="rounded border border-gray-300 px-3 py-2 text-sm"
      />
      <select
        defaultValue={params.get("type") ?? ""}
        onChange={(e) => update("type", e.target.value)}
        className="rounded border border-gray-300 px-3 py-2 text-sm"
      >
        <option value="">All types</option>
        {LISTING_TYPES.map((t) => (
          <option key={t} value={t}>
            {LISTING_TYPE_LABEL[t]}
          </option>
        ))}
      </select>
      <select
        defaultValue={params.get("region") ?? ""}
        onChange={(e) => update("region", e.target.value)}
        className="rounded border border-gray-300 px-3 py-2 text-sm"
      >
        <option value="">All regions</option>
        {REGIONS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => router.push("/explore")}
        className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
      >
        Reset filters
      </button>
    </div>
  );
}
