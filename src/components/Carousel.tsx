"use client";

import { useRef, type ReactNode } from "react";

// Horizontal scroll-snap carousel with prev/next arrows, matching the live
// "See what's new" / "What are we talking about" carousels. Children should be
// fixed-width snap items.
export function Carousel({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: number) =>
    ref.current?.scrollBy({ left: dir * 320, behavior: "smooth" });

  return (
    <div className="relative">
      <div
        ref={ref}
        className="flex snap-x gap-5 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
      <div className="mt-2 flex justify-center gap-3">
        <button
          type="button"
          aria-label="Previous"
          onClick={() => scroll(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-muted hover:border-brand hover:text-brand"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="Next"
          onClick={() => scroll(1)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 text-muted hover:border-brand hover:text-brand"
        >
          ›
        </button>
      </div>
    </div>
  );
}
