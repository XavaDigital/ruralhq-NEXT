// Portable Postgres data access. Active whenever DATABASE_URL is set — works
// identically against local Docker Postgres, Supabase (pooled :6543), or AWS
// RDS, since it speaks plain Postgres (no provider-specific client).
//
// When DATABASE_URL is unset, `sql` is null and the app falls back to the JSON
// seed + file submission store (see data.ts / submissions.ts).
//
// Server-only: imported by the data layer, never by a client component.

import postgres from "postgres";
import type {
  Listing,
  ListingDraft,
  ModerationResult,
  ModerationStatus,
  Submission,
} from "./types";

const url = process.env.DATABASE_URL;
// Local Docker has no TLS; managed Postgres (Supabase pooler / RDS) requires it.
const isLocal = /localhost|127\.0\.0\.1|::1/.test(url ?? "");

// Reuse one pool across HMR / module reloads so dev doesn't exhaust connections.
const g = globalThis as unknown as { __rhqSql?: postgres.Sql };
export const sql: postgres.Sql | null = url
  ? (g.__rhqSql ??= postgres(url, {
      // Small per-process pool: Next's build spawns many workers, each with its
      // own pool, so keep the total well under Postgres max_connections.
      max: 3,
      idle_timeout: 20,
      // prepare:false keeps us compatible with transaction-mode poolers
      // (Supabase :6543 / pgbouncer).
      prepare: false,
      ssl: isLocal ? false : "require",
    }))
  : null;

export const usingDb = sql !== null;

// The driver's json() has a very strict JSONValue type that rejects arrays of
// objects (no index signature). Our values are valid JSON, so cast at the
// boundary via the driver's own expected parameter type.
type JsonParam = Parameters<NonNullable<typeof sql>["json"]>[0];
const jsonb = (v: unknown) => sql!.json(v as unknown as JsonParam);

// ---------------------------------------------------------------------------
// Row mapping (snake_case columns + driver types -> domain shapes)
// ---------------------------------------------------------------------------
type Row = Record<string, unknown>;

function iso(v: unknown): string {
  return v instanceof Date ? v.toISOString() : String(v ?? "");
}

function toListing(r: Row): Listing {
  return {
    id: String(r.id),
    type: r.type as Listing["type"],
    slug: String(r.slug),
    title: String(r.title),
    tagline: (r.tagline as string) ?? undefined,
    excerpt: (r.excerpt as string) ?? "",
    description: (r.description as string) ?? "",
    address: (r.address as string) ?? undefined,
    regionSlug: (r.region_slug as string) ?? undefined,
    town: (r.town as string) ?? undefined,
    lat: r.lat != null ? Number(r.lat) : undefined,
    lng: r.lng != null ? Number(r.lng) : undefined,
    categories: (r.categories as string[]) ?? [],
    phone: (r.phone as string) ?? undefined,
    email: (r.email as string) ?? undefined,
    website: (r.website as string) ?? undefined,
    social: (r.social as Listing["social"]) ?? [],
    logoUrl: (r.logo_url as string) ?? undefined,
    coverUrl: (r.cover_url as string) ?? undefined,
    imageUrl: (r.image_url as string) ?? undefined,
    gallery: (r.gallery as string[]) ?? [],
    rating: r.rating != null ? Number(r.rating) : undefined,
    reviewCount: r.review_count != null ? Number(r.review_count) : undefined,
    featured: Boolean(r.featured),
    claimed: Boolean(r.claimed),
    status: r.status as ModerationStatus,
    createdAt: iso(r.created_at),
    updatedAt: iso(r.updated_at),
  };
}

function toSubmission(r: Row): Submission {
  const l = toListing(r);
  return {
    ...l,
    moderation: (r.moderation as ModerationResult) ?? {
      decision: "flagged",
      spamProbability: 0,
      confidence: 0,
      reason: "",
      model: "unknown",
    },
  };
}

// ---------------------------------------------------------------------------
// Listing queries
// ---------------------------------------------------------------------------
export interface DbListingQuery {
  type?: string;
  regionSlugs?: string[]; // region + descendant slugs (computed by caller)
  category?: string;
  search?: string;
  page?: number;
  perPage?: number;
}

