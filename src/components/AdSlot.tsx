// Google AdSense slot.
//
// AdSense needs the ad code present in server-rendered HTML, which SSR/ISR gives
// us for free. Set NEXT_PUBLIC_ADSENSE_CLIENT (ca-pub-xxxx) and per-slot ids in
// env. The <Script> for adsbygoogle.js itself is loaded once in layout.tsx.

"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

export function AdSlot({
  slot,
  format = "auto",
  className,
}: {
  slot: string;
  format?: string;
  className?: string;
}) {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  useEffect(() => {
    if (!client) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // adsbygoogle not ready yet; ignore.
    }
  }, [client]);

  if (!client) {
    // Placeholder so layout is visible during development.
    return (
      <div
        className={`flex items-center justify-center rounded border border-dashed border-gray-300 bg-gray-50 p-6 text-xs text-gray-400 ${className ?? ""}`}
      >
        Ad slot ({slot})
      </div>
    );
  }

  return (
    <ins
      className={`adsbygoogle ${className ?? ""}`}
      style={{ display: "block" }}
      data-ad-client={client}
      data-ad-slot={slot}
      data-ad-format={format}
      data-full-width-responsive="true"
    />
  );
}
