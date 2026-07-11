-- Halo — PostgreSQL schema (Supabase)
--
-- The in-memory store in lib/data/store.ts mirrors this shape so the MVP runs
-- with zero configuration; this file is the production data layer. Apply with:
--   supabase db reset   (or)   psql < lib/db/schema.sql
--
-- Design notes:
--  * Contributor and listing contacts are stored separately. Raw numbers are
--    encrypted at rest; a deterministic salted hash powers duplicate matching;
--    a masked value is safe for previews. No raw number is ever selectable by
--    the anon role.
--  * Public browsing needs no auth. Contribution/claim writes require an
--    authenticated (phone-OTP) user. Moderation requires an admin role.
--  * Search uses full-text + pg_trgm; no external search engine.

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
create type risk_level        as enum ('standard','sensitive','high_stakes');
create type public_state      as enum ('public_listing','business_managed','community_vouched');
create type moderation_status as enum ('pending','needs_information','approved','rejected','duplicate','withdrawn');
create type created_source    as enum ('seed','user_submission','provider_claim','admin');
create type used_recency      as enum ('within_month','1_3_months','3_6_months','6_12_months','over_year');
create type would_use_again   as enum ('yes','no','not_sure');
create type permission_basis  as enum ('publicly_advertised','has_permission','unsure');
create type source_type       as enum ('google_places','justdial','sulekha','official_business','user_contribution','provider_claim');
create type match_status      as enum ('exact','probable','conflicting','not_found');
create type contact_type      as enum ('mobile','landline','whatsapp');
create type verification_state as enum ('unverified','provider_confirmed','moderator_verified');
create type user_role         as enum ('contributor','provider','admin');

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------
create table profiles (
  id                 uuid primary key default gen_random_uuid(),
  auth_user_id       uuid unique references auth.users(id) on delete set null,
  first_name         text,
  public_display_name text,
  phone_encrypted    bytea,        -- pgp_sym_encrypt(number, key)
  phone_hash         text,         -- hmac(number, salt); indexed
  home_area_id       uuid,
  role               user_role not null default 'contributor',
  created_at         timestamptz not null default now(),
  deleted_at         timestamptz
);
create index on profiles (phone_hash);

