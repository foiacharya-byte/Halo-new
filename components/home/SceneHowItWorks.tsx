import { Reveal } from "./Reveal";
import { PassingLinePath } from "./PassingLine";

const STEPS = [
  { n: "1", label: "Ask or search", detail: "Tell Halo what you need in Vadodara." },
  { n: "2", label: "Someone passes it on", detail: "A trusted contact, from a phone or a group." },
  { n: "3", label: "Halo verifies", detail: "Contact, category, locality, recency, consent." },
  { n: "4", label: "You tell Halo what happened", detail: "Your outcome sharpens the next answer." },
];

export function SceneHowItWorks() {
  return (
    <section id="how-it-works" className="py-12 sm:py-16" aria-labelledby="how-it-works-heading">
      <div className="mx-auto max-w-content px-4 sm:px-6">
        <Reveal>
          <h2 id="how-it-works-heading" className="text-center font-serif text-2xl text-ink sm:text-[28px]">
            Simple. Human. Powerful.
          </h2>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mx-auto mt-8 max-w-2xl">
            <PassingLinePath labels={STEPS.map((s) => s.n)} />
          </div>
        </Reveal>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={0.05 * i}>
              <div className="h-full rounded-halo border border-border bg-surface p-5">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-ink text-sm font-medium text-white">
                  {s.n}
                </span>
                <p className="mt-3 font-serif text-base text-ink">{s.label}</p>
                <p className="mt-1 text-sm text-ink-soft">{s.detail}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
