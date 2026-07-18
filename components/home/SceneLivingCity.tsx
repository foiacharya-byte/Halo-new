// Scene 9 — Living City ribbon. Explicitly labelled illustrative preview
// per the spec's own instruction: real area names (lib/data/areas.ts), but
// no claim these are real live events, since no live activity feed exists
// yet (docs/HALO_ASSET_AUDIT.md — "no fake live activity").

const PREVIEW_ITEMS = [
  "Gotri · contact reconfirmed",
  "Sama · request answered",
  "Akota · trusted number passed on",
  "Manjalpur · verification completed",
  "Alkapuri · new contact added",
];

export function SceneLivingCity() {
  return (
    <div className="border-y border-border bg-paper-deep py-3" aria-label="Illustrative preview of Halo activity across Vadodara">
      <div className="mx-auto flex max-w-content items-center gap-3 overflow-x-auto px-4 sm:px-6">
        <span className="shrink-0 rounded-full border border-ink-faint/30 px-2.5 py-1 text-[11px] font-medium uppercase tracking-wide text-ink-faint">
          Illustrative preview
        </span>
        <ul className="flex shrink-0 items-center gap-6 text-sm text-ink-soft" role="list">
          {PREVIEW_ITEMS.map((item) => (
            <li key={item} className="whitespace-nowrap">
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
