# Vadodara Freshness Plan

> Stage 1 of the Vadodara Knowledge Ingestion System. Defines how Halo will
> classify and communicate **how current** each piece of Vadodara knowledge
> is — separately from whether it is official, and separately from whether
> it is Halo-verified. This is a planning document: it defines the classes
> and fields Stage 2 will implement; it does not implement freshness
> tracking yet, and no record has been classified against it.

## Why this exists

Two rules from the project's governing principles make freshness a
first-class concern rather than a display detail:

- **"Collected today" ≠ "updated today."** Halo fetching a page this
  morning tells you nothing about whether the *page itself* changed this
  morning, last year, or never. These are different facts and must never
  be collapsed into one date.
- **Every statistic needs its reporting year; never present old Census (or
  similar) data as current.** A number without a date is not a fact Halo
  can respectably show.

The existing schema (`lib/knowledge/schema.ts`, `Provenance`) already keeps
`fetchedAt` (when Halo fetched it) separate from `publishedAt` and
`updatedAt` (the source's own dates). This plan builds the freshness
*classification* on top of that separation — it does not replace it.

## The four freshness classes

| Class | Name | Meaning | Typical re-check cadence |
|---|---|---|---|
| **A** | Live / daily | The underlying reality changes day-to-day (or faster) and the record is only useful if checked at least daily | Daily |
| **B** | Weekly | Changes on the order of days-to-weeks; a week-old value is usually still trustworthy but should be re-confirmed regularly | Weekly |
| **C** | Monthly / quarterly | Changes slowly — office listings, tourism facts, dataset revisions; still worth periodic re-confirmation | Monthly or quarterly, by category |
| **D** | Historical / periodic | Point-in-time or fixed-schedule official releases (Census, annual reports) that are never "re-fetched fresh" — only superseded by the *next* official release | On the source's own publication schedule (e.g. annual, decennial) |

A class describes **how often Halo should check**, not how trustworthy a
value is — authority and trust remain governed separately, per
`lib/knowledge/README.md` rules 10–11. A Class D Census figure can be fully
authoritative and simultaneously eleven years old; the class makes that
visible instead of hiding it.

## Category → class mapping

| Knowledge-map category | Class | Rationale |
|---|---|---|
| 1. City Structure | **C** | Boundaries/PIN codes change rarely |
| 2. Government & Civic (offices, directories) | **C** | Office listings drift slowly |
| 2. Government & Civic (notices/circulars) | **A** | Time-sensitive by nature |
| 3. Health & Emergency (facility listings) | **C** | Facility existence changes slowly |
| 3. Health & Emergency (emergency numbers) | **B**, checked like **A** in practice | Low change frequency but highest harm if stale — checked more often than its "natural" volatility would suggest |
| 4. Education | **C** | Institution listings change slowly (yearly at most) |
| 5. Transport & Mobility (routes, stations) | **C** | Infrastructure-level, slow-changing |
| 5. Transport & Mobility (advisories) | **A** | Time-sensitive |
| 6. Food, Shopping & Discovery | *out of scope* | Halo-native; governed by product's own submission flow, not this system |
| 7. Culture, Heritage & Tourism | **C** | Slow-changing; timings/fees explicitly caveated as unreliable regardless of class |
| 8. Sports & Recreation | **C** | Facility listings change slowly |
| 9. Events & Current Activity | **A** | The most freshness-critical category in the whole map |
| 10. Utilities & Essential Services (contacts) | **C** | Slow-changing |
| 10. Utilities & Essential Services (outage notices) | **A** | Time-sensitive |
| 11. City Statistics | **D** | Governed by official release cycles, not re-fetch frequency |
| 12. Halo Community Knowledge | *out of scope* | Halo-native; not part of this system |

Several categories split into two rows because a single knowledge-map
category can contain both slow-changing reference facts (an office's
address) and fast-changing situational facts (a notice that office
published today). The freshness class applies to the **record type**, not
the category as a whole.

## Per-record freshness fields (Stage 2 schema target)

`lib/knowledge/schema.ts` today separates `fetchedAt` / `publishedAt` /
`updatedAt` on `Provenance`. To support the classes above, Stage 2 will
extend that model with the following fields. They are specified here so
the shape is agreed before implementation — **none of these fields exist
in code yet.**

| Field | Meaning | Distinct from |
|---|---|---|
| `source_published_at` | When the source first published this value (maps to today's `publishedAt`) | `source_updated_at` — a value can be published once and updated later |
| `source_updated_at` | When the source itself last changed this value (maps to today's `updatedAt`) | `collected_at` — the source can update without Halo having re-fetched yet |
| `collected_at` | When Halo first collected this value (maps to today's `fetchedAt`) | `last_checked_at` — first collection vs. every subsequent check |
| `last_checked_at` | The most recent time Halo re-requested this source and got a response (even if the value didn't change) | `last_confirmed_at` — checking is not the same as confirming the value is still correct |
| `last_confirmed_at` | The most recent time the value was actively verified to still be correct (matched on re-check, or explicitly re-confirmed) | `last_checked_at` — a check that finds the page unreachable does not confirm anything |
| `expires_at` | For Class A/B records with a known validity window (e.g. an event's end date) — the point after which the record must stop being shown as current | all of the above — this is a forward-looking cutoff, not a record of the past |
| `freshness_status` | The derived, human-facing state (see below) | — this is computed from the fields above, never set directly |

### `freshness_status` values

| Value | Meaning |
|---|---|
| `current` | Checked within the class's cadence window and confirmed unchanged (or newly collected) |
| `recently_checked` | Checked within a grace window past the cadence, no change detected — still shown, with a visible "as of" date |
| `possibly_outdated` | Past the grace window without a re-check — shown only with an explicit staleness indicator, never silently as current |
| `outdated` | Known to have changed at source (per change detection) but the new value hasn't been collected/reviewed yet |
| `historical` | Class D records — correctly dated to their source's release, never implied to be present-day |
| `unknown` | No successful check has ever completed — the default until Stage 2's collection work runs, and the only honest status for anything today |

**Today, every record Halo could theoretically hold would be `unknown`** —
no collection has run. This status existing as the default (rather than
`current`) is deliberate: it is the same "innocent until collected" posture
as `extractorStatus: "not_audited"` in the source registry.

## Rules this plan enforces

1. **A Class A/B record past its cadence window without a re-check must
   never display as `current`.** It steps down through `recently_checked`
   → `possibly_outdated` automatically as time passes, not on a human's
   say-so.
2. **Class D records are never displayed without their reporting
   period.** `historical` is not a downgrade to hide — it is the correct,
   permanent status for e.g. a Census figure, shown proudly next to its
   year.
3. **`expires_at` is mandatory for anything shown as "upcoming."** If a
   source doesn't give Halo a determinable end date for an event or
   notice, the record cannot carry `freshness_status: current` under an
   "upcoming" framing — it is either held back or shown without that
   framing until a date is known. This is the direct implementation of
   the product rule that expired events must not appear as upcoming.
4. **`collected_at` moving forward never implies `source_updated_at` moved
   forward.** Re-fetching an unchanged page updates `last_checked_at`
   only; `source_updated_at` only changes when the source's own content
   actually changes (detected via `contentHash` on `Provenance`, which
   already exists in the schema today).
5. **Sources disagreeing does not average out into a status.** If two
   sources give different values for the same fact, that is a
   `RecordConflict` (already in `schema.ts`) — freshness classification
   applies to each source's value independently, and the conflict itself
   is surfaced, not silently resolved by picking the "fresher" one.

## What Stage 1 does *not* do

- Does not add `last_checked_at` / `last_confirmed_at` / `expires_at` /
  `freshness_status` to `lib/knowledge/schema.ts` — that is Stage 2
  implementation work, once this plan is confirmed.
- Does not implement change detection (comparing `contentHash` across
  runs) — the field already exists on `Provenance` for this purpose, but
  no comparison logic exists yet.
- Does not classify any real record, because no real record exists yet.
