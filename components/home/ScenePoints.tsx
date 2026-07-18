import { Reveal } from "./Reveal";

const EVENTS = [
  { icon: "points_contact_verified.svg", amount: "+3", label: "Contact verified" },
  { icon: "points_helped_someone.svg", amount: "+5", label: "Helped someone" },
  { icon: "points_successful_outcome.svg", amount: "+10", label: "Successful outcome" },
  { icon: "points_top_contributor.svg", amount: "+20", label: "Top contributor" },
];

export function ScenePoints() {
  return (
    <section id="points" className="py-16 sm:py-20">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16">
          <Reveal>
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/assets/halo/matched/07_scene_halo_points/points_confetti.svg" alt="" className="pointer-events-none absolute -left-6 -top-6 h-16 w-16" aria-hidden />
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/assets/halo/matched/07_scene_halo_points/points_medal.svg" alt="" className="h-12 w-12" aria-hidden />
                <h2 className="font-serif text-2xl text-ink sm:text-[28px]">Helpful contributions should count.</h2>
              </div>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft">
                Halo Points reward verification, not volume. Nothing is awarded on submission — only once
                Halo confirms a contact is real, and more once it genuinely helps someone.
              </p>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {EVENTS.map((e) => (
                <div key={e.label} className="flex items-center gap-3 rounded-halo border border-border bg-surface p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/assets/halo/matched/07_scene_halo_points/${e.icon}`} alt="" className="h-9 w-9 shrink-0" aria-hidden />
                  <div>
                    <p className="font-serif text-lg text-gold">{e.amount}</p>
                    <p className="text-xs text-ink-faint">{e.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
