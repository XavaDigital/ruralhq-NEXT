// Standalone moderation endpoint — classify a draft without storing it (useful
// for testing the classifier or pre-checking in the UI). The actual submission
// flow lives in POST /api/listings.
//
// Policy (see src/lib/moderation.ts): confident legit -> approved, confident
// spam -> rejected, uncertain -> flagged (human review queue).

import { NextResponse } from "next/server";
import { classifyListing } from "@/lib/moderation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    title?: string;
    description?: string;
    website?: string;
  };
  if (!body.title || !body.description) {
    return NextResponse.json(
      { error: "title and description are required" },
      { status: 400 },
    );
  }
  const result = await classifyListing({
    title: body.title,
    description: body.description,
    website: body.website,
  });
  return NextResponse.json(result);
}
