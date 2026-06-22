"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { COOKIE_NAME, constantTimeEqual, createSessionToken } from "@/lib/auth";

export type LoginState = { error?: string } | null;

export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");
  const nextRaw = String(formData.get("next") ?? "/admin/review");
  const next = nextRaw.startsWith("/admin") ? nextRaw : "/admin/review";

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || !process.env.SESSION_SECRET) {
    return {
      error:
        "Admin auth isn't configured. Set ADMIN_PASSWORD and SESSION_SECRET.",
    };
  }
  if (!constantTimeEqual(password, expected)) {
    return { error: "Incorrect password." };
  }

  (await cookies()).set(COOKIE_NAME, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  redirect(next);
}

export async function logout(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
  redirect("/admin/login");
}
