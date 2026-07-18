# Vadodara Source Plan

> Stage 1 of the Vadodara Knowledge Ingestion System. Maps each category in
> [`VADODARA_KNOWLEDGE_MAP.md`](./VADODARA_KNOWLEDGE_MAP.md) to the sources
> Halo intends to use, and records what is known about each source's
> access method, licence status and reliability **before** any data
> collection happens.
>
> **No source in this document has been ingested from.** Registered
> sources (below) exist in `lib/knowledge/registry.ts` with
> `extractorStatus: "not_audited"` — an audit report is required before
> any is approved, and an extractor is built for exactly one source at a
> time, per `lib/knowledge/README.md`. Proposed sources are not yet in the
> registry at all.

## Legend

- **Registered** — already an entry in `lib/knowledge/registry.ts`; audit
  tooling (`npx tsx scripts/knowledge/audit-source.ts <id>`) can run
  against it today. Still `not_audited` unless the registry says otherwise.
- **Proposed** — identified as needed for a category, but not yet added to
  the registry. Adding it requires the same registration + audit +
  human-approval sequence as every existing source; it is listed here for
  planning only.
- **Manual-approval flag** — every source, registered or proposed, needs an
  explicit human decision before an extractor is built. Nothing in this
  document authorises that on its own.

---

## Registered sources (in `lib/knowledge/registry.ts`)

### `vmc` — Vadodara Municipal Corporation

- **Authority:** Vadodara Municipal Corporation (VMC)
- **Categories:** Government & Civic (2), Utilities & Essential Services (10), Sports & Recreation (8, public facilities), Events & Current Activity (9, civic notices)
- **Access method:** HTML extraction (`html_extractor`) — no public API known
- **Licence status:** unknown / unconfirmed — must be located during audit
- **Robots status:** not yet probed (`npx tsx scripts/knowledge/audit-source.ts vmc`)
- **Proposed collection frequency:** weekly for static pages (offices, helplines), daily for notices/circulars once that sub-source is scoped
- **Reliability:** Primary authority for municipal facts; content freshness varies by page
- **Known limitations:** No confirmed licence; page structure not yet surveyed; civic pages "can lag reality" (registry `currencyCaveat`)
- **Manual-approval flag:** required before any extractor

### `vadodara_district` — Vadodara District Administration

- **Authority:** Vadodara District Administration (Collectorate), Govt of Gujarat
- **Categories:** Government & Civic (2), Health & Emergency (3, emergency contacts), City Structure (1, ward/zone reference)
- **Access method:** HTML extraction
- **Licence status:** unknown / unconfirmed; likely GIGW/NIC policy-governed
- **Robots status:** not yet probed
- **Proposed collection frequency:** weekly; notices sub-source daily once scoped
- **Reliability:** Primary authority for district-level civic facts
- **Known limitations:** Terms URL known (`/website-policies/`) but licence not confirmed; publish/update dates must be captured per-notice, not assumed
- **Manual-approval flag:** required

### `data_gov_in` — Data.gov.in (Open Government Data Platform India)

- **Authority:** National Informatics Centre / MeitY, Government of India
- **Categories:** City Statistics (11), City Structure (1, PIN datasets), any dataset with a Vadodara-scoped cut
- **Access method:** Official API (needs per-account API key, `DATA_GOV_IN_API_KEY`, not yet provisioned)
- **Licence status:** GODL-India by default, but **must be confirmed per dataset** — datasets vary
- **Robots status:** not yet probed
- **Proposed collection frequency:** dataset-dependent; most Census/statistical datasets update rarely (annual or less) — checked monthly for new versions, not re-fetched daily
- **Reliability:** High authority, but "datasets carry their own 'updated' timestamps and can be stale for years" (registry `currencyCaveat`) — exactly why City Statistics requires a reporting year on every figure
- **Known limitations:** No API key provisioned yet; per-dataset licence confirmation is real work, not a formality
- **Manual-approval flag:** required, and required again per dataset

### `smart_cities_data` — Smart Cities Open Data Portal

