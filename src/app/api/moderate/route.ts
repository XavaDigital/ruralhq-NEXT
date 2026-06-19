// AI listing moderation endpoint (stub).
//
// Flow: a new/edited listing is submitted -> this endpoint asks Claude to
// classify it as legit vs spam, returning a decision + confidence + reason.
// Recommended policy to start: human-in-the-loop.
//   - confidence >= 0.85 & legit  -> auto-approve
//   - confidence >= 0.85 & spam   -> auto-reject
//   - otherwise                   -> "flagged" -> human review queue
// Tighten the auto-approve threshold as the classifier earns trust.
//
// To wire up: `npm i @anthropic-ai/sdk`, set ANTHROPIC_API_KEY, and replace the
// stubbed classification below with a real call (model: claude-opus-4-8 or a
// cheaper tier like claude-haiku-4-5 for high volume).

import { NextResponse } from "next/server";

interface ModerationRequest {
  title: string;
  description: string;
  website?: string;
}

interface ModerationResult {
  decision: "approved" | "rejected" | "flagged";
  spamProbability: number;
  confidence: number;
  reason: string;
}

export async function POST(request: Request) {
  const body = (await request.json()) as ModerationRequest;

  if (!body?.title || !body?.description) {
    return NextResponse.json(
      { error: "title and description are required" },
      { status: 400 },
    );
  }

  const result = await classifyListing(body);
  return NextResponse.json(result);
}

// ---------------------------------------------------------------------------
// STUB: deterministic heuristic placeholder. Replace with a Claude call.
// ---------------------------------------------------------------------------
async function classifyListing(
  listing: ModerationRequest,
): Promise<ModerationResult> {
  const text = `${listing.title} ${listing.description}`.toLowerCase();
  const spammySignals = ["casino", "viagra", "crypto giveaway", "free money"];
  const hit = spammySignals.find((s) => text.includes(s));

  if (hit) {
    return {
      decision: "rejected",
      spamProbability: 0.95,
      confidence: 0.9,
      reason: `Matched spam signal: "${hit}" (stubbed heuristic).`,
    };
  }

  return {
    decision: "flagged",
    spamProbability: 0.2,
    confidence: 0.4,
    reason:
      "Stubbed classifier — no AI configured yet. Defaulting to human review.",
  };
}
