// "Read" — the newsfeed. Mirrors the live page: a dark "Your RuralHQ Newsfeed"
// hero, an article search bar, and a grid of article cards.

import type { Metadata } from "next";
import { getArticleCategories, getArticles } from "@/lib/data";
import { ArticleCard } from "@/components/ArticleCard";

export const metadata: Metadata = {
  title: "Read — rural New Zealand news & insights",
  description:
    "Short news synopses and expert insights for rural New Zealand, updated regularly.",
};

export default async function NewsfeedPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const sp = await searchParams;
  let articles = await getArticles(sp.q);
  if (sp.category) {
    articles = articles.filter((a) => a.category === sp.category);
  }
  const categories = getArticleCategories();

  return (
    <div>
      {/* Hero */}
      <section className="bg-ink text-white">
        <div className="container-rhq py-20 text-center">
          <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">
            Your <span className="text-brand">RuralHQ</span> Newsfeed
          </h1>
          <div className="mx-auto mt-4 h-1 w-16 rounded bg-brand" />
        </div>
      </section>

      <div className="container-rhq py-10">
        {/* Search */}
        <form
          action="/newsfeed"
          method="get"
          className="mx-auto flex max-w-4xl flex-col gap-2 sm:flex-row"
        >
          <input
            name="q"
            defaultValue={sp.q}
            placeholder="Search articles…"
            className="flex-1 rounded border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-brand"
          />
          <select
            name="category"
            defaultValue={sp.category ?? ""}
            className="rounded border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-brand"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Search Now
          </button>
        </form>

        {/* Articles */}
        {articles.length === 0 ? (
          <p className="py-16 text-center text-muted">No articles found.</p>
        ) : (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <ArticleCard key={article.slug} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

