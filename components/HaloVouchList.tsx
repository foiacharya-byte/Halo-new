import type { PublicVouch } from "@/lib/data/store";

export function HaloVouchList({ vouches }: { vouches: PublicVouch[] }) {
  if (vouches.length === 0) {
    return (
      <div className="rounded-halo border border-dashed border-border p-6 text-center">
        <p className="text-sm text-ink-soft">No reviewed community experience has been added yet.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-4" role="list">
      {vouches.map((v) => (
        <li key={v.id} className="rounded-halo border border-border bg-surface p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-medium text-ink">{v.contributorDisplay}</span>
            <span className="text-xs text-ink-faint">{v.monthYear}</span>
          </div>

          <dl className="mt-3 space-y-2 text-sm">
            <Row label="Used for">{v.useContext}</Row>
            <Row label="Used">{v.usedLabel}</Row>
            {v.areaName && <Row label="Area">{v.areaName}</Row>}
            <Row label="Useful detail">
              <span className="text-ink">{v.usefulDetail}</span>
            </Row>
            <Row label="Would use again">
              <span className={v.wouldUseAgain === "Yes" ? "text-good" : "text-ink"}>{v.wouldUseAgain}</span>
            </Row>
          </dl>

          <p className="mt-3 text-xs text-ink-faint">Reviewed Halo contribution</p>
        </li>
      ))}
    </ul>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <dt className="w-28 shrink-0 text-ink-faint">{label}</dt>
      <dd className="text-ink-soft">{children}</dd>
    </div>
  );
}
