import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root to this project so Turbopack doesn't infer it from a
  // stray lockfile higher up the tree (e.g. C:\Users\cirni\package-lock.json).
  turbopack: { root: __dirname },
  async redirects() {
    return [
      // Contractor detail pages canonically live under /businesses/ (mirrors the
      // live site, where /contractors/{slug} 301s to /businesses/{slug}).
      // Note: /contractors (no slug) is the browse section and is NOT redirected.
      {
        source: "/contractors/:slug",
        destination: "/businesses/:slug",
        permanent: true,
      },
    ];
  },
  images: {
    // Listing media still points at the existing WordPress uploads CDN until
    // assets are migrated; allow it through next/image.
    remotePatterns: [{ protocol: "https", hostname: "ruralhq.co.nz" }],
  },
};

export default nextConfig;
