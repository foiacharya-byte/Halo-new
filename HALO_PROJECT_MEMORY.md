# Halo (ae halo) — Project Memory & Handoff
*Single source of truth. Written so chats can be deleted without losing context.*
*Last consolidated: June 2026 · Current build: `index_v22.html`*

---

## 0. How to read this file
This is the full state of the project "till now." It is a **statement of where things stand**, not a guarantee that any external claim (FSSAI status, a provider's details, a law) is currently accurate — those must be re-verified at the point of use. Anything below marked **[FLAG]** is an open risk that needs a decision or guardrail.

---

## 1. What Halo is
- **Name / wordmark:** Halo — styled **"ae halo"** ("ae" = the affectionate Gujarati call, "ae halo!").
- **What it is:** A hyperlocal **directory + community platform** for **Vadodara (Baroda), Gujarat**.
- **Long-term goal:** **Halo AI** — Vadodara's own local AI for personalised, *verified* discovery.
- **Beta truth:** AI is a **future promise only**. The beta is a complete, clean, emotionally resonant **directory** that feels like *"Baroda's own."*
- **Taglines:** `Homegrown.` · Gujarati `આપણી માટીનું.` · `Vadodara's own · now in beta`
- **Pillars:** **Trust × Discovery × Local Strength.**
- **Operator reality:** Solo founder, **very low budget**, 2–3 people who help occasionally. Every decision is constrained by this.

---

## 2. Current strategy (BETA) — full directory
This is the **active** direction and supersedes any earlier single-vertical plan.

- Build a **full, multi-category directory** — **not** narrowed to one vertical.
- **Bootstrap data** from **publicly available info of branded / fixed shops** (scraping for initial seed only).
- **Users and businesses can submit** listings and numbers themselves.
- **Manual verification** of submissions before anything is marked trusted.
- **Contribution incentives** to get people adding listings — with **basic abuse protection**.
- **Collect phone numbers + permissions early** via sign-in / submission consent.
- **Positioning:** clean local directory with *"Vadodara's own AI coming soon."*

> **Superseded history (kept for the learnings, not to act on):** An earlier plan locked **tiffin/home-cooked food** as a first vertical, and **home repair** was dropped after a competitive scan surfaced Urban Company's incumbent strength. The direction has since **broadened to a full directory** (already reflected in the build, which carries Home Food, Services, Tuition, Health, Events, Other). Lasting lesson: **scan the competition before committing**, and decide second.

---

## 3. Trust & legal posture (non-negotiables)
These are load-bearing. Breaking them breaks the whole premise.

- **Directory ≠ platform.** Halo does **not** handle payments, food, or delivery, and issues **no safety guarantees**. It connects people; it does not transact.
- **Transparency over hype.** Every listing shows **what was verified and what wasn't**. Source labels in use: `Verified by Halo`, `Owner claimed`, `Added by a neighbour`.
- **Consent-respecting by default.** A contact button (WhatsApp) appears **only when a listing is BOTH `trusted:true` AND has a phone the owner consented to share.** This rule is enforced in code and in the seed-data comments.
- **No invented social proof.** Do **not** ship made-up reviews under real-sounding neighbour names. Listings with no reviews fall back to an honest *"be the first to vouch"* state.
- **DPDP compliance.** India's **Digital Personal Data Protection (DPDP) Act / DPDP Rules 2025** governs how phone numbers and personal data are collected, stored, and used. Consent must be explicit, purpose-limited, and withdrawable.
- **FSSAI for food.** Any food/tiffin listing presented as trusted should be checked for **Active** status on the **FoSCoS portal**; the trust badge reflects what was independently verified.

### [FLAG] Scraping vs. DPDP / trust
Scraping public business info for the seed is the plan, but it carries real risk:
- **Scraped phone numbers must never auto-publish a contact button.** (Already enforced: WhatsApp only on consented + trusted.) Treat scraped numbers as *leads to invite*, not as public contact data.
- A scraped listing should display as `Verifying` / un-trusted until the owner claims or Halo verifies it.
- Plan an explicit **claim + consent step** before any scraped record gains a trust badge or contactable number.
- Keep a path for businesses to **request removal** (DPDP data-principal rights). Build this early, even if manual.

---

## 4. Design system (LOCKED — treat as sacred)
Any deviation has been rejected on sight before. Reuse exact markup; don't re-invent.

### Fonts
- **Fraunces** — primary serif (`--serif`)
- **Cormorant Garamond** — caps / eyebrows (`--caps`)
- **Caveat** — script, used for the **"ae"** flourish (`--script`)
- **Noto Serif Gujarati** — Gujarati text (`--gu`)
- *(Pinyon Script has also been used historically for "ae"; current build uses Caveat.)*

### Palette (`:root` in build)
| Token | Hex | Role |
|---|---|---|
| `--paper` | `#F8F2E7` | warm paper background |
| `--paper-deep` | `#EBE0CD` | deeper paper |
| `--ink` | `#2A1E11` | primary text |
| `--ink-soft` | `#6E5A40` | secondary text |
| `--maroon` | `#7A2E22` | headings / accents |
| `--terra` | `#C2531F` | primary action / "ae" |
| `--gold` | `#BE9A4E` | highlights |
| `--sand` | `#CBB488` | muted UI |

- **Background:** white/warm paper (decided). **No breathing radial glow bloom** behind the logo (removed, unwanted).
- **Wordmark rule:** the **`.mk` component with `.mk-sm` override** is the fix for wordmark drift across screens. Reuse it exactly everywhere "ae halo" appears.

### Cinematic intro sequence (3 beats, then the site)
1. **Screen 1 — Wordmark:** "ae halo" + orbiting **halo ring** (Jon Kantner MIT spinner, recoloured to the heritage palette as a glowing pearl) + tagline + **"Bolo Halo" toggle switch** + sepia **skyline floor**.
2. **Loader — "We heard you":** the **original Jon Kantner skeuomorphic spinning wheel**, recoloured to the heritage palette. *(This was once erroneously replaced by Claude and then restored — do not swap it out.)*
3. **Pillars — word-by-word reveal:** "Built on trust. / So you discover / the strength next door. / To make Vadodara proud. / **Homegrown.**" → Gujarati **"આપણી માટીનું."** → "ae halo" signoff.

---

## 5. Current build state — `index_v22.html`
A single self-contained vanilla **HTML/CSS/JS** file (no framework). What exists today:

### Intro → site flow
`#intro` (wordmark + toggle) → `#loader` ("We heard you") → `#pillars` (cinematic reveal) → main site. Honors `prefers-reduced-motion`.

### Main site sections
- **Nav** — links jump to Directory and "How trusted."
- **Hero** — search bar that **drives the directory**, trust line ("No fake hype · No spam · Reviews from people who actually used the service"), quick chips (**Tiffin, Electricians, Carpenters, Tutors**), and an **"Add yours"** CTA. Hint: *"smart AI search is coming soon."*
- **Directory (`#directory`)** — live search + category pills, listing cards with trust badges, reviews, and conditional WhatsApp button.
- **How trusted (`#howtrust`)** — 3-step explainer + a trust pledge.
- **Home cooks & makers** — dedicated invite block; its CTA pre-selects the food category in the add form.
- **Footer.**
- **Add-a-listing modal** — the contribution form (see §6).
- **Reviews modal** — star picker + write-a-review; submissions are **pending** until verified (see §7).
- **Voices stack** — auto-cycling "overheard" community comments.

### Data model (per listing)
`name, cat, area, landmark, offer, trusted (bool), source, phone, reviews[]`
Review object: `{ by, area, stars, text, verified (bool) }`

### Categories (`DCATS`)
`All · Home Food · Services · Tuition · Health · Events · Other`
*(The cooks CTA also references a "Tiffin & Home Food" label — worth reconciling to one canonical taxonomy.)* **[FLAG]**

### Seed data
Current `LISTINGS` are **placeholder/demo** (e.g. Maa Annapurna Tiffin, Shree Sai Tailors, Baroda Home Bakes, Gyan Deep Tuition, Aarogya Clinic, etc.) with **demo reviews**, clearly commented as such. **All `phone` fields are empty.** Replace with verified listings before/at launch — never paste scraped numbers here.

### Backend
- Submissions POST to a **Google Apps Script web app** (`HALO_ENDPOINT`) which writes to a **Google Sheet**. Uses `mode:'no-cors'` (fire-and-forget; can't read the response, so success is assumed on network completion). **[FLAG]** consider a confirmation mechanism later.

---

## 6. Contribution flow (add a listing)
Form fields: **business name\***, **category\***, **area\***, **landmark\***, **phone\***, address (optional), your name (optional), **opt-in for updates** (checkbox), **consent to store & verify** (required checkbox).
- Required fields validated client-side; **consent box is mandatory** before submit.
- On submit → POST to the Sheet → success screen with an "add another" path.
- Success screen reinforces the **verification-before-publish** promise.

---

## 7. Verification & reviews workflow
- **Listings:** arrive via the form → land in the Google Sheet → **manual verification** → flip `trusted:true` and add a consented phone before a contact button shows.
- **Reviews:** submitted as **`verified:false` (pending)** and explicitly **never auto-count toward the public rating**. A neighbour verifies before it goes live. Pending reviews show a "checking before it goes live" tag.
- **Tooling:** Google Forms + Sheets for intake/consent; FoSCoS for food status; free tools only.

---

## 8. Incentives & abuse protection
- Use **contribution incentives** to drive listings growth.
- Must include **basic anti-abuse**: rate-limit/throttle submissions, dedupe by phone/name+area, require consent, hold everything in a **pending state** (nothing public until a human checks), and reward **verified** contributions only — not raw submission counts. **[FLAG]** design the exact incentive mechanic and its abuse guardrails before switching it on.

---

## 9. Working principles (how KING likes to build)
- **Make the call, don't ask.** Ship the best decisive answer; KING corrects if wrong. No menus of options.
- **One atomic change at a time.** No multi-change dumps.
- **ADHD-friendly:** minimal options per turn, clear, designer-led.
- **Cache-busting:** when something isn't appearing, **ship under a new filename** rather than debugging caching in place. (History: `build_v9–v14.py` → outputs; current `index_v22.html`.)
- **Sourcing discipline:** flag **verified conclusions vs. inferences** clearly; weak sourcing gets pushed back on.
- **Trust > speed/growth**, always.
- Strategic outputs are **statements of intent**; KING keeps final review authority.

---

## 10. Tools & resources
- **Frontend:** vanilla HTML/CSS/JS, single file. Jon Kantner spinner component (recoloured).
- **Build:** Python scripts (versioned) writing HTML → `/mnt/user-data/outputs/`.
- **Backend/intake:** Google Apps Script → Google Sheet; Google Forms for consent.
- **Verification:** FoSCoS portal (food); manual neighbour checks.
- **Discovery:** free tools only (no budget).
- **Regulation:** DPDP Act / DPDP Rules 2025.

---

## 11. Roadmap / next steps
1. **Replace demo seed** with real, verified listings (no scraped numbers in the file).
2. **Bootstrap pipeline:** scrape public branded-shop info → load as `Verifying` (no contact button) → claim/consent step → trust badge.
3. **Claim + consent + removal flow** for scraped records (DPDP rights). 
4. **Incentive mechanic + abuse guardrails** — design, then enable.
5. **Reconcile category taxonomy** (Home Food vs. "Tiffin & Home Food").
6. **Submission confirmation** (move beyond fire-and-forget `no-cors`).
7. Continue **directory build-out** across categories.
8. Keep the **AI as "coming soon"** until the directory is genuinely complete and clean.

---

## 12. Open risks — quick list
- **[FLAG]** Scraped numbers + DPDP → never publish without consent; build removal path.
- **[FLAG]** Category taxonomy inconsistency.
- **[FLAG]** No submission confirmation (no-cors).
- **[FLAG]** Incentive abuse — guardrails not yet designed.
- **[FLAG]** Demo reviews/listings must be cleared before launch so nothing fake ships.

---

*End of memory file. Re-verify any external fact (laws, FSSAI status, provider details) at the moment you act on it.*
