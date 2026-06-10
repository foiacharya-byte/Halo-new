# HALO — QUESTIONNAIRE STRATEGY
## The minimum research to validate Beliefs 3, 4 and 5 — and the blueprint for Questionnaire V1
*Built only on `HALO_CORE_BELIEFS.md`. This is the last strategy document. Its single job: design just enough research to convert three high-stakes beliefs into evidence or a pivot, then hand off a V1 that is mechanical to write.*

---

## 0. Scope — what this is and isn't

**In scope:** test exactly three beliefs.
- **Belief 3** — credible trust is *specific, named, blemished* — not aggregated, anonymous, perfect.
- **Belief 4** — the heritage identity is an *asset*, not a liability. (Fork: *boring* vs *under-powered* vs *liability*.)
- **Belief 5** — *recognition precision* is the moat; the *institutional-trust lineage* is its deepest, least-tested form.

**Out of scope (deliberately, to stay minimum):** Beliefs 1, 2, 6, 7, 9; pricing; feature concepts; anything answered better by behaviour-over-time than by a survey. We are de-risking the three beliefs flagged for validation, nothing else.

**The destination:** §8 is a section-by-section blueprint. When it's done, writing Questionnaire V1 is filling in copy, not making decisions.

**This is research design, not product design.** No UI, features, or implementation are proposed here — only what to ask, whom, how, and how to read the answer.

---

## 1. The governing constraint: the say/do gap

The research's own central finding is that **Barodians say one thing and do another** (complain about Garba prices → buy out passes in hours; say "professional ratings" → trust the neighbour's word). A questionnaire that asks people what they *prefer* will therefore lie to us. Every design choice below exists to extract **revealed** preference, not **stated** preference.

**Six rules this forces (non-negotiable for V1):**
1. **Brand-blind.** Never mention Halo, the founder, or "an app we're building." The survey is *"a short study on how Baroda finds local services."* This kills founder-pleasing inflation and "sure, I'd use it" answers.
2. **Behaviour over intention.** Anchor on the *last real time* they needed a service ("the last time you needed an electrician, what did you actually do?"), not "what would you do."
3. **Forced trade-offs over agreement scales.** Likert "do you agree?" inflates everything. Make people *choose one* and *give something up* — that's where truth leaks.
4. **Show, then react — don't ask people to imagine.** For identity/trust judgments, present a concrete stimulus and measure the reaction; do not ask people to describe a preference in the abstract.
5. **Hide the hypothesis.** Never let a question reveal the answer we want. Randomise option order; balance positive/negative framings.
6. **Only act on large effects.** With a small sample and self-report noise, a marginal result means the belief wasn't load-bearing anyway. We look for clear, decisive gaps — not statistical hair-splitting.

---

## 2. Pre-registered decision thresholds

Decided *before* data, so we can't rationalise afterward. Each belief resolves to one of three states.

| Belief | ✅ Validated if… | 🔁 Reframe if… | ❌ Disproven if… |
|---|---|---|---|
| **B3 — trust unit** | In a forced choice of *what makes a listing trustworthy*, the **named, specific neighbour account** is the clear top choice (plurality, clearly ahead of star-average) **and** prominent "unverified / verifying" honesty does **not** materially suppress willingness to contact. | Named account wins, **but** explicit "unverified" labelling noticeably lowers willingness to act → keep named/specific, soften how absence-of-verification is expressed. | A **star average** or "official verification" badge clearly beats the named neighbour account, **or** honesty-about-gaps strongly suppresses action. |
| **B4 — heritage identity** | The heritage stimulus matches or beats the alternative on **trust** *and* **"feels like Vadodara,"** even if slightly lower on "modern." | It scores **high on trust/rooted but low on appeal/energy** → the problem is *amplitude (under-powered)*, not direction. Keep identity, raise intensity. | It scores **low on trust AND appeal** and is read as **"old/dated"** against a cleaner alternative that wins across the board. |
| **B5 — specificity & lineage** | **Recognition:** hyper-local specific framing beats generic on *"this feels made for my Vadodara."* **Lineage:** the institutional-trust story **raises** trust/pride **without** raising "this isn't for me / it's pretentious." | Recognition wins but lineage is **neutral** → keep specificity, demote the lineage narrative to background. | Specific framing does **not** beat generic, **or** the lineage story **raises alienation** ("pretentious," "not for people like me," "irrelevant"). |

**The B4 fork is the most important single output of this whole exercise.** "Boring" and "under-powered" demand opposite responses; the questionnaire must be able to tell them apart (see §3.B).

---

## 3. Test design, belief by belief

### B3 — The unit of trust

**Sub-claims to separate (they can fail independently):**
- (a) Named + specific account > anonymous aggregate (stars).
- (b) Specific concrete detail > generic praise.
- (c) Honesty about what *wasn't* verified builds (not breaks) trust.
- (d) "Official verification" is *not* what they actually weight most.

