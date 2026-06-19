// Dynamic sitemap generated from the data layer. Mirrors the live Rank Math
// sitemap coverage: every listing (by type-prefixed URL), every article, plus
// key index pages. For ~thousands of listings this is fine as a single file; if
// it grows past ~50k URLs, split via generateSitemaps().

import type { MetadataRoute } from "next";
import { getArticles, getListingSlugs } from "@/lib/data";
import { LISTING_TYPES } from "@/lib/types";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/explore"), changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/newsfeed"), changeFrequency: "daily", priority: 0.8 },
  ];

  for (const type of LISTING_TYPES) {
    const slugs = await getListingSlugs(type);
    for (const slug of slugs) {
      entries.push({
        url: absoluteUrl(`/${type}/${slug}`),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
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
