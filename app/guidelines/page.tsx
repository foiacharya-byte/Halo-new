import { Eyebrow } from "@/components/ui";

export const metadata = { title: "Contribution guidelines" };

export default function GuidelinesPage() {
  return (
    <div className="mx-auto max-w-prose px-4 py-10 sm:px-6">
      <Eyebrow>Guidelines</Eyebrow>
      <h1 className="mt-3 font-serif text-3xl text-ink">Contribution guidelines</h1>

      <div className="mt-6 space-y-6 text-sm leading-relaxed text-ink-soft">
        <section>
          <h2 className="font-serif text-lg text-ink">Only vouch for what you used</h2>
          <p className="mt-2">
            Add a vouch only if you personally used the service. This is what makes Halo different
            from a list of ads.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-lg text-ink">Be specific</h2>
          <p className="mt-2">
            &ldquo;Repaired our ceiling-fan regulator&rdquo; helps the next person. &ldquo;Best,
            amazing, five stars&rdquo; does not — the system will ask you to add detail.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-lg text-ink">Respect privacy</h2>
          <p className="mt-2">
            Only submit a number that is publicly advertised for the service or that you have
            permission to share. Never submit a private household worker&rsquo;s number without
            clear permission.
          </p>
        </section>
        <section>
          <h2 className="font-serif text-lg text-ink">Every contribution is reviewed</h2>
          <p className="mt-2">
            Nothing is auto-published. We check for duplicates, specificity, self-vouching, and
            private-number risk before anything appears publicly.
          </p>
        </section>
      </div>
    </div>
  );
}
