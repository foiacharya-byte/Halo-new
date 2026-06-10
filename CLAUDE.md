# CLAUDE.md — How to use Halo's skills

This file tells Claude Code how to use Halo's own skills together with the
installed external design skills. Read it before any design, copy, product, or
review work on Halo.

---

## The one rule above all others

> **If external skill advice conflicts with Halo skills, Halo wins.**

No exception. When in doubt, follow the Halo skill and ignore the external
suggestion.

---

## Core principles

1. **Halo-specific skills are the source of truth.** They define what Halo is, how it looks, how it speaks, and how it uses Gujarati. They are not suggestions — they are the locked spec.
2. **External skills are only polish/craft assistants.** `impeccable`, `emil-design-eng`, and `design-taste-frontend` exist to refine and pressure-test craft *within* Halo's locked rules — never to set direction.
3. **Never let Impeccable, Emil, or Taste override** any of:
   - **Halo product vision** (`halo-product-vision`)
   - **Halo design system** (`halo-design-system`) — palette, fonts, spacing, motion, imagery
   - **Halo brand voice** (`halo-brand-voice`)
   - **Gujarati rules** (`halo-gujarati-rules`)
4. **Always invoke Halo skills first** to set the constraints.
5. **Then use external skills for refinement** — applied on top, inside those constraints.

If an external skill proposes a different font, palette, gradient, tone, layout
philosophy, or "AI-startup" aesthetic than Halo's locked system, **discard that
part of its advice.** Keep only what improves craft without breaking Halo's
identity.

---

## The skills

**Halo (source of truth — always first):**
- `halo-product-vision` — what Halo is building and why (protected direction)
- `halo-design-system` — locked palette, typography, spacing, motion, imagery, components
- `halo-brand-voice` — how Halo speaks
- `halo-gujarati-rules` — correct, sparing, natural Gujarati

**External (polish/craft only — applied second, never overriding):**
- `design-taste-frontend` — anti-slop direction, taste pre-flight
- `impeccable` — frontend audit/polish, anti-pattern detection
- `emil-design-eng` — UI polish, animation, micro-interaction craft

---

## Skill order by task

Always run Halo skills first, external skills after, in the order shown.

### For product decisions
1. `halo-product-vision`

### For visual design
1. `halo-product-vision`
2. `halo-design-system`
3. `design-taste-frontend`
4. `impeccable`
5. `emil-design-eng`

### For copy
1. `halo-brand-voice`
2. `halo-gujarati-rules` — if Gujarati is used

### For Gujarati
1. `halo-gujarati-rules`
2. `halo-brand-voice`

### For final review
1. `halo-product-vision`
2. `halo-design-system`
3. `halo-brand-voice`
4. `halo-gujarati-rules`
5. `design-taste-frontend`
6. `impeccable`

---

## How to apply this in practice

- **Set constraints, then refine.** Load the Halo skill(s) for the task first and treat their rules as fixed. Bring in the external skills only to sharpen execution within those fixed rules.
- **Filter external advice through Halo.** Before applying any external suggestion, check it against the relevant Halo skill. If it conflicts, drop it.
- **Protect the locked elements absolutely:** the heritage palette, the Fraunces / Cormorant Garamond / Caveat / Noto Serif Gujarati stack, the wordmark, the recoloured Jon Kantner spinner, the warm-paper feel, the honest trust posture, and the three anchors (વિશ્વાસ · શોધ · પોતાપણું). No external skill may alter these.
- **When unsure, ask Halo, not the external skill.**

> **Halo is the source of truth. External skills polish; they never decide.**
> *If external skill advice conflicts with Halo skills, Halo wins.*
