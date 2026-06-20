import Link from "next/link";

const COLS = [
  {
    heading: "Explore",
    links: [
      { label: "Businesses", href: "/explore?type=businesses" },
      { label: "Contractors", href: "/contractors" },
      { label: "Newsfeed", href: "/newsfeed" },
    ],
  },
  {
    heading: "RuralHQ",
    links: [
      { label: "What is RuralHQ?", href: "/about" },
      { label: "Add a listing", href: "/add-listing" },
      { label: "Sign in", href: "/sign-in" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-ink text-gray-300">
      <div className="container-rhq grid gap-8 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2">
          <p className="font-slab text-lg font-bold text-white">
            Rural<span className="text-brand">HQ</span>
          </p>
          <p className="mt-2 max-w-sm text-sm text-gray-400">
            Connecting Rural New Zealand — the directory and information hub for
            rural businesses, contractors, deals and events.
          </p>
        </div>
        {COLS.map((col) => (
          <div key={col.heading}>
            <h3 className="text-sm font-semibold text-white">{col.heading}</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-brand">
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
    </footer>
  );
}
