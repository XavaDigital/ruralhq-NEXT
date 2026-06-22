"use client";

import Link from "next/link";
import { useState } from "react";

// Dark, full-width header matching the live site: the RuralHQ logo sits hard
// left, "Add Listing" hard right, with an inline search and the primary nav
// between. Collapses to a hamburger below lg.

const LOGO = "https://ruralhq.co.nz/wp-content/uploads/2019/09/ruralhq-logo_white-small.png";

const NAV = [
  { label: "Explore", href: "/explore" },
  { label: "Contractors", href: "/contractors" },
  { label: "Read", href: "/newsfeed" },
  { label: "What is RuralHQ?", href: "/about" },
];

function SearchBox({ className }: { className?: string }) {
  return (
    <form action="/explore" className={`relative ${className ?? ""}`}>
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
        aria-hidden
      >
        <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.7.7l.27.28v.79l5 4.99L20.49 19zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14z" />
      </svg>
      <input
        name="q"
        placeholder="Type your search…"
        aria-label="Search"
        className="w-full rounded bg-white/10 py-1.5 pl-8 pr-3 text-sm text-white placeholder:text-gray-400 focus:bg-white/15 focus:outline-none"
      />
    </form>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-ink text-white">
      <div className="flex h-16 items-center gap-6 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO} alt="RuralHQ" className="h-9 w-auto" />
        </Link>
        <SearchBox className="hidden w-56 md:block" />

        <nav className="ml-auto hidden items-center gap-6 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-gray-200 transition-colors hover:text-brand"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Link
            href="/sign-in"
            className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
              <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zm0 2c-4.42 0-8 2.24-8 5v1h16v-1c0-2.76-3.58-5-8-5z" />
            </svg>
            Sign in or Register
          </Link>
          <Link
            href="/add-listing"
            className="flex items-center gap-1.5 rounded border border-white/30 px-4 py-1.5 text-sm font-semibold text-white hover:border-brand hover:bg-brand"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
              <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z" />
            </svg>
            Add Listing
          </Link>
        </div>

        <button
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="ml-auto flex h-10 w-10 items-center justify-center rounded text-white lg:hidden"
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

      {open ? (
        <nav className="border-t border-white/10 bg-ink lg:hidden">
          <div className="flex flex-col gap-1 px-4 py-3 sm:px-6">
            <SearchBox className="mb-2" />
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="py-2 text-sm font-medium text-gray-200"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/sign-in"
              onClick={() => setOpen(false)}
              className="py-2 text-sm text-gray-300"
            >
              Sign in or Register
            </Link>
            <Link
              href="/add-listing"
              onClick={() => setOpen(false)}
              className="mt-1 rounded border border-white/30 px-4 py-2 text-center text-sm font-semibold text-white"
            >
              Add Listing
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}
