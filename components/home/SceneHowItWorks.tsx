import { Reveal } from "./Reveal";

const STEPS = [
  { icon: "step_01_search.svg", label: "Ask or search", detail: "Tell Halo what you need in Vadodara." },
  { icon: "step_02_find.svg", label: "Someone passes it on", detail: "A trusted contact, from a phone or a group." },
  { icon: "step_03_use.svg", label: "Halo verifies", detail: "Contact, category, locality, recency, consent." },
  { icon: "step_04_help.svg", label: "You tell Halo what happened", detail: "Your outcome sharpens the next answer." },
];

export function SceneHowItWorks() {
  return (
    <section id="how-it-works" className="py-16 sm:py-20">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <Reveal>
          <h2 className="text-center font-serif text-2xl text-ink sm:text-[28px]">Simple. Human. Powerful.</h2>
        </Reveal>

        <div className="relative mt-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/halo/matched/06_scene_how_it_works/step_connector_line.svg"
            alt=""
            className="absolute left-0 right-0 top-8 hidden w-full sm:block"
            aria-hidden
          />
          <div className="relative grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <Reveal key={s.label} delay={0.05 * i}>
                <div className="flex flex-col items-center rounded-halo border border-border bg-surface p-5 text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`/assets/halo/matched/06_scene_how_it_works/${s.icon}`} alt="" className="h-14 w-14" aria-hidden />
                  <p className="mt-3 font-serif text-base text-ink">{s.label}</p>
                  <p className="mt-1 text-sm text-ink-soft">{s.detail}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
