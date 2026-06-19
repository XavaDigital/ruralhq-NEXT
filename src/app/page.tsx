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
    <div className="mx-auto max-w-6xl px-4 py-10">
      <section className="text-center">
        <h1 className="text-4xl font-bold text-gray-900">
          Connecting Rural New Zealand
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-gray-600">
          Find the best contractors, deals, events and jobs near you — across
          all 16 regions.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href="/explore"
            className="rounded bg-green-700 px-5 py-2.5 font-medium text-white hover:bg-green-800"
          >
            Explore the directory
          </Link>
          <Link
            href="/add-listing"
            className="rounded border border-gray-300 px-5 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
          >
            Add your free listing
          </Link>
        </div>
      </section>

      <div className="my-10">
        <AdSlot slot="home-leaderboard" />
      </div>

      <section>
        <h2 className="text-xl font-bold text-gray-900">Recently added</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold text-gray-900">From the newsfeed</h2>
        <ul className="mt-4 space-y-3">
          {articles.slice(0, 5).map((article) => (
            <li key={article.slug}>
              <Link
                href={`/${article.slug}`}
                className="text-green-800 hover:underline"
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
