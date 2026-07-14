# Vadodara Knowledge Engine

Gathers **structured, attributable** information about Vadodara from a small set
of registered official/open sources — with provenance, licensing and dates as
first-class concerns. It does **not** scrape the open internet.

> Status: **foundation only.** Registry, schemas, audit tooling and a database
> migration *proposal* exist. **No source extractor is implemented yet** — each
> is built one at a time, only after its audit is reviewed and approved.

## Non-negotiable rules (enforced in code where possible)

1. **Official ≠ current.** Every source carries a `currencyCaveat`; every fact
   stores the source's own publish/update dates *separately* from our fetch date.
2. **Accessible ≠ openly licensed.** Licences default to `unknown` /
   `unconfirmed`. A human confirms a licence before any data is used or shown.
3. **Every fact preserves its exact `sourceUrl`.** (`Provenance.sourceUrl`.)
4. **Never copy government/tourism images** without confirmed reuse rights.
   `imageReuse` defaults to `prohibited`/`unknown`.
5. **Never bypass CAPTCHAs or auth.** A `401/403` is a hard stop in the fetcher.
6. **Never scrape prohibited directories** (Google Maps, Justdial, Sulekha, …).
   `assertNoProhibited()` fails the build if one is ever registered.
7. **Do not invent missing fields.** Absent data stays absent.
8. **Do not merge conflicting records silently.** Divergent values become a
   `RecordConflict` (`resolution: "unresolved"`).
9. **OSM stays unverified** (`osmUnverified: true`) until separately confirmed.
10. **Government-listed ≠ Halo-trusted.** `AuthorityStatus` has no "trusted"
    member; trust is derived elsewhere, only from community vouches.
11. **Community vouches are separate** from source authority — never blended in.
12. **Respect robots.txt, terms, rate limits and licences.** The fetcher obeys
    robots (unreachable ⇒ refuse), rate-limits per host, retries politely and
    caches.
13. **Audit before you extract.** An audit report is required *before* any
    website extractor is designed. Extractors are added **one source at a time.**

## Layout

| File | Purpose |
|---|---|
| `schema.ts` | Zod schemas + types: `Provenance`, `Fact`, `KnowledgeRecord`, `RecordConflict`, `IngestionRun`, `AuditReport`, `SourceRegistryEntry`. |
| `registry.ts` | The registered sources (8) + `assertNoProhibited()`. Every source starts `not_audited`. |
| `robots.ts` | Conservative robots.txt parser (when in doubt, disallow). |
| `http.ts` | `politeFetch()` — the only sanctioned way to hit the network (robots + rate limit + retry + cache). |
| `audit.ts` | `auditSource(id)` — read-only reconnaissance → audit report + ingestion log. |
| `../db/migrations/0001_knowledge_engine.sql` | Database migration **proposal** (not auto-applied). |
| `../../scripts/knowledge/audit-source.ts` | CLI: `npx tsx scripts/knowledge/audit-source.ts <id>`. |
| `../../data/knowledge/` | `cache/` (ignored), `audits/` (committed), `logs/` (ignored), `processed/` (committed). |

## Registered sources

`vmc`, `vadodara_district`, `data_gov_in`, `smart_cities_data`, `osm_overpass`,
`india_post`, `gujarat_tourism`, `gujarat_state_departments`.

## Workflow (per source)

```
1. npx tsx scripts/knowledge/audit-source.ts <id>     # writes data/knowledge/audits/<id>-<date>.md
2. A human reviews the report: robots ✓, terms located, licence CONFIRMED,
   dates available, image policy noted, caveats understood.
3. If (and only if) approvable, set that source's extractorStatus:"approved"
   in registry.ts — with a note on the confirmed licence.
4. Build the ONE extractor for that source (its own PR). Repeat for the next.
```
