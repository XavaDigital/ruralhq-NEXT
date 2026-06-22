-- RuralHQ initial schema.
-- Mirrors src/lib/types.ts. Load order for seeding: regions -> categories ->
-- listings (listings.region_slug references regions).

-- ---------------------------------------------------------------------------
-- Taxonomies (hierarchical; parent_slug is a plain column, not a self-FK, so
-- seed insert order doesn't matter).
-- ---------------------------------------------------------------------------
create table if not exists regions (
  slug        text primary key,
  name        text not null,
  parent_slug text
);

create table if not exists categories (
  slug        text primary key,
  name        text not null,
  parent_slug text
);

-- ---------------------------------------------------------------------------
-- Listings
-- ---------------------------------------------------------------------------
do $$ begin
  create type listing_type as enum ('businesses', 'contractors');
exception when duplicate_object then null; end $$;

do $$ begin
  create type moderation_status as enum ('pending', 'approved', 'rejected', 'flagged');
exception when duplicate_object then null; end $$;

create table if not exists listings (
  id           text primary key,
  type         listing_type not null,
  slug         text not null unique,
  title        text not null,
  tagline      text,
  excerpt      text,
  description  text,
  address      text,
  region_slug  text references regions (slug),
  town         text,
  lat          double precision,
  lng          double precision,
  categories   text[] not null default '{}',
  phone        text,
  email        text,
  website      text,
  social       jsonb not null default '[]',
  logo_url     text,
  cover_url    text,
  image_url    text,
  gallery      jsonb not null default '[]',
  rating       numeric(2, 1),
  review_count integer not null default 0,
  featured     boolean not null default false,
  claimed      boolean not null default false,
  status       moderation_status not null default 'pending',
  -- AI moderation verdict for user submissions (null for seeded listings).
  moderation   jsonb,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  -- Full-text search vector over the key fields (Postgres FTS to start; can be
  -- swapped for Meilisearch/Typesense later without schema change).
  search       tsvector generated always as (
    to_tsvector(
      'english',
      coalesce(title, '') || ' ' || coalesce(tagline, '') || ' ' || coalesce(excerpt, '')
    )
  ) stored
);

create index if not exists listings_type_idx on listings (type);
create index if not exists listings_region_idx on listings (region_slug);
create index if not exists listings_status_idx on listings (status);
create index if not exists listings_categories_idx on listings using gin (categories);
create index if not exists listings_search_idx on listings using gin (search);

-- keep updated_at fresh on edits
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

drop trigger if exists listings_updated_at on listings;
create trigger listings_updated_at before update on listings
  for each row execute function set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Public (anon) may read taxonomies and only APPROVED listings. All writes go
-- through the service-role key in server routes (moderation/cron), which
-- bypasses RLS, so no write policies are defined here.
-- ---------------------------------------------------------------------------
alter table listings   enable row level security;
alter table regions    enable row level security;
alter table categories enable row level security;

create policy "public read approved listings"
  on listings for select using (status = 'approved');

create policy "public read regions"
  on regions for select using (true);

create policy "public read categories"
  on categories for select using (true);
