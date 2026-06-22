// "What is RuralHQ?" — the about/marketing page. Reproduces the live sections:
// hero, Our Mission, Why, "Get the information you need faster" features, and
// "Explore, Discover, Review, Share, Contribute".

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "What is RuralHQ?",
  description:
    "RuralHQ is a platform built to connect rural New Zealand — with good local businesses, timely information, and each other.",
};

const ICON = {
  search:
    "M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z",
  star: "M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z",
  share:
    "M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z",
  pencil:
    "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75z",
};

function Icon({ d, className }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d={d} />
    </svg>
  );
}

function Heading({
  eyebrow,
  title,
  dark,
}: {
  eyebrow: string;
  title: string;
  dark?: boolean;
}) {
  return (
    <div className="text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-brand">
        {eyebrow}
      </p>
      <h2
        className={`mt-2 font-slab text-3xl font-bold ${dark ? "text-white" : "text-ink"}`}
      >
        {title}
      </h2>
      <div className="mx-auto mt-4 h-1 w-16 rounded bg-brand" />
    </div>
  );
}

const FEATURES = [
  { title: "Find it fast", desc: "RuralHQ is one of the most comprehensive rural directories in the country." },
  { title: "Find it easily", desc: "We've designed RuralHQ to be simple and easy to use for anybody." },
  { title: "Find it anywhere", desc: "Mobile users are nearly 80% of all web traffic — and we know it." },
  { title: "Built for rural", desc: "RuralHQ has been designed specifically for rural communities." },
  { title: "Free to use", desc: "RuralHQ is totally free for community members to use." },
  { title: "Innovative", desc: "Constant improvement & innovation is what sets the RuralHQ platform apart." },
];

const USES = [
  { icon: ICON.search, title: "Discover", desc: "Discover local businesses & events that other people love and take the hassle out of finding what you need." },
  { icon: ICON.star, title: "Review", desc: "Leave a review for local businesses you love so that others might find a good, honest, reputable supplier." },
  { icon: ICON.share, title: "Share", desc: "Found an awesome supplier on RuralHQ? Share it with your own network and help spread the word." },
  { icon: ICON.pencil, title: "Contribute", desc: "RuralHQ is all about sharing what you know. If you've got something to share, we'd love to hear about it." },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-ink text-white">
        <div className="container-rhq py-24 text-center">
          <p className="font-slab text-4xl font-bold">
            Rural<span className="text-brand">HQ</span>
          </p>
          <div className="mx-auto mt-4 h-1 w-16 rounded bg-brand" />
          <p className="mt-4 text-xl text-gray-200">
            Connecting Rural New Zealand
          </p>
        </div>
      </section>

      {/* Our mission */}
      <section className="bg-white">
        <div className="container-rhq py-16">
          <Heading eyebrow="Our Mission" title="Connecting rural New Zealand." />
          <div className="mx-auto mt-6 max-w-2xl text-center text-body">
            <p>RuralHQ is a platform built to &lsquo;Connect Rural New Zealand&rsquo;.</p>
            <ul className="mx-auto mt-4 inline-block list-disc space-y-1 text-left">
              <li>Connect you with good, honest, reputable local businesses.</li>
              <li>Connect you with interesting, relevant, and timely information.</li>
              <li>Connect you with other rural people who share your interests and concerns.</li>
            </ul>
            <p className="mt-4">
              By collectively sharing knowledge and experiences on RuralHQ, rural
              communities are empowered to get information and make better
              decisions, faster.
            </p>
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="bg-ink text-white">
        <div className="container-rhq py-16">
          <Heading eyebrow="Why?" title="We want to empower rural communities!" dark />
          <p className="mx-auto mt-6 max-w-2xl text-center font-semibold text-white">
            Word of mouth has served you well, but now there&apos;s a better way.
          </p>
          <div className="mx-auto mt-6 max-w-2xl space-y-4 text-center text-gray-300">
            <p>
              In our increasingly digital age, rural communities have a need
              that&apos;s currently under-served by existing technologies.
              Word-of-mouth sharing of knowledge and experiences is quickly
              moving online — we&apos;ve built RuralHQ to enable that sharing in a
              new and more efficient way.
            </p>
            <p>
              We&apos;ve launched with a minimum set of features to start
              providing value as soon as possible, and plan to extend the
              platform as we learn what the community needs and wants.
            </p>
          </div>
        </div>
      </section>

      {/* Why you should be on RuralHQ */}
      <section className="bg-white">
        <div className="container-rhq py-16">
          <Heading
            eyebrow="Why you should be on RuralHQ"
            title="Get the information you need, faster."
          />
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex gap-4">
                <Icon d={ICON.star} className="h-7 w-7 shrink-0 text-brand" />
                <div>
                  <h3 className="font-bold text-ink">{f.title}</h3>
                  <p className="mt-1 text-sm text-body">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What can you do */}
      <section className="bg-ink text-white">
        <div className="container-rhq py-16">
          <Heading
            eyebrow="What can you do with RuralHQ?"
            title="Explore, Discover, Review, Share, Contribute."
            dark
          />
          <p className="mx-auto mt-6 max-w-2xl text-center text-gray-300">
            We&apos;re empowering rural communities to share their knowledge and
            experiences to benefit the wider community.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {USES.map((u) => (
              <div
                key={u.title}
                className="rounded-lg border border-white/10 bg-white/5 p-6 text-center"
              >
                <Icon d={u.icon} className="mx-auto h-9 w-9 text-brand" />
                <h3 className="mt-3 font-bold text-white">{u.title}</h3>
                <p className="mt-2 text-sm text-gray-400">{u.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/add-listing"
              className="inline-block rounded bg-brand px-6 py-3 font-semibold text-white hover:bg-brand-dark"
            >
              Add your free listing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
