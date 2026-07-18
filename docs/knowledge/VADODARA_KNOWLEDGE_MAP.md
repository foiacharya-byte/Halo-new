# Vadodara Knowledge Map

> Stage 1 of the Vadodara Knowledge Ingestion System. This document defines
> **what Halo intends to know about Vadodara** — organised into categories —
> and, for each category, why it matters to someone living in or moving to
> the city. It does not collect, index, or synchronise any data itself.
>
> **No data has been collected under this map.** It is a planning document.
> The mechanics of *how* each category is populated live in
> [`VADODARA_SOURCE_PLAN.md`](./VADODARA_SOURCE_PLAN.md); *how fresh each
> category can ever be* lives in
> [`VADODARA_FRESHNESS_PLAN.md`](./VADODARA_FRESHNESS_PLAN.md). All three
> extend the existing governance model in [`lib/knowledge/`](../../lib/knowledge/README.md)
> (provenance, licensing, authority-vs-trust) — nothing here overrides it.

## How to read this map

Every category below states:
- **Covers** — the concrete things Halo wants structured knowledge of.
- **Why it matters** — answered against the standing test the product uses:
  *"How will this help Vadodara, or someone who has recently moved here?"*
- **Nature of the knowledge** — whether it is fundamentally official/civic,
  crowd-sourced/geographic, or Halo-native (produced by the Halo community,
  never by outside data collection).
- **Boundaries** — what this category deliberately excludes, so scope does
  not creep toward "we know everything."

Halo will **never claim category completeness**. Each record shown in the
product carries its own provenance (source, collection date, source's own
update date) per the schema in `lib/knowledge/schema.ts`. A category being
"mapped" here means Halo intends to build structured knowledge for it — not
that the knowledge exists yet.

---

## 1. City Structure

**Covers:** Wards and zones, area/locality boundaries and names, PIN codes
and the post offices that serve them, how areas relate to each other
geographically (which areas are adjacent, which fall in which zone).

**Why it matters:** This is the substrate every other category sits on. A
newcomer asking "where is Alkapuri relative to Gotri" or "which ward am I
in for a civic complaint" needs this before anything else resolves.

**Nature:** Civic/administrative (VMC, District Administration) for wards
and zones; postal-authority for PIN codes; geographic/crowd-sourced (OSM)
for locality boundaries and adjacency, which stays unverified until
separately confirmed.

**Boundaries:** Does not include real-estate valuation, livability scoring,
or demographic profiling of areas — those belong to City Statistics (§11)
and, where subjective, to Halo Community Knowledge (§12) only.

## 2. Government & Civic

**Covers:** VMC and District Administration office locations and contact
details, department directories, ward office addresses, public notices and
circulars, grievance-redressal channels, election/civic-participation
information where officially published.

**Why it matters:** "Who do I call about a broken streetlight," "where is
my ward office," "is there a public notice about my area" are exactly the
questions a resident — new or long-term — has no easy single place to ask
today.

**Nature:** Official/civic only. No aggregation from private directories.

**Boundaries:** Halo records what a civic body has published and when; it
does not adjudicate whether a department is responsive, and does not carry
complaint-handling itself (that would require private citizen data, which
this system does not collect).

## 3. Health & Emergency

**Covers:** Emergency numbers (police/fire/ambulance), government hospitals
and their departments, blood banks, and a dedicated mental-health support
pathway (helplines, verified counselling resources, crisis-response
information) consistent with the mental-health essentials flow already
built into the product.

**Why it matters:** This is the highest-stakes category in the whole map —
wrong or stale information here can cause real harm. It is also where
"official ≠ current" matters most: a helpline number that changed last
year but is still printed on a government page is actively dangerous if
Halo repeats it uncritically.

**Nature:** Official/civic for facilities and emergency numbers. Halo does
not attempt to determine which private hospitals are "best" — that
judgement, if shown at all, comes only from Halo Community Knowledge (§12)
with its own separate trust signal.

