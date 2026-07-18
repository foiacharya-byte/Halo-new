import { Reveal } from "./Reveal";

export function SceneStepwell() {
  return (
    <div className="relative z-[1] flex min-h-[480px] items-center justify-center overflow-hidden bg-paper">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/halo/vadodara/supplied/bg-step.jpg"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover opacity-30"
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,3,1,.55)_0%,rgba(6,3,1,.75)_68%)]" />
      <Reveal className="relative z-[1] max-w-[920px] px-6 text-center sm:px-16">
        <h2 className="font-display text-[clamp(38px,5.5vw,72px)] font-normal leading-[1.08] tracking-tight text-[#F0E4CC]">
          A city built over centuries.
          <br />
          <em className="italic text-accent">Halo gives it a voice for today.</em>
        </h2>
      </Reveal>
    </div>
  );
}
