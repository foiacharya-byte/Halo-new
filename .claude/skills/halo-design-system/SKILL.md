---
name: halo-design-system
description: The design skill for Halo (ae halo), Vadodara's hyperlocal directory. Invoke before designing, building, or reviewing any Halo screen, component, section, or visual change. Defines the locked palette, typography, spacing, motion, imagery, component rules, Gujarati usage, and the test for whether a page feels premium. Halo is a premium hyperlocal digital identity for Vadodara — not a SaaS dashboard, not a generic AI startup site.
---

# Halo Design System — *આપણી માટીનું*

This is the single source of visual truth for Halo. If a design choice
conflicts with this file, this file wins. The build `index_v22.html` is the
reference implementation; reuse its exact markup and tokens rather than
re-inventing.

---

## 0. What Halo is (and is not)

**Halo is a premium, hyperlocal *digital identity* for Vadodara (Baroda).**
A warm, cinematic, trustworthy local directory that feels like *"Baroda's own."*

It is **not**:
- a SaaS dashboard (no card grids of KPIs, no sidebar-nav admin shell, no data-table aesthetic)
- a generic AI startup website (no purple-blue gradients, no abstract blobs, no "AI" glow, no robot/sparkle iconography)
- a noisy listing site (no ad density, no badge soup, no clutter)

Every screen should feel like a **quiet, confident, beautifully made local
publication** — closer to a printed city journal than to software.

### The three emotions (memorise these)
| English | ગુજરાતી | Means in the UI |
|---|---|---|
| **Trust** | **વિશ્વાસ** | Honesty about what's verified; nothing fake; calm restraint |
| **Discovery** | **શોધ** | Effortless, delightful finding of the gem next door |
| **Belonging** | **પોતાપણું** | *"This is ours."* Local pride, warmth, recognition |

Every page must serve at least one. A page that serves none is wrong.

### The reference feeling (blend, don't copy)
- **Apple storytelling** — one idea per view, generous space, cinematic reveals, restraint.
- **Aman Resorts calm** — stillness, warmth, luxury through *absence*, never loud.
- **Airbnb city-guide warmth** — local, human, photographed-by-a-neighbour, friendly.
- **Halo Lab polish** — pixel-tight craft, considered motion, no rough edges.

If a screen feels like **Stripe, Linear, Notion, or a SaaS template**, it has failed.

---

## 1. Colour palette (LOCKED)

These are the exact `:root` tokens in the build. Do not introduce new hues
without an explicit decision; extend only by tinting within this family.

| Token | Hex | Role |
|---|---|---|
| `--paper` | `#F8F2E7` | warm paper — primary background |
| `--paper-deep` | `#EBE0CD` | deeper paper — sections, depth |
| `--ink` | `#2A1E11` | primary text |
| `--ink-soft` | `#6E5A40` | secondary text, captions |
| `--maroon` | `#7A2E22` | headings, accents, gravitas |
| `--terra` | `#C2531F` | primary action, the **"ae"** flourish |
| `--gold` | `#BE9A4E` | highlights, dividers, halo light |
| `--sand` | `#CBB488` | muted UI, inactive states |

### Palette rules
- **Paper is the world.** Backgrounds are warm off-white/cream, never pure `#FFF`, never grey, never dark-mode by default.
- **Maroon carries authority; terracotta carries action.** Use terracotta sparingly — it is the one warm spark on the page (the "ae", the primary CTA, one accent). If everything is terracotta, nothing is.
- **Gold is light, not fill.** Use it for thin dividers, the halo glow, small highlights — almost never as a solid background block.
- **One accent per view.** A screen has a single dominant warm accent moment. Competing accents = clutter.
- **Contrast is non-negotiable.** Body text is `--ink` on paper (passes AA). Never set `--sand` or `--gold` as text on paper for anything readable.
- **Trust labels have fixed colour meaning:** `Verified by Halo` (maroon/gold weight), `Owner claimed` (neutral ink-soft), `Added by a neighbour` (neutral). Never colour an unverified state to *look* verified.

### Forbidden colour moves
- ❌ Blue/purple/teal "tech" gradients of any kind.
- ❌ Neon, saturated digital primaries, pure black `#000`.
- ❌ Multi-stop rainbow gradients, glassmorphism frost, dark glass cards.
- ❌ Drop-shadows in cool grey — shadows are warm and low (`hsla(28,40%,18%,…)`).

