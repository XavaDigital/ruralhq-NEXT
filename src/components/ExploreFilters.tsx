"use client";

// Faceted search controls for /explore. State lives in the URL query string
// (?type=&region=&category=&q=) so results stay server-rendered and crawlable —
// the page reads these params and renders matching listings on the server.
// Facet options (regions, categories) are passed in from the server page.

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { LISTING_TYPES, LISTING_TYPE_LABEL } from "@/lib/types";
import type { Term } from "@/lib/types";

export function ExploreFilters({
  regions,
  categories,
}: {
  regions: Term[];
  categories: Term[];
}) {
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

  const select =
    "rounded border border-gray-300 px-3 py-2 text-sm bg-white";

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <input
        type="search"
        defaultValue={params.get("q") ?? ""}
        placeholder="Search listings…"
        onChange={(e) => update("q", e.target.value)}
        className={`${select} lg:col-span-2`}
      />
      <select
        defaultValue={params.get("type") ?? ""}
        onChange={(e) => update("type", e.target.value)}
        className={select}
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
        className={select}
      >
        <option value="">All regions</option>
        {regions.map((r) => (
          <option key={r.slug} value={r.slug}>
            {r.name}
          </option>
        ))}
      </select>
      <select
        defaultValue={params.get("category") ?? ""}
        onChange={(e) => update("category", e.target.value)}
        className={select}
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
