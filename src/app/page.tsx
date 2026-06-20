import Link from "next/link";
import { getArticles, getListings } from "@/lib/data";
import { ListingCard } from "@/components/ListingCard";
import { AdSlot } from "@/components/AdSlot";

export default async function Home() {
  const [{ items: recent }, articles] = await Promise.all([
    getListings({ perPage: 6 }),
    getArticles(),
  ]);

  return (
    <div className="container-rhq py-10">
      <section className="rounded-2xl bg-ink px-6 py-14 text-center text-white">
        <h1 className="font-slab text-4xl font-bold text-white">
          Connecting Rural New Zealand
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-gray-300">
          Find the best contractors, businesses, deals and events near you —
          across all 16 regions.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/explore"
            className="rounded bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-dark"
          >
            Explore the directory
          </Link>
          <Link
            href="/add-listing"
            className="rounded border border-white/40 px-5 py-2.5 font-medium text-white hover:bg-white/10"
          >
            Add your free listing
          </Link>
        </div>
      </section>

      <div className="my-10">
        <AdSlot slot="home-leaderboard" />
      </div>

      <section>
        <h2 className="font-slab text-xl font-bold text-ink">Recently added</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="font-slab text-xl font-bold text-ink">From the newsfeed</h2>
        <ul className="mt-4 space-y-3">
          {articles.slice(0, 5).map((article) => (
            <li key={article.slug}>
              <Link
                href={`/${article.slug}`}
                className="text-brand-dark hover:underline"
              >
                {article.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
