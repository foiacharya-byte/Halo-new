-- ============================================================================
-- Vadodara Knowledge Engine — database migration PROPOSAL
--
-- STATUS: proposal only. Do NOT auto-apply. Review, then apply deliberately:
--   psql "$DATABASE_URL" -f lib/db/migrations/0001_knowledge_engine.sql
--
-- Mirrors lib/knowledge/schema.ts. Governance encoded as constraints/comments:
--  * Every fact has a source_url and separate published/updated/fetched dates.
--  * Licence defaults to 'unknown'/'unconfirmed'; nothing is assumed open.
--  * Authority (government_listed/tourism_listed/osm_unverified/...) is NOT trust.
--    There is deliberately no "halo_trusted" authority value; community trust
--    lives only in the existing vouch tables and is never merged in here.
--  * Conflicting facts are recorded (knowledge_record_conflict), never merged.
--  * OSM records carry osm_unverified = true until separately confirmed.
-- ============================================================================

create extension if not exists "pgcrypto";

-- ── enums ───────────────────────────────────────────────────────────────────
create type ke_access_method   as enum ('official_api','open_data_download','overpass_api','html_extractor','document_download','manual');
create type ke_licence_id       as enum ('unknown','all_rights_reserved','gov_open_data_india','osm_odbl','cc_by_4','cc_by_sa_4','public_domain','custom');
create type ke_licence_conf     as enum ('confirmed','unconfirmed');
create type ke_image_reuse      as enum ('prohibited','confirmed_allowed','unknown');
create type ke_authority        as enum ('government_listed','tourism_listed','open_data','osm_unverified','postal_reference');
create type ke_verification     as enum ('unverified','source_confirmed');
create type ke_extractor_status as enum ('not_audited','audited_pending_review','approved','blocked');
create type ke_run_kind         as enum ('audit','fetch','extract');
create type ke_run_status       as enum ('running','success','partial','failed','skipped');
create type ke_conflict_res     as enum ('unresolved','kept_both','source_preferred','manual');

-- ── registry ────────────────────────────────────────────────────────────────
create table ke_source (
  id                 text primary key,
  name               text not null,
  authority          text not null,
  category           text not null,
  homepage_url       text not null,
  base_urls          text[] not null,
  access_method      ke_access_method not null,
  api_docs_url       text,
  robots_txt_url     text,
  terms_url          text,
  licence_url        text,
  licence            ke_licence_id   not null default 'unknown',
  licence_confidence ke_licence_conf not null default 'unconfirmed',
  image_reuse        ke_image_reuse  not null default 'unknown',
  currency_caveat    text not null,
  rate_min_delay_ms  integer not null check (rate_min_delay_ms > 0),
  rate_rpm           integer not null check (rate_rpm > 0),
  extractor_status   ke_extractor_status not null default 'not_audited',
  prohibited         boolean not null default false,
  notes              text not null default '',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  -- prohibited directories must never be stored
  constraint ke_source_not_prohibited check (prohibited = false)
);
comment on column ke_source.currency_caveat is 'Official is not automatically current; carried into provenance.';

-- ── ingestion runs (logs) ────────────────────────────────────────────────────
create table ke_ingestion_run (
  id               text primary key,
  source_id        text not null references ke_source(id),
  kind             ke_run_kind not null,
  status           ke_run_status not null default 'running',
  started_at       timestamptz not null default now(),
  finished_at      timestamptz,
  requests         integer not null default 0,
  cache_hits       integer not null default 0,
  items_seen       integer not null default 0,
  items_written    integer not null default 0,
  robots_respected boolean not null default true,
  errors           jsonb not null default '[]',
  notes            text not null default ''
);
create index ke_run_source_idx on ke_ingestion_run(source_id, started_at desc);

