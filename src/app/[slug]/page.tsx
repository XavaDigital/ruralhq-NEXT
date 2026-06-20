// Article detail at the root URL (e.g. /improving-the-value-of-strong-wool),
// matching the live site's permalink structure. Static folder routes
// (/explore, /businesses, …) take precedence over this dynamic segment, so it
// only catches article slugs; anything unknown 404s.

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getArticle, getArticleSlugs } from "@/lib/data";
import { JsonLd } from "@/components/JsonLd";
import { AdSlot } from "@/components/AdSlot";
import { absoluteUrl, articleJsonLd } from "@/lib/seo";

type RouteProps = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getArticleSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: RouteProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return {};
  const url = absoluteUrl(`/${article.slug}`);
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: url },
    openGraph: { title: article.title, description: article.excerpt, url },
  };
}

export default async function ArticlePage({ params }: RouteProps) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  return (
    <article className="mx-auto max-w-3xl px-4 py-8">
      <JsonLd data={articleJsonLd(article)} />
      <h1 className="font-slab text-3xl font-bold text-ink">{article.title}</h1>
      <p className="mt-2 text-sm text-gray-500">
        {new Date(article.publishedAt).toLocaleDateString("en-NZ")}
        {article.aiGenerated ? " · AI-assisted summary" : ""}
      </p>
      <div className="my-6">
        <AdSlot slot="article-top" />
      </div>
      <div
        className="max-w-none text-body leading-relaxed [&_a]:text-brand-dark [&_a]:underline [&>p]:mb-3"
        dangerouslySetInnerHTML={{ __html: article.body }}
      />
    </article>
  );
}
