// Minimal, portable admin auth — a stateless signed session cookie (HMAC-SHA256
// via Web Crypto, so it runs in both Edge middleware and Node). No external auth
// service, so it isn't tied to Supabase and survives a move to RDS.
//
// Requires two env vars:
//   ADMIN_PASSWORD  — the admin login password
//   SESSION_SECRET  — random secret used to sign session cookies
//
// This module is pure crypto (no next/headers / fs) so middleware can import it.

export const COOKIE_NAME = "rhq_admin";
const SESSION_MS = 7 * 24 * 60 * 60 * 1000;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function b64url(bytes: Uint8Array): string {
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlToBytes(input: string): Uint8Array {
  let s = input.replace(/-/g, "+").replace(/_/g, "/");
  s += "=".repeat((4 - (s.length % 4)) % 4);
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

async function sign(data: string): Promise<string> {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return b64url(new Uint8Array(sig));
}

export async function createSessionToken(): Promise<string> {
  const payload = b64url(
    encoder.encode(JSON.stringify({ role: "admin", exp: Date.now() + SESSION_MS })),
  );
  return `${payload}.${await sign(payload)}`;
}

export async function verifySessionToken(
  token: string | undefined | null,
): Promise<boolean> {
  if (!token || !process.env.SESSION_SECRET) return false;
  const dot = token.lastIndexOf(".");
  if (dot < 1) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  let expected: string;
  try {
    expected = await sign(payload);
  } catch {
    return false;
  }
  if (!constantTimeEqual(sig, expected)) return false;
  try {
    const { exp } = JSON.parse(decoder.decode(b64urlToBytes(payload)));
    return typeof exp === "number" && Date.now() < exp;
  } catch {
    return false;
  }
}
