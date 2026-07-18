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
  { icon: "🟣", text: "Live in Vadodara" },
  { icon: "🩷", text: "AC technician in Gotri answered 18m ago" },
  { icon: "🟠", text: "Maid request in Sama answered 32m ago" },
  { icon: "🔵", text: "New contact passed on in Manjalpur 1h ago" },
  { icon: "🟢", text: "Gym recommendation added in Akota 1h ago" },
];

export function SceneHero() {
  return (
    <section id="top">
      {/* Photo band — bounded to a fixed height and never cropped (object-contain),
          so the image's own baked-in left-side fade lines up with the paper
          background instead of getting cut off mid-fade by object-cover. It
          sits only behind the headline/search band; the locality path and
          ticker below are on plain paper, never under the photo. Real,
          verified Vadodara photograph (Laxmi Vilas Palace) — see
          docs/PHOTO_SOURCES_AND_LICENSES.md for full attribution. */}
      <div className="relative overflow-hidden">
        {/* Desktop: photo sits behind the headline zone, right-anchored,
            never cropped — its baked-in left fade lines up with the paper. */}
        <div className="pointer-events-none absolute inset-x-0 top-0 hidden h-[300px] sm:block lg:h-[380px]" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/halo/matched/01_scene_hero/hero_laxmi_vilas_right_fade_desktop.png"
            alt=""
            className="h-full w-full object-contain object-right-top"
          />
        </div>

        <div className="relative mx-auto max-w-content px-4 pb-10 pt-14 sm:px-6 sm:pt-20">
          <div className="absolute -top-2 left-1/2 hidden -translate-x-1/2 sm:block" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/halo/matched/01_scene_hero/sun_doodle.svg" alt="" className="h-14 w-14 -translate-x-40" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/halo/matched/01_scene_hero/birds_doodle.svg" alt="" className="h-10 w-24 translate-x-24 -translate-y-10" />
          </div>

          {/* Mobile: photo is a normal block above the text, never
              underneath it, so the search bar and buttons stay fully
              legible on plain paper. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/halo/matched/01_scene_hero/hero_laxmi_vilas_bottom_fade_mobile.png"
            alt="Laxmi Vilas Palace, Vadodara"
            className="mb-6 h-44 w-full rounded-2xl object-cover object-bottom sm:hidden"
          />

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
        </div>
      </div>

      {/* Locality path — fully below the photo band, on plain paper. */}
      <Reveal delay={0.2}>
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

      {/* Live activity ticker — illustrative, not a real-time feed. Distinct
          pill chips, matching the reference (not a plain scrolling text row). */}
      <div className="overflow-hidden border-y border-border bg-paper-deep py-3" aria-label="Illustrative preview of Halo activity">
        <div className="flex w-max animate-[marquee_36s_linear_infinite] gap-3 px-4 motion-reduce:animate-none">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
            <span
              key={i}
              className="flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs text-ink-soft"
            >
              <span aria-hidden>{t.icon}</span>
              {t.text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