**How to measure (revealed, not stated):**
- **Behavioural anchor:** last real service search — what they actually relied on to decide (open + coded options). Establishes the real-world baseline before any stimulus.
- **Forced-choice trust test:** present the *same* listing rendered four ways — (1) a named neighbour's specific account, (2) a 4.6★ aggregate with counts, (3) an "officially verified" badge with no story, (4) bare info — and force a single "which would you actually contact?" plus "which feels most trustworthy?" (the gap between *contact* and *trust* is itself a finding).
- **Blemish test:** show one listing openly marked "we couldn't verify the phone yet / added by a neighbour, not yet checked" vs one that simply asserts trust; measure willingness to contact. This is the riskiest edge of Belief 3 and must be tested directly.

**Traps:** people will *say* they want verification and stars (familiar, "responsible"). Only the forced single-choice and the behavioural recall reveal the truth. Keep the four renderings otherwise identical so only the trust-signal varies.

### B4 — The heritage identity (the fork)

**The hard truth:** aesthetics are the one thing a text questionnaire tests *weakly*. To get a real answer, V1 must carry a **visual stimulus** — at minimum one paired comparison: the existing heritage direction vs one deliberately cleaner/cooler/more "modern" alternative, shown as static images. Without a visual pair, B4 cannot be properly resolved and we should say so rather than pretend a word-only proxy settled it.

**What to measure on each stimulus (fixed scales + one open word):**
- **Trust** ("which would you trust with your home / your money?")
- **Belonging** ("which feels made for Vadodara / for people like me?")
- **Appeal / energy** ("which makes you want to look closer?") — this is the axis that separates *boring* from *trustworthy-but-flat*.
- **Age read** ("which feels modern? which feels old/dated?") — the explicit boring-detector.
- **One open response:** "first word that comes to mind." Unprompted language ("calm/classy" vs "boring/old" vs "cheap/generic") is the highest-signal item in the survey.

**Reading the fork:**
- High trust + high belonging + low appeal/energy → **under-powered** (keep direction, add amplitude).
- Low trust + "old/dated" + alternative wins everywhere → **liability** (direction is wrong).
- Matches/beats on trust + belonging → **asset** (validated).

**Traps:** order/position bias (randomise which image is left/A); the "newer = better" reflex (counter by leading with trust, not "which looks nicer"); founder's attachment (the brand-blind framing protects against respondents guessing which one is "ours").

### B5 — Recognition precision + the lineage narrative

**Two separable tests (they are rated very differently in the beliefs doc — recognition is Strong, lineage is Weak — so keep them apart):**

**B5a — Recognition precision.** Show the *same* offer in two framings: hyper-local/specific (real areas, real landmarks, real local texture — e.g., "near MSU gate," a named kitli) vs generic ("local services in your area"). Measure *"this feels made for my Vadodara"* and recall/warmth. Expectation: specific wins clearly.

**B5b — The lineage narrative.** Present the institutional-trust story (the city built libraries, a bank, schools for ordinary people → a neighbour-trust platform continues that) as a short worded passage. Measure **two opposing things**: does it *raise* trust/pride, **and** does it *raise* "this is pretentious / academic / not for me"? A narrative can lift pride and alienation simultaneously — we need both readings to know if it's a moat or a museum plaque.

**Traps:** social desirability will make people *praise* the heritage story (it flatters the city). Counter with a forced trade-off ("which of these two intros would make you actually start using it?") and the alienation item phrased so agreement is socially easy ("a bit much / showing off"). The behavioural framing ("would make you *start using it*") beats the attitudinal ("is nice").

---

## 4. Sample & recruitment (minimum viable)

| Dimension | Decision | Why |
|---|---|---|
| **Target** | **80–120 completes** (hard floor 60) | Directional, not powered. We act only on large effects (§1.6); n≈80 reveals those cleanly. |
| **Segments** | ~50/50 **newcomers** (in Vadodara <3 yrs / students / NRIs / new-married-in) vs **established locals** | Also throws side-light on Belief 8; lets us see if B3/B4/B5 split by tenure. |
| **Screening** | Currently lives in / recently lived in Vadodara; has sought a local service in last ~6 months | Keeps the sample to people with the real job. |
| **Mode** | Mobile-first **bilingual (Gujarati + English / Gujlish)** form, free tooling, **≤10 minutes** | Matches the audience's reality; completion craters past ~10 min. The visual stimulus (B4) must render on a phone. |
| **Channels** | Local Instagram audiences (e.g. @ourvadodara-type reach), MSU student groups, society WhatsApp groups, founder network | The only affordable channels — but see bias note. |
| **Incentive** | Small **draw / early-access**, *revealed only at the end* | Cash up-front attracts gaming; end-reveal preserves brand-blindness. |

