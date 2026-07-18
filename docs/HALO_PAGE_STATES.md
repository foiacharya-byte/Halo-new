# Halo Page & State Architecture

> Maps the pre-launch experience's required routes, states and flows onto
> what exists in `app/` and `components/` today, and specifies the state
> machines (search, request, contribution, contact-reveal) the spec
> requires. Planning document — no routes are added or changed by this
> file itself.

## 1. Route inventory — required vs. existing

| Spec route | Exists today? | Notes |
|---|---|---|
| `/` | **Yes** (`app/page.tsx`) | Currently a calm, static hero + contribution CTA + category index + trust explanation. Needs to become the 9-scene scroll story (§7 of spec) while keeping `HaloSearch` as the actual search mechanism. |
| `/search?q=` | **Yes** (`app/search/page.tsx`) | Working: branch selection for ambiguous multi-category/area queries, filters, empty state. This is the "strong-result / no-result" split the spec asks for in Scene 3 and §8 — **already substantially implemented**, not net-new. Gap: no explicit "why each matches" evidence line, no business-provided vs. Halo-confirmed vs. community-outcome distinction on result cards yet. |
| `/request/new` | **No** — closest existing is `/add` (`HaloAddNumberFlow`), which is the *contribution* flow (submitting a trusted number), not the *request* flow (asking for one). These are different in the spec (§9 vs §10) and must stay different: a request is a need with no strong answer yet; a contribution is a trusted contact someone is passing on. **Net new**, but should reuse `flow-ui.tsx`'s step primitives. |
| `/request/:id/status` | **No.** Net new. Needs a `Request` entity with a status enum (Received → Finding options → Verifying → Answer ready → Closed). |
| `/answer/:id` | **No.** Net new. Renders 1–3 matched options with evidence, uncertainty, last-confirmed date, and the "Reveal contact" action. |
| `/contribute` | **Overlaps `/add`.** The existing add-number flow is close to what the spec calls "contribution" (§10) but the spec's contribution form asks richer sourcing questions ("How do you know them?", source = phone/neighbour/WhatsApp group/other) than the current `HaloAddNumberFlow` collects. Recommend extending `/add` in place (it is functionally the same concept) rather than standing up a parallel `/contribute` route — **flagged as a naming/scope decision for confirmation**, see the response's contradictions item. |
| `/contribute/request/:requestId` | **No.** Net new — a contribution made in direct response to a specific open request (drives the "helped a real request" bonus-points event). |
| `/how-it-works` | **No** dedicated route. Scene 6 of the homepage covers this narratively; a standalone page may be redundant with the scroll story — recommend the homepage scene *is* the explanation, with `/how-it-works` as a lightweight anchor-linked section rather than a full duplicate page, unless the spec wants a shareable static explainer. |
| `/urgent-help` | **No.** Net new, and per §12 of the spec, deliberately **isolated** from Halo Points/ranking/paid placement — its own route, its own component tree, no shared trust-scoring code path. |
| `/business/invite/:token` | **No.** Existing `/business` (`HaloBusinessFlow`) is a self-serve claim/correct/list flow open to anyone who navigates there — the spec's §13 explicitly wants business access to be **invitation-led only**, gated by a token, not a public "list your business" entry point. This is a **real behavioral conflict** with the current `/business` page, not just a missing route — flagged below. |

### Existing routes the spec doesn't mention (keep as-is)

`/listing/[slug]`, `/vouch/[listingId]`, `/submissions`, `/guidelines`,
`/privacy`, and the `/admin/*` moderation surfaces are all outside the
spec's scope and should be left untouched.

## 2. Conflict: `/business` today vs. the spec's invitation-only model

Today, `app/business/page.tsx` is a public, self-serve entry point: anyone
can go list, claim, or correct a business, gated only by `?claim=` /
`?correct=` query params for pre-filling — not by an invitation token. The
spec (§13) is explicit: *"Do not place a large 'List your business'
marketplace on the public homepage. Business access is invitation-led."*

This is a genuine product-behavior contradiction, not a cosmetic one — the
current MVP's business flow and the spec's business flow serve different
trust models (self-serve vs. invitation-gated). Resolving it needs a
decision: keep the current self-serve `/business` as an internal/soft-launch
tool while building the new `/business/invite/:token` as the *only*
publicly linked entry point (recommended — lowest risk, nothing existing
breaks, the self-serve route simply stops being linked from public nav);
or replace `/business` outright. Flagged for confirmation.

## 3. Search state machine (already implemented — preserve exactly)

```
[idle] --submit query--> [loading]
[loading] --strong result, single branch--> [result: strong]
[loading] --strong result, ambiguous (multi-category/area)--> [result: branch-select]
[loading] --no strong result--> [result: empty]
[result: branch-select] --pick branch--> [result: strong | result: empty]
[result: empty] --"Post this request"--> [/request/new, query preserved]
```

This machine lives in `lib/search/parser.ts` (`parseQuery`,
`expandBranches`) and `lib/data/store.ts` (`search`, `searchBranch`), driven
by `app/search/page.tsx`. **The user has explicitly asked that this keeps
working exactly as it does today.** Nothing in the new homepage or request
flow should fork or duplicate this logic — Scene 3's "strong result / no
result" split and the `/request/new` hand-off both call into this existing
machine, they don't reimplement it. The one real gap against the spec is
presentational (evidence line, source-type badges on results), not
behavioral — see §1's `/search` row.

## 4. Request state machine (net new)

