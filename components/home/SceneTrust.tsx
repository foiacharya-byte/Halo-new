import { Reveal } from "./Reveal";

// Scene 5 — Trust You Can See. An annotated template of the evidence a
// listing carries — deliberately labelled as a template, not a real
// listing, so nothing here reads as a fabricated review or outcome count
// (see docs/HALO_ASSET_AUDIT.md — "no fake live activity").

const EVIDENCE_ROWS = [
  { label: "Contact confirmed", detail: "Verified against the number provided" },
  { label: "Area served", detail: "Matched to where it was actually used" },
  { label: "Recommended by", detail: "Someone who personally used them, not a repost" },
  { label: "Last used", detail: "Recency Halo asks for directly" },
  { label: "Outcome", detail: "Whether the request that led here was resolved" },
  { label: "Would use again", detail: "Yes / maybe / no — never a forced star rating" },
];

export function SceneTrust() {
  return (
    <section id="trust" className="py-12 sm:py-16" aria-labelledby="trust-heading">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
          <Reveal>
            <div>
              <h2 id="trust-heading" className="font-serif text-2xl text-ink sm:text-[28px]">
                We do not just list. We verify, confirm and track outcomes.
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
                No single trust score pretending to sum up a person. Every piece of evidence stays
                visible on its own — including what is still unresolved or uncertain.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="rounded-halo border border-border bg-surface p-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">
                How a Halo answer is put together
              </p>
              <dl className="mt-4 divide-y divide-border">
                {EVIDENCE_ROWS.map((r) => (
                  <div key={r.label} className="flex items-start justify-between gap-4 py-3">
                    <dt className="flex items-center gap-2 text-sm text-ink">
                      <span className="text-good" aria-hidden>
                        ✓
                      </span>
                      {r.label}
                    </dt>
                    <dd className="max-w-[55%] text-right text-xs text-ink-faint">{r.detail}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
