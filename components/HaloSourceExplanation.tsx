// Concise, honest explanation of where trust comes from. Three states.

const ITEMS = [
  {
    title: "Public listing",
    body: "Basic public business information. No Halo community vouch yet.",
  },
  {
    title: "Business-managed",
    body: "Information submitted or updated by the provider.",
  },
  {
    title: "Community-vouched",
    body: "Reviewed experiences shared by people who personally used the service.",
  },
];

export function HaloSourceExplanation() {
  return (
    <section aria-labelledby="trust-heading">
      <h2 id="trust-heading" className="font-serif text-2xl text-ink">
        Clear about where trust comes from.
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {ITEMS.map((item) => (
          <div key={item.title} className="rounded-halo border border-border bg-surface p-5">
            <h3 className="text-sm font-semibold text-ink">{item.title}</h3>
            <p className="mt-2 text-sm text-ink-soft">{item.body}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-ink-faint">A listing can exist without being community-vouched.</p>
    </section>
  );
}
