import Link from "next/link";
import { getArticles, getListings, getTopCategories } from "@/lib/data";
import { ListingCard } from "@/components/ListingCard";
import { RotatingText } from "@/components/RotatingText";
import { AdSlot } from "@/components/AdSlot";

const HERO_IMG =
  "https://ruralhq.co.nz/wp-content/uploads/2018/07/cows_field_grass_1920x1080.jpg";

const PROFESSIONS = [
  "Accountant", "Contractor", "Stock Agent", "Mechanic", "Lawyer",
  "Agronomist", "Builder", "Engineer", "Insurance Broker",
];

const PATHS = {
  star: "M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
  search:
    "M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z",
  share:
    "M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z",
  news: "M22 3l-1.67 1.67L18.67 3 17 4.67 15.33 3l-1.66 1.67L12 3l-1.67 1.67L8.67 3 7 4.67 5.33 3 3.67 4.67 2 3v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2zm-9 13H7v-2h6zm4-4H7v-2h10zm0-4H7V6h10z",
  arrow: "M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z",
};

function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d={d} />
    </svg>
  );
}

const FEATURES = [
  { icon: PATHS.star, title: "Review", desc: "Leave a review for local businesses you love so that others might find a good, honest, reputable supplier." },
  { icon: PATHS.search, title: "Discover", desc: "Discover local businesses that other people love and take the hassle out of finding a new supplier." },
  { icon: PATHS.share, title: "Share", desc: "Found an awesome new supplier? Help them out — share their business profile with your own network." },
];

export default async function Home() {
  const [{ items: recent }, articles] = await Promise.all([
    getListings({ perPage: 8 }),
    getArticles(),
  ]);
  const categories = getTopCategories();

  return (
    <div>
      {/* Hero — photographic, dark overlay */}
      <section className="relative isolate overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={HERO_IMG}
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-ink/75" />
        <div className="container-rhq py-24 text-center text-white sm:py-32">
          <h1 className="font-slab text-4xl font-bold text-white sm:text-5xl">
            Connecting Rural New Zealand
          </h1>
          <p className="mt-3 text-lg text-gray-200 sm:text-xl">
            Find the best{" "}
            <RotatingText
              words={PROFESSIONS}
              className="font-semibold text-brand"
            />{" "}
            near you
          </p>

          <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-lg border border-white/15 bg-white/5 p-6 backdrop-blur-sm"
              >
                <Icon d={f.icon} className="mx-auto h-9 w-9 text-brand" />
                <h2 className="mt-3 font-slab text-lg font-bold text-white">
                  {f.title}
                </h2>
                <p className="mt-1 text-sm text-gray-300">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search band */}
      <section className="bg-ink text-white">
        <div className="container-rhq py-12 text-center">
          <h2 className="font-slab text-2xl font-bold text-white">
            Start your <span className="text-brand">search</span> here
          </h2>
          <form
            action="/explore"
            className="mx-auto mt-5 flex max-w-3xl flex-col gap-px overflow-hidden rounded-lg bg-white p-1 shadow-lg sm:flex-row"
          >
            <input
              name="q"
              placeholder="What are you looking for?"
              aria-label="Search"
              className="flex-1 rounded px-4 py-2.5 text-sm text-ink outline-none"
            />
            <select
              name="category"
              aria-label="Category"
              className="rounded px-3 py-2.5 text-sm text-ink outline-none sm:border-l sm:border-gray-200"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="rounded bg-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Search
            </button>
          </form>
          <p className="mt-7 text-gray-300">
            or choose a category to start{" "}
            <span className="font-semibold text-brand">exploring.</span>
          </p>
        </div>
        <div className="flex justify-center">
          <div className="h-0 w-0 border-x-[14px] border-t-[14px] border-x-transparent border-t-ink" />
        </div>
      </section>

      {/* Category mosaic */}
      <section className="bg-gray-100">
        <div className="container-rhq py-12">
          <div className="grid auto-rows-[140px] grid-cols-2 gap-3 lg:grid-cols-4">
            <Link
              href="/explore"
              className="col-span-2 flex flex-col items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand-dark text-white transition hover:brightness-105 lg:row-span-2"
            >
              <Icon d={PATHS.search} className="h-9 w-9" />
              <span className="mt-2 font-semibold">Explore Businesses</span>
            </Link>
            {categories.slice(0, 4).map((c) => (
              <Link
                key={c.slug}
                href={`/explore?category=${c.slug}`}
                className="flex items-end rounded-lg bg-ink p-4 text-sm font-semibold text-white transition hover:bg-brand-dark"
              >
                {c.name}
              </Link>
            ))}
            <Link
              href="/contractors"
              className="flex flex-col items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand-dark text-white transition hover:brightness-105"
            >
              <Icon d={PATHS.search} className="h-7 w-7" />
              <span className="mt-2 font-semibold">Contractors</span>
            </Link>
            <Link
              href="/newsfeed"
              className="flex flex-col items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand-dark text-white transition hover:brightness-105"
            >
              <Icon d={PATHS.news} className="h-7 w-7" />
              <span className="mt-2 font-semibold">Read Our News</span>
            </Link>
          </div>
        </div>
      </section>

      {/* What are we talking about? — newsfeed */}
      {articles.length > 0 ? (
        <section className="bg-ink text-white">
          <div className="container-rhq py-14 text-center">
            <h2 className="font-slab text-3xl font-bold text-white">
              What are we talking about?
            </h2>
            <div className="mx-auto mt-3 h-1 w-16 rounded bg-brand" />
            <p className="mx-auto mt-4 max-w-2xl text-gray-300">
              RuralHQ is more than a directory. We&apos;re also an information
              hub — sharing knowledge from experts in their field.
            </p>
            <div className="mt-8 grid gap-5 text-left sm:grid-cols-2 lg:grid-cols-3">
              {articles.slice(0, 3).map((article) => (
                <Link
                  key={article.slug}
                  href={`/${article.slug}`}
                  className="group overflow-hidden rounded-lg bg-white text-ink transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <div className="flex h-32 items-center justify-center bg-gradient-to-br from-brand/20 to-ink/10">
                    <Icon d={PATHS.news} className="h-10 w-10 text-brand/50" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-slab font-semibold text-brand-dark group-hover:text-brand">
                      {article.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-sm text-body">
                      {article.excerpt}
                    </p>
                    <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-brand-dark">
                      Read More
                      <Icon d={PATHS.arrow} className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
            <Link
              href="/newsfeed"
              className="mt-8 inline-block rounded-full border border-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand"
            >
              Read More
            </Link>
          </div>
        </section>
      ) : null}

      <div className="container-rhq">
        <AdSlot slot="home-leaderboard" className="my-8" />

        {/* See what's new — latest listings */}
        <section className="py-4 pb-12">
          <div className="text-center">
            <h2 className="font-slab text-3xl font-bold text-ink">
              See what&apos;s new
            </h2>
            <div className="mx-auto mt-3 h-1 w-16 rounded bg-brand" />
            <p className="mt-4 text-muted">
              See all the latest profiles added to RuralHQ
            </p>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recent.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/explore"
              className="inline-block rounded-full border border-brand px-6 py-2.5 text-sm font-semibold text-brand-dark hover:bg-brand hover:text-white"
            >
              See all latest
            </Link>
          </div>
        </section>

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