**Sampling honesty:** the founder's reachable channels skew toward the already-engaged and the design-literate. Mitigate by (a) explicitly recruiting through at least one channel the founder does *not* personally dominate, (b) reporting results by segment, and (c) treating this as *directional de-risking*, not proof. A clear result here lowers risk; it does not certify success.

---

## 5. Bias controls (the methodological spine)

- **Brand-blindness** (kills founder-pleasing) — the single most important control.
- **Behavioural recall** anchors (kills hypothetical inflation).
- **Forced single-choice / trade-offs** (kills acquiescence — the tendency to "agree" with everything).
- **Randomised option & stimulus order** (kills primacy/position effects).
- **Balanced framings** — every "is it good?" paired with an equally-easy "is it too much / off-putting?" (kills social desirability, especially on the heritage story).
- **Separate trust-vs-contact** measurement (reveals where stated trust and real action diverge — the say/do gap, measured directly).
- **One open-text per stimulus** (catches the unprompted word the scales miss).

---

## 6. Consent & data (light, DPDP-aware)

Collect the minimum: segment markers (tenure, area, rough age band), the answers, and only-if-volunteered contact for the draw. Explicit consent line, purpose stated, withdrawal possible, no sensitive personal data, no community/caste questions (both unnecessary and, per the beliefs doc's guardrail, a line Halo does not go near). Keep PII out of the analysis sheet.

---

## 7. What this study deliberately will NOT do

To stay minimum and honest: it won't test whether people will *use* Halo (Beliefs 1/2/7 — behaviour over time answers those, not a survey), won't price anything, won't test feature ideas, and won't try to be statistically definitive. Scope creep here is the enemy of ever shipping V1.

---

## 8. The bridge: Questionnaire V1 blueprint

This is the hand-off. V1 is these blocks, in this order, with these question-types. Writing it = supplying copy. **~22–26 items, ≤10 minutes.**

| # | Block | Purpose / belief | Type | ~Items |
|---|---|---|---|---|
| 0 | **Consent + brand-blind intro** | Frame as "how Baroda finds local services"; consent | Statement + 1 checkbox | 1 |
| 1 | **Screener + segment** | Tenure, area, age band, recent service-seeking | Single-select | 3–4 |
| 2 | **Behavioural anchor** | Last real service search: what they did, what they relied on | 1 open + 1 multi-select | 2 |
| 3 | **B3 — trust-unit forced choice** | Same listing × 4 renderings (named-specific / stars / official-badge / bare): "most trustworthy?" + "would actually contact?" | 2 forced single-select (randomised) | 2 |
| 4 | **B3 — blemish test** | Honest "unverified/added by neighbour" vs asserted-trust: willingness to contact | Forced choice + 1 scale | 2 |
| 5 | **B4 — visual pair** | Heritage direction vs cleaner alternative, on Trust / Belonging / Appeal-energy / Age-read | 4 paired-choice scales (image stimulus) | 4 |
| 6 | **B4 — open word** | Unprompted first word for the heritage stimulus | 1 open | 1 |
| 7 | **B5a — recognition** | Hyper-local-specific vs generic framing: "made for my Vadodara?" | Forced choice + 1 scale | 2 |
| 8 | **B5b — lineage** | The institutional-trust passage: raises pride? AND raises "too much / not for me"? + "would make you start using it?" | 2 balanced scales + 1 forced choice | 3 |
| 9 | **Catch / quality** | One attention check; optional "anything else" open | 1 check + 1 open | 2 |
| 10 | **Incentive reveal + thanks** | Reveal draw/early-access, optional contact | Statement + optional field | 1 |

**Stimuli V1 must prepare before fielding (research assets, not product design):**
1. One listing rendered four ways for Block 3 (trust-signal is the only variable).
2. One "honest-about-gaps" vs "asserted-trust" pair for Block 4.
3. **One visual pair for Block 5** — heritage vs a cleaner alternative. *This is the gating asset: no visual pair → B4 stays unresolved.*
4. Two framing passages (specific vs generic) for Block 7, and one lineage passage for Block 8.

**Outputs that end the exercise:** three verdicts (Validated / Reframe / Disproven) against the §2 thresholds — and with them, a go/no-go on the two beliefs we're betting the company on that depend on B3, plus a clear *direction* (not *redirection*) decision on the identity. That is the entire point: research → conviction → a V1 we can write today.

> **One line:** Don't ask Barodians what they like — show them, make them choose, anchor on what they last actually did, and never let them know it's ours. The truth about Beliefs 3, 4 and 5 is in the trade-offs, not the opinions.

*વિશ્વાસ · શોધ · પોતાપણું*
