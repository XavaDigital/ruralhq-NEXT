// Newsletter signups. Stores the email for now; swap saveSignup for an email
// provider (Mailchimp/Klaviyo) in production.

import { NextResponse } from "next/server";
import { saveSignup } from "@/lib/contact";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const firstName =
    typeof body.firstName === "string" ? body.firstName.trim() : undefined;
  const region =
    typeof body.region === "string" ? body.region.trim() : undefined;

  if (!email || !/.+@.+\..+/.test(email)) {
    return NextResponse.json(
      { error: "A valid email is required." },
      { status: 400 },
    );
  }
  await saveSignup({ email, firstName, region });
  return NextResponse.json({ ok: true }, { status: 201 });
}
