// Moderation review queue. Shows submissions the AI flagged as uncertain, with
// its verdict, so a human can approve or reject. Approving publishes the listing
// to the directory.
//
// NOTE: prototype has no auth — in production this must sit behind admin login.
// It's disallowed in robots.txt. Always rendered fresh (reads the store).

import type { Metadata } from "next";
import { listSubmissions } from "@/lib/submissions";
import { regionName } from "@/lib/data";
import { approve, reject } from "./actions";
import { logout } from "../login/actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Review queue", robots: { index: false } };

function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

export default async function ReviewPage() {
  const [flagged, approved, rejected] = await Promise.all([
    listSubmissions("flagged"),
    listSubmissions("approved"),
    listSubmissions("rejected"),
  ]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-ink">Review queue</h1>
        <form action={logout}>
          <button className="text-sm text-muted hover:text-ink">Sign out</button>
        </form>
      </div>
      <p className="mt-1 text-sm text-muted">
        {flagged.length} awaiting review · {approved.length} approved ·{" "}
        {rejected.length} rejected
      </p>

      {flagged.length === 0 ? (
        <p className="mt-10 rounded-lg border border-dashed border-gray-300 p-8 text-center text-muted">
          Nothing to review right now.
        </p>
      ) : (
        <ul className="mt-6 space-y-4">
          {flagged.map((s) => (
            <li
              key={s.id}
              className="rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-heading font-bold text-ink">{s.title}</h2>
                  <p className="text-xs text-muted">
                    {[s.town, regionName(s.regionSlug)].filter(Boolean).join(", ")}
                  </p>
                </div>
                <span className="shrink-0 rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                  spam {pct(s.moderation.spamProbability)} · conf{" "}
                  {pct(s.moderation.confidence)}
                </span>
              </div>

              <p className="mt-2 line-clamp-3 text-sm text-body">
                {s.description}
              </p>

              <p className="mt-2 text-xs text-muted">
                <span className="font-medium">AI ({s.moderation.model}):</span>{" "}
                {s.moderation.reason}
              </p>

              <div className="mt-3 flex gap-2">
                <form action={approve}>
                  <input type="hidden" name="id" value={s.id} />
                  <button className="rounded bg-brand px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-dark">
                    Approve
                  </button>
                </form>
                <form action={reject}>
                  <input type="hidden" name="id" value={s.id} />
                  <button className="rounded border border-gray-300 px-4 py-1.5 text-sm font-semibold text-ink hover:bg-gray-50">
                    Reject
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

