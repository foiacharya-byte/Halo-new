# Halo

**A simple local directory for finding useful people and services across Vadodara, strengthened by real experiences from people who have used them.**

Halo begins with public business listings and local contributions, and becomes
trustworthy over time through reviewed community vouches, clear information
sources, recent-use context, contributor verification and provider corrections.
The product *is* the homepage: search first, then contribute.

This repository is the production MVP.

---

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build
npm test           # deterministic search-parser unit tests (Vitest)
```

The MVP runs **out of the box with zero configuration** on an in-memory seed
store, so the whole directory — search, listings, vouches, submissions,
moderation and seed research — is fully functional and browsable locally.

## Stack

- **Next.js (App Router) + TypeScript** — server components, server actions.
- **Tailwind CSS** — custom, restrained design system (calm, warm, mobile-first).
- **Zod** — server-side validation of every mutation.
- **Vitest** — unit tests for the search parser.
- **Supabase PostgreSQL** — production data layer (schema in `lib/db/schema.sql`).

## How the data layer works

`lib/data/store.ts` is the single seam between the product and its persistence.
It runs on seed data (`lib/data/seed.ts`) today; in production a Supabase-backed
adapter plugs in here. The Postgres schema in `lib/db/schema.sql` mirrors the
in-memory shape exactly, including Row Level Security, `pg_trgm` fuzzy search,
indexed phone hashes, and a masked-contacts view.

### Phone privacy (load-bearing)

Contributor and listing contacts are stored **separately** (`lib/phone.ts`):

- a normalized **E.164** value (server-side only),
- a deterministic **salted hash** for duplicate matching,
- a **masked** display value (`98••• ••421`) safe for previews.

A raw number is never shipped to the client in previews and never stored in
analytics. The full public number is fetched only on demand, via a server
action, and only when the contact is genuinely public + permitted.

## Search

`lib/search/parser.ts` is a **deterministic** (no-LLM) query parser. It handles
service/category/name/area/phone intents, combined intents with branch
selection ("plumber and electrician in Gotri"), Vadodara area aliases
(English/Hinglish/transliterated Gujarati), and light misspelling tolerance.
Areas and category aliases live in the "database" (`lib/data/*`), not in
components. See `lib/search/parser.test.ts` for the covered cases.

## Routes

| Route | Purpose |
|---|---|
| `/` | Homepage + search |
| `/search` | Results, filters, branch selection |
| `/listing/[slug]` | Listing profile |
| `/add` | Add a trusted number (progressive flow + duplicate detection) |
| `/business` | List / claim / correct / request removal |
| `/vouch/[listingId]` | Add a vouch (7-step flow) |
| `/submissions` | Contributor dashboard (private "Under review" status) |
| `/admin`, `/admin/submissions`, `/admin/listings`, `/admin/seed` | Internal review |

## Trust model

Three **public** states — `Public listing`, `Business-managed`,
`Community-vouched` — are always kept separate. External ratings are never
blended into Halo community trust. "Under review" is never a public state.
Experience signals appear only after thresholds are met (≥5 approved vouches for
the full summary, ≥3 answers per dimension). Every contribution is reviewed
before publication; nothing auto-publishes.

## What is intentionally not built

Points, rewards, notifications, sponsored placement, paid ranking, chat, social
following, map-first browsing, or a long marketing landing page. The schema
stays extensible; unfinished future features are not exposed.
