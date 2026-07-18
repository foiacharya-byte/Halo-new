import { Reveal } from "./Reveal";
import { WaitlistTrigger } from "./WaitlistProvider";

export function SceneWaitlistCTA() {
  return (
    <section id="waitlist" className="relative z-[1] overflow-hidden bg-paper-deep/50 px-6 py-[clamp(120px,14vw,180px)] sm:px-16">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[min(700px,120vw)] w-[min(700px,120vw)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(212,164,67,.12),transparent_65%)]" />
      <div className="relative z-[1] mx-auto max-w-[860px] text-center">
        <Reveal>
          <p className="mb-[22px] text-[11px] font-medium uppercase tracking-[0.2em] text-accent">The beginning</p>
        </Reveal>
        <Reveal variant="big">
          <h2 className="font-serif mb-[18px] text-[clamp(40px,5.5vw,72px)] font-normal leading-[1.08] tracking-tight text-ink">
            The first Barodians <em className="italic text-accent">will shape Halo.</em>
          </h2>
        </Reveal>
        <Reveal>
          <p className="mx-auto mb-7 max-w-[52ch] text-lg leading-[1.64] text-ink-soft">
            Halo is opening carefully. Join early to help decide what your area needs, what should be discovered
            first, which local names deserve visibility, and what kind of city platform Baroda should have.
          </p>
        </Reveal>
        <Reveal>
          <p className="font-serif mx-auto mb-[38px] max-w-[40ch] text-[clamp(16px,1.5vw,20px)] italic leading-[1.64] text-ink-soft">
            This is not just a waitlist. It is the beginning of Baroda building its own local place.
          </p>
        </Reveal>
        <Reveal className="mb-[18px] flex flex-wrap items-center justify-center gap-3.5">
          <WaitlistTrigger className="rounded-full bg-accent px-9 py-[17px] text-[17px] font-medium text-white transition-colors hover:bg-accent-ink">
            Join the waitlist →
          </WaitlistTrigger>
        </Reveal>
        <Reveal>
          <p className="text-[12.5px] tracking-wide text-ink-soft">
            No paid noise. No fake listings. No random clutter. Built with Vadodara, for Vadodara.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