- **Authority:** Smart Cities Mission, MoHUA, Government of India
- **Categories:** City Statistics (11), Transport & Mobility (5) and Utilities (10) if a Vadodara node publishes relevant datasets
- **Access method:** Open data download
- **Licence status:** GODL-India assumed, unconfirmed
- **Robots status:** not yet probed
- **Proposed collection frequency:** monthly check for new/updated datasets
- **Reliability:** Project-era snapshots, often one-off — "never present as live without a fresh update timestamp" (registry `currencyCaveat`)
- **Known limitations:** Unknown whether a Vadodara city node exists yet; whether it's CKAN/API or raw file downloads is unconfirmed
- **Manual-approval flag:** required

### `osm_overpass` — OpenStreetMap (via Overpass API)

- **Authority:** OpenStreetMap contributors (crowd-sourced, not governmental)
- **Categories:** City Structure (1, locality/adjacency geometry), Transport & Mobility (5, roads/stops)
- **Access method:** Overpass API, bounded queries to the Vadodara bounding box only
- **Licence status:** ODbL 1.0 — **confirmed** (attribution + share-alike obligations apply to any derivative Halo publishes)
- **Robots status:** not yet probed
- **Proposed collection frequency:** monthly for boundaries (slow-changing), light/cached/off-peak per Overpass usage policy
- **Reliability:** Useful for geometry, **never** for verification — every OSM record stays `osmUnverified: true` regardless of how it looks
- **Known limitations:** Accuracy/completeness "vary block to block" (registry `currencyCaveat`); this is the one source where authority is deliberately weak by design
- **Manual-approval flag:** required (licence is confirmed, but audit + approval gate still applies)

### `india_post` — India Post (PIN code / post office directory)

- **Authority:** Department of Posts, Government of India
- **Categories:** City Structure (1, PIN code ↔ locality mapping)
- **Access method:** HTML extraction
- **Licence status:** unknown / unconfirmed
- **Robots status:** not yet probed
- **Proposed collection frequency:** quarterly — PIN/post-office lists "change rarely but do change" (registry `currencyCaveat`)
- **Reliability:** Authoritative for PIN↔office mapping, but registry notes a **dated** PIN dataset also exists on `data_gov_in` — both should be audited and the one with the clearer licence + dates preferred
- **Known limitations:** No licence URL on record yet
- **Manual-approval flag:** required

### `gujarat_tourism` — Gujarat Tourism

- **Authority:** Tourism Corporation of Gujarat Ltd (TCGL)
- **Categories:** Culture, Heritage & Tourism (7)
- **Access method:** HTML extraction
- **Licence status:** all-rights-reserved assumed (marketing copy/photos are typically © TCGL), unconfirmed
- **Robots status:** not yet probed
- **Proposed collection frequency:** monthly
- **Reliability:** Good for names/locations/descriptions; "timings/fees drift and are often aspirational" — registry explicitly says never treat as authoritative for hours/prices without a second source
- **Known limitations:** **Images prohibited by default** — text facts only unless reuse rights are separately confirmed
- **Manual-approval flag:** required

### `gujarat_state_departments` — Gujarat State Government departments (entry point)

- **Authority:** Government of Gujarat (various departments)
- **Categories:** placeholder/entry point spanning several — Health & Emergency (3), Education (4), Utilities (10)
- **Access method:** HTML extraction
- **Licence status:** unknown / unconfirmed
- **Robots status:** not yet probed
- **Proposed collection frequency:** N/A — this entry is not itself extracted from
- **Reliability:** N/A
- **Known limitations:** This is explicitly a **placeholder**. Concrete departments (Health & Family Welfare, GSRTC, GWSSB, MGVCL, Revenue, etc.) must each become their **own** registry entry with their **own** audit before any extraction — the registry note already says so. This source plan does not shortcut that.
- **Manual-approval flag:** required per concrete department, individually

---

## Proposed sources (not yet in `lib/knowledge/registry.ts`)

These fill gaps the eight registered sources don't cover. Each needs its
own registry entry and audit before anything else happens — listed here so
the category coverage in the knowledge map is honest about what's missing
today.

### GSRTC (Gujarat State Road Transport Corporation)

- **Categories:** Transport & Mobility (5)
- **Likely access method:** HTML extraction (route/depot pages); no known public API
- **Licence status:** unknown — to be established at registration/audit
- **Reliability (anticipated):** Authoritative for official routes/depots; timetable adherence in practice may differ
- **Manual-approval flag:** required before registration even begins collecting audit data

### Indian Railways / rail authority public information

