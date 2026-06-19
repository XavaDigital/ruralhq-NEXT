import Link from "next/link";

// Primary navigation mirrors the live site: Explore / Read / Discover.
// Styling here is intentionally minimal — it will be replaced with the lifted
// My Listing CSS so the frontend stays pixel-close (see MIGRATION.md).

const NAV = [
  { label: "Explore", href: "/explore" },
  { label: "Read", href: "/newsfeed" },
  { label: "Discover", href: "/discover/featured" },
  { label: "What is RuralHQ?", href: "/about" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-green-800">
          RuralHQ
        </Link>
        <nav className="hidden gap-6 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-700 hover:text-green-800"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link href="/sign-in" className="text-sm text-gray-700">
            Sign in
          </Link>
          <Link
            href="/add-listing"
            className="rounded bg-green-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-800"
          >
            Add Listing
          </Link>
        </div>
      </div>
    </header>
  );
}
