"use client";

import { useState } from "react";
import Link from "next/link";
import type { Term } from "@/lib/types";

type Result =
  | { status: string; decision: string; reason: string; slug: string }
  | { error: string };

const field =
  "w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none";
const label = "block text-sm font-medium text-ink";

export function AddListingForm({
  regions,
  categories,
}: {
  regions: Term[];
  categories: Term[];
}) {
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);
    const form = new FormData(e.currentTarget);
    const payload = {
      title: form.get("title"),
      tagline: form.get("tagline"),
      description: form.get("description"),
      regionSlug: form.get("regionSlug"),
      town: form.get("town"),
      address: form.get("address"),
      phone: form.get("phone"),
      email: form.get("email"),
      website: form.get("website"),
      categories: form.getAll("categories"),
    };
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setResult(await res.json());
    } catch {
      setResult({ error: "Something went wrong. Please try again." });
    } finally {
      setSubmitting(false);
    }
  }

  if (result && "status" in result) {
    return <SubmittedMessage result={result} />;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {result && "error" in result ? (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">
          {result.error}
        </p>
      ) : null}

      <div>
        <label className={label} htmlFor="title">
          Business name *
        </label>
        <input id="title" name="title" required className={field} />
      </div>

      <div>
        <label className={label} htmlFor="tagline">
          Tagline
        </label>
        <input id="tagline" name="tagline" className={field} />
      </div>

      <div>
        <label className={label} htmlFor="description">
          Description *
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={5}
          className={field}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={label} htmlFor="regionSlug">
            Region
          </label>
          <select id="regionSlug" name="regionSlug" className={field}>
            <option value="">Select a region…</option>
            {regions.map((r) => (
              <option key={r.slug} value={r.slug}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={label} htmlFor="town">
            Town
          </label>
          <input id="town" name="town" className={field} />
        </div>
      </div>

      <div>
        <label className={label} htmlFor="categories">
          Categories <span className="text-muted">(hold Ctrl/Cmd to pick several)</span>
        </label>
        <select
          id="categories"
          name="categories"
          multiple
          size={6}
          className={field}
        >
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={label} htmlFor="address">
          Address
        </label>
        <input id="address" name="address" className={field} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className={label} htmlFor="phone">
            Phone
          </label>
          <input id="phone" name="phone" className={field} />
        </div>
        <div>
          <label className={label} htmlFor="email">
            Email
          </label>
          <input id="email" name="email" type="email" className={field} />
        </div>
        <div>
          <label className={label} htmlFor="website">
            Website
          </label>
          <input id="website" name="website" type="url" className={field} />
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Submit listing"}
      </button>
    </form>
  );
}

function SubmittedMessage({
  result,
}: {
  result: { status: string; decision: string; reason: string; slug: string };
}) {
  if (result.status === "approved") {
    return (
      <div className="rounded-lg border border-brand/30 bg-brand/5 p-5">
        <h2 className="font-slab text-lg font-bold text-ink">
          Your listing is live! 🎉
        </h2>
        <p className="mt-1 text-sm text-body">
          It passed our checks and has been published.
        </p>
        <Link
          href={`/businesses/${result.slug}`}
          className="mt-3 inline-block rounded bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          View your listing
        </Link>
      </div>
    );
  }
  if (result.status === "rejected") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-5">
        <h2 className="font-slab text-lg font-bold text-ink">
          We couldn&apos;t accept this listing
        </h2>
        <p className="mt-1 text-sm text-body">{result.reason}</p>
        <p className="mt-1 text-sm text-muted">
          If you think this is a mistake, please get in touch.
        </p>
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-5">
      <h2 className="font-slab text-lg font-bold text-ink">
        Thanks — your listing is in review
      </h2>
      <p className="mt-1 text-sm text-body">
        We give submissions a quick human check before they go live. You&apos;ll
        see it in the directory shortly.
      </p>
    </div>
  );
}
