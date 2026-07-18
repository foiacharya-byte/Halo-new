import { HaloSearch } from "@/components/HaloSearch";
import { Reveal } from "./Reveal";

const EXAMPLE_QUERIES = [
  "AC repair in Gotri",
  "reliable maid near Alkapuri",
  "good tailor in Karelibaug",
  "music teacher in Sama",
];

const LOCALITIES = ["Gotri", "Akota", "Manjalpur", "Sama"];

const TICKER_ITEMS = [
  "AC technician in Gotri answered 18m ago",
  "Maid request in Sama answered 32m ago",
  "New contact passed on in Manjalpur 1h ago",
  "Tailor recommendation added in Akota 1h ago",
];

export function SceneHero() {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* Landmark art — real, verified Vadodara photograph (Laxmi Vilas
          Palace), faded on the left so it never competes with the text.
          public/assets/halo/matched/ — see docs/PHOTO_SOURCES_AND_LICENSES.md
          for full attribution. */}
      <div className="pointer-events-none absolute inset-0 hidden sm:block" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/halo/matched/01_scene_hero/hero_laxmi_vilas_right_fade_desktop.png"
          alt=""
          className="h-full w-full object-cover object-right opacity-90"
        />
      </div>
      <div className="pointer-events-none absolute inset-0 sm:hidden" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/assets/halo/matched/01_scene_hero/hero_laxmi_vilas_bottom_fade_mobile.png"
          alt=""
          className="h-full w-full object-cover object-bottom opacity-70"
        />
      </div>

      <div className="relative mx-auto max-w-content px-4 pb-10 pt-14 sm:px-6 sm:pt-20">
        <div className="absolute -top-2 left-1/2 hidden -translate-x-1/2 sm:block" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/halo/matched/01_scene_hero/sun_doodle.svg" alt="" className="h-14 w-14 -translate-x-40" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/halo/matched/01_scene_hero/birds_doodle.svg" alt="" className="h-10 w-24 translate-x-24 -translate-y-10" />
        </div>

        <Reveal>
          <div className="max-w-xl text-left">
            <h1 className="font-serif text-4xl leading-tight text-ink sm:text-5xl">
              What do you need in Vadodara?
            </h1>
            <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-soft sm:text-base">
              Ask. Search. Get trusted answers from real people.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-8 max-w-xl">
            <HaloSearch size="hero" rotatingPlaceholders={EXAMPLE_QUERIES} />
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <a
                href="/add"
                className="rounded-full border border-border bg-surface px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-accent"
              >
                Pass on someone you trust
              </a>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="relative mt-10 max-w-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/halo/matched/01_scene_hero/passing_line_localities.svg" alt="" className="h-8 w-full text-gold" aria-hidden />
            <div className="mt-1 flex justify-between text-xs text-ink-faint">
              {LOCALITIES.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>

      {/* Live activity ticker — illustrative, not a real-time feed */}
      <div className="relative overflow-hidden border-t border-border bg-surface/70 py-3" aria-label="Illustrative preview of Halo activity">
        <div className="flex w-max animate-[marquee_32s_linear_infinite] gap-8 motion-reduce:animate-none">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
            <span key={i} className="flex items-center gap-2 whitespace-nowrap text-xs text-ink-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              {t}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
