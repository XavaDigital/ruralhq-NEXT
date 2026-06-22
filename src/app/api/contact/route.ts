// Contact / suggestion / error-report submissions.

import { NextResponse } from "next/server";
import { saveMessage } from "@/lib/contact";

export const runtime = "nodejs";

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const name = str(body.name);
  const email = str(body.email);
  const message = str(body.message);
  const topic = str(body.topic) || "contact";

  if (!email || !/.+@.+\..+/.test(email)) {
    return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
  }
  if (message.length < 5) {
    return NextResponse.json({ error: "Please add a message." }, { status: 400 });
  }

  await saveMessage({ topic, name, email, message });
  return NextResponse.json({ ok: true }, { status: 201 });
}
