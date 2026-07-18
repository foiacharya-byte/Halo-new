import { HaloSearch } from "@/components/HaloSearch";
import { FloatCard, SpinBadge } from "./HeroMotion";
import { Avatar } from "./Avatar";
import { Reveal } from "./Reveal";

const EXAMPLE_QUERIES = [
  "AC repair in Gotri",
  "reliable maid near Alkapuri",
  "good tailor in Karelibaug",
  "music teacher in Sama",
];

const LOCALITIES = ["Gotri", "Akota", "Manjalpur", "Sama"];

const TICKER_ITEMS = [
  { text: "Live in Vadodara" },
  { text: "AC technician in Gotri answered 18m ago" },
  { text: "Maid request in Sama answered 32m ago" },
  { text: "New contact passed on in Manjalpur 1h ago" },
  { text: "Gym recommendation added in Akota 1h ago" },
];

// Stacked 1px-offset shadow to give the display type a chunky, extruded
// dimension instead of a flat CSS text-shadow blur — same technique across
// all three headline lines so they read as one carved block.
function extrude(color: string, steps = 9) {
  return Array.from({ length: steps }, (_, i) => `${i + 1}px ${i + 1}px 0 ${color}`).join(", ");
}

export function SceneHero() {
  return (
    <section id="top" className="relative overflow-hidden bg-accent-ink">
      {/* Real, verified Vadodara photograph, dimmed into the dark ground —
          keeps the bold hero grounded in the actual place instead of being
          generic. See docs/PHOTO_SOURCES_AND_LICENSES.md for attribution. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/halo/matched/01_scene_hero/hero_laxmi_vilas_right_fade_desktop.png"
        alt=""
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.14] mix-blend-luminosity"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "3.5rem 3.5rem",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
        style={{ background: "radial-gradient(60% 60% at 50% 0%, rgba(242,168,38,0.16), transparent 70%)" }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-content px-4 pb-28 pt-14 sm:px-6 sm:pt-20 lg:pb-40">
        <Reveal>
          <h1 className="max-w-3xl select-none font-serif uppercase leading-[0.92] tracking-tight">
            <span
              className="block text-[13vw] text-gold sm:text-[44px] lg:text-[52px]"
              style={{ textShadow: extrude("#06120E", 5) }}
            >
              What do you
            </span>
            <span
              className="block pl-[6vw] text-[19vw] text-paper sm:pl-2 sm:text-[92px] lg:text-[120px]"
              style={{ textShadow: extrude("#06120E", 8) }}
            >
              need in
            </span>
            <span
              className="block text-[13.5vw] text-coral sm:pl-6 sm:text-[68px] lg:text-[86px]"
              style={{ textShadow: extrude("#06120E", 6) }}
            >
              Vadodara?
            </span>
          </h1>
        </Reveal>

        <Reveal delay={0.15}>
          <p className="mt-6 max-w-md text-[15px] leading-relaxed text-paper/70 sm:text-base">
            Ask. Search. Get trusted answers from real people.
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-7 max-w-xl">
            <HaloSearch size="hero" rotatingPlaceholders={EXAMPLE_QUERIES} />
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a
                href="/add"
                className="rounded-full border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-medium text-paper backdrop-blur-sm transition-colors hover:border-white/50 hover:bg-white/15"
              >
                Pass on someone you trust
              </a>
            </div>
          </div>
        </Reveal>

        {/* Floating proof cards — real illustrative content (same copy the
            Trust and activity-ticker sections use further down), not
            decoration. Hidden on small screens to keep the mobile hero
            calm. */}
        <FloatCard
          className="pointer-events-none absolute right-[6%] top-[8%] hidden w-52 lg:block"
          rotate={-8}
          duration={5.5}
        >
          <div className="rounded-3xl border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <Avatar name="Rakesh Refrigeration" size={36} />
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-paper">Rakesh Refrigeration</p>
                <p className="truncate text-[11px] text-paper/60">AC repair · Gotri</p>
              </div>
            </div>
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-gold-soft px-2.5 py-1 text-[10px] font-medium text-accent-ink">
              <span aria-hidden>✓</span> Contact confirmed
            </p>
          </div>
        </FloatCard>

        <FloatCard
          className="pointer-events-none absolute right-[16%] top-[46%] hidden w-56 xl:block"
          rotate={6}
          delay={0.8}
          duration={6.5}
        >
          <div className="rounded-3xl border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur-md">
            <p className="flex items-center gap-2 text-xs text-paper">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-coral" aria-hidden />
              AC technician in Gotri answered 18m ago
            </p>
          </div>
        </FloatCard>

        <SpinBadge
          label="PASS IT ON · EARN HALO POINTS · "
          className="pointer-events-none absolute bottom-[6%] right-[4%] hidden h-28 w-28 lg:block"
        />
      </div>

      {/* Scoop transition into the cream scroll-story below — locality path
          and ticker live on this panel, not on the dark hero. */}
      <div className="relative z-10 -mt-10 rounded-t-[2.5rem] bg-paper pt-8 sm:-mt-12 sm:rounded-t-[3rem] sm:pt-10">
        <Reveal delay={0.1}>
          <div className="relative mx-auto max-w-content px-4 pb-6 sm:px-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/halo/matched/01_scene_hero/passing_line_localities.svg" alt="" className="h-8 w-full max-w-xl" aria-hidden />
            <div className="mt-1 flex max-w-xl justify-between text-xs font-medium text-ink-soft">
              {LOCALITIES.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Live activity ticker — illustrative, not a real-time feed. */}
        <div className="overflow-hidden border-y border-border bg-paper-deep py-3" aria-label="Illustrative preview of Halo activity">
          <div className="flex w-max animate-[marquee_36s_linear_infinite] gap-3 px-4 motion-reduce:animate-none">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
              <span
                key={i}
                className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs text-ink-soft"
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                {t.text}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