-- ---------------------------------------------------------------------------
-- Areas
-- ---------------------------------------------------------------------------
create table areas (
  id             uuid primary key default gen_random_uuid(),
  canonical_name text not null,
  slug           text unique not null,
  aliases        text[] not null default '{}',
  ward           text,
  zone           text,
  latitude       double precision,
  longitude      double precision,
  is_active      boolean not null default true,
  sort_order     int not null default 0
);
create index on areas using gin (aliases);
create index on areas using gin (canonical_name gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------
create table categories (
  id              uuid primary key default gen_random_uuid(),
  parent_id       uuid references categories(id) on delete set null,
  name            text not null,
  slug            text unique not null,
  description     text,
  aliases         text[] not null default '{}',
  search_keywords text[] not null default '{}',
  icon_key        text,
  risk_level      risk_level not null default 'standard',
  is_seedable     boolean not null default true,
  is_active       boolean not null default true,
  sort_order      int not null default 0
);
create index on categories using gin (aliases);
create index on categories using gin (search_keywords);

-- ---------------------------------------------------------------------------
-- Listings
-- ---------------------------------------------------------------------------
create table listings (
  id               uuid primary key default gen_random_uuid(),
  slug             text unique not null,
  display_name     text not null,
  description      text,
  primary_area_id  uuid references areas(id),
  status           moderation_status not null default 'approved',
  public_state     public_state not null default 'public_listing',
  business_managed boolean not null default false,
  google_place_id  text,
  seed_confidence  text,   -- low|medium|high|manually_verified (internal only)
  created_source   created_source not null default 'seed',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  published_at     timestamptz
);
create index on listings (primary_area_id);
create index on listings (google_place_id);
create index on listings using gin (display_name gin_trgm_ops);

create table listing_categories (
  listing_id  uuid references listings(id) on delete cascade,
  category_id uuid references categories(id) on delete cascade,
  is_primary  boolean not null default false,
  primary key (listing_id, category_id)
);

create table listing_service_areas (
  listing_id uuid references listings(id) on delete cascade,
  area_id    uuid references areas(id) on delete cascade,
  primary key (listing_id, area_id)
);

create table listing_contacts (
  id                  uuid primary key default gen_random_uuid(),
  listing_id          uuid references listings(id) on delete cascade,
  contact_type        contact_type not null default 'mobile',
  value_encrypted     bytea,
  value_hash          text,     -- deterministic; indexed for duplicate/phone search
  masked_value        text,
  is_public           boolean not null default false,
  permission_basis    permission_basis not null default 'unsure',
  verification_status verification_state not null default 'unverified',
  verified_at         timestamptz
);
create index on listing_contacts (value_hash);
create index on listing_contacts (listing_id);

create table listing_source_refs (
  id             uuid primary key default gen_random_uuid(),
  listing_id     uuid references listings(id) on delete cascade,
  source_type    source_type not null,
  source_url     text,
  external_id    text,
  match_status   match_status,
  observed_at    timestamptz not null default now(),
  reviewer_notes text
);

-- ---------------------------------------------------------------------------
-- Vouches
-- ---------------------------------------------------------------------------
create table vouches (
  id                uuid primary key default gen_random_uuid(),
  listing_id        uuid references listings(id) on delete cascade,
  contributor_id    uuid references profiles(id) on delete set null,
  use_context       text not null,
  useful_detail     text,
  used_recency      used_recency not null,
  used_month        int,
  used_year         int,
  used_area_id      uuid references areas(id),
  would_use_again   would_use_again,
  moderation_status moderation_status not null default 'pending',
  submitted_at      timestamptz not null default now(),
  approved_at       timestamptz,
  -- one contributor counts once per listing (unless an intentional repeat-use
  -- submission is later supported).
  unique (listing_id, contributor_id)
);
create index on vouches (listing_id, moderation_status);

create table vouch_signals (
  id                        uuid primary key default gen_random_uuid(),
  vouch_id                  uuid references vouches(id) on delete cascade,
  reliability               int check (reliability between 1 and 5),
  work_quality              int check (work_quality between 1 and 5),
  communication_punctuality int check (communication_punctuality between 1 and 5),
  price_clarity             int check (price_clarity between 1 and 5),
  respectfulness            int check (respectfulness between 1 and 5)
);

-- ---------------------------------------------------------------------------
-- Submissions / claims / corrections
-- ---------------------------------------------------------------------------
create table listing_submissions (
  id                           uuid primary key default gen_random_uuid(),
  contributor_id               uuid references profiles(id) on delete set null,
  proposed_name                text not null,
  proposed_phone_encrypted     bytea,
  proposed_phone_hash          text,
  permission_basis             permission_basis not null default 'unsure',
  category_id                  uuid references categories(id),
  primary_area_id              uuid references areas(id),
  use_context                  text,
  used_recency                 used_recency,
  moderation_status            moderation_status not null default 'pending',
  possible_duplicate_listing_id uuid references listings(id),
  submitted_at                 timestamptz not null default now()
);
create index on listing_submissions (proposed_phone_hash);

create table provider_claims (
  id                 uuid primary key default gen_random_uuid(),
  listing_id         uuid references listings(id) on delete set null,
  claimant_profile_id uuid references profiles(id) on delete set null,
  proof_type         text,
  proof_reference    text,
  status             moderation_status not null default 'pending',
  submitted_at       timestamptz not null default now()
);

create table listing_corrections (
  id              uuid primary key default gen_random_uuid(),
  listing_id      uuid references listings(id) on delete cascade,
  submitted_by    uuid references profiles(id) on delete set null,
  correction_type text,
  proposed_value  text,
  evidence        text,
  status          moderation_status not null default 'pending',
  submitted_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Seed research
-- ---------------------------------------------------------------------------
create table seed_matrix (
  id                 uuid primary key default gen_random_uuid(),
  area_id            uuid references areas(id) on delete cascade,
  category_id        uuid references categories(id) on delete cascade,
  status             text not null default 'not_started',
  candidates_found   int not null default 0,
  candidates_approved int not null default 0,
  last_researched_at timestamptz,
  assigned_reviewer  uuid references profiles(id),
  notes              text,
  unique (area_id, category_id)
);

create table seed_candidates (
  id               uuid primary key default gen_random_uuid(),
  area_id          uuid references areas(id),
  category_id      uuid references categories(id),
  google_place_id  text,
  proposed_name    text,
  google_rating    numeric(2,1),
  google_rating_count int,
  match_confidence text,
  qualification_status text,
  reviewer_notes   text,
  status           text not null default 'pending'
);

-- ---------------------------------------------------------------------------
-- Moderation + analytics
-- ---------------------------------------------------------------------------
create table moderation_actions (
  id           uuid primary key default gen_random_uuid(),
  entity_type  text not null,
  entity_id    uuid not null,
  moderator_id uuid references profiles(id),
  action       text not null,
  reason       text,
  created_at   timestamptz not null default now()
);

create table search_logs (
  id                  uuid primary key default gen_random_uuid(),
  normalized_query    text,       -- '[phone lookup]' for phone searches; never raw digits
  detected_category_id uuid references categories(id),
  detected_area_id    uuid references areas(id),
  result_count        int not null default 0,
  zero_result         boolean not null default false,
  created_at          timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table listings              enable row level security;
alter table listing_categories    enable row level security;
alter table listing_service_areas enable row level security;
alter table listing_contacts      enable row level security;
alter table listing_source_refs   enable row level security;
alter table vouches               enable row level security;
alter table vouch_signals         enable row level security;
alter table listing_submissions   enable row level security;
alter table provider_claims       enable row level security;
alter table listing_corrections   enable row level security;
alter table profiles              enable row level security;
alter table search_logs           enable row level security;

-- Public can read approved/published listings and their non-secret facets.
create policy "public reads published listings"
  on listings for select using (published_at is not null);

create policy "public reads approved vouches"
  on vouches for select using (moderation_status = 'approved');

-- Public may read contacts ONLY when public + verified; the raw ciphertext
-- column is never exposed via the anon role (grant only masked columns at the
-- API layer / a view).
create policy "public reads public verified contacts"
  on listing_contacts for select
  using (is_public and verification_status <> 'unverified');

-- Authenticated users can create contributions for themselves.
create policy "auth users create vouches"
  on vouches for insert to authenticated
  with check (contributor_id = (select id from profiles where auth_user_id = auth.uid()));

create policy "auth users create submissions"
  on listing_submissions for insert to authenticated
  with check (contributor_id = (select id from profiles where auth_user_id = auth.uid()));

create policy "contributors read own submissions"
  on listing_submissions for select to authenticated
  using (contributor_id = (select id from profiles where auth_user_id = auth.uid()));

-- Providers cannot self-vouch or alter community content: no update/delete
-- policies are granted on vouches/vouch_signals to non-admin roles. All
-- moderation and publication mutations run through server-side code holding the
-- service role, guarded by explicit admin checks.

-- A masked, public-safe view for listing contacts.
create view public_listing_contacts as
  select id, listing_id, contact_type, masked_value, is_public,
         permission_basis, verification_status
  from listing_contacts
  where is_public and verification_status <> 'unverified';
