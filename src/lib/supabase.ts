// Supabase client placeholder.
//
// Not wired up yet — the data layer (src/lib/data.ts) returns mock data for now.
// When the database is available:
//   1. npm i @supabase/supabase-js @supabase/ssr
//   2. Fill SUPABASE_URL / keys in .env.local (see .env.example)
//   3. Replace the bodies in data.ts with queries via this client.
//
// Two clients are intended: an anon client for public reads (RLS-protected) and
// a service-role client used only in server-side moderation/cron routes.

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "Supabase env not configured. Copy .env.example to .env.local and fill it in.",
    );
  }
  return { url, anonKey };
}
