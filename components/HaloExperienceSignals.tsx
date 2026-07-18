import type { SignalSummary } from "@/lib/data/store";

// Refined horizontal measures — no giant stars, no single overall score, no
// radar charts. Only shown once thresholds are met.

function Measure({ label, value }: { label: string; value: number | null }) {
  const pct = value ? (value / 5) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-40 shrink-0 text-sm text-ink-soft">{label}</span>
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-border" aria-hidden>
        <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-16 shrink-0 text-right text-sm tabular-nums text-ink">
        {value ? value.toFixed(1) : "—"}
      </span>
    </div>
  );
}

export function HaloExperienceSignals({ summary }: { summary: SignalSummary }) {
  if (!summary.ready) {
    return (
      <div className="rounded-halo border border-border bg-surface p-5">
        <p className="text-sm text-ink-soft">Community experience is still forming.</p>
        <p className="mt-1 text-xs text-ink-faint">
          A full five-signal summary appears once at least {5} reviewed vouches exist.
          {summary.vouchCount > 0 && ` (${summary.vouchCount} so far.)`}
        </p>
      </div>
    );
  }

  const wua = summary.wouldUseAgain;
  const wuaTotal = wua ? wua.yes + wua.no + wua.notSure : 0;

  return (
    <div className="rounded-halo border border-border bg-surface p-5">
      <div className="space-y-3">
        {summary.dimensions.map((d) => (
          <Measure key={d.key} label={d.label} value={d.average} />
        ))}
      </div>

      {wua && wuaTotal > 0 && (
        <div className="mt-5 border-t border-border pt-4">
          <p className="text-sm font-medium text-ink">Would use again</p>
          <div className="mt-2 flex gap-4 text-sm text-ink-soft">
            <span>
              <span className="font-semibold text-good">{Math.round((wua.yes / wuaTotal) * 100)}%</span> yes
            </span>
            <span>{Math.round((wua.notSure / wuaTotal) * 100)}% not sure</span>
            <span>{Math.round((wua.no / wuaTotal) * 100)}% no</span>
          </div>
        </div>
      )}

      <p className="mt-4 text-xs text-ink-faint">Based only on reviewed Halo contributions.</p>
    </div>
  );
}