export async function dbGetListings(
  q: DbListingQuery,
): Promise<{ items: Listing[]; total: number }> {
  const s = sql!;
  const { type, regionSlugs, category, search, page = 1, perPage = 24 } = q;
  const conds = [s`status = 'approved'`];
  if (type) conds.push(s`type = ${type}`);
  if (regionSlugs?.length) conds.push(s`region_slug = any(${regionSlugs})`);
  if (category) conds.push(s`categories && ${[category]}`);
  if (search) conds.push(s`search @@ websearch_to_tsquery('english', ${search})`);
  const where = conds.reduce((a, c) => s`${a} and ${c}`);

  const [{ count }] = await s<{ count: number }[]>`
    select count(*)::int as count from listings where ${where}`;
  const rows = await s<Row[]>`
    select * from listings where ${where}
    order by featured desc, rating desc nulls last, review_count desc nulls last
    limit ${perPage} offset ${(page - 1) * perPage}`;
  return { items: rows.map(toListing), total: count };
}

export async function dbGetListingBySlug(slug: string): Promise<Listing | null> {
  const rows = await sql!<Row[]>`
    select * from listings where slug = ${slug} and status = 'approved' limit 1`;
  return rows.length ? toListing(rows[0]) : null;
}

export async function dbGetAllListings(): Promise<Listing[]> {
  const rows = await sql!<Row[]>`
    select * from listings where status = 'approved'`;
  return rows.map(toListing);
}

// Slugs to PRERENDER at build (generateStaticParams). Capped + ordered by
// prominence so builds against a remote DB stay fast; the rest render on-demand
// via ISR (dynamicParams) and cache on first hit.
export async function dbGetAllListingSlugs(): Promise<string[]> {
  const rows = await sql!<{ slug: string }[]>`
    select slug from listings where status = 'approved'
    order by featured desc, rating desc nulls last, review_count desc nulls last
    limit 200`;
  return rows.map((r) => r.slug);
}

export async function dbGetContractorListings(
  contractorCats: string[],
  page = 1,
  perPage = 36,
): Promise<{ items: Listing[]; total: number }> {
  const s = sql!;
  const [{ count }] = await s<{ count: number }[]>`
    select count(*)::int as count from listings
    where status = 'approved' and categories && ${contractorCats}`;
  const rows = await s<Row[]>`
    select * from listings
    where status = 'approved' and categories && ${contractorCats}
    order by featured desc, rating desc nulls last
    limit ${perPage} offset ${(page - 1) * perPage}`;
  return { items: rows.map(toListing), total: count };
}

export async function dbGetRelated(
  listing: Listing,
  limit = 3,
): Promise<Listing[]> {
  const s = sql!;
  const rows = await s<Row[]>`
    select * from listings
    where status = 'approved' and id <> ${listing.id} and type = ${listing.type}
      and (categories && ${listing.categories} or region_slug = ${listing.regionSlug ?? null})
    order by featured desc, rating desc nulls last
    limit ${limit}`;
  return rows.map(toListing);
}

// ---------------------------------------------------------------------------
// Submissions (stored as listings rows with non-approved status + moderation)
// ---------------------------------------------------------------------------
export async function dbCreateSubmission(
  draft: ListingDraft,
  moderation: ModerationResult,
  id: string,
  slug: string,
  excerpt: string,
  description: string,
): Promise<Submission> {
  const status: ModerationStatus =
    moderation.decision === "approved" ? "approved"
    : moderation.decision === "rejected" ? "rejected"
    : "flagged";
  const rows = await sql!<Row[]>`
    insert into listings (
      id, type, slug, title, tagline, excerpt, description, address,
      region_slug, town, categories, phone, email, website, social,
      logo_url, cover_url, image_url, status, moderation
    ) values (
      ${id}, 'businesses', ${slug}, ${draft.title}, ${draft.tagline ?? null},
      ${excerpt}, ${description}, ${draft.address ?? null}, ${draft.regionSlug ?? null},
      ${draft.town ?? null}, ${draft.categories}, ${draft.phone ?? null},
      ${draft.email ?? null}, ${draft.website ?? null},
      ${jsonb(draft.social ?? [])}, ${draft.logoUrl ?? null},
      ${draft.coverUrl ?? null}, ${draft.coverUrl ?? null}, ${status},
      ${jsonb(moderation)}
    ) returning *`;
  return toSubmission(rows[0]);
}

export async function dbSlugTaken(slug: string): Promise<boolean> {
  const rows = await sql!`select 1 from listings where slug = ${slug} limit 1`;
  return rows.length > 0;
}

export async function dbListSubmissions(
  status: ModerationStatus,
): Promise<Submission[]> {
  const rows = await sql!<Row[]>`
    select * from listings where status = ${status} and moderation is not null
    order by created_at desc`;
  return rows.map(toSubmission);
}

export async function dbSetStatus(
  id: string,
  status: ModerationStatus,
): Promise<void> {
  await sql!`update listings set status = ${status} where id = ${id}`;
}
