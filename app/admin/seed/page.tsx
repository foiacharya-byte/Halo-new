import { getSeedMatrix, getSeedCandidates } from "@/lib/data/store";
import { getCategoryById } from "@/lib/data/categories";
import { getAreaById } from "@/lib/data/areas";
import { HaloSeedReview } from "@/components/HaloSeedReview";

export const dynamic = "force-dynamic";

const STATUS_CLS: Record<string, string> = {
  not_started: "bg-paper text-ink-faint",
  researching: "bg-warn-soft text-warn",
  review_required: "bg-warn-soft text-warn",
  partially_covered: "bg-warn-soft text-warn",
  covered: "bg-good-soft text-good",
  revisit_required: "bg-accent-soft text-accent-ink",
};

export default function AdminSeed() {
  const matrix = getSeedMatrix();
  const candidates = getSeedCandidates();

  return (
    <div className="space-y-12">
      <section>
        <h2 className="font-serif text-xl text-ink">Category × area seed matrix</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Research is planned per area × subcategory — never one broad “all businesses” query. Launch
          is not blocked by a complete matrix.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-ink-faint">
                <th className="py-2 pr-4">Area</th>
                <th className="py-2 pr-4">Category</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Found</th>
                <th className="py-2 pr-4">Approved</th>
              </tr>
            </thead>
            <tbody>
              {matrix.map((m) => (
                <tr key={m.id} className="border-b border-border">
                  <td className="py-2 pr-4 text-ink">{getAreaById(m.areaId)?.canonicalName}</td>
                  <td className="py-2 pr-4 text-ink-soft">{getCategoryById(m.categoryId)?.name}</td>
                  <td className="py-2 pr-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_CLS[m.status]}`}>
                      {m.status.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="py-2 pr-4 tabular-nums text-ink-soft">{m.candidatesFound}</td>
                  <td className="py-2 pr-4 tabular-nums text-ink-soft">{m.candidatesApproved}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-serif text-xl text-ink">Seed candidates</h2>
        <p className="mt-1 text-sm text-ink-soft">
          A high star rating alone never qualifies a candidate. Cross-source confirmation and rating
          thresholds apply. Approving creates a “Public listing” with no community vouch.
        </p>
        <ul className="mt-4 space-y-3">
          {candidates.map((c) => (
            <HaloSeedReview key={c.id} candidate={c} />
          ))}
        </ul>
      </section>
    </div>
  );
}