---

## 2. Typography direction (LOCKED font stack)

| Token | Family | Use |
|---|---|---|
| `--serif` | **Fraunces** | Primary voice — headlines, wordmark, body display |
| `--caps` | **Cormorant Garamond** | Eyebrows / small-caps labels (letter-spaced) |
| `--script` | **Caveat** | *Only* the **"ae"** flourish — nowhere else |
| `--gu` | **Noto Serif Gujarati** | All Gujarati text |

### Type rules
- **Fraunces is the soul.** Serif-first, optical sizing, slightly editorial. Weights stay in the **440–600** range — never thin, never black. Headlines lean `470–600`, tight tracking (`-.015em` to `-.04em`).
- **Cormorant for eyebrows only**, uppercase, wide tracking (`.24em–.32em`), small (12–15px), in maroon. This is the "city journal" label voice.
- **Caveat is sacred and singular.** It renders the affectionate **"ae"** in terracotta and *nothing else*. Never use Caveat for body, buttons, or decoration.
- **Gujarati always in Noto Serif Gujarati**, weight 500–600, sized to optically match its English neighbour (Gujarati often needs ~1–2px more to feel equal).
- **Scale is fluid** (`clamp()`), cinematic on hero (up to `130px` wordmark), calm and readable in body (16–19px). Few sizes, big jumps — editorial hierarchy, not 8 near-identical steps.
- **Line length** 60–75 characters for body. **Line-height** 1.45–1.6 for paragraphs, 1.1–1.2 for display.
- **Numerals & rupees:** use `₹`, Indian digit grouping where natural; never invent precision (no fake "4.8 ★ (2,318)").

### The wordmark (do not drift)
Reuse the `.mk` component exactly. `.mk-sm` is the override that fixes wordmark
drift across screens — use it everywhere a smaller "ae halo" appears. The "ae"
(Caveat, terracotta), the word *halo*, and the terracotta end-bang/dot are one
locked unit. Never re-letter, re-space, or re-colour it ad hoc.

---

## 3. Spacing & layout rules

- **Air is the luxury.** Generous whitespace is the single biggest signal of premium here. When unsure, add space, remove elements.
- **Spacing scale (8px base):** `4, 8, 12, 16, 24, 32, 48, 64, 96, 128`. Section vertical rhythm lives in the `64–128` range on desktop; `48–80` on mobile.
- **One idea per view.** Sections are tall and breathe. Each does one job (hook, what-it-is, directory, trust, cooks). Don't cram two messages into one band.
- **Content max-width** ~`1100–1180px`; text columns ~`60–72ch`. Full-bleed only for intentional cinematic/imagery moments.
- **Alignment:** mostly left-aligned editorial text; centre only hero/intro and short emotional lines. Avoid centring long paragraphs.
- **Rhythm over grid-fill.** Asymmetry and considered offsets read as crafted; a rigid 3-up card matrix reads as a dashboard. Use cards, but let them breathe.
- **Mobile-first reality:** most Barodians arrive on a phone. Tap targets ≥ 44px, thumb-reachable primary actions, no hover-only affordances.
- **Radii:** soft and consistent — pills `999px` for chips/switches/CTAs, cards `~14–20px`. No sharp corners, no aggressively rounded "bubbly" 32px+ blobs.

---

## 4. Animation & motion rules

Motion is **cinematic and earned**, never decorative fidgeting.

