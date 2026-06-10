---
name: halo-gujarati-rules
description: Use before writing, editing, translating, or reviewing any Gujarati copy for Halo. Protects Halo from wrong, awkward, machine-translated, or over-romantic Gujarati. Gujarati must be natural, respectful, simple, and used sparingly as emotional anchor — never decoration. Preserves the three approved anchors વિશ્વાસ / શોધ / પોતાપણું. If unsure, flag for human review.
---

# Halo Gujarati Rules — *ભાષાની કાળજી*

This skill guards Halo's Gujarati. Wrong or awkward Gujarati destroys *વિશ્વાસ*
(trust) instantly — a single bad matra or a translated-feeling line tells a
Barodian "this isn't really ours." Read this before touching any Gujarati word.

Pairs with `halo-brand-voice` (overall voice) — this is the Gujarati-specific
guardrail.

---

## 0. The ten rules (non-negotiable)

1. **Natural, respectful, simple.** It must read the way a thoughtful Barodian actually speaks — plain, warm, correct.
2. **Never machine-translate English literally.** Translate the *feeling*, not the words. A literal render is almost always wrong.
3. **Gujarati is an emotional anchor, not decoration.** Use it where a Barodian would *feel* it (a soul line, a hook, a signoff) — never to dress up UI.
4. **Use it sparingly.** One well-placed Gujarati line beats ten. Gujarati on every label = gimmick.
5. **Never mix Gujarati and English awkwardly.** Each part of a mixed line must be grammatical on its own; don't fracture a Gujarati sentence to fit an English layout.
6. **Prefer short Gujarati phrases over long translated sentences.** Short and true > long and stiff.
7. **If unsure, flag for human review.** When correctness, tone, or idiom is uncertain, leave it in English and mark it `[GU REVIEW]` rather than ship a guess.
8. **Do not invent local slang** unless it's verified as genuinely used in Vadodara. No made-up "authentic" phrases.
9. **Avoid over-romantic or fake-cultural Gujarati.** No flowery, poetic, nostalgia-bait lines that no real person says. Honest warmth, not theatre.
10. **Preserve the three approved anchors exactly:** **વિશ્વાસ** · **શોધ** · **પોતાપણું**. Never alter, re-spell, or replace them.

---

## 1. The three approved anchors (the emotional spine)

| Anchor | Transliteration | Meaning | Use for |
|---|---|---|---|
| **વિશ્વાસ** | vishwaas | trust | trust/verification moments |
| **શોધ** | shodh | discovery / search | finding, discovery moments |
| **પોતાપણું** | potapanu | belonging / "our-own-ness" | local pride, belonging moments |

These three are locked. Reach for them deliberately and correctly — exact
spelling and matra every time. Do not coin new "anchor" words.

---

## 2. Approved Gujarati words & phrases

Safe, natural, correct — use where they earn emotion:

- **ae halo** — the affectionate Baroda call ("ae halo!"); keep its warmth, never flatten it.
- **આપણી માટીનું** (aapni maati nu) — "of our soil / homegrown" — the core soul line.
- **આવો** (aavo) — "come in / welcome" — warm greeting.
- **આભાર** (aabhaar) — "thank you" — sincere, simple.
- **વિશ્વાસ** (vishwaas) — trust. *(anchor)*
- **શોધ** (shodh) — search / discovery. *(anchor)*
- **પોતાપણું** (potapanu) — belonging. *(anchor)*
- **સાચા લોકો, સાચી માહિતી, સાચો વિશ્વાસ** (saacha loko, saachi maahiti, saacho vishwaas) — "real people, real information, real trust."
- **પણ કોઈને ખબર નથી** (pan koi ne khabar nathi) — "but nobody knows" — honest pain-point note.
- **હા, આ તો રોજનું છે** (haa, aa to roj nu chhe) — "yes, this is an everyday thing" — relatable.

Rules for this list: keep additions short, verified, and idiomatic. When adding
a new phrase, it must pass §5's checklist first.

---

## 3. Risky Gujarati patterns (handle with care / usually avoid)

