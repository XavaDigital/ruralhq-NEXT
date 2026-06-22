"use client";

import { useState } from "react";

// Shared form for Contact / Make a Suggestion / Report an Error. The `topic`
// distinguishes them server-side; `cta` labels the button.

const field =
  "w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none";

export function ContactForm({
  topic,
  cta = "Send message",
}: {
  topic: string;
  cta?: string;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          name: form.get("name"),
          email: form.get("email"),
          message: form.get("message"),
        }),
      });
      const json = await res.json();
      if (res.ok) setDone(true);
      else setError(json.error ?? "Something went wrong.");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-lg border border-brand/30 bg-brand/5 p-5 text-sm text-body">
        Thanks — we&apos;ve received your message and will be in touch.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? (
        <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-ink">
            Name
          </label>
          <input id="name" name="name" className={field} />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink">
            Email *
          </label>
          <input id="email" name="email" type="email" required className={field} />
        </div>
      </div>
      <div>
        <label htmlFor="message" className="block text-sm font-medium text-ink">
          Message *
        </label>
        <textarea id="message" name="message" required rows={5} className={field} />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded bg-brand px-5 py-2.5 font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {submitting ? "Sending…" : cta}
      </button>
    </form>
  );
}
