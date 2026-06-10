# HALO — CONVERSATION INSTRUMENTATION SPEC
## Making the journey measurable without making it a survey
*Maps 1:1 to `HALO_CONVERSATION_JOURNEY.md`. The journey is fixed; this only instruments it. No final UI copy, no code, no redesign. Response "formats" and field values below are **data schema**, not screen wording.*

---

## 0. The budget (hard caps from the brief)

| Stage | Max asks | Used | Felt weight |
|---|---|---|---|
| 1 Landing | 1 | 1 (a doorway, not a question) | one warm tap |
| 2 First interaction | 2 | 2 | two single-selects |
| 3 Trust discovery | 2 | 2 | two forced choices |
| 4 Contribution | 1 | 1 (an open gift) | one invitation |
| 5 Halo reveal | 2 | 2 | two single-selects |
| 6 Waitlist | 1 | 1 (the join) | one opt-in |

**9 touches total.** Everything else is *observed* (behaviour/funnel), never asked. The rule: if a measurement can be taken as behaviour, it is never posed as a question.

---

## STAGE 1 — LANDING

**1. The one thing it asks/observes:** Who is this person to the city — newcomer or rooted — captured as a warm doorway that *is* the act of entering (doubles as the engagement signal).
**2. Response format:** Single-select, framed as a personal greeting, not a screener.
**3. Field name:** `resident_type` — enum: `new_to_baroda | always_home | returned_nri | other`
**4. Belief it maps to:** B8 (the two-users split) and the **segmentation key for every other belief** — every result below is read by this cut.
**5. Success signal:** Clean spread across segments; people choose and proceed (low landing bounce).
**6. Failure signal:** High bounce at the doorway → the recognition hook missed (the pain framing isn't landing).
**7. Bias risk:** Feeling like a survey screener on arrival; framing that flatters one identity.
**8. Reduce it by:** Posing it as a warm "who's arriving" greeting, balanced phrasing, no "select your category" tone; the choice itself opens the conversation.
**9. Required / optional:** **Required** (it's the entry act) — but it never feels like a gate because choosing *is* entering.

---

## STAGE 2 — FIRST INTERACTION

### Ask 2a
**1. The one thing:** What they *actually did* the last real time they needed local help (behavioural recall, not intention).
**2. Response format:** Single-select of real-world channels + an open "other".
**3. Field name:** `last_search_method` — enum: `neighbour_word | society_whatsapp | google_justdial | instagram_local | known_contact | other`
**4. Belief:** Anchor for **B3**; lived-behaviour evidence for B1.
**5. Success signal:** Word-of-mouth channels (`neighbour_word`, `society_whatsapp`, `known_contact`) dominate → confirms the trust economy Halo is built on.
**6. Failure signal:** Formal platforms (`google_justdial`) dominate and satisfy → the assumed gap is smaller than believed.
**7. Bias risk:** Rationalising the past ("I research carefully"); recency distortion.
**8. Reduce it by:** Anchoring to one concrete recent event ("the last time"), behaviour not preference; closed channels reduce embellishment.
**9. Required / optional:** **Required** (single tap; it's the analysis anchor).

### Ask 2b
**1. The one thing:** How that last time turned out (the felt outcome).
**2. Response format:** Single-select.
**3. Field name:** `last_search_outcome` — enum: `smooth | minor_hassle | let_down | gave_up`
**4. Belief:** B1 (is the pain real in lived experience).
**5. Success signal:** Meaningful share of `let_down` / `gave_up` → the pain is real, not narrated.
**6. Failure signal:** `smooth` dominates → people already cope fine; weakens the premise.
**7. Bias risk:** Negativity performance (complaining is easy/social) — inflating pain.
**8. Reduce it by:** Neutral, non-leading options; pairing an easy "it was fine" so complaint isn't the only socially-available answer.
**9. Required / optional:** **Required** (single tap, light).

---

## STAGE 3 — TRUST DISCOVERY *(the crux, taken blind / pre-reveal)*

### Ask 3a
**1. The one thing:** Of four ways the *same* listing can present trust, which makes them actually reach out.
**2. Response format:** Forced single-select among four otherwise-identical renderings (order randomised).
**3. Field name:** `trust_signal_choice` — enum: `named_specific | star_average | official_badge | bare_info`
**4. Belief:** **B3** — the unit of trust (the company-bet belief).
**5. Success signal:** `named_specific` is the clear plurality, clearly ahead of `star_average`.
**6. Failure signal:** `star_average` or `official_badge` wins → B3 disproven; the inherited star model was right.
**7. Bias risk:** Demand bias — if Halo's preferred answer is telegraphed, everyone "discovers" it.
**8. Reduce it by:** **The firewall** — taken before any Halo reveal; renderings shown as generic "ways people show trust," never as Halo's badges; visually even; order randomised.
**9. Required / optional:** **Required** (the single most important measurement in the study).

### Ask 3b
**1. The one thing:** Whether open honesty about what *wasn't* verified makes them more or less willing to contact.
**2. Response format:** Forced choice between an openly-unverified listing and an asserted-trust listing.
**3. Field name:** `blemish_choice` — enum: `honest_unverified | asserted_trust | no_difference`
**4. Belief:** **B3** (the blemishing edge — its riskiest sub-claim).
**5. Success signal:** `honest_unverified` ≥ `asserted_trust` → admitting limits builds trust.
**6. Failure signal:** `asserted_trust` strongly wins → honesty-about-gaps suppresses action (the "Reframe" threshold from the strategy).
**7. Bias risk:** People *say* they value honesty (virtue signalling) more than they act on it.
**8. Reduce it by:** Framing as "which would you actually call," an action not an opinion; the two listings differ only in the trust claim.
**9. Required / optional:** **Required** (defines B3's reframe-vs-validate fork).

---

## STAGE 4 — CONTRIBUTION *(the peak — a gift, never a form)*

### Ask 4 (single open invitation)
**1. The one thing:** Their Vadodara — a gem they'd vouch for, or the frustration they want fixed (their voice, freely given).
**2. Response format:** One open invitation (free text), unstructured; giving is voluntary.
**3. Field name:** `contribution_text` (free text) → derived `did_contribute` (boolean).
**4. Belief:** **B6** (will they actually give — behavioural) + **B5a** (recognition precision — do they name *their specific* corner).
**5. Success signal:** High `did_contribute` rate; text rich in specific local detail (named areas, kitlis, real gems).
**6. Failure signal:** Low contribution even after trust is earned → the bootstrapping/stake-holding model is weak.
**7. Bias risk:** Feeling like data extraction; the engaged-sample over-contributing vs the real population.
**8. Reduce it by:** Framing as generosity ("add your Vadodara"), never mandatory, and the contribution must visibly land/acknowledge (Belief 6's boundary condition) — segment results by `resident_type`.
**9. Required / optional:** **Optional** — non-negotiably. A mandatory gift is not a gift; the *willingness* is the data.

> ⚠️ **`contribution_text` is the one PII-danger field.** Free text may contain a real person's name or a third party's phone number. Treat it as potentially containing third-party PII: never auto-publish, never treat any number in it as consented contact (per Halo's own trust rules), scrub before analysis.

---

## STAGE 5 — HALO REVEAL *(post-reveal; reaction + continuation)*

### Ask 5a
**1. The one thing:** Whether the institutional-trust/identity story makes them *want to start* — measured against a plain framing, as intent, not taste.
**2. Response format:** Forced choice (story framing vs plain framing).
**3. Field name:** `reveal_resonance` — enum: `lineage_pulls | plain_pulls | neither`
**4. Belief:** **B5b** — the lineage narrative (the weakest, most-likely-wrong belief).
**5. Success signal:** `lineage_pulls` clearly leads → the story is a moat.
**6. Failure signal:** `plain_pulls` ≥ lineage → the lineage is a founder's romance; demote it.
**7. Bias risk:** Social desirability — the heritage story flatters the city, so people praise it.
**8. Reduce it by:** Behavioural framing ("which makes you want to start") not "which is nicer"; cross-check against continuation (did they proceed to Stage 6).
**9. Required / optional:** **Required** (single tap; the stage's reason to exist).

### Ask 5b
**1. The one thing:** Whether the story alienates ("a bit much / not for me") — the disproof signal.
**2. Response format:** Single-select, phrased so agreeing it's "too much" is socially easy.
**3. Field name:** `reveal_alienation` — enum: `this_is_for_me | a_bit_much | not_for_me | neutral`
**4. Belief:** **B5b** (the alienation half — a story can lift pride *and* alienation at once).
**5. Success signal:** `this_is_for_me` dominates, `not_for_me` rare.
**6. Failure signal:** Meaningful `a_bit_much` / `not_for_me` → pretentious; pull the lineage back.
**7. Bias risk:** Politeness suppresses admitting alienation.
**8. Reduce it by:** Making "a bit much / showing off" an easy, blame-free thing to pick; also inferable from drop-off after the reveal.
**9. Required / optional:** **Optional** (protects flow right before the join; partly inferable from continuation behaviour).

---

## STAGE 6 — WAITLIST *(the truest data point — revealed intent)*

### Ask 6 (the join)
**1. The one thing:** Do they want this enough to *act* — to join.
**2. Response format:** Voluntary opt-in; contact captured only on join, with explicit consent.
**3. Field name:** `waitlist_join` (boolean) + `waitlist_contact` (PII string, opt-in only).
**4. Belief:** **B2 / B7** behaviourally (does felt value convert to action); **B8** side-light (who converts).
**5. Success signal:** Strong join rate, especially among those who contributed (Stage 4) and resonated (Stage 5).
**6. Failure signal:** Warm journey, weak join → love isn't converting to intent (a real warning for B7).
**7. Bias risk:** Over-promising hype inflates joins; engaged-sample inflation; PII friction depresses joins.
**8. Reduce it by:** Honest, no-hype close that returns value to them; minimal PII; consent + purpose stated; segment join rates rather than reading a raw number.
**9. Required / optional:** **Optional** — joining is voluntary by definition; the *choice* is the measure. `waitlist_contact` collected only on opt-in.

---

## DATA FIELD LEDGER

### Total fields
**11 substantive fields** from 9 asks (two stages derive a second field), plus behavioural/metadata.

| # | Field | Stage | Type | PII? |
|---|---|---|---|---|
| 1 | `resident_type` | 1 | enum | No |
| 2 | `last_search_method` | 2a | enum | No |
| 3 | `last_search_outcome` | 2b | enum | No |
| 4 | `trust_signal_choice` | 3a | enum | No |
| 5 | `blemish_choice` | 3b | enum | No |
| 6 | `contribution_text` | 4 | free text | **PII-risk** (third-party) |
| 7 | `did_contribute` | 4 | boolean (derived) | No |
| 8 | `reveal_resonance` | 5a | enum | No |
| 9 | `reveal_alienation` | 5b | enum | No |
| 10 | `waitlist_join` | 6 | boolean | No |
| 11 | `waitlist_contact` | 6 | string | **PII (intentional, consented)** |

**Metadata (observed, never asked):** `session_id` (random, anonymous), `stage_reached` (funnel/drop-off), `entry_engaged`, `timestamp`. None are PII.

### Analysis-critical (these decide the beliefs — protect at all costs)
`trust_signal_choice` (B3) · `blemish_choice` (B3) · `did_contribute` (B6) · `reveal_resonance` (B5b) · `waitlist_join` (B2/B7) · `resident_type` (segments everything) · `last_search_method` (B3 anchor).

### Nice-to-have (colour, not verdicts)
`last_search_outcome` · `contribution_text` content (qualitative B5a texture) · `reveal_alienation` (also inferable from drop-off) · `stage_reached` funnel · `entry_engaged`.

### Must NEVER collect PII
Every enum/research field (1–5, 7–10) and all metadata. `contribution_text` (6) must be **PII-minimised and scrubbed** — it's the accidental-PII danger field; never publish, never treat embedded numbers as consented contact.

### What's safe to send to Airtable / Supabase later
- **Research table (anonymous):** fields 1–5, 7–10 + metadata, keyed by `session_id`. Fully safe to store/sync — no PII. Include `waitlist_join` (boolean) here so you can analyse *whether joiners answered differently* **without** coupling their contact to their answers.
- **Contact table (restricted):** `waitlist_contact` only, with consent flag and purpose, stored **separately** and access-controlled, linked to research rows by `session_id` **only if** consent allows — otherwise kept decoupled.
- **Hold back:** raw `contribution_text` until scrubbed; never sync it alongside contact data.

This separation is the integrity spine: the *answers* live anonymously, the *PII* lives apart, and the only bridge is a boolean — so you can learn from behaviour without ever turning a research instrument into a surveillance one.

---

> **One line:** Nine light touches, eleven fields, one PII field collected only with consent — the conversation stays a conversation, and the measurement happens in the choices and the actions, never in a survey the Barodian can feel.

*વિશ્વાસ · શોધ · પોતાપણું*
