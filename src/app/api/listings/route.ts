// Public listing-submission endpoint. Validates the draft, runs AI moderation,
// and stores it with the resulting status (approved / rejected / flagged).

import { NextResponse } from "next/server";
import { classifyListing } from "@/lib/moderation";
import { createSubmission } from "@/lib/submissions";
import type { ListingDraft } from "@/lib/types";

export const runtime = "nodejs"; // submission store uses fs

function str(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const title = str(body.title);
  const description = str(body.description);
  if (!title || title.length < 2) {
    return NextResponse.json({ error: "A title is required." }, { status: 400 });
  }
  if (!description || description.length < 10) {
    return NextResponse.json(
      { error: "Please add a longer description (at least 10 characters)." },
      { status: 400 },
    );
  }

  const draft: ListingDraft = {
    title,
    description,
    tagline: str(body.tagline),
    regionSlug: str(body.regionSlug),
    town: str(body.town),
    address: str(body.address),
    categories: Array.isArray(body.categories)
      ? (body.categories.filter((c) => typeof c === "string") as string[])
      : [],
    phone: str(body.phone),
    email: str(body.email),
    website: str(body.website),
    logoUrl: str(body.logoUrl),
    coverUrl: str(body.coverUrl),
  };

  const moderation = await classifyListing({
    title,
    description,
    website: draft.website,
  });
  const submission = await createSubmission(draft, moderation);

  return NextResponse.json(
    {
      id: submission.id,
      slug: submission.slug,
      status: submission.status,
      decision: moderation.decision,
      reason: moderation.reason,
    },
    { status: 201 },
  );
}
