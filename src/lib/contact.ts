// Lightweight store for contact-style messages and newsletter signups.
//
// File-backed (.data/, gitignored) for dev — same pattern as the submission
// store. In production these become a DB table or, for the newsletter, a push
// to an email provider (Mailchimp/Klaviyo). Server-only.

import { promises as fs } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

const DIR = path.join(process.cwd(), ".data");

async function append(file: string, record: object): Promise<void> {
  const filePath = path.join(DIR, file);
  let items: unknown[] = [];
  try {
    items = JSON.parse(await fs.readFile(filePath, "utf-8"));
  } catch {
    // no file yet
  }
  items.push(record);
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(items, null, 2), "utf-8");
}

export async function saveMessage(m: {
  topic: string;
  name: string;
  email: string;
  message: string;
}): Promise<void> {
  await append("messages.json", {
    id: randomUUID(),
    ...m,
    createdAt: new Date().toISOString(),
  });
}

export async function saveSignup(s: {
  email: string;
  firstName?: string;
  region?: string;
}): Promise<void> {
  await append("newsletter.json", {
    id: randomUUID(),
    ...s,
    createdAt: new Date().toISOString(),
  });
}
