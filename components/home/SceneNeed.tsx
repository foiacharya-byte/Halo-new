import { HaloSearch } from "@/components/HaloSearch";
import { Button, Eyebrow } from "@/components/ui";
import { PassingLinePath } from "./PassingLine";
import { Reveal } from "./Reveal";

// Scene 1 — The Need. The product's opening question, the real search box
// (unchanged behaviour), and a first look at The Passing Line running under
// it through real Vadodara locality names.

const EXAMPLE_QUERIES = [
  "AC repair in Gotri",
  "tailor in Karelibaug",
  "maths tutor in Manjalpur",
  "music teacher in Sama",
  "domestic help in Alkapuri",
];

const LINE_LOCALITIES = ["Gotri", "Akota", "Manjalpur", "Sama"];

export function SceneNeed() {
  return (
    <section id="need" className="pt-14 pb-16 sm:pt-20" aria-labelledby="hero-heading">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Vadodara&rsquo;s trusted local answers</Eyebrow>
          <h1 id="hero-heading" className="mt-4 font-serif text-4xl leading-tight text-ink sm:text-5xl">
            What do you need in Vadodara?
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft sm:text-base">
            Ask. Search. Get trusted answers from real people.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="mx-auto mt-8 max-w-2xl">
          <HaloSearch size="hero" rotatingPlaceholders={EXAMPLE_QUERIES} />
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <p className="text-sm text-ink-faint">
              Search first. If Halo does not know yet, you can post the request.
            </p>
            <Button href="/add" variant="secondary" size="sm">
              Pass on someone you trust
            </Button>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="mx-auto mt-10 max-w-xl">
          <PassingLinePath labels={LINE_LOCALITIES} />
        </div>
      </Reveal>
    </section>
  );
}
