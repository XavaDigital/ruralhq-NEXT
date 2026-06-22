"use client";

import { useState } from "react";

// Newsletter signup. `variant="dark"` is used in the footer band (white inputs
// on the green band); the default is for light sections.
export function NewsletterForm({
  variant = "light",
  cta = "Send me the good stuff!",
}: {
  variant?: "light" | "dark";
  cta?: string;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const email = new FormData(e.currentTarget).get("email");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) setDone(true);
      else setError((await res.json()).error ?? "Something went wrong.");
    } catch {
      setError("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <p
        className={`text-sm font-medium ${variant === "dark" ? "text-white" : "text-brand-dark"}`}
      >
        🎉 You&apos;re subscribed — thanks!
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-sm flex-col gap-2 sm:flex-row">
      <input
        name="email"
        type="email"
        required
        placeholder="Your email"
        aria-label="Email"
        className="flex-1 rounded border border-gray-300 px-3 py-2.5 text-sm text-ink outline-none focus:border-brand"
      />
      <button
        type="submit"
        disabled={submitting}
        className={`shrink-0 rounded px-5 py-2.5 text-sm font-semibold disabled:opacity-60 ${
          variant === "dark"
            ? "bg-ink text-white hover:bg-black"
            : "bg-brand text-white hover:bg-brand-dark"
        }`}
      >
        {submitting ? "…" : cta}
      </button>
    </form>
  );
}
