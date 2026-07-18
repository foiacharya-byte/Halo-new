import { getCategoryById } from "@/lib/data/categories";
import { getAreaById } from "@/lib/data/areas";
import { HaloModerationActions } from "./HaloModerationActions";
import type { SeedCandidate } from "@/lib/data/types";

function MatchPill({ label, status }: { label: string; status: string }) {
  const cls =
    status === "exact"
      ? "bg-good-soft text-good"
      : status === "conflicting" || status === "not_found"
      ? "bg-accent-soft text-accent-ink"
      : "bg-warn-soft text-warn";
  return <span className={`rounded-full px-2 py-0.5 text-xs ${cls}`}>{label}: {status}</span>;
}

export function HaloSeedReview({ candidate }: { candidate: SeedCandidate }) {
  const meetsRating =
    (candidate.googleRating ?? 0) >= 4.3 && (candidate.googleRatingCount ?? 0) >= 20;

  return (
    <li className="rounded-halo border border-border bg-surface p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">{candidate.proposedName}</p>
          <p className="mt-0.5 text-xs text-ink-faint">
            {getCategoryById(candidate.categoryId)?.name} ·{" "}
            {getAreaById(candidate.areaId)?.canonicalName}
            {candidate.googlePlaceId ? ` · ${candidate.googlePlaceId}` : ""}
          </p>

          {/* Google source — shown with attribution, separated from Halo trust. */}
          <div className="mt-2 rounded-lg border border-border bg-paper p-2 text-xs text-ink-soft">
            <p>
              Google: {candidate.googleRating?.toFixed(1) ?? "—"} ({candidate.googleRatingCount ?? 0}{" "}
              ratings) ·{" "}
              <span className={meetsRating ? "text-good" : "text-accent"}>
                {meetsRating ? "meets threshold" : "below threshold"}
              </span>{" "}
              · Powered by Google
            </p>
          </div>

          <div className="mt-2 flex flex-wrap gap-1.5">
            <MatchPill label="Phone" status={candidate.phoneMatch} />
            <MatchPill label="Name" status={candidate.nameMatch} />
            <MatchPill label="Area" status={candidate.areaMatch} />
            <span className="rounded-full bg-paper px-2 py-0.5 text-xs text-ink-soft">
              Confidence: {candidate.matchConfidence}
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {candidate.justdialUrl && (
              <a href={candidate.justdialUrl} rel="nofollow" className="text-accent-ink hover:underline">
                Justdial
              </a>
            )}
            {candidate.sulekhaUrl && (
              <a href={candidate.sulekhaUrl} rel="nofollow" className="text-accent-ink hover:underline">
                Sulekha
              </a>
            )}
            {candidate.officialUrl && (
              <a href={candidate.officialUrl} rel="nofollow" className="text-accent-ink hover:underline">
                Official site
              </a>
            )}
          </div>

          {candidate.reviewerNotes && (
            <p className="mt-2 text-xs italic text-ink-soft">{candidate.reviewerNotes}</p>
          )}
        </div>

        <div className="shrink-0 text-right">
          <span className="mb-2 block text-xs text-ink-faint">Status: {candidate.status}</span>
          <HaloModerationActions kind="seed" id={candidate.id} />
        </div>
      </div>
    </li>
  );
}
