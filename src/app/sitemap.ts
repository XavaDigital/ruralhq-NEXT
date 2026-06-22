// Dynamic sitemap generated from the data layer. Mirrors the live Rank Math
// sitemap coverage: every listing (by type-prefixed URL), every article, plus
// key index pages. For ~thousands of listings this is fine as a single file; if
// it grows past ~50k URLs, split via generateSitemaps().

import type { MetadataRoute } from "next";
import { getAllListings, getArticles } from "@/lib/data";
import { absoluteUrl, listingPath } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/explore"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/contractors"), changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/newsfeed"), changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/add-listing"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/about"), changeFrequency: "monthly", priority: 0.5 },
    ...[
      "/faq",
      "/guidelines",
      "/business-support",
      "/contributors",
      "/contact",
      "/suggestion",
      "/report",
      "/privacy",
      "/terms",
    ].map((p) => ({
      url: absoluteUrl(p),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];

  for (const listing of await getAllListings()) {
    entries.push({
      url: absoluteUrl(listingPath(listing)),
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  for (const article of await getArticles()) {
    entries.push({
      url: absoluteUrl(`/${article.slug}`),
      lastModified: article.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
