# Halo Asset Audit

> Inventory of what exists in this repository today — code, design tokens,
> and media assets — measured against what the Halo Pre-launch Experience
> spec requires. Written before any implementation. Nothing in this
> document has been built yet; it is the "what we have vs. what we need"
> ledger the implementation plan is based on.

## 1. Repository reality check

This is a **Next.js 15 / React 19 / TypeScript** app (`app/` router), not the
single-file vanilla-HTML build described in `HALO_PROJECT_MEMORY.md`
(`index_v22.html`). That memory file documents a **different, earlier
artifact** — a self-contained HTML/CSS/JS build with its own "LOCKED"
design system (Fraunces/Cormorant Garamond/Caveat fonts, maroon/terra/gold
palette on warm paper, "ae halo" wordmark with an orbiting halo-ring intro).
**None of that exists in this codebase.** See §4 for why this matters and
what it means for the design system this build should use.

The current Next.js app already ships a working, if intentionally minimal,
MVP:
- Search-first homepage (`app/page.tsx`), full search results with a
  deterministic query parser (`lib/search/parser.ts`, no LLM), branch
  selection for ambiguous queries, category/area filters.
- Contribution flow (`app/add`, `HaloAddNumberFlow.tsx`).
- Business claim/correct flow (`app/business`, `HaloBusinessFlow.tsx`).
- Vouch flow (`app/vouch/[listingId]`, `HaloVouchFlow.tsx`).
- Admin/moderation surfaces (`app/admin/*`) and a seed-research review tool.
- A Postgres schema (`lib/db/schema.sql`) and matching TypeScript types
  (`lib/data/types.ts`) already encoding a lot of the spec's data-model
  intent: `PublicState`, `ModerationStatus`, `SourceRef`/`MatchStatus`
  (authority ≠ trust, already separated), `Vouch` with `ExperienceSignals`
  and `moderationStatus`, `ListingSubmission`, `ProviderClaim`.
- A separate, unrelated **Knowledge Ingestion System** (`lib/knowledge/`)
  for civic/government data — governed by its own rules, not part of this
  spec, not to be touched by this work.

This is a substantial head start. The pre-launch spec is not a from-scratch
build; it is a **narrative and interaction redesign of the homepage and
core loops**, plus several genuinely new flows (request lifecycle, contact
reveal + follow-up, Halo Points ledger, business invitation, urgent help),
layered onto data structures that mostly already exist or need targeted
extension.

## 2. Design tokens — current state

`tailwind.config.ts` today:

| Token | Value | Role |
|---|---|---|
| `paper` | `#FBF9F5` | warm near-white background |
| `surface` | `#FFFFFF` | card/surface |
| `border` | `#E9E4DB` | hairlines |
| `ink` | `#1F1B16` | primary text |
| `ink-soft` | `#6B6259` | secondary text |
| `ink-faint` | `#948A7E` | tertiary text |
| `accent` | `#B4471F` | terracotta — primary action |
| `accent-soft` / `accent-ink` | `#F3E7E0` / `#8E3416` | accent tints |
| `good` / `good-soft` | `#2F6B4F` / `#E6F0EA` | success/trust green |
| `warn` / `warn-soft` | `#8A6D1F` / `#F3ECD8` | caution |

Fonts: `--font-sans` (system stack) and `--font-serif` (Iowan Old
Style/Palatino/Georgia stack) — **no serif font file is actually loaded**;
it's a system-font fallback declared in `globals.css`, not a real
typographic choice yet. `border-radius: halo = 14px` is the one named
radius token. No motion/spacing/shadow token set beyond `boxShadow.card`
and `boxShadow.focus`.

**This is close to, but not the same as, the spec's target palette**
(§3 of the master prompt): warm near-white base ✓, deep ink for trust ✓
(spec also wants a "forest" trust tone — not present), marigold for
contribution/points (not present — closest is `accent` terracotta, which
the spec reserves for a different role), coral for active
requests/no-result (not present — again closest is `accent`), electric
blue/lilac as rare discovery accents (not present). `good`/`warn` map
loosely to spec ideas but aren't named to match.

