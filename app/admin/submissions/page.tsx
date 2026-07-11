import {
  listPendingVouches,
  listSubmissions,
  listClaims,
  getListingById,
} from "@/lib/data/store";
import { getCategoryById } from "@/lib/data/categories";
import { getAreaById } from "@/lib/data/areas";
import { isSpecificEnough } from "@/lib/moderation";
import { HaloModerationActions } from "@/components/HaloModerationActions";

export const dynamic = "force-dynamic";

export default function AdminSubmissions() {
  const vouches = listPendingVouches();
  const submissions = listSubmissions();
  const claims = listClaims();

  return (
    <div className="space-y-12">
      {/* Vouch moderation */}
      <section>
        <h2 className="font-serif text-xl text-ink">Pending vouches</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Check OTP status, specificity, self-vouch risk, and duplicate use before approving.
        </p>
        {vouches.length === 0 ? (
          <p className="mt-3 text-sm text-ink-faint">No pending vouches.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {vouches.map((v) => {
              const listing = getListingById(v.listingId);
              const specific = isSpecificEnough(v.useContext);
              return (
                <li key={v.id} className="rounded-halo border border-border bg-surface p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {listing?.displayName ?? "Listing"} — {v.contributorDisplay}
                      </p>
                      <p className="mt-1 text-sm text-ink-soft">Used for: {v.useContext}</p>
                      <p className="mt-1 text-sm text-ink-soft">Detail: {v.usefulDetail}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <span className={specific ? "text-good" : "text-accent"}>
                          {specific ? "✓ Specific enough" : "⚠ Vague — request clarification"}
                        </span>
                      </div>
                    </div>
                    <HaloModerationActions kind="vouch" id={v.id} />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Submission moderation */}
      <section>
        <h2 className="font-serif text-xl text-ink">User submissions</h2>
        {submissions.length === 0 ? (
          <p className="mt-3 text-sm text-ink-faint">No submissions yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {submissions.map((s) => {
              const dup = s.possibleDuplicateListingId
                ? getListingById(s.possibleDuplicateListingId)
                : undefined;
              return (
                <li key={s.id} className="rounded-halo border border-border bg-surface p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-ink">{s.proposedName}</p>
                      <p className="mt-1 text-xs text-ink-faint">
                        {getCategoryById(s.categoryId)?.name} ·{" "}
                        {getAreaById(s.primaryAreaId)?.canonicalName} · {s.proposedPhoneMasked}
                      </p>
                      <p className="mt-1 text-sm text-ink-soft">Used for: {s.useContext}</p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-paper px-2 py-0.5 text-ink-soft">
                          Permission: {permissionLabel(s.permissionBasis)}
                        </span>
                        <span className="rounded-full bg-paper px-2 py-0.5 text-ink-soft">
                          Status: {s.moderationStatus}
                        </span>
                        {dup && (
                          <span className="rounded-full bg-warn-soft px-2 py-0.5 text-warn">
                            Possible duplicate: {dup.displayName}
                          </span>
                        )}
                      </div>
                      {s.permissionBasis === "unsure" && (
                        <p className="mt-2 text-xs text-accent">
                          Number stored for verification only — do not publish until confirmed as a
                          public business number.
                        </p>
                      )}
                    </div>
                    {s.moderationStatus === "pending" && (
                      <HaloModerationActions kind="submission" id={s.id} />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Business requests */}
      <section>
        <h2 className="font-serif text-xl text-ink">Business requests</h2>
        {claims.length === 0 ? (
          <p className="mt-3 text-sm text-ink-faint">No business requests yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {claims.map((c) => (
              <li key={c.id} className="rounded-halo border border-border bg-surface p-4">
                <p className="text-sm font-medium text-ink">
                  {c.businessName} — <span className="capitalize">{c.claimType}</span>
                </p>
                <p className="mt-1 text-xs text-ink-faint">
                  By {c.claimantName}
                  {c.proofType ? ` · Proof: ${c.proofType}` : ""}
                  {c.proofReference ? ` (${c.proofReference})` : ""}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function permissionLabel(p: string): string {
  switch (p) {
    case "publicly_advertised":
      return "Publicly advertised";
    case "has_permission":
      return "Has permission";
    default:
      return "Unsure";
  }
}