- **Easing tokens (locked):** `--expo: cubic-bezier(.16,1,.3,1)` for entrances/reveals; `--spring: cubic-bezier(.34,1.4,.5,1)` for tactile UI (switch, press).
- **The intro is a film, not a loader.** Three beats — wordmark + orbiting halo → "We heard you" spinner → pillar reveal — each beat lands, then yields. Keep the Jon Kantner spinner recoloured to the heritage palette. **Never swap or "modernise" it** (it was wrongly replaced once and restored — do not repeat).
- **Reveal vocabulary:** fade + slight rise (`opacity` + `translateY(8–20px)`), blur-to-sharp on hero text, one-pass sheen sweep across the wordmark, slow breathe on the halo glow, drifting dust motes. That is the palette of motion — extend within it, don't bolt on bouncy/elastic everything.
- **Durations:** entrances `0.9–1.9s` with staggered delays; micro-interactions `120–250ms`. Nothing snappy-instant on hero; nothing sluggish on a button.
- **Stagger, don't dump.** Reveal lines/elements in sequence (`d1 d2 d3…`) so the eye is led — Apple-style.
- **Respect `prefers-reduced-motion`** everywhere — collapse to gentle fades / no motion. This is a trust and accessibility requirement, not optional.
- **Scroll:** smooth, calm. No parallax circus, no scroll-jacking that traps the user, no elements flying in from off-screen edges aggressively.
- **60fps or cut it.** Animate only `opacity` and `transform`. If a motion janks on a mid-range Android, it is wrong — remove it.

---

## 5. Imagery rules

- **Real Vadodara, seen warmly.** Imagery evokes a neighbour's well-shot photo: warm light, golden hour, lived-in streets, real shops, real food, real hands. Airbnb-city-guide honesty, not stock.
- **Tone the image to the paper.** Slight warm/sepia grade so photos sit in the palette; never a cold, blue, or HDR-crunchy photo dropped on cream.
- **People as belonging.** Where people appear, they are recognisably local and dignified — never posed stock "business handshake," never models.
- **Texture, not decoration.** Film grain, soft vignette, paper warmth, gold light — subtle and consistent. These carry the cinematic feel.
- **Landmarks with respect.** Vadodara cues (Laxmi Vilas Palace silhouette, Sayaji Baug, the skyline floor) appear as *quiet sepia line/silhouette*, suggestion not spectacle. **Never fake 3D landmark renders, never cartoon monuments, never a clip-art Kirti Mandir.**
- **No stock business clip-art, no generic icon packs, no 3D blobs, no AI-generated uncanny imagery.** If an asset looks like it came from a template marketplace, it cannot ship.
- **Iconography is minimal and line-based**, single-weight, drawn to match (the search magnifier, the arrow). No multicolour icon sets, no emoji as UI, no decorative sparkles.

---

## 6. UI component rules

General: every component should feel like it was *set* by a typographer, not
assembled from a UI kit.

**Buttons / CTAs**
- One primary action per view, in terracotta (`--terra`), pill-shaped, Fraunces label, generous padding. Secondary actions are quiet text/ghost links in maroon or ink-soft.
- Press has a small spring scale; focus-visible shows a warm gold ring (never a default blue outline).

**Cards (listings)**
- Calm, paper-toned, soft warm shadow, ample internal padding. Name in Fraunces, area/landmark in ink-soft, offer line readable.
- **Trust badge is honest and prominent:** show source label (`Verified by Halo` / `Owner claimed` / `Added by a neighbour`). Unverified never masquerades as verified.
- **WhatsApp/contact button appears ONLY when `trusted:true` AND a consented phone exists.** This is a design *and* code rule — no contact affordance otherwise.
- Reviews: only `verified:true` reviews count toward the visible rating. No reviews → honest *"be the first to vouch"* empty state, never a fake "5.0".

**Search**
- The hero search is the hero. Large, inviting, single field, line-art magnifier, calm placeholder with a *real* local example ("electrician near MSU", "tiffin in Alkapuri").
- Hint copy is honest: *"Search the live directory below — smart AI search is coming soon."* AI is "coming soon," never implied as live.

**Pills / filters**
- Pill-shaped category chips, one active state in warm accent, the rest sand/muted. Clear single selection, no badge clutter.

**Forms (add a listing / review)**
- Editorial, unhurried, one clear column. Required fields honest; **consent checkbox is mandatory and clearly worded** (DPDP). Success state reinforces the *verify-before-publish* promise.
- Inputs sit on paper with soft warm borders, gold focus ring, Fraunces labels.

**Toggle ("Bolo Halo")**
- The locked skeuomorphic switch with the spring thumb and the off→on label crossfade (English label → Gujarati). Reuse exactly.

**Empty / pending / loading states**
- Always honest and warm: "checking before it goes live," "be the first to vouch." Pending reviews show a quiet tag. Never an empty grey skeleton dashboard.

---

## 7. Language & Gujarati usage rules

