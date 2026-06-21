// AI moderation for incoming listings.
//
// classifyListing() decides whether a submission is legit (approve), spam
// (reject), or uncertain (flag for human review). When ANTHROPIC_API_KEY is
// set it asks Claude; otherwise it falls back to a transparent heuristic so the
// whole submission flow works locally without any keys.
//
// Server-only (reads env / may call an external API). Only imported by route
// handlers — never from a client component.

import type { ListingDraft, ModerationResult } from "./types";

const SPAM_SIGNALS = [
  "casino",
  "viagra",
  "crypto giveaway",
  "free money",
  "make money fast",
  "buy followers",
  "porn",
  "loan approval",
];

export async function classifyListing(
  draft: Pick<ListingDraft, "title" | "description" | "website">,
): Promise<ModerationResult> {
  if (process.env.ANTHROPIC_API_KEY) {
    try {
      return await classifyWithClaude(draft);
    } catch (err) {
      // Fall through to the heuristic rather than failing the submission.
      console.error("Claude moderation failed, using heuristic:", err);
    }
  }
  return classifyHeuristic(draft);
}

// ---------------------------------------------------------------------------
// Heuristic fallback. Obvious spam -> reject; everything else -> flag for a
// human (the heuristic can't confidently approve). With Claude wired up, clean
// legit listings auto-approve instead.
// ---------------------------------------------------------------------------
function classifyHeuristic(
  draft: Pick<ListingDraft, "title" | "description" | "website">,
): ModerationResult {
  const text = `${draft.title} ${draft.description}`.toLowerCase();
  const hit = SPAM_SIGNALS.find((s) => text.includes(s));
  if (hit) {
    return {
      decision: "rejected",
      spamProbability: 0.95,
      confidence: 0.9,
      reason: `Matched spam signal: "${hit}".`,
      model: "heuristic",
    };
  }
  if (draft.description.trim().length < 30) {
    return {
      decision: "flagged",
      spamProbability: 0.4,
      confidence: 0.3,
      reason: "Description is very short; needs a human look.",
      model: "heuristic",
    };
  }
  return {
    decision: "flagged",
    spamProbability: 0.15,
    confidence: 0.35,
    reason: "No AI configured — routed to human review.",
    model: "heuristic",
  };
}

// ---------------------------------------------------------------------------
// Claude classifier. Uses a cheap, fast model for high-volume moderation and
// forces a structured JSON verdict. Dynamically imports the SDK so the package
// is only required when a key is actually configured.
// ---------------------------------------------------------------------------
async function classifyWithClaude(
  draft: Pick<ListingDraft, "title" | "description" | "website">,
): Promise<ModerationResult> {
  // @anthropic-ai/sdk is an OPTIONAL dependency, loaded only when a key is set.
  // The variable specifier stops TypeScript resolving its types; the ignore
  // comments stop the bundler hard-requiring it at build time. To enable Claude
  // moderation: pnpm add @anthropic-ai/sdk  (and set ANTHROPIC_API_KEY).
  const sdkName = "@anthropic-ai/sdk";
  const mod = await import(
    /* webpackIgnore: true */ /* turbopackIgnore: true */ sdkName
  );
  const client = new mod.default();
  const model = "claude-haiku-4-5";

  const prompt = `You are moderating a free business listing for RuralHQ, a rural New Zealand directory. Decide if it is a legitimate rural business/service listing or spam.

Title: ${draft.title}
Website: ${draft.website ?? "(none)"}
Description: ${draft.description}

Respond with ONLY a JSON object: {"spamProbability": <0-1>, "confidence": <0-1>, "reason": "<short>"}. Spam = irrelevant, scammy, adult, gambling, fake, or keyword-stuffed. Legit = a real rural NZ business, contractor, or service.`;

  const res = await client.messages.create({
    model,
    max_tokens: 200,
    messages: [{ role: "user", content: prompt }],
  });

  const block = res.content.find(
    (b: { type: string; text?: string }) => b.type === "text",
  );
  const raw = block?.text ?? "{}";
  const json = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
  const spamProbability = Number(json.spamProbability ?? 0.5);
  const confidence = Number(json.confidence ?? 0.5);

  // Policy: confident verdicts auto-act; anything uncertain goes to review.
  let decision: ModerationResult["decision"] = "flagged";
  if (confidence >= 0.85 && spamProbability >= 0.8) decision = "rejected";
  else if (confidence >= 0.85 && spamProbability <= 0.2) decision = "approved";

  return {
    decision,
    spamProbability,
    confidence,
    reason: String(json.reason ?? ""),
    model,
  };
}