- **Categories:** Transport & Mobility (5)
- **Likely access method:** Official API if one is publicly documented; otherwise HTML extraction of station-level pages only
- **Licence status:** unknown
- **Reliability (anticipated):** Authoritative for station facts (name, code, location); explicitly **not** a source for live train status — no live/real-time category exists in this map
- **Manual-approval flag:** required

### Gujarat Police (public-facing pages) / emergency services directory

- **Categories:** Health & Emergency (3), Government & Civic (2)
- **Likely access method:** HTML extraction of public helpline/contact pages only
- **Licence status:** unknown
- **Reliability (anticipated):** Highest-stakes category in the whole map (see knowledge map §3) — this source would need the most conservative audit and the clearest human review before approval, given the harm potential of a stale emergency number
- **Manual-approval flag:** required, with extra scrutiny

### Education boards / recognised-institution directories (GSEB and equivalent, UGC-recognised university lists)

- **Categories:** Education (4)
- **Likely access method:** Open data download or HTML extraction depending on board
- **Licence status:** unknown
- **Reliability (anticipated):** Authoritative for "does this institution officially exist," not for quality/ranking
- **Manual-approval flag:** required

### GPCB (Gujarat Pollution Control Board) / CPCB (Central Pollution Control Board)

- **Categories:** City Statistics (11), Utilities & Essential Services (10, environmental advisories where published)
- **Likely access method:** Open data download or official API if available (both boards publish some monitoring data)
- **Licence status:** unknown
- **Reliability (anticipated):** Useful for dated environmental statistics; explicitly not a source for real-time air-quality claims unless the source itself publishes a genuinely real-time, dated feed
- **Manual-approval flag:** required

### Official press-release / notice channels (e.g. PIB Gujarat, VMC/District press pages if distinct from their main sites)

- **Categories:** Events & Current Activity (9)
- **Likely access method:** HTML extraction or RSS/feed if one exists
- **Licence status:** unknown
- **Reliability (anticipated):** This is the most promising lead for the freshness-critical Events category, since press releases are reliably dated at source
- **Manual-approval flag:** required

---

## What this plan deliberately does not include

- **No** Google Maps, Justdial, Sulekha, Yellow Pages, or any comparable
  private directory — enforced in code today via `PROHIBITED_HOSTS` and
  `assertNoProhibited()` in `lib/knowledge/registry.ts`.
- **No** source for Food, Shopping & Discovery (knowledge-map §6) or Halo
  Community Knowledge (§12) — those categories are Halo-native by design
  and are out of scope for this document entirely.
- **No** login-protected, CAPTCHA-gated, or private-database source of any
  kind, official or not.

## Coverage against the knowledge map

| Category | Registered sources | Proposed sources | Gaps |
|---|---|---|---|
| 1. City Structure | `vadodara_district`, `data_gov_in`, `osm_overpass`, `india_post` | — | none identified yet |
| 2. Government & Civic | `vmc`, `vadodara_district` | Gujarat Police (contact pages) | none major |
| 3. Health & Emergency | `gujarat_state_departments` (placeholder) | Gujarat Police, GPCB/CPCB (indirect) | no concrete hospital/blood-bank source registered yet |
| 4. Education | `gujarat_state_departments` (placeholder) | Education boards | no concrete source registered yet |
| 5. Transport & Mobility | `osm_overpass` | GSRTC, Railways | official transit-route source not registered yet |
| 6. Food, Shopping & Discovery | — (out of scope) | — | intentionally none |
| 7. Culture, Heritage & Tourism | `gujarat_tourism` | — | reasonably covered |
| 8. Sports & Recreation | `vmc` (facilities, if published) | — | depends on VMC page coverage — unconfirmed |
| 9. Events & Current Activity | `vmc`, `vadodara_district` (notices) | Press-release channels | freshest-need category; needs the strongest source once found |
| 10. Utilities & Essential Services | `vmc`, `gujarat_state_departments` (placeholder) | GPCB/CPCB | concrete utility-board sources (MGVCL etc.) not registered yet |
| 11. City Statistics | `data_gov_in`, `smart_cities_data` | GPCB/CPCB | reasonably covered, dating discipline is the real work |
| 12. Halo Community Knowledge | — (out of scope) | — | intentionally none |

Every "gap" above is a real, current limitation — not a to-do the map is
allowed to paper over. Stage 2+ work should register and audit the
proposed sources one at a time, starting with whichever gap blocks the
most-requested product surface (see the Stage 2 instruction at the end of
the ingestion-system report).