Gujarati is **emotional punctuation, not translation padding.** It appears
where a Barodian would *feel* it, then stops.

- **English carries information; Gujarati carries feeling.** Use Gujarati for the soul lines (`આપણી માટીનું.`, the pain-point hooks, a punchline, a signoff) — not to mirror every English string.
- **Never machine-translate. Never approximate.** Gujarati must read as natural, idiomatic, correct Baroda Gujarati — script, spelling, and matra perfect. If correctness is uncertain, leave it in English rather than ship awkward Gujarati. Awkward or wrong Gujarati actively destroys *વિશ્વાસ*.
- **Never overuse.** A wall of Gujarati, or Gujarati on every label, reads as gimmick. Restraint is respect.
- **The three anchors** are the emotional spine — use them deliberately:
  - **વિશ્વાસ** (vishwaas) — trust
  - **શોધ** (shodh) — discovery / search
  - **પોતાપણું** (potapanu) — belonging / *"our-own-ness"*
- **"ae halo"** is the affectionate Gujarati call ("ae halo!") — keep its warmth; never flatten it to a generic brand token.
- **Tone:** warm, neighbourly, confident, never salesy, never hype. No exclamation spam, no "🔥 best deals." Halo speaks like a trusted local friend who happens to have impeccable taste.
- **Mixed lines** (English + a Gujarati phrase) must each be grammatical on their own; don't fragment a Gujarati sentence to fit an English layout.

---

## 8. What to NEVER do (hard bans)

- ❌ SaaS-dashboard aesthetics: KPI cards, data tables, admin sidebars, dense control panels.
- ❌ Generic AI-startup look: blue→purple gradients, glow orbs, abstract 3D blobs, "AI sparkle" icons, robot mascots.
- ❌ Cheap or random gradients of any kind; glassmorphism; neon; pure black; dark mode by default.
- ❌ Stock business clip-art, template icon packs, fake 3D landmarks, cartoon monuments, AI-uncanny imagery.
- ❌ Clutter & over-decoration: badge soup, too many accents, competing CTAs, decorative noise with no meaning.
- ❌ Fake social proof: invented reviews, fabricated ratings/counts, made-up neighbour names presented as real.
- ❌ A contact button on any listing that isn't `trusted:true` with a consented phone. No scraped numbers as public contacts, ever.
- ❌ Implying the AI is live. It is "coming soon" until the directory is genuinely complete.
- ❌ Awkward, overused, or mistranslated Gujarati.
- ❌ Swapping the locked wordmark, palette, fonts, or the recoloured Jon Kantner spinner.
- ❌ Hover-only interactions, motion that ignores `prefers-reduced-motion`, animations that drop frames on a mid-range phone.

---

## 9. The premium test — how to judge a page

Before shipping any screen, ask. Premium requires **mostly YES**:

1. **Squint test:** does it read as a calm, warm, premium *publication* — or as software? (Must be publication.)
2. **One-idea test:** can you say what this view is *for* in one sentence? Is there a single clear focal point and one primary action?
3. **Air test:** is there enough space that nothing feels crowded? Could you *remove* something and lose nothing?
4. **Accent test:** is there exactly one dominant warm accent moment, not five competing ones?
5. **Trust test:** is every claim honest? Is verified-vs-unverified unmistakable? No fake reviews, no premature AI, no rogue contact buttons?
6. **Belonging test:** would a Barodian feel *"this is ours"* — local, recognised, proud — not "this is a tech product"?
7. **Gujarati test:** does every Gujarati word read as natural and correct to a native speaker, and is it used sparingly where it earns emotion?
8. **Motion test:** does motion feel cinematic and intentional, run at 60fps, and fully respect reduced-motion?
9. **Craft test:** are type, spacing, radii, and shadows pixel-consistent with the locked system — nothing borrowed from a UI kit?
10. **Reference test:** does it sit in the Apple × Aman × Airbnb-city-guide × Halo-Lab world — and *nowhere near* Stripe/Linear/Notion?

If a page fails the squint test or the trust test, it does not ship —
no matter how polished the rest is.

---

## 10. The one-line north star

> **Halo should feel like Vadodara, set in type by someone who loves it —
> warm paper, honest words, a little cinema, and not one wasted pixel.**
>
> *વિશ્વાસ · શોધ · પોતાપણું*
