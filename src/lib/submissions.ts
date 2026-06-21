// Submission store for user-created listings + their moderation state.
//
// Backed by a local JSON file (.data/submissions.json, gitignored) so the whole
// submit -> moderate -> review -> publish loop works in dev without a database.
// When Supabase is wired, replace the read/write helpers with table queries —
// the exported functions keep their signatures.
//
// Server-only: uses fs. Imported only by route handlers and server components.

import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type {
  Listing,
  ListingDraft,
  ModerationResult,
  ModerationStatus,
  Submission,
} from "./types";

const FILE = path.join(process.cwd(), ".data", "submissions.json");

export function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "listing"
  );
}

async function readAll(): Promise<Submission[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf-8")) as Submission[];
  } catch {
    return [];
  }
}

async function writeAll(items: Submission[]): Promise<void> {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(items, null, 2), "utf-8");
}

export async function createSubmission(
  draft: ListingDraft,
  moderation: ModerationResult,
): Promise<Submission> {
  const items = await readAll();
  let slug = slugify(draft.title);
  if (items.some((s) => s.slug === slug)) slug = `${slug}-${randomUUID().slice(0, 4)}`;
  const now = new Date().toISOString();
  const submission: Submission = {
    ...draft,
    id: randomUUID(),
    slug,
    status: moderation.decision === "approved" ? "approved"
      : moderation.decision === "rejected" ? "rejected"
      : "flagged",
    moderation,
    createdAt: now,
    updatedAt: now,
  };
  items.push(submission);
  await writeAll(items);
  return submission;
}

export async function listSubmissions(
  status?: ModerationStatus,
): Promise<Submission[]> {
  const items = await readAll();
  const filtered = status ? items.filter((s) => s.status === status) : items;
  return filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function setSubmissionStatus(
  id: string,
  status: ModerationStatus,
): Promise<Submission | null> {
  const items = await readAll();
  const sub = items.find((s) => s.id === id);
  if (!sub) return null;
  sub.status = status;
  sub.updatedAt = new Date().toISOString();
  await writeAll(items);
  return sub;
}

// Approved submissions projected into the directory's Listing shape, so a
// reviewer's approval makes the listing appear in /explore and at its URL.
export async function getApprovedSubmissionListings(): Promise<Listing[]> {
  const items = await readAll();
  return items.filter((s) => s.status === "approved").map(submissionToListing);
}

function submissionToListing(s: Submission): Listing {
  const plain = s.description.replace(/<[^>]+>/g, "").trim();
  return {
    id: s.id,
    type: "businesses",
    slug: s.slug,
    title: s.title,
    tagline: s.tagline,
    excerpt: plain.length > 160 ? plain.slice(0, 159) + "…" : plain,
    description: /<\w/.test(s.description)
      ? s.description
      : `<p>${s.description}</p>`,
    address: s.address,
    regionSlug: s.regionSlug,
    town: s.town,
    categories: s.categories,
    phone: s.phone,
    email: s.email,
    website: s.website,
    social: s.social,
    logoUrl: s.logoUrl,
    coverUrl: s.coverUrl,
    imageUrl: s.coverUrl,
    status: "approved",
    createdAt: s.createdAt,
    updatedAt: s.updatedAt,
  };
}
