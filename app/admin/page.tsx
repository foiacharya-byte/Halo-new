import Link from "next/link";
import {
  listPendingVouches,
  listSubmissions,
  listClaims,
  listAllListings,
  getSeedCandidates,
  getZeroResultQueries,
} from "@/lib/data/store";
import { getCategoryById } from "@/lib/data/categories";
import { getAreaById } from "@/lib/data/areas";

export const dynamic = "force-dynamic";

function Stat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href} className="rounded-halo border border-border bg-surface p-5 hover:border-accent">
      <p className="text-3xl font-semibold text-ink">{value}</p>
      <p className="mt-1 text-sm text-ink-soft">{label}</p>
    </Link>
  );
}

export default function AdminOverview() {
  const pendingVouches = listPendingVouches();
  const submissions = listSubmissions().filter((s) => s.moderationStatus === "pending");
  const claims = listClaims();
  const listings = listAllListings();
  const candidates = getSeedCandidates().filter((c) => c.status === "pending");
  const zeroResults = getZeroResultQueries();

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="Pending vouches" value={pendingVouches.length} href="/admin/submissions" />
        <Stat label="Pending submissions" value={submissions.length} href="/admin/submissions" />
        <Stat label="Business requests" value={claims.length} href="/admin/submissions" />
        <Stat label="Published listings" value={listings.length} href="/admin/listings" />
        <Stat label="Seed candidates" value={candidates.length} href="/admin/seed" />
      </div>

      <section className="mt-10">
        <h2 className="font-serif text-xl text-ink">Zero-result searches</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Guide seed research, new aliases and missing areas. Phone lookups are never stored as raw
          digits.
        </p>
        {zeroResults.length === 0 ? (
          <p className="mt-3 text-sm text-ink-faint">No zero-result searches logged this session.</p>
        ) : (
          <ul className="mt-3 divide-y divide-border rounded-halo border border-border">
            {zeroResults.slice(0, 15).map((z) => (
              <li key={z.id} className="flex items-center justify-between px-4 py-2 text-sm">
                <span className="text-ink">“{z.normalizedQuery}”</span>
                <span className="text-xs text-ink-faint">
                  {getCategoryById(z.detectedCategoryId ?? "")?.name ?? "—"}
                  {z.detectedAreaId ? ` · ${getAreaById(z.detectedAreaId)?.canonicalName}` : ""}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
