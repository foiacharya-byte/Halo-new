import { Reveal } from "./Reveal";

export function SceneVision() {
  return (
    <section id="vision" className="relative z-[1] overflow-hidden bg-paper-deep/55 px-6 py-[clamp(100px,12vw,156px)] sm:px-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_78%_68%_at_center,rgba(6,3,1,.5)_0%,rgba(6,3,1,.24)_56%,transparent_100%)]" />
      <div className="relative z-[1] mx-auto max-w-[900px] text-center">
        <Reveal variant="left">
          <p className="mb-[22px] text-[11px] font-medium uppercase tracking-[0.2em] text-accent">Less noise. Better choices.</p>
        </Reveal>
        <Reveal variant="big">
          <h2 className="font-display mb-[clamp(22px,2.8vw,34px)] text-[clamp(34px,4.6vw,62px)] font-normal leading-[1.06] tracking-tight text-ink">
            Your city should make
            <br />
            daily life easier.
          </h2>
        </Reveal>
        <Reveal>
          <p className="mx-auto mb-4 max-w-[46ch] text-[clamp(17px,1.7vw,20px)] leading-[1.7] text-ink-soft">
            You should not have to waste time guessing.
          </p>
        </Reveal>
        <Reveal>
          <p className="mx-auto mb-[clamp(34px,4.2vw,50px)] max-w-[56ch] text-[clamp(16px,1.6vw,19px)] leading-[1.74] text-ink-soft/90">
            Not for food. Not for a class. Not for a service. Not for weekend plans. Not for a shop, artist,
            event, or local name people already trust.
          </p>
        </Reveal>
        <Reveal>
          <p className="font-serif mx-auto max-w-[26ch] text-[clamp(22px,2.5vw,34px)] font-normal leading-[1.32] tracking-tight text-ink">
            Halo helps Barodians find what is{" "}
            <strong className="font-semibold text-accent">useful, trusted, and worth discovering</strong> —
            without starting from random noise every time.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