-- ── audit reports ────────────────────────────────────────────────────────────
create table ke_audit_report (
  id               uuid primary key default gen_random_uuid(),
  source_id        text not null references ke_source(id),
  audited_at       timestamptz not null default now(),
  reviewer         text not null default 'automated-probe',
  decision         text not null default 'needs_review'
                     check (decision in ('approved','needs_review','blocked')),
  robots           jsonb not null,
  terms            jsonb not null,
  licence          jsonb not null,
  access           jsonb not null,
  findings         jsonb not null default '[]',
  decision_reasons jsonb not null default '[]'
);
create index ke_audit_source_idx on ke_audit_report(source_id, audited_at desc);

-- ── raw document cache (metadata; payload lives on disk / object store) ───────
create table ke_raw_document (
  id            uuid primary key default gen_random_uuid(),
  source_id     text not null references ke_source(id),
  url           text not null,
  http_status   integer,
  content_type  text,
  content_hash  text,          -- sha-256 of payload; change detection
  fetched_at    timestamptz not null default now(),
  storage_ref   text,          -- pointer to cached payload (path/bucket key)
  unique (url, content_hash)
);

-- ── knowledge records ────────────────────────────────────────────────────────
create table ke_record (
  id             uuid primary key default gen_random_uuid(),
  source_id      text not null references ke_source(id),
  type           text not null,
  name           text not null,
  authority      ke_authority not null,           -- NOT trust
  verification   ke_verification not null default 'unverified',
  osm_unverified boolean not null default false,  -- OSM stays unverified
  licence        ke_licence_id not null default 'unknown',
  -- record-level provenance (facts also carry their own, in ke_fact)
  source_url     text not null,
  published_at   date,                            -- source's publish date (separate)
  updated_at_src date,                            -- source's update date (separate)
  fetched_at     timestamptz not null default now(),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  -- OSM authority and osm_unverified must agree
  constraint ke_record_osm_flag check (
    (authority = 'osm_unverified') = osm_unverified
  )
);
create index ke_record_source_idx on ke_record(source_id);

-- ── facts (field-level, each fully attributed) ───────────────────────────────
create table ke_fact (
  id             uuid primary key default gen_random_uuid(),
  record_id      uuid not null references ke_record(id) on delete cascade,
  key            text not null,
  value_text     text,
  value_num      double precision,
  value_bool     boolean,
  unit           text,
  -- provenance for THIS fact
  source_id      text not null references ke_source(id),
  source_url     text not null,                   -- exact URL of the fact (required)
  retrieval      ke_access_method not null,
  fetched_at     timestamptz not null default now(),
  published_at   date,                            -- separate from fetched/updated
  updated_at_src date,
  licence        ke_licence_id not null default 'unknown',
  licence_conf   ke_licence_conf not null default 'unconfirmed',
  content_hash   text
);
create index ke_fact_record_idx on ke_fact(record_id);
create index ke_fact_key_idx on ke_fact(record_id, key);

-- ── conflicts (never merge silently) ─────────────────────────────────────────
create table ke_record_conflict (
  id              uuid primary key default gen_random_uuid(),
  record_id       uuid not null references ke_record(id) on delete cascade,
  key             text not null,
  values          jsonb not null,                 -- [{value, source_id, source_url, fetched_at}, ...]
  detected_at     timestamptz not null default now(),
  resolution      ke_conflict_res not null default 'unresolved',
  resolution_note text not null default '',
  constraint ke_conflict_two_values check (jsonb_array_length(values) >= 2)
);

-- ── RLS posture (proposal) ───────────────────────────────────────────────────
-- Knowledge data is INTERNAL until surfaced deliberately by the app layer.
-- Public read (if ever enabled) must be restricted to records whose source is
-- extractor_status='approved' AND whose licence_confidence='confirmed'. All
-- writes are service-role only. (Enable + define policies when wiring the app.)
alter table ke_source          enable row level security;
alter table ke_record          enable row level security;
alter table ke_fact            enable row level security;
alter table ke_record_conflict enable row level security;
alter table ke_ingestion_run   enable row level security;
alter table ke_audit_report    enable row level security;
alter table ke_raw_document    enable row level security;
-- (No permissive policies are created here on purpose — deny by default.)
