"use server";

import { revalidatePath } from "next/cache";
import { setSubmissionStatus } from "@/lib/submissions";

// Approve/reject a flagged submission. Implemented as server actions (not a
// public API) so the mutation isn't exposed to the world; in production this
// page sits behind admin auth. Revalidates the directory so an approval shows
// up immediately.
async function decide(formData: FormData, status: "approved" | "rejected") {
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
