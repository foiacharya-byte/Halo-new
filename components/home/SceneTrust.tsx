import { Avatar } from "./Avatar";
import { Reveal } from "./Reveal";

const EVIDENCE = [
  { icon: "icon_contact_confirmed.svg", label: "Contact confirmed", detail: "Verified against the number provided" },
  { icon: "icon_personally_used.svg", label: "Recommended by", detail: "Someone who personally used them" },
  { icon: "icon_recency.svg", label: "Last used", detail: "Recency Halo asks for directly" },
  { icon: "icon_successful_outcome.svg", label: "Outcome", detail: "Whether the request was resolved" },
  { icon: "icon_price_note.svg", label: "Price note", detail: "What was actually discussed, if shared" },
];

export function SceneTrust() {
  return (
    <section id="trust" className="py-16 sm:py-20">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-16">
          <Reveal>
            <div>
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/halo/matched/05_scene_trust/trust_shield.svg" alt="" className="h-10 w-10" aria-hidden />
                <h2 className="font-serif text-2xl text-ink sm:text-[28px]">
                  We do not just list. We verify, confirm and track outcomes.
                </h2>
              </div>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
                No single trust score pretending to sum up a person. Every piece of evidence stays
                visible on its own — including what is still unresolved or uncertain.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="relative rounded-halo border border-border bg-surface p-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/halo/matched/05_scene_trust/trust_card_back_02.svg" alt="" className="pointer-events-none absolute -right-3 -top-3 -z-10 h-full w-full opacity-40" aria-hidden />
              <div className="flex items-center gap-3">
                <Avatar name="Rakesh Refrigeration" size={48} />
                <div>
                  <p className="font-medium text-ink">Rakesh Refrigeration</p>
                  <p className="text-xs text-ink-faint">AC repair · Gotri</p>
                </div>
              </div>
              <dl className="mt-4 divide-y divide-border">
                {EVIDENCE.map((r) => (
                  <div key={r.label} className="flex items-center gap-3 py-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={`/assets/halo/matched/05_scene_trust/${r.icon}`} alt="" className="h-6 w-6 shrink-0" aria-hidden />
                    <dt className="text-sm text-ink">{r.label}</dt>
                    <dd className="ml-auto max-w-[50%] text-right text-xs text-ink-faint">{r.detail}</dd>
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
