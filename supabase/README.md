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

## The flip

`src/lib/data.ts` currently reads the JSON sample in `src/data/`. Once the DB is
loaded, its query functions get swapped to Supabase queries (same signatures, so
nothing in the UI changes). Search uses the Postgres FTS `search` column to
start; can move to Meilisearch/Typesense later without a schema change.
