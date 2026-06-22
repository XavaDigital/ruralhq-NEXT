"use server";

import { revalidatePath } from "next/cache";
import { setSubmissionStatus } from "@/lib/submissions";
import { requireAdmin } from "@/lib/auth-server";

// Approve/reject a flagged submission. Server actions are globally invocable by
// id, so each one re-checks admin auth (the page-level middleware gate isn't
// enough on its own). Revalidates the directory so an approval shows up
// immediately.
async function decide(formData: FormData, status: "approved" | "rejected") {
  await requireAdmin();
  const id = String(formData.get("id"));
  await setSubmissionStatus(id, status);
  revalidatePath("/admin/review");
  revalidatePath("/explore");
  revalidatePath("/");
}

export async function approve(formData: FormData) {
  await decide(formData, "approved");
}

export async function reject(formData: FormData) {
  await decide(formData, "rejected");
}
