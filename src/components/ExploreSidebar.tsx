import Link from "next/link";
import type { Term } from "@/lib/types";

// Explore filters sidebar — a plain GET form (navigates to /explore?…), matching
// the live sidebar: search, Categories, "Where to look?", "Order by", a green
// Search button and Reset. Server-rendered; current values come from the URL.

const labelCls = "block text-xs font-semibold uppercase tracking-wide text-muted";
const selectCls =
  "mt-1 w-full border-b border-gray-300 bg-transparent py-2 text-sm text-ink outline-none focus:border-brand";

export function ExploreSidebar({
  params,
  regions,
  categories,
}: {
  params: { q?: string; category?: string; region?: string; order?: string };
  regions: Term[];
  categories: Term[];
}) {
  return (
    <form action="/explore" method="get" className="space-y-5">
      <div className="flex gap-6 border-b border-gray-200 pb-3 text-sm font-semibold">
        <span className="-mb-3 border-b-2 border-brand pb-3 text-brand-dark">
          Filters
        </span>
        <span className="text-muted">Categories</span>
      </div>

      <div>
        <label htmlFor="q" className={labelCls}>
          What are you looking for?
        </label>
        <input
          id="q"
          name="q"
          defaultValue={params.q}
          placeholder="Search…"
          className={selectCls}
        />
      </div>

      <div>
        <label htmlFor="category" className={labelCls}>
          Categories
        </label>
        <select
          id="category"
          name="category"
          defaultValue={params.category ?? ""}
          className={selectCls}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="region" className={labelCls}>
          Where to look?
        </label>
        <select
          id="region"
          name="region"
          defaultValue={params.region ?? ""}
          className={selectCls}
        >
          <option value="">Anywhere</option>
          {regions.map((r) => (
            <option key={r.slug} value={r.slug}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="order" className={labelCls}>
          Order by
        </label>
        <select
          id="order"
          name="order"
          defaultValue={params.order ?? "featured"}
          className={selectCls}
        >
          <option value="featured">Featured</option>
          <option value="newest">Newest</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      <button
        type="submit"
        className="w-full rounded bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
      >
        Search
      </button>
      <Link
        href="/explore"
        className="block text-center text-sm text-muted hover:text-ink"
      >
        ↻ Reset Filters
      </Link>
    </form>
  );
}