```
DRAFT (steps 1-5 of /request/new: need, where, what matters, when, consent)
  --submit--> RECEIVED
RECEIVED --community/ops sourcing begins--> FINDING_OPTIONS
FINDING_OPTIONS --a candidate contact is proposed--> VERIFYING
VERIFYING --contact confirmed (category, locality, recency, consent)--> ANSWER_READY
VERIFYING --nothing verifiable found--> FINDING_OPTIONS (retry) or CLOSED (no answer)
ANSWER_READY --requester views /answer/:id--> (no state change; view event only)
ANSWER_READY --requester reveals contact--> (Request stays ANSWER_READY; a separate
                                              ContactReveal record is created — see §6)
ANSWER_READY | FINDING_OPTIONS | VERIFYING --requester or timeout--> CLOSED
```

Matches the spec's five stages (Received, Finding options, Verifying,
Answer ready, Closed) exactly. `RequestPreference` (budget/availability/
quick response/quality/experience/safety/near-me/other) and the
today/few-days/this-week/exploring urgency field attach to the `Request`
record at DRAFT→RECEIVED and are read-only after submission.

## 5. Contribution state machine (net new, extends existing add-number flow)

```
DRAFT (source: phone | neighbour/friend | WhatsApp group | family group | other;
       how-known: personally used | someone close used | trusted-group rec | know-of;
       provider details; recency; why trusted; consent)
  --submit--> PENDING_VERIFICATION   (0 Halo Points — never awarded on raw submission)
PENDING_VERIFICATION --moderator verifies contact/category/locality/recency/consent--> VERIFIED (+3 points)
PENDING_VERIFICATION --fails verification--> REJECTED (0 points, contributor notified)
VERIFIED --contribution is later used to answer a real Request and outcome = success--> VERIFIED_AND_HELPED (bonus points event)
```

This is the same shape as the existing `ListingSubmission.moderationStatus`
(`pending → approved/rejected`, already in `lib/data/types.ts`) plus one
addition the spec requires that doesn't exist yet: the **source-of-knowledge
field** ("How do you know them?" / where the number came from) and the
**bonus event when a verified contribution resolves an open Request** —
today's `ListingSubmission` has no link back to a `Request`, because
`Request` doesn't exist yet either. Both are additive fields/records, not
breaking changes to the current submission shape.

## 6. Contact-reveal + follow-up state machine (net new)

```
ANSWER_READY --user clicks "Reveal contact"--> ContactReveal{status: CONTACT_REVEALED, revealedAt}
CONTACT_REVEALED --+24h reminder--> "Did you contact them?" 
  --> not_contacted | contacted
contacted --+3d reminder--> "Did you use them?"
  --> no_response | number_invalid | unavailable | not_suitable | booked | service_completed | cancelled | no_longer_needed | outcome_unknown
service_completed --final question--> "Would you use them again?" (yes/maybe/no)
  + structured signals (responded promptly, arrived on time, price stayed as discussed,
    work completed, professional behaviour, issue solved, price changed, missed appointment,
    incomplete work) — no forced star rating
--+7d (from CONTACT_REVEALED, if no completion)--> CLOSED, reminders stop
```

This is entirely new — there is no reveal/reminder concept in the current
codebase at all (the closest existing thing, `HaloVouchFlow`, is a
retrospective "I used this and here's my experience" form with no
reveal-event or reminder-scheduling behind it). This needs its own
`Reminder` scheduling mechanism; since the app has no background job runner
today, the practical MVP approach is: store `Reminder{dueAt, kind}` rows
and check/surface them on the user's next visit (e.g. `/submissions` or a
dedicated "your requests" view), rather than assume outbound push/email
infrastructure exists — **flagged as an implementation-approach decision**,
not a spec conflict.

## 7. Halo Points — ledger, not a counter

Per spec §14, `HaloPointTransaction` must be append-only
(`reason, amount, status, relatedContributionId, relatedOutcomeId,
createdAt`), with balances **derived**, never stored as a single mutable
total. Nothing like this exists today — no points concept is implemented
anywhere in the current Next.js app (the point/leaderboard/streak features
referenced in earlier project history belong to the separate `halo.html`
artifact, not this repository). This is straightforwardly net new and low-risk
to add as an additive table + a `getBalance(userId)` derivation function.

## 8. Urgent help — isolation requirement

Per spec §12, `/urgent-help` must not share code paths with Halo
Points/ranking/trust-scoring. Concretely: its data (`EmergencyResource`)
must be a separate, manually-curated, approval-gated list — **never**
sourced from the same `Listing`/`Vouch`/points pipeline as the rest of the
directory, and never touched by the unrelated Knowledge Ingestion System
either (that system explicitly does not cover this — see
`docs/knowledge/VADODARA_KNOWLEDGE_MAP.md` §3, which notes Halo does not
attempt to determine "best" providers and carries no ranking). Until real,
approved emergency data exists, the page must show the spec's mandated
placeholder copy verbatim rather than any invented number.

## 9. Summary of net-new vs. extend-in-place

| New capability | Approach |
|---|---|
| Homepage scroll story | **Rewrite** `app/page.tsx` + new scene components; `HaloSearch` embedded unchanged |
| Search results evidence/source badges | **Extend** `HaloDirectoryList`/result card, not the parser |
| Request flow + status | **Net new** (`/request/new`, `/request/:id/status`) using `flow-ui.tsx` primitives |
| Answer + reveal | **Net new** (`/answer/:id`, `ContactReveal`) |
| Contribution sourcing fields | **Extend** `HaloAddNumberFlow` + `ListingSubmission` type |
| Follow-up reminders | **Net new**, poll-on-visit approach (no background jobs yet) |
| Halo Points ledger | **Net new**, additive, derived balance |
| Business invitation | **Net new route**; existing `/business` kept but unlinked from public nav pending confirmation |
| Urgent help | **Net new**, deliberately isolated |
| The Passing Line | **Net new** shared component (SVG/motion path), no dependency on missing image assets |
