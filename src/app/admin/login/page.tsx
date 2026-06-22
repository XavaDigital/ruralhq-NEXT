import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="font-slab text-2xl font-bold text-ink">Admin sign in</h1>
      <p className="mt-1 text-sm text-muted">
        Restricted area — moderation review queue.
      </p>
      <LoginForm next={next ?? "/admin/review"} />
    </div>
  );
}
