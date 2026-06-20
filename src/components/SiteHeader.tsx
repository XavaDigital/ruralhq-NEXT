"use client";

import Link from "next/link";
import { useState } from "react";

// Primary navigation mirrors the live site (Explore / Contractors / Read), with
// a hamburger menu below the 767px breakpoint to match its responsive header.

const NAV = [
  { label: "Explore", href: "/explore" },
  { label: "Contractors", href: "/contractors" },
  { label: "Read", href: "/newsfeed" },
  { label: "What is RuralHQ?", href: "/about" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="container-rhq flex items-center justify-between py-3.5">
        <Link
          href="/"
          className="font-slab text-xl font-bold text-brand"
          onClick={() => setOpen(false)}
        >
          Rural<span className="text-ink">HQ</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-ink transition-colors hover:text-brand"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link href="/sign-in" className="text-sm font-medium text-ink">
            Sign in
          </Link>
          <Link
            href="/add-listing"
            className="rounded bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
          >
            Add Listing
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="flex h-10 w-10 items-center justify-center rounded text-ink md:hidden"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {open ? (
        <nav className="border-t border-gray-100 bg-white md:hidden">
          <div className="container-rhq flex flex-col py-2">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-2.5 text-sm font-medium text-ink"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/add-listing"
              onClick={() => setOpen(false)}
              className="mt-2 rounded bg-brand px-4 py-2.5 text-center text-sm font-semibold text-white"
            >
              Add Listing
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
