"use client";

import { useState, type ReactNode } from "react";

// Tabbed panels for the listing detail (Profile / Reviews / Related), matching
// the My Listing single-listing layout. Panels are server-rendered and passed
// in; this only toggles which is visible.

export interface Tab {
  id: string;
  label: ReactNode;
  panel: ReactNode;
}

export function ListingTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  return (
    <div>
      <div className="flex gap-7 overflow-x-auto border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActive(t.id)}
            className={`-mb-px whitespace-nowrap border-b-2 py-3 text-sm font-semibold transition-colors ${
              active === t.id
                ? "border-brand text-ink"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="py-6">{tabs.find((t) => t.id === active)?.panel}</div>
    </div>
  );
}
