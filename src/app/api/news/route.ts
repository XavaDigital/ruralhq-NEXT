// AI news-synopsis generation endpoint (stub).
//
// Intended to run on a schedule (e.g. a daily cron / Vercel Cron / external
// trigger hitting this route with a shared secret) to keep the newsfeed fresh —
// the live site's feed has been stale since 2019, so this is filling a real gap.
//
// Flow: pull rural-NZ source material (RSS feeds, press releases, supplied
// links) -> ask Claude to write a short, original synopsis with a headline and
// excerpt -> save as a draft Article (aiGenerated: true) for review, or
// auto-publish once you trust the pipeline.
//
// Guardrails to add before auto-publishing: dedupe against existing articles,
// require attribution/sources, and keep a human approval step initially.
//
// To wire up: protect with a CRON_SECRET header check, set ANTHROPIC_API_KEY,
// and replace the stub with a real Claude call + a write to the articles table.

import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // STUB: pretend we generated one draft synopsis.
  const draft = {
    slug: "stub-generated-synopsis",
    title: "Stub: AI-generated rural news synopsis",
    excerpt: "Wire up ANTHROPIC_API_KEY and a source feed to generate real ones.",
    aiGenerated: true,
    status: "draft",
  };

  return NextResponse.json({ generated: [draft] });
}
