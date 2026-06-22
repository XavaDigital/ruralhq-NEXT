import Link from "next/link";
import { getArticles, getListings, getTopCategories } from "@/lib/data";
import { ListingCard } from "@/components/ListingCard";
import { AdSlot } from "@/components/AdSlot";

export default async function Home() {
  const [{ items: recent }, articles] = await Promise.all([
    getListings({ perPage: 8 }),
    getArticles(),
  ]);
  const categories = getTopCategories().slice(0, 10);

  return (
    <div>
      {/* Hero — dark, with search + category shortcuts (matches the live home) */}
      <section className="bg-ink text-white">
        <div className="container-rhq py-16 text-center sm:py-20">
          <h1 className="font-slab text-4xl font-bold text-white sm:text-5xl">
            Connecting Rural New Zealand
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-gray-300">
            Find the best contractors, businesses and services near you — across
            all 16 regions. Start your search here.
          </p>

          <form
            action="/explore"
            className="mx-auto mt-7 flex max-w-2xl overflow-hidden rounded-lg bg-white shadow-lg"
          >
            <input
              name="q"
              placeholder="Type your search…"
              aria-label="Search listings"
              className="flex-1 px-4 py-3 text-sm text-ink outline-none"
            />
            <button
              type="submit"
              className="bg-brand px-6 py-3 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Search
            </button>
          </form>

          <p className="mt-7 text-sm text-gray-400">
            or choose a category to start exploring
          </p>
          <div className="mx-auto mt-3 flex max-w-3xl flex-wrap justify-center gap-2">
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/explore?category=${c.slug}`}
                className="rounded-full border border-white/20 px-3 py-1.5 text-sm text-gray-200 transition hover:border-brand hover:bg-brand hover:text-white"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="container-rhq">
        {/* Recently added */}
        <section className="py-12">
          <div className="flex items-end justify-between">
            <h2 className="font-slab text-2xl font-bold text-ink">
              Recently added
            </h2>
            <Link
              href="/explore"
              className="text-sm font-semibold text-brand-dark hover:underline"
            >
              Explore all →
            </Link>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </section>

        <AdSlot slot="home-leaderboard" className="my-6" />

        {/* See what's new — newsfeed */}
        {articles.length > 0 ? (
          <section className="py-12">
            <h2 className="font-slab text-2xl font-bold text-ink">
              See what&apos;s new
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {articles.slice(0, 3).map((article) => (
                <Link
                  key={article.slug}
                  href={`/${article.slug}`}
                  className="group rounded-lg border border-gray-200 bg-white p-5 transition hover:border-brand/40 hover:shadow-md"
                >
                  <h3 className="font-slab font-semibold text-ink group-hover:text-brand">
                    {article.title}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm text-body">
                    {article.excerpt}
                  </p>
                  <p className="mt-3 text-xs text-muted">
                    {new Date(article.publishedAt).toLocaleDateString("en-NZ")}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        {/* Business owner CTA */}
        <section className="my-10 rounded-2xl bg-ink px-6 py-12 text-center text-white">
          <h2 className="font-slab text-2xl font-bold text-white">
            Are you a business owner?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-gray-300">
            List your rural business or service on RuralHQ — it&apos;s free, and
            we check every submission before it goes live.
          </p>
          <Link
            href="/add-listing"
            className="mt-5 inline-block rounded bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark"
          >
            Add your free listing
          </Link>
        </section>
      </div>
    </div>
  );
}
