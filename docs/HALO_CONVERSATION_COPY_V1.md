# HALO — CONVERSATION COPY V1
## Final wording for the 9 touches
*Sources: `HALO_CONVERSATION_JOURNEY.md`, `HALO_CONVERSATION_INSTRUMENTATION.md`, `HALO_BRAND_VOICE.md`, `HALO_GUJARATI_RULES.md`. This is copy only — no code, no redesign. Field values (→ `value`) are data schema, not screen text; only the quoted lines are shown.*

**Honoured throughout:** mobile-first and short · a Barodian talking to a Barodian · no corporate/startup tone · never the words "survey/questionnaire" · no AI · no fake urgency · no product secrets · Gujarati leads **only** at the emotional beats (Stages 1, 4, 5, 6), always short and correct · **the firewall:** the name *Halo* never appears before the Stage 5 reveal.

---

## STAGE 1 — LANDING · *the doorway*

1. **Screen title:** આવો.
2. **Supporting line:** We're listening to how Baroda really finds the people it trusts.
3. **The ask:** First — is Baroda new to you, or has it always been home?
4. **Answer options:**
   - "New here" → `new_to_baroda`
   - "Born and raised" → `always_home`
   - "Back after years away" → `returned_nri`
   - "Just visiting" → `other`
5. **Microcopy:** No right answer. It just helps us hear you better.
6. **Skip copy:** *(required — choosing is how you come in)* — gentle nudge if untouched: "Pick whichever feels closest."
7. **Internal field name:** `resident_type`

---

## STAGE 2 — FIRST INTERACTION · *real life*

**Shared title:** Let's start with something real.
**Shared supporting line:** The last time you needed someone local — a plumber, a tiffin, a tutor.

### Ask 2a
3. **The ask:** What did you actually do?
4. **Answer options:**
   - "Asked a neighbour or friend" → `neighbour_word`
   - "Put it in a society / WhatsApp group" → `society_whatsapp`
   - "Searched Google or JustDial" → `google_justdial`
   - "Looked on Instagram" → `instagram_local`
   - "Already had my person" → `known_contact`
   - "Something else" → `other`
5. **Microcopy:** Whatever you really did — no judgement.
6. **Skip copy:** *(required)* "Just the closest one is fine."
7. **Internal field name:** `last_search_method`

### Ask 2b
3. **The ask:** And how did it go?
4. **Answer options:**
   - "Smooth, no fuss" → `smooth`
   - "Bit of a hassle" → `minor_hassle`
   - "Got let down" → `let_down`
   - "Gave up on it" → `gave_up`
5. **Microcopy:** We've all had all four.
6. **Skip copy:** *(required, light)* —
7. **Internal field name:** `last_search_outcome`

---

## STAGE 3 — TRUST DISCOVERY · *who would you call?* (taken before any reveal)

### Ask 3a
1. **Screen title:** Same person. Shown four ways.
2. **Supporting line:** —
3. **The ask:** Which one makes you actually pick up the phone?
4. **Answer options:**
   - "Meena from Akota: 'He fixed my AC in an hour, fair price.'" → `named_specific`
   - "4.6 ★ · 212 ratings" → `star_average`
   - "✓ Verified" → `official_badge`
   - "Just the name and number" → `bare_info`
5. **Microcopy:** Go with your gut.
6. **Skip copy:** *(required)* —
7. **Internal field name:** `trust_signal_choice`

### Ask 3b
1. **Screen title:** One more, honestly.
2. **Supporting line:** Two listings. Same work, same area.
3. **The ask:** Which would you trust enough to call?
4. **Answer options:**
   - "'Added by a neighbour — we haven't checked them yet.'" → `honest_unverified`
   - "'Trusted ✓'" → `asserted_trust`
   - "Makes no difference to me" → `no_difference`
5. **Microcopy:** There's no catch here.
6. **Skip copy:** *(required)* —
7. **Internal field name:** `blemish_choice`

---

## STAGE 4 — CONTRIBUTION · *the gift* (optional, never required)