- **Literal UI-label translation** — "વ્યવસાય શોધો" for a "Search businesses" button reads stiff and translated. Keep functional UI in English; save Gujarati for feeling.
- **Long translated sentences** — mirroring a full English paragraph in Gujarati almost always turns awkward. Shorten or drop.
- **Heavy Sanskritised / formal register** — overly bookish words feel like a government notice, not a neighbour. Use everyday spoken Gujarati.
- **Romanised "Gujlish"** (e.g. "Aavo bhai, best tiffin!") in product copy — fine in casual speech, cheap in the UI. Avoid.
- **Mixed-script mid-sentence switching** without grammatical breaks — jarring. Switch only at natural clause boundaries.
- **Regional slang assumed universal** — a phrase from one community may not read as Baroda-wide. Verify before using.
- **Emoji + Gujarati exclamation stacking** — "જબરદસ્ત!! 🔥" — breaks the calm, premium tone. Never.

Any of these → either rewrite to a short approved phrase, keep in English, or
mark `[GU REVIEW]`.

---

## 4. Forbidden mistakes (never ship)

- ❌ **Machine/word-for-word translation** of English copy into Gujarati.
- ❌ **Wrong spelling, wrong matra, broken conjuncts (jodakshar), or anglicised grammar.** Even one error = trust broken.
- ❌ **Altering the three anchors** (વિશ્વાસ · શોધ · પોતાપણું) — no respelling, no synonyms swapped in.
- ❌ **Invented slang or fake "local" phrases** presented as authentic.
- ❌ **Over-romantic / nostalgia-bait Gujarati** ("માટીની મહેક", flowery poetry no one speaks).
- ❌ **Gujarati on every label** / wall-of-Gujarati decoration.
- ❌ **Awkward English+Gujarati hybrids** that aren't grammatical on each side.
- ❌ **Salesy/hype Gujarati** — "સૌથી સસ્તું!", "ધમાકો!", exclamation spam.
- ❌ **Shipping uncertain Gujarati** instead of flagging it `[GU REVIEW]`.

---

## 5. Good vs bad usage (examples)

| Context | ✅ Good | ❌ Bad | Why |
|---|---|---|---|
| Soul line | "આપણી માટીનું." | "વડોદરા માટે બનાવેલ ડિજિટલ સોલ્યુશન" | Right one is warm & true; wrong one is translated corporate-speak |
| Welcome | "આવો. Vadodara's own." | "સ્વાગત છે અમારા પ્લેટફોર્મ પર" | Short, natural vs stiff/literal |
| Search button | "Browse the directory" | "વ્યવસાય શોધો" | Keep functional UI in English; Gujarati for feeling |
| Pain hook | "There's a great tiffin aunty somewhere — પણ કોઈને ખબર નથી." | "એક સારી ટિફિન આંટી ક્યાંક હશે પરંתુ કોઈને જ્ઞાત નથી" | Real spoken phrase vs bookish/over-formal |
| Thanks | "આભાર. You're among the first Barodians on Halo." | "તમારો ખૂબ ખૂબ આભાર!! 🙏🔥" | Sincere & calm vs hype + emoji |
| Trust | "સાચા લોકો, સાચી માહિતી, સાચો વિશ્વાસ." | "૧૦૦% વિશ્વસનીય ગેરંટી!" | Honest cadence vs salesy false guarantee |

**Pattern to copy:** English carries the information; one short, correct Gujarati
phrase carries the feeling — placed where it lands, then it stops.

---

## 6. Review checklist (run before any Gujarati ships)

1. **Native test:** would a Vadodara native say this exact line aloud, naturally? (Must be yes.)
2. **Translation test:** is this translating a *feeling*, not English words literally? (No literal renders.)
3. **Correctness test:** spelling, matra, jodakshar, grammar all perfect? (Any doubt → `[GU REVIEW]`.)
4. **Sparingly test:** is Gujarati used where it earns emotion, not as decoration or on every label?
5. **Short test:** is this the shortest true phrasing? (Prefer short over long translated sentences.)
6. **Mix test:** if mixed with English, is each part grammatical on its own, switching only at natural breaks?
7. **Anchor test:** if an anchor (વિશ્વાસ / શોધ / પોતાપણું) is used, is it exact and unaltered?
8. **Authenticity test:** no invented slang, no over-romantic/fake-cultural lines, no hype or emoji spam?
9. **Tone test:** warm, respectful, calm, neighbourly — never salesy, never bookish?

If any answer is "no" or "unsure" → **do not ship.** Keep it in English and mark
it `[GU REVIEW]` for a human Gujarati speaker.

> **Better honest English than awkward Gujarati. Gujarati, when it appears, must
> feel like home — correct, simple, and earned.**
>
> *વિશ્વાસ · શોધ · પોતાપણું*
