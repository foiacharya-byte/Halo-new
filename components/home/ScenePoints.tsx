import { Reveal } from "./Reveal";

// Scene 7 — Halo Points. Explains the mechanic only; no fabricated personal
// point total or user count is shown (see docs/HALO_PRELAUNCH_IMPLEMENTATION_PLAN.md
// — no invented "live" data). The real ledger (HaloPointTransaction) is
// Phase 3 scope.

const REWARD_EVENTS = [
  { amount: "+3", label: "Verified trusted contact" },
  { amount: "+bonus", label: "That contact resolves a real request" },
  { amount: "0", label: "Copied, duplicate, fake, or unverified — always" },
];

export function ScenePoints() {
  return (
    <section id="points" className="py-12 sm:py-16" aria-labelledby="points-heading">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16">
          <Reveal>
            <div>
              <h2 id="points-heading" className="font-serif text-2xl text-ink sm:text-[28px]">
                Helpful contributions should count.
              </h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
                Halo Points reward verification, not volume. Nothing is awarded on submission — only
                once Halo confirms a contact is real, and more once it genuinely helps someone.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {REWARD_EVENTS.map((r) => (
                <div key={r.label} className="rounded-halo border border-border bg-surface p-4 text-center">
                  <p className="font-serif text-2xl text-gold">{r.amount}</p>
                  <p className="mt-1 text-xs text-ink-faint">{r.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
