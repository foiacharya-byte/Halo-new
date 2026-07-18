import { WaitlistTrigger } from "./WaitlistProvider";
import { Reveal } from "./Reveal";

const AVATARS = Array.from({ length: 6 }, (_, i) => `join_avatar_0${i + 1}.svg`);

export function SceneJoin() {
  return (
    <section id="join" className="relative overflow-hidden py-16 sm:py-20">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/halo/matched/08_scene_join/join_lilac_blob.svg"
        alt=""
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 opacity-70"
        aria-hidden
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/halo/matched/08_scene_join/join_orbit_line.svg" alt="" className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2" aria-hidden />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/assets/halo/matched/08_scene_join/join_sparkles.svg" alt="" className="pointer-events-none absolute right-[15%] top-10 h-12 w-12" aria-hidden />

      <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6">
        <Reveal>
          <h2 className="font-serif text-2xl text-ink sm:text-[28px]">
            Let&rsquo;s build Vadodara&rsquo;s most trusted network. Together.
          </h2>
          <div className="mt-5 flex justify-center -space-x-2">
            {AVATARS.map((a) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={a} src={`/assets/halo/matched/08_scene_join/${a}`} alt="" className="h-10 w-10 rounded-full border-2 border-paper" aria-hidden />
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-6">
            <WaitlistTrigger className="rounded-full bg-accent px-7 py-3.5 text-[15px] font-medium text-white transition-colors hover:bg-accent-ink">
              Join Halo
            </WaitlistTrigger>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-ink-faint">
            <span>✓ It&rsquo;s free</span>
            <span>✓ Verified community</span>
            <span>✓ Privacy protected</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
