import { Reveal } from "./Reveal";
import { WaitlistTrigger } from "./WaitlistProvider";

export function SceneWork() {
  return (
    <section id="work" className="relative z-[1] flex min-h-screen flex-col justify-center overflow-hidden bg-[#0A0503]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/halo/vadodara/supplied/bg-work.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover opacity-50"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0503]/90 via-[#0a0503]/68 to-[#0a0503]/10" />
      <div className="absolute inset-x-0 top-0 z-[1] h-[18%] bg-gradient-to-b from-paper to-transparent" />
      <div className="absolute inset-x-0 bottom-0 z-[1] h-[18%] bg-gradient-to-t from-[#0a0503] to-transparent" />

      <div className="relative z-[2] mx-auto w-full max-w-[1200px] px-6 py-[clamp(100px,12vw,140px)] text-center sm:px-16">
        <Reveal variant="left">
          <p className="mb-7 text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">You are not just a user</p>
        </Reveal>
        <Reveal variant="big">
          <h2 className="font-display mx-auto mb-[clamp(20px,3vw,36px)] max-w-[22ch] text-[clamp(36px,5.5vw,74px)] font-normal leading-[1.06] tracking-tight text-[#F0E4CC]">
            You probably know something
            <br />
            <em className="italic text-accent">Baroda should know.</em>
          </h2>
        </Reveal>

        <Reveal className="mb-[clamp(28px,4vw,48px)]">
          <p className="font-serif mb-[30px] text-[clamp(20px,2.1vw,28px)] leading-[1.5] tracking-tight text-[#F0E4CC]">
            Recommend a person<span className="px-[.42em] text-accent">·</span>share a place
            <span className="px-[.42em] text-accent">·</span>add a local discovery
            <span className="px-[.42em] text-accent">·</span>tell us what is happening nearby
            <span className="px-[.42em] text-accent">·</span>help correct what is wrong
            <span className="px-[.42em] text-accent">·</span>bring a hidden gem into the open.
          </p>
          <div className="mb-6 h-px bg-ink/10" />
          <p className="mx-auto mb-6 max-w-[50ch] text-[clamp(15px,1.5vw,18px)] leading-[1.72] text-ink-soft">
            One useful recommendation can save someone else time, support good local work, and make Baroda feel
            more connected.
          </p>
          <p className="font-gu mb-[clamp(32px,4vw,52px)] text-[clamp(17px,1.7vw,21px)] font-medium text-accent">
            જે સારું છે, એ શહેર સુધી પહોંચવું જોઈએ.
          </p>
        </Reveal>

        <Reveal className="flex flex-wrap items-center justify-center gap-5">
          <WaitlistTrigger role="recommend" className="rounded-full bg-accent px-8 py-3.5 text-base font-medium text-white transition-colors hover:bg-accent-ink">
            Recommend something good →
          </WaitlistTrigger>
        </Reveal>
      </div>
    </section>
  );
}