**Decision needed before tokens are extended (flagged in the implementation
plan and in the "risks/contradictions" section of the response):** treat
`HALO_PROJECT_MEMORY.md`'s "ae halo" design system as **superseded/historical**
(it documents a different artifact this repo doesn't contain), and treat
the master prompt's §3 palette as the target to extend the *existing*
Tailwind tokens toward — adding `forest`, `marigold`, `coral`, and a single
restrained `lilac`/`electric-blue` discovery accent, rather than replacing
`accent`/`good`/`warn` outright, since result pages, buttons, and chips
already depend on them.

## 3. Typography

Nothing expressive is loaded yet — `--font-serif` is a system fallback
stack, not an actual serif font file. The spec asks for "an expressive
editorial serif for major statements" plus "a modern sans-serif for
interface/forms" plus an optional constrained handwritten accent. No font
files exist in `public/` or are referenced via `next/font`. **This needs a
real font choice and `next/font` wiring** — recommend `next/font/google`
for a self-hosted, license-clean serif (e.g. a high-contrast editorial
serif) + the existing system sans stack kept for interface text (fast,
zero layout shift, already proven). A handwritten accent font should be
added only if used for 2–5 word annotations per the spec — not before a
concrete use is designed.

## 4. Brand / wordmark

Current header/footer (`HaloHeader.tsx`, `HaloFooter.tsx`) use a plain
circular "h" monogram in a colored circle — explicitly commented in code as
a placeholder ("until a transparent vector exists"). **No Halo logo file
exists anywhere in this repository.** `HALO_PROJECT_MEMORY.md` describes an
"ae halo" wordmark treatment (`.mk` / `.mk-sm` CSS classes) that belongs to
the other, non-Next.js artifact and has no corresponding asset here either.

**Missing asset (spec item G):** Halo logo files in SVG/PNG. Until
supplied, the existing monogram placeholder is reused as-is (it is already
a deliberate, labeled placeholder — no new fake logo will be invented).

## 5. Vadodara visual assets

`public/` contains exactly four files: `social/{instagram,x,whatsapp,linkedin}.svg`
(brand icons for the footer's `SocialLinks` component — unrelated to city
imagery). **There is no Vadodara photography, line art, skyline, map
graphic, or locality-path asset anywhere in the repository.**

Per the spec's non-negotiable asset rule, none of the following may be
invented or AI-generated as if factual:
- landmark photography or line art (spec item A)
- an isolated skyline/architectural silhouette (item B)
- a locality map/path graphic using real area names (item C)

**All are missing and must be requested from the repository owner.** Until
supplied, the hero and any other scene calling for a city visual will use
an elegant neutral placeholder (typographic/geometric — not a fabricated
skyline) with a `TODO(asset)` comment and a corresponding entry in the
table below, per the spec's own fallback instruction ("if an approved
asset is missing, use an elegant neutral placeholder and add a TODO").
**The Passing Line itself (§4 of the spec) is not blocked by this** — it is
a generated, abstract line animation (SVG/motion path over locality *text*
labels, not photography), so it can be built now.

## 6. Missing-asset table

| Spec ref | Asset | Status | Placeholder plan until supplied |
|---|---|---|---|
| A | Verified landmark photo/line art (single approved landmark) | **Missing — request from owner** | Neutral geometric/typographic hero backdrop; no invented landmark |
| B | Isolated skyline/architectural line drawing, transparent bg | **Missing — request from owner** | Omit skyline layer; rely on typography + Passing Line |
| C | Locality map/path graphic with real area names | **Missing — request from owner** | Text-label path only (locality names + The Passing Line), no map imagery |
| D | Realistic phone-contact-list visual | **Missing — request from owner** | Coded UI mockup (real component, not a photo) representing a contact list — this can be built as an actual small UI component rather than an image, which sidesteps the asset problem entirely |
| E | Anonymised WhatsApp-group conversation visual | **Missing — request from owner** | Same approach as D: a coded chat-bubble UI component with placeholder/anonymised copy, not an image asset |
| F | Real provider portraits or approved neutral placeholders | **Missing — request from owner** | Initials-in-circle avatars (same pattern as the existing header monogram) — already an established, honest placeholder style in this codebase |
| G | Halo logo files (SVG/PNG) | **Missing — request from owner** | Keep existing labeled monogram placeholder |
| H | Subtle local textures/patterns | **Missing — optional** | Omit; rely on typography/whitespace/line-work per the spec's own design character guidance ("use composition... instead" of decoration) |

Items D, E and F are the good news: they don't need real photography at
all — they're better built as actual coded UI (a contact-list component, a
chat-bubble component, initials avatars), which is more honest than a
stock photo pretending to be a real user's phone anyway, and ships without
waiting on the owner.

## 7. Reusable UI infrastructure

Already present and directly reusable for the new build:
- `components/ui.tsx` — `Button`, `Eyebrow`, `SectionTitle`, `Chip`, local
  `cn()`. Small, consistent primitives; extend rather than replace.
- `components/ui/social-links.tsx` — shadcn-style component using
  `framer-motion` (already a dependency, `^12.42.2`) — confirms
  framer-motion is available for the Passing Line and scene motion without
  adding a new animation dependency.
- `components/flow-ui.tsx` — shared building blocks for the existing
  multi-step flows (add-number, business, vouch) — the request flow and
  contribution flow in the new spec should extend this rather than invent
  a parallel step-flow pattern.
- `components/HaloSearch.tsx` — the working search box (hero/compact
  sizes), already wired to `/search?q=`. **This is the search behavior the
  user has asked to explicitly preserve** — the new homepage scenes wrap
  around it, they do not replace it.
- `lib/search/parser.ts` + `lib/data/store.ts` — the deterministic,
  no-LLM query parser and in-memory data store. Untouched by this spec.

## 8. What this audit rules out

- No existing font files, logo files, or city imagery will be fabricated
  to "fill in" this audit. Every gap above is listed as missing, not
  quietly substituted.
- `HALO_PROJECT_MEMORY.md`'s design system is treated as historical
  documentation of a different, non-Next.js build — not as binding
  instruction for this codebase — pending explicit confirmation (see the
  response's "risks and contradictions" item).