**Boundaries:** No private hospital/clinic ranking from outside data. No
medical advice content. Mental-health resources are limited to
organisations Halo can attribute to a named, checkable source — never
invented or inferred.

## 4. Education

**Covers:** Government/board-recognised schools, colleges and universities
(names, addresses, affiliation/board where published), academic calendars
where officially published.

**Why it matters:** Families moving to Vadodara and students choosing where
to study need a factual base list before anything about "student perks" (the
Unidays/Studentbeans-style layer already in the product) makes sense —
Halo needs to know an institution exists and is legitimate before it can
be a perk-eligible affiliation.

**Nature:** Official/civic (education boards, university directories,
government school lists).

**Boundaries:** No rankings, no admissions advice, no fee data unless an
institution publishes it officially with a date. Reviews of institutions,
if ever shown, would be Halo Community Knowledge — not this category.

## 5. Transport & Mobility

**Covers:** GSRTC bus routes/depots, railway station information, official
traffic-advisory notices, road/ward-level infrastructure from OSM (roads,
stops) where useful for orientation.

**Why it matters:** "How do I get from Fatehgunj to Manjalpur," "where's
the nearest railway station," "is there a traffic diversion today" are
constant, practical questions — especially for people new to the city who
don't yet have a mental map.

**Nature:** Official (GSRTC, Railways, Traffic Police notices) for routes
and advisories; OSM (unverified) for road/stop geometry.

**Boundaries:** No live vehicle tracking or real-time transit data — no
approved source for that exists yet in the registry. No auto-rickshaw fare
aggregation from unofficial listings.

## 6. Food, Shopping & Discovery

**Covers:** Local eateries, shops, markets and everyday-discovery listings
that make the "hyperlocal directory" experience useful — but sourced
exclusively from **Halo's own community** (submissions, community
verification, Halo trust signals), never from ingested external listings.

**Why it matters:** This is Halo's core differentiator, and it is
explicitly why the rules forbid pulling this category from Google
Maps/Justdial/Sulekha or any other private directory: the value is a
trustworthy, community-verified layer, not a repost of someone else's
listings.

**Nature:** Halo-native. This category is **not populated by the
ingestion system described in this map** — it is out of scope for
source ingestion entirely and is governed by the product's own
submission/verification flow, not `lib/knowledge/`.

**Boundaries:** The knowledge-ingestion system must never attempt to fill
this category from any external source, official or not — doing so would
blur exactly the authority-vs-trust line the whole system exists to keep
separate.

## 7. Culture, Heritage & Tourism

**Covers:** Monuments, museums, heritage sites, festivals and cultural
institutions (e.g. Laxmi Vilas Palace, Sayaji Baug, EME Temple), described
in text with attributed facts (location, historical description).

**Why it matters:** Helps both residents and newcomers connect with the
city beyond utility — "what's actually worth seeing/doing here," which
also feeds the area-guide "is it liveable / what's nearby" narrative.

**Nature:** Official/tourism-board text content only. Timings and fees from
tourism marketing sources are treated as indicative, not authoritative,
per that source's `currencyCaveat`.

**Boundaries:** **No images copied** from tourism sources without confirmed
reuse rights (the default is prohibited). Text facts only until a licence
is confirmed otherwise.

## 8. Sports & Recreation

**Covers:** Public grounds, stadiums, sports complexes, parks, gyms and
clubs where officially listed (municipal/sports-authority facilities).

**Why it matters:** "Where can I play/run/train near me" is a recurring
newcomer question and ties into the area-guide livability angle.

**Nature:** Official/civic for public facilities. Private gyms/clubs, if
ever included, would need to come through Halo's own submission flow
(§12), not external ingestion.

**Boundaries:** No aggregation of private fitness businesses from
directories.

## 9. Events & Current Activity

**Covers:** Public notices, official civic circulars, government-published
event announcements (fairs, civic drives, public holidays with local
relevance) with explicit start/end dates.

