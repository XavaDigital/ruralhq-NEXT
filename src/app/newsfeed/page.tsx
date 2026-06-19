// Newsfeed index ("Read"). On the live site this lapsed in 2019 — the AI
// news-synopsis pipeline (see src/app/api/news) is meant to keep it fresh.

import type { Metadata } from "next";
import Link from "next/link";
import { getArticles } from "@/lib/data";

export const metadata: Metadata = {
  title: "Read — rural New Zealand news & insights",
  description:
    "Short news synopses and expert insights for rural New Zealand, updated regularly.",
};

export default async function NewsfeedPage() {
  const articles = await getArticles();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Read</h1>
      <ul className="mt-6 space-y-6">
        {articles.map((article) => (
          <li key={article.slug} className="border-b border-gray-100 pb-6">
            <Link
              href={`/${article.slug}`}
              className="text-lg font-semibold text-green-800 hover:underline"
            >
              {article.title}
            </Link>
            <p className="mt-1 text-sm text-gray-600">{article.excerpt}</p>
            <p className="mt-1 text-xs text-gray-400">
              {new Date(article.publishedAt).toLocaleDateString("en-NZ")}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
