// Server-side auth helpers (use next/headers cookies). Imported by server
// actions / components — NOT by middleware (which reads the cookie off the
// request directly).

import { cookies } from "next/headers";
import { COOKIE_NAME, verifySessionToken } from "./auth";

export async function isAdmin(): Promise<boolean> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

// Guard for server actions — server actions are globally invocable by id, so
// they can't rely on the page-level middleware gate alone.
export async function requireAdmin(): Promise<void> {
  if (!(await isAdmin())) throw new Error("Unauthorized");
}
