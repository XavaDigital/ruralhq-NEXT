import Link from "next/link";
import { getArticles, getListings, getTopCategories } from "@/lib/data";
import { ListingCard } from "@/components/ListingCard";
import { ArticleCard } from "@/components/ArticleCard";
import { Carousel } from "@/components/Carousel";
import { RotatingText } from "@/components/RotatingText";

const HERO_IMG =
  "https://ruralhq.co.nz/wp-content/uploads/2018/07/cows_field_grass_1920x1080.jpg";
const TALK_IMG =
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
  gift: "M20 6h-2.18c.11-.31.18-.65.18-1a2.996 2.996 0 0 0-5.5-1.65l-.5.67-.5-.68C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-5-2c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zM9 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm11 15H4v-2h16zm0-5H4V8h5.08L7 10.83 8.62 12 12 7.4l3.38 4.6L17 10.83 14.92 8H20z",
  cal: "M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 16H5V9h14z",
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

const PRICING = [
  { icon: PATHS.search, title: "Business Profiles" },
  { icon: PATHS.gift, title: "Promotions" },
  { icon: PATHS.cal, title: "Events" },
];

export default async function Home() {
  const [{ items: recent }, articles] = await Promise.all([
    getListings({ perPage: 10 }),
    getArticles(),
  ]);
  const categories = getTopCategories();

  return (
    <div>
      {/* Hero — full-height photo, dark overlay */}
      <section className="relative isolate flex min-h-[calc(100vh-4rem)] items-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={HERO_IMG} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
        <div className="absolute inset-0 -z-10 bg-ink/75" />
        <div className="container-rhq py-16 text-center text-white">
          <h1 className="text-5xl font-medium text-white sm:text-6xl">
            Connecting Rural New Zealand
          </h1>
          <p className="mt-4 text-xl text-gray-200 sm:text-2xl">
            Find the best{" "}
            <RotatingText words={PROFESSIONS} className="font-semibold text-brand" />{" "}
            near you
          </p>
          <div className="mx-auto mt-12 grid max-w-4xl gap-5 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="rounded-lg border border-white/15 bg-black/20 p-6 backdrop-blur-sm">
                <Icon d={f.icon} className="mx-auto h-10 w-10 text-brand" />
                <h2 className="mt-3 text-xl font-semibold text-white">{f.title}</h2>
                <p className="mt-2 text-sm text-gray-300">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Search band */}
      <section className="bg-ink text-white">
        <div className="container-rhq py-14 text-center">
          <h2 className="text-3xl font-medium text-white">
            Start your <span className="text-brand">search</span> here
          </h2>
          <form
            action="/explore"
            className="mx-auto mt-6 flex max-w-3xl flex-col gap-1 rounded-lg bg-white p-1 shadow-lg sm:flex-row"
          >
            <input
              name="q"
              placeholder="What are you looking for?"
              aria-label="Search"
              className="flex-1 rounded px-4 py-3 text-sm text-ink outline-none"
            />
            <select
              name="category"
              aria-label="Category"
              className="rounded px-3 py-3 text-sm text-ink outline-none sm:border-l sm:border-gray-200"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
            <button type="submit" className="rounded bg-brand px-8 py-3 text-sm font-semibold text-white hover:bg-brand-dark">
              Search
            </button>
          </form>
          <p className="mt-8 text-lg text-gray-200">
            or choose a category to start{" "}
            <span className="font-semibold text-brand">exploring.</span>
          </p>
        </div>
        <div className="flex justify-center">
          <div className="h-0 w-0 border-x-[16px] border-t-[16px] border-x-transparent border-t-ink" />
        </div>
      </section>

      {/* Category mosaic */}
      <section className="bg-gray-100">
        <div className="container-rhq py-12">
          <div className="grid auto-rows-[150px] grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="flex items-center rounded-lg bg-ink p-5 text-sm font-medium leading-snug text-gray-200">
              <p>
                <span className="font-bold text-white">Find</span> local
                businesses that understand rural needs and have a proven track
                record
              </p>
            </div>
            <Link
              href="/explore"
              className="col-span-2 row-span-2 flex flex-col items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand-dark text-white transition hover:brightness-105"
            >
              <Icon d={PATHS.search} className="h-12 w-12" />
              <span className="mt-3 text-lg font-semibold">Explore Businesses</span>
            </Link>
            <Link
              href="/business-support"
              className="flex items-end rounded-lg bg-[#3a3a3e] p-4 text-sm font-semibold text-white transition hover:bg-brand-dark"
            >
              Business Support
            </Link>
            {categories.slice(0, 3).map((c) => (
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
              <Icon d={PATHS.search} className="h-8 w-8" />
              <span className="mt-2 font-semibold">Contractors</span>
            </Link>
            <Link
              href="/newsfeed"
              className="col-span-2 flex flex-col items-center justify-center rounded-lg bg-gradient-to-br from-brand to-brand-dark text-white transition hover:brightness-105"
            >
              <Icon d={PATHS.news} className="h-8 w-8" />
              <span className="mt-2 font-semibold">Read Our News</span>
            </Link>
          </div>
        </div>
      </section>

      {/* What are we talking about — newsfeed carousel over a dark photo */}
      {articles.length > 0 ? (
        <section className="relative isolate overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={TALK_IMG} alt="" className="absolute inset-0 -z-10 h-full w-full object-cover" />
          <div className="absolute inset-0 -z-10 bg-ink/85" />
          <div className="container-rhq py-16 text-white">
            <div className="text-center">
              <h2 className="text-3xl font-medium text-white sm:text-4xl">
                What are we talking about?
              </h2>
              <div className="mx-auto mt-3 h-1 w-16 rounded bg-brand" />
              <p className="mx-auto mt-4 max-w-2xl text-gray-300">
                RuralHQ is more than a directory. We&apos;re also an information
                hub — sharing knowledge from experts in their field.
              </p>
            </div>
            <div className="mt-8">
              <Carousel>
                {articles.map((article) => (
                  <div key={article.slug} className="w-80 shrink-0 snap-start">
                    <ArticleCard article={article} />
                  </div>
                ))}
              </Carousel>
            </div>
            <div className="mt-4 text-center">
              <Link
                href="/newsfeed"
                className="inline-block rounded-full border border-brand px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand"
              >
                Read More
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* Special Launch Pricing */}
      <section className="bg-gradient-to-br from-brand to-brand-dark text-white">
        <div className="container-rhq py-16 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
            Limited Time Only
          </p>
          <h2 className="mt-2 text-3xl font-medium text-white sm:text-4xl">
            Special Launch Pricing
          </h2>
          <div className="mx-auto mt-3 h-1 w-16 rounded bg-ink/40" />
          <p className="mx-auto mt-6 max-w-xl text-white/90">
            Add your own listing now — it&apos;s free during our launch period.
          </p>
          <div className="mx-auto mt-8 grid max-w-4xl gap-5 sm:grid-cols-3">
            {PRICING.map((p) => (
              <div key={p.title} className="rounded-lg bg-ink/90 p-6">
                <Icon d={p.icon} className="mx-auto h-9 w-9 text-gray-400" />
                <h3 className="mt-3 text-lg font-semibold text-brand">{p.title}</h3>
                <p className="mt-1 text-xs text-gray-400">from</p>
                <p className="text-2xl font-bold text-white">FREE</p>
                <Link
                  href="/add-listing"
                  className="mt-4 inline-block rounded-full border border-brand px-5 py-2 text-sm font-semibold text-white hover:bg-brand"
                >
                  Get started now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* See what's new — latest listings carousel */}
      <section className="bg-white">
        <div className="container-rhq py-14">
          <div className="text-center">
            <h2 className="text-3xl font-medium text-ink sm:text-4xl">
              See what&apos;s new
            </h2>
            <div className="mx-auto mt-3 h-1 w-16 rounded bg-brand" />
            <p className="mt-4 text-muted">
              See all the latest profiles added to RuralHQ
            </p>
          </div>
          <div className="mt-8">
            <Carousel>
              {recent.map((listing) => (
                <div key={listing.id} className="w-72 shrink-0 snap-start">
                  <ListingCard listing={listing} />
                </div>
              ))}
            </Carousel>
          </div>
          <div className="mt-4 text-center">
            <Link
              href="/explore"
              className="inline-block rounded-full border border-brand px-6 py-2.5 text-sm font-semibold text-brand-dark hover:bg-brand hover:text-white"
            >
              See all latest
            </Link>
          </div>
        </div>
      </section>

      {/* Business owner CTA */}
      <section className="bg-gray-100">
        <div className="container-rhq py-16 text-center">
          <h2 className="text-3xl font-medium text-ink">
            Are you a business owner?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-body">
            List your rural business or service on RuralHQ — it&apos;s free, and
            we check every submission before it goes live.
          </p>
          <Link
            href="/add-listing"
            className="mt-6 inline-block rounded bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark"
          >
            Add your free listing
          </Link>
        </div>
      </section>
    </div>
  );
}
