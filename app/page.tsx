import { HaloSearch } from "@/components/HaloSearch";
import { HaloCategoryIndex } from "@/components/HaloCategoryIndex";
import { HaloSourceExplanation } from "@/components/HaloSourceExplanation";
import { Button, Eyebrow } from "@/components/ui";

// The product IS the homepage: search first, then a calm contribution
// invitation, a compact category index, and a brief trust explanation.

export default function HomePage() {
  return (
    <div className="mx-auto max-w-content px-4 sm:px-6">
      {/* Hero */}
      <section className="pt-14 pb-10 sm:pt-20" aria-labelledby="hero-heading">
        <div className="mx-auto max-w-2xl text-center">
          <Eyebrow>Vadodara&rsquo;s local directory</Eyebrow>
          <h1 id="hero-heading" className="mt-4 font-serif text-4xl leading-tight text-ink sm:text-5xl">
            Who does Vadodara call?
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-ink-soft sm:text-base">
            Search by service, area, name or number. See what is publicly listed, what businesses
            have provided, and what people have personally vouched for.
          </p>
        </div>

        <div className="mx-auto mt-8 max-w-2xl">
          <HaloSearch size="hero" />
          <p className="mt-3 text-center text-sm text-ink-faint">
            Try: electrician in Gotri · tiffin near Alkapuri · tailor in Karelibaug
          </p>
        </div>
      </section>

      {/* Contribution invitation */}
      <section
        className="my-6 rounded-halo border border-border bg-surface p-6 sm:p-8"
        aria-labelledby="contribute-heading"
      >
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <h2 id="contribute-heading" className="font-serif text-xl text-ink">
              Know a number Vadodara should know?
            </h2>
            <p className="mt-2 text-sm text-ink-soft">
              If you have personally used a local service you would call again, add the name and
              number. Halo will review it before it appears publicly.
            </p>
            <p className="mt-2 text-xs text-ink-faint">
              Only share a number that is publicly used for the service or that you have permission
              to submit.
            </p>
          </div>
          <div className="shrink-0">
            <Button href="/add">Give Vadodara a trusted number</Button>
          </div>
        </div>
      </section>

      {/* Category index */}
      <section className="py-10">
        <HaloCategoryIndex />
      </section>

      {/* Trust explanation */}
      <section className="py-10">
        <HaloSourceExplanation />
      </section>
    </div>
  );
}
