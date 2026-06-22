# Supabase

Schema and seed for the RuralHQ database.

## Files

- `migrations/0001_init.sql` — schema: `regions`, `categories`, `listings`
  (with enums, FTS `search` column, indexes, an `updated_at` trigger) and RLS
  policies (public reads approved listings + all taxonomy rows; writes go
  through the service-role key in server routes).
- `seed.sql` — **generated, gitignored**. The full dataset (all ~2,700
  businesses + ~1,040 contractors + regions + categories) as idempotent
  `insert … on conflict do nothing`. Regenerate any time from the WP dump:

  ```bash
  python migration/etl.py path/to/dump.sql   # writes supabase/seed.sql
  ```

## One-time load (when the project exists)

1. Create a Supabase project. Copy the keys into `.env.local` (see
   `.env.example`): `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
2. Apply the schema, then the seed. Either via the Supabase SQL editor (paste
   each file) or with psql against the session connection string:

   ```bash
   psql "$DATABASE_URL_SESSION" -f supabase/migrations/0001_init.sql
   psql "$DATABASE_URL_SESSION" -f supabase/seed.sql
   ```

3. Verify: `select type, count(*) from listings group by type;`
   (expect ~2,697 businesses, ~1,042 contractors).

## Data layer (done)

The app talks to Postgres via a **portable connection string** (`DATABASE_URL`,
`postgres` driver in `src/lib/db.ts`) — not the Supabase JS client — so the same
code runs on Supabase, AWS RDS, or local Docker. When `DATABASE_URL` is unset it
falls back to the JSON seed + file submission store.

- **Local dev (fast):** `docker run -d --name rhq-pg -e POSTGRES_PASSWORD=postgres -p 55432:5432 postgres:16`,
  load `migrations/0001_init.sql` then `seed.sql`, and set
  `DATABASE_URL=postgres://postgres:postgres@localhost:55432/postgres`.
- **Production:** point `DATABASE_URL` at the Supabase **transaction pooler**
  (`…pooler.supabase.com:6543`, IPv4) or an RDS endpoint. SSL auto-applies for
  non-local hosts.

User submissions are stored in the `listings` table (non-approved status +
`moderation` jsonb); approving flips status to `approved` and the listing
appears in the directory. Search uses the FTS `search` column (swap for
Meilisearch/Typesense later without a schema change).

> ⚠️ **Region:** the current Supabase project is in `ap-northeast-1` (Tokyo),
> which adds ~1–2s/query latency for NZ users. For production, recreate it in
> `ap-southeast-2` (Sydney) — far closer — and rely on ISR caching for listing
> pages so most requests serve static HTML with no per-request DB hit.