**Why it matters:** This is the most time-sensitive category in the map —
and the one where the "expired events must not appear as upcoming" rule is
load-bearing. Nobody is served by Halo showing a festival that already
happened as if it's still coming up.

**Nature:** Official/civic. Freshness-critical (Class A, see the freshness
plan) — every record here needs a real expiry, not just a collection date.

**Boundaries:** No aggregation of private/commercial event listings. If an
event's end date cannot be determined from the source, it cannot be shown
as "upcoming" at all — it is held back rather than guessed.

## 10. Utilities & Essential Services

**Covers:** Water supply (VMC), electricity (MGVCL), waste collection
schedules, gas distribution — official service information and contact
points, plus any officially published outage/advisory notices.

**Why it matters:** "Who do I contact when the water stops," "what's my
garbage collection day," "is there a scheduled power cut" — unglamorous
but genuinely high-utility questions for every resident.

**Nature:** Official/civic (utility boards, VMC).

**Boundaries:** No real-time outage status unless a utility publishes one
officially — Halo will not infer or crowd-source "is the power out right
now" as if it were verified fact.

## 11. City Statistics

**Covers:** Population, area, demographics, literacy and other Census/
official-statistics figures, each carrying its own **reporting year** as a
first-class, always-visible attribute.

**Why it matters:** Gives real texture to "is this area/city growing,
what's the scale of things" for the area-guide deep-dive experience —
*only* if every figure is honestly dated, which is the entire point of
this category existing separately from the others.

**Nature:** Official statistical (Census of India, data.gov.in datasets,
VMC/District published figures).

**Boundaries:** **A statistic without a reporting year is not shown as
current-day fact.** Old Census figures (e.g. 2011) must always display
their year prominently — Halo does not imply 2026 population from 2011
Census data. If a more recent figure doesn't exist, the old one is shown
*as* old, not silently presented as present-day.

## 12. Halo Community Knowledge (kept separate)

**Covers:** Halo Points, the leaderboard, community vouches, user
submissions, perk redemptions, reviews and any trust signal that comes
from Halo's own users.

**Why it matters:** This is the layer that makes Halo *Halo* rather than a
mirror of government data — but exactly because it's valuable, it must
never be confused with, or silently merged into, official authority data.

**Nature:** 100% Halo-native. Zero external source ingestion.

**Boundaries:** This category is **not part of the knowledge-ingestion
system**. It is listed here only so the map is explicit about the one
kind of "Vadodara knowledge" Halo holds that this system will never touch,
collect for, or influence. `CommunityVouch` in `lib/knowledge/schema.ts`
already encodes this isolation at the type level — this category is the
product-level acknowledgement of that same boundary.

---

## Summary table

| # | Category | Nature | Freshness-critical? | Populated by external ingestion? |
|---|---|---|---|---|
| 1 | City Structure | Civic + OSM (unverified) | Low | Yes |
| 2 | Government & Civic | Civic | Medium | Yes |
| 3 | Health & Emergency | Civic | High | Yes (facts only, not rankings) |
| 4 | Education | Civic | Low | Yes |
| 5 | Transport & Mobility | Civic + OSM (unverified) | Medium | Yes |
| 6 | Food, Shopping & Discovery | Halo-native | — | **No — explicitly excluded** |
| 7 | Culture, Heritage & Tourism | Tourism (text only) | Low | Yes (text only, no images) |
| 8 | Sports & Recreation | Civic | Low | Yes (public facilities only) |
| 9 | Events & Current Activity | Civic | **Highest** | Yes |
| 10 | Utilities & Essential Services | Civic | Medium | Yes |
| 11 | City Statistics | Official statistics | Low (but date-critical) | Yes |
| 12 | Halo Community Knowledge | Halo-native | — | **No — explicitly excluded** |

Ten of twelve categories are in scope for source ingestion. Two (Food/
Shopping/Discovery and Halo Community Knowledge) are permanently out of
scope for this system by design, not by current limitation.
