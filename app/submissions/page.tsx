import { getContributorSubmissions, getListingById } from "@/lib/data/store";
import { getCategoryById } from "@/lib/data/categories";
import { getAreaById } from "@/lib/data/areas";
import { Eyebrow } from "@/components/ui";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending: { label: "Under review", cls: "bg-warn-soft text-warn" },
  needs_information: { label: "Needs information", cls: "bg-warn-soft text-warn" },
  approved: { label: "Approved & published", cls: "bg-good-soft text-good" },
  rejected: { label: "Not published", cls: "bg-paper text-ink-soft" },
  duplicate: { label: "Merged as duplicate", cls: "bg-paper text-ink-soft" },
  withdrawn: { label: "Withdrawn", cls: "bg-paper text-ink-soft" },
};

function Status({ status }: { status: string }) {
  const s = STATUS_LABEL[status] ?? { label: status, cls: "bg-paper text-ink-soft" };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${s.cls}`}>{s.label}</span>;
}

export default function SubmissionsPage() {
  const { submissions, vouches } = getContributorSubmissions();

  return (
    <div className="mx-auto max-w-prose px-4 py-8 sm:px-6">
      <Eyebrow>Your contributions</Eyebrow>
      <h1 className="mt-3 font-serif text-3xl text-ink">Submissions</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Track what you&rsquo;ve submitted. &ldquo;Under review&rdquo; is private to you — it never
        appears as a public trust state.
      </p>

      <section className="mt-8">
        <h2 className="font-serif text-xl text-ink">Numbers you added</h2>
        {submissions.length === 0 ? (
          <p className="mt-3 text-sm text-ink-faint">You haven&rsquo;t added any numbers yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {submissions.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-sm font-medium text-ink">{s.proposedName}</p>
                  <p className="text-xs text-ink-faint">
                    {getCategoryById(s.categoryId)?.name}
                    {" · "}
                    {getAreaById(s.primaryAreaId)?.canonicalName}
                    {" · "}
                    {s.proposedPhoneMasked}
                  </p>
                </div>
                <Status status={s.moderationStatus} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-xl text-ink">Vouches you added</h2>
        {vouches.length === 0 ? (
          <p className="mt-3 text-sm text-ink-faint">You haven&rsquo;t added any vouches yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border">
            {vouches.map((v) => {
              const listing = getListingById(v.listingId);
              return (
                <li key={v.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-ink">{listing?.displayName ?? "Listing"}</p>
                    <p className="text-xs text-ink-faint">Used for: {v.useContext}</p>
                  </div>
                  <Status status={v.moderationStatus} />
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
