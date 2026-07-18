import { Reveal } from "./Reveal";

const BUBBLES: { file: string; text: string; time: string; className: string }[] = [
  { file: "message_bubble_01.svg", text: "Any good AC technician?", time: "10:32 AM", className: "left-0 top-0" },
  { file: "message_bubble_02.svg", text: "Does anyone know a reliable maid?", time: "11:05 AM", className: "left-8 top-24 sm:left-16" },
  { file: "message_bubble_03.svg", text: "Need a gym in Akota under ₹20k", time: "11:19 AM", className: "left-2 top-48 sm:left-4" },
];

export function SceneReality() {
  return (
    <section id="reality" className="py-16 sm:py-20">
      <div className="mx-auto grid max-w-content grid-cols-1 gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-center lg:gap-16">
        <Reveal>
          <div>
            <h2 className="font-serif text-2xl text-ink sm:text-[28px]">
              Today, answers are everywhere.{" "}
              <span className="text-coral">But not always reliable.</span>
            </h2>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-ink-soft">
              People ask. Wait. Hope.
              <br />
              And still aren&rsquo;t sure.
            </p>
          </div>
        </Reveal>

        <div className="relative h-[380px] sm:h-[420px]">
          {BUBBLES.map((b) => (
            <div key={b.file} className={`absolute w-60 ${b.className}`}>
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`/assets/halo/matched/02_scene_reality/${b.file}`} alt="" className="w-full" aria-hidden />
                {/* The bubble SVG bakes in its own placeholder text-line
                    bars; an opaque patch matching the bubble's white
                    interior hides them so only the real coded text shows. */}
                <p className="absolute inset-x-[6%] inset-y-[13%] bottom-[24%] flex items-center rounded bg-white px-4 text-[13px] leading-snug text-ink">
                  {b.text}
                </p>
              </div>
              <span className="mt-1 block text-right text-[11px] text-ink-faint">{b.time}</span>
            </div>
          ))}

          {/* The "answer" — visually distinct from the scattered questions
              above it, coded (no matching SVG variant exists for this one). */}
          <div className="absolute left-16 top-[280px] w-60 sm:left-24">
            <p className="flex w-fit items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-[13px] text-white shadow-card">
              <span aria-hidden>📱</span>
              I have one number, I&rsquo;ll share.
            </p>
            <span className="mt-1 block text-[11px] text-ink-faint">11:21 AM</span>
          </div>

          <div className="absolute bottom-0 right-0 h-28 w-28">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/halo/matched/02_scene_reality/halo_convergence_orb.svg" alt="" className="h-full w-full" aria-hidden />
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-serif text-xs font-medium text-white">
              halo!
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
