import Link from "next/link";
import type { Article } from "@/lib/types";

// Newsfeed article card, matching the live "Read" cards: image with a green
// category pill, green title, excerpt, a "READ MORE »" link and a date /
// comments footer.

export function ArticleCard({ article }: { article: Article }) {
  return (
    <Link
      href={`/${article.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition hover:-translate-y-0.5 hover:shadow-lg"
    >
      <div className="relative h-44">
        {article.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand/20 to-ink/10">
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-10 w-10 text-brand/50" aria-hidden>
              <path d="M22 3l-1.67 1.67L18.67 3 17 4.67 15.33 3l-1.66 1.67L12 3l-1.67 1.67L8.67 3 7 4.67 5.33 3 3.67 4.67 2 3v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2zm-9 13H7v-2h6zm4-4H7v-2h10zm0-4H7V6h10z" />
            </svg>
          </div>
        )}
        {article.category ? (
          <span className="absolute right-3 top-3 rounded-full bg-brand px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white shadow">
            {article.category}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-heading text-lg font-bold text-brand-dark group-hover:text-brand">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm text-body">{article.excerpt}</p>
        <span className="mt-3 text-sm font-semibold uppercase tracking-wide text-brand-dark">
          Read More »
        </span>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-gray-100 pt-3 text-xs text-muted">
          {article.author ? (
            <>
              <span className="font-medium text-ink">{article.author}</span>
              <span>·</span>
            </>
          ) : null}
          <span>
            {new Date(article.publishedAt).toLocaleDateString("en-NZ", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </span>
          <span>·</span>
          <span>No Comments</span>
        </div>
      </div>
    </Link>
  );
}

