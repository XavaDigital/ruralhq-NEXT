import Link from "next/link";

// Footer reproduced from the live RuralHQ: a green newsletter band, a dark
// "follow us on social" bar, and a near-black 4-column footer. Links are mapped
// to our routes; pages we haven't built yet (FAQ/About/Privacy/Terms/Contact)
// point to "#" for now.

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] =
  [
    {
      heading: "Get Started",
      links: [
        { label: "Explore Businesses", href: "/explore" },
        { label: "Contractors", href: "/contractors" },
        { label: "Explore All", href: "/explore" },
        { label: "Newsfeed", href: "/newsfeed" },
      ],
    },
    {
      heading: "Community",
      links: [
        { label: "Suggest a Listing", href: "/add-listing" },
        { label: "Make a Suggestion", href: "#" },
        { label: "Report an Error", href: "#" },
        { label: "Guidelines", href: "#" },
      ],
    },
    {
      heading: "For Business",
      links: [
        { label: "Get on RuralHQ", href: "/add-listing" },
        { label: "Business Support", href: "#" },
      ],
    },
    {
      heading: "About",
      links: [
        { label: "About Us", href: "/about" },
        { label: "Contributors", href: "#" },
        { label: "Privacy Policy", href: "#" },
        { label: "Terms & Conditions", href: "#" },
        { label: "Contact Us", href: "#" },
      ],
    },
  ];

const SOCIAL: { label: string; href: string; d: string }[] = [
  {
    label: "Facebook",
    href: "#",
    d: "M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.5 1.49-3.89 3.78-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.44 2.89h-2.34v6.99A10 10 0 0 0 22 12z",
  },
  {
    label: "Instagram",
    href: "#",
    d: "M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.43.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.43.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.43-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.43-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 3.68a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-10.4a1.44 1.44 0 1 1-2.88 0 1.44 1.44 0 0 1 2.88 0z",
  },
  {
    label: "Twitter",
    href: "#",
    d: "M22 5.92c-.74.33-1.53.55-2.36.65a4.12 4.12 0 0 0 1.8-2.27c-.79.47-1.67.81-2.6 1a4.1 4.1 0 0 0-7 3.74A11.65 11.65 0 0 1 3.4 4.66a4.1 4.1 0 0 0 1.27 5.47c-.66-.02-1.28-.2-1.82-.5v.05a4.1 4.1 0 0 0 3.29 4.02c-.6.16-1.23.18-1.84.07a4.1 4.1 0 0 0 3.83 2.85A8.23 8.23 0 0 1 2 18.29a11.62 11.62 0 0 0 6.29 1.84c7.55 0 11.68-6.25 11.68-11.67v-.53c.8-.58 1.5-1.3 2.03-2.12z",
  },
  {
    label: "YouTube",
    href: "#",
    d: "M23 12s0-3.2-.4-4.73a2.46 2.46 0 0 0-1.73-1.74C19.34 5.13 12 5.13 12 5.13s-7.34 0-8.87.4a2.46 2.46 0 0 0-1.73 1.74C1 8.8 1 12 1 12s0 3.2.4 4.73c.22.85.88 1.52 1.73 1.74 1.53.4 8.87.4 8.87.4s7.34 0 8.87-.4a2.46 2.46 0 0 0 1.73-1.74C23 15.2 23 12 23 12zM9.75 15.02V8.98L15 12l-5.25 3.02z",
  },
];

function SocialRow({ className }: { className?: string }) {
  return (
    <div className={`flex gap-3 ${className ?? ""}`}>
      {SOCIAL.map((s) => (
        <a
          key={s.label}
          href={s.href}
          aria-label={s.label}
          className="flex h-8 w-8 items-center justify-center rounded bg-white/10 text-white transition hover:bg-brand"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <path d={s.d} />
          </svg>
        </a>
      ))}
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16">
      {/* Newsletter band */}
      <section className="bg-gradient-to-r from-brand to-brand-dark text-white">
        <div className="container-rhq flex flex-col items-center gap-6 py-12 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
              Get the latest
            </p>
            <h2 className="font-slab text-2xl font-bold text-white">
              Special Offers &amp; Deals
            </h2>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/80">
              Direct to your inbox
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm text-white/90 md:mx-0">
              From time to time RuralHQ and our partners offer special offers
              &amp; deals. Subscribe to be among the first to hear about them.
            </p>
          </div>
          {/* Newsletter signup — wire to an email provider later. */}
          <form action="#" className="shrink-0">
            <button
              type="submit"
              className="rounded bg-ink px-6 py-3 text-sm font-semibold text-white hover:bg-black"
            >
              Send me the good stuff!
            </button>
          </form>
        </div>
      </section>

      {/* Social bar */}
      <div className="bg-[#2a2a2e]">
        <div className="container-rhq flex flex-col items-center gap-3 py-5">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-gray-300">
            Follow us on social
          </p>
          <SocialRow />
        </div>
      </div>

      {/* Main footer */}
      <div className="bg-ink text-gray-300">
        <div className="container-rhq grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <p className="font-slab text-lg font-bold text-white">
              Rural<span className="text-brand">HQ</span>
            </p>
            <p className="mt-2 text-sm text-gray-400">
              RuralHQ is a comprehensive directory service for rural New Zealand.
            </p>
            <SocialRow className="mt-4" />
          </div>
          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <h3 className="text-sm font-semibold text-white">{col.heading}</h3>
              <ul className="mt-3 space-y-2 text-sm">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-gray-400 hover:text-brand">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10">
          <div className="container-rhq py-5 text-xs text-gray-500">
            © {new Date().getFullYear()} RuralHQ. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
