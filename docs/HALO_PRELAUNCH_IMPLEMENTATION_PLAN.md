# Halo Pre-launch Implementation Plan

> Staged plan for building the Halo Vadodara Pre-launch Experience inside
> this Next.js repository. Written before implementation, per the spec's
> own requirement. Extends `HALO_ASSET_AUDIT.md` (what exists / is missing)
> and `HALO_PAGE_STATES.md` (routes and state machines) into a build order.
> No code has been changed by this document.

## Non-negotiable constraint carried through every phase

**The existing search behavior is preserved exactly.** `HaloSearch` →
`/search?q=` → `parseQuery`/`expandBranches` (`lib/search/parser.ts`) →
`search`/`searchBranch` (`lib/data/store.ts`) is not rewritten, forked, or
routed around. Every new surface (homepage Scene 3, the no-result → request
hand-off, `/request/new`) *calls into* this existing pipeline. If a new
scene needs richer result cards (evidence line, source-type badges), that
is a presentational extension of `HaloDirectoryList`, not a new search
implementation.

## Two open decisions this plan assumes (pending confirmation)

1. **Design-system authority:** `HALO_PROJECT_MEMORY.md`'s "ae halo"
   system (Fraunces/Caveat fonts, maroon/terra/gold palette, spinning-wheel
   intro) describes a different, non-Next.js artifact and is treated as
   **historical, not binding**. The master prompt's §3 palette (near-white
   base, ink/forest for trust, marigold for contribution/points, coral for
   active/no-result, rare blue/lilac accent) is the target this plan
   extends the *existing* Tailwind tokens toward.
2. **`/business` behavior:** the current self-serve claim/list flow stays
   in the codebase but is **unlinked from public navigation** once
   `/business/invite/:token` ships, rather than being deleted — lowest-risk
   path that satisfies "invitation-led, not a public marketplace entry
   point" without breaking anything that currently depends on `/business`.

Both are called out explicitly in the response to this task; implementation
proceeds on these assumptions unless corrected.

## Phase 1 — Foundation (tokens, shell, homepage scenes 1–3, Passing Line)

1. **Asset audit** — done (`HALO_ASSET_AUDIT.md`).
2. **Design tokens** — extend `tailwind.config.ts` additively: add
   `forest`, `marigold`, `coral`, one discovery accent (`lilac` or
   `electric`), keep `paper`/`surface`/`border`/`ink`/`accent`/`good`/`warn`
   as-is so nothing currently styled with them breaks. Load a real
   editorial serif via `next/font/google` for major statements; keep the
   system sans stack for interface/forms. No handwritten font until a
   concrete 2–5-word use is designed.
3. **`PassingLine` component** — shared SVG/motion-path component
   (framer-motion, already installed) representing the trusted-number
   journey; respects `prefers-reduced-motion` (the codebase already has a
   global reduced-motion rule in `globals.css` to hook into). Built as pure
   generated line-art — not blocked by missing photography.
4. **Homepage Scenes 1–3** — rewrite `app/page.tsx` as the scroll story
   for: The Need (hero, existing `HaloSearch` embedded, rotating placeholder
   examples, PassingLine through locality labels), The Reality (scattered
   query fragments gathering into one answer), Search-first-or-Request
   (wraps the *existing* search pipeline — strong result shows ≤3 matches
   with evidence; no-result shows "Post this request" preserving the query
   string into `/request/new`).
5. **Responsive nav** — extend `HaloHeader.tsx` rather than replace
   (`How it works`, `For businesses`, `About`, `Join early access`, mobile
   menu); keep the existing skip-link and sticky/blur behavior.
6. **Early-access form** — Scene 8 as a new section/component
   (email required, phone optional with explicit consent copy,
   communication-preference radio). No fabricated waitlist counts.

## Phase 2 — Search results polish, request flow, contribution flow

1. Extend `HaloDirectoryList` result cards with: why-it-matches line,
   business-provided vs. Halo-confirmed vs. community-outcome source
   badges, "Reveal contact" / "Not suitable" / "Post a more specific
   request" actions — presentational layer only, over the existing search
   result shape.
2. **`/request/new`** — five-step flow (need → where → what matters →
   when → delivery/consent) built on `flow-ui.tsx`'s existing step
   primitives; new `Request`/`RequestPreference` types alongside
   `lib/data/types.ts`; explicit "may call about this request" checkbox,
   never assumed.
3. **`/request/:id/status`** — renders the five-stage state machine from
   `HALO_PAGE_STATES.md` §4.
4. **Contribution flow** — extend `HaloAddNumberFlow`/`/add` with the
   spec's sourcing questions (how-known, source-of-number) rather than
   building a parallel `/contribute` route; pending-vs-verified points
   states shown explicitly ("Pending verification — 0 awarded now").

## Phase 3 — Answer, contact reveal, outcome feedback, Halo Points

1. **`/answer/:id`** — 1–3 options with evidence, uncertainty, last-confirmed
   date, "Reveal contact".
2. **`ContactReveal` event + reminder scheduling** — poll-on-visit approach
   (no background job runner exists yet in this app; reminders are computed
   from `dueAt` and surfaced on the requester's next relevant page view,
   e.g. `/request/:id/status` or `/submissions`) — see
   `HALO_PAGE_STATES.md` §6 for the exact reminder cadence and status enum.
3. **Outcome/feedback flow** — structured signals (responded promptly,
   arrived on time, price stayed as discussed, work completed, professional
   behaviour, issue solved, price changed, missed appointment, incomplete
   work), no forced star rating; "would use again" only after
   `service_completed`.
4. **`HaloPointTransaction` ledger** — append-only table/type, balance
   derived (never a stored mutable total); +3 on verified contribution,
   bonus event on a contribution that resolves a real request.

## Phase 4 — Urgent help, business invitation, accessibility/performance pass

1. **`/urgent-help`** shell — isolated component tree and data
   (`EmergencyResource`), no points/ranking/paid-placement code path
   reachable from it; mandated placeholder copy until real approved
   emergency data exists; never an invented number.
2. **`/business/invite/:token`** — tokenised invitation view ("You were
   recommended by residents", what Halo has on file, confirm identity/
   categories/areas, contact preference, accept/decline, opt-out). Existing
   `/business` stays functional but stops being publicly linked (see
   decision #2 above).
3. **Accessibility/performance review** — keyboard nav through the new
   scroll story and flows, 360px-up responsiveness, no horizontal overflow,
   lazy-loaded/optimized media, `prefers-reduced-motion` honored throughout
   (already a global rule; every new animated component must respect it,
   not just the PassingLine).

## Explicitly out of scope for all four phases

Per spec §18: no full business dashboard, no public social feed/comments,
no bookings, no payments/fintech features. Per this repo's existing
governance: no changes to `lib/knowledge/*` (separate Knowledge Ingestion
System, unrelated to this spec) and no invented Vadodara imagery, logo,
emergency numbers, testimonials, review counts, or "live" activity data —
any illustrative data is explicitly labeled as such (e.g. Scene 9's living
footer, if it ships before real activity data exists, is labeled
"Illustrative preview" per the spec's own instruction).

## Acceptance check per phase

Each phase ends with: `tsc --noEmit` clean, `vitest run` green (existing
12 search-parser tests must keep passing unmodified — they are the
contract for "search keeps working"), `next build` clean, and a manual
walk of that phase's new routes in a dev server before moving on.