1. **Screen title:** તમારું વડોદરા.
2. **Supporting line:** Everyone in Baroda has one — the tiffin that tastes like home, the electrician who actually turns up.
3. **The ask:** Tell us about someone you'd vouch for. Or the one that let you down.
4. **Answer options:** *(open — one line)* placeholder: "A name, an area, why you'd tell a friend…"
5. **Microcopy:** Whatever you share helps the next person find them.
6. **Skip copy:** "Rather not? No worries — keep going." → button: "Skip"
7. **Internal field name:** `contribution_text` → `did_contribute`

> *Copy guard:* the placeholder asks for a name/area/reason — **never** a phone number — to keep third-party PII out of `contribution_text`.

---

## STAGE 5 — HALO REVEAL · *this is for us* (the name appears for the first time)

**Reveal title:** So — this is Halo.
**Reveal line (short, humble — no secrets, no AI):** Baroda's always trusted its own, neighbour to neighbour. We're just putting that in one place.

### Ask 5a
3. **The ask:** Which feels more like something you'd want in on?
4. **Answer options:**
   - "Carrying on what Baroda already does — trusting our own." → `lineage_pulls`
   - "Just a cleaner way to find local people you trust." → `plain_pulls`
   - "Neither, really" → `neither`
5. **Microcopy:** Gut feeling.
6. **Skip copy:** *(required, single tap)* —
7. **Internal field name:** `reveal_resonance`

### Ask 5b
3. **The ask:** And honestly — how did that land?
4. **Answer options:**
   - "This is for me" → `this_is_for_me`
   - "A bit much" → `a_bit_much`
   - "Not really for me" → `not_for_me`
   - "No strong feeling" → `neutral`
5. **Microcopy:** Say it straight — that's the helpful part.
6. **Skip copy:** "Skip" *(optional)*
7. **Internal field name:** `reveal_alienation`

---

## STAGE 6 — WAITLIST · *the close*

1. **Screen title:** એ હાલો.
2. **Supporting line:** Halo's being built slowly, by Barodians. Want to be one of the first in?
3. **The ask:** Leave a number or email and we'll tell you the moment it opens.
4. **Answer options:** *(opt-in)*
   - Contact field: placeholder "WhatsApp number or email"
   - Consent line (ticked to join): "Okay to keep this, only to tell you when Halo opens."
   - "Not now" → leaves without joining (`waitlist_join = false`)
5. **Microcopy:** We won't spam you. We won't share your number. આભાર.
6. **Error / skip copy:**
   - Invalid entry: "Hmm, that doesn't look right — mind checking?"
   - Skip: "All good — thank you for being heard. એ હાલો."
   - **Confirmation (after joining):** "You're in. You helped start this. — એ હાલો"
7. **Internal field name:** `waitlist_join` *(boolean)* + `waitlist_contact` *(PII, opt-in, stored separately)*

---

## Copy notes (for whoever builds it)

- **Gujarati used, and only here:** આવો (come in) · તમારું વડોદરા (your Vadodara) · એ હાલો (let's go) · આભાર (thank you). All short, all verified-natural — no machine-translated lines, nothing decorative.
- **Tone check:** no "platform / solution / users / sign up / AI / limited time / don't miss out." Sentence case, few full stops of hype, zero exclamation marks.
- **Firewall in the copy:** Stages 1–4 carry the warm heritage *mood* but never the name *Halo* or any pitch; the name and the one-line story arrive only at Stage 5, *after* the trust measurements are taken.
- **Listening, felt not stated:** "we're listening," "helps us hear you," "thank you for being heard" — present but sparing.
- **PII discipline:** only Stage 6 invites contact, with consent and a no-spam/no-share promise; Stage 4's open field is steered away from numbers.
- **Stage 3 stimuli** ("Meena from Akota", the ratings, the badge) are *research stimulus cards inside a choice* — not live listings and never shipped as real social proof.

> **One line:** Nine short, warm exchanges in Baroda's own voice — it should read like someone who loves the city is genuinely asking, and listening.

*વિશ્વાસ · શોધ · પોતાપણું*
