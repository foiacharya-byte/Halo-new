import Link from "next/link";
import type { SearchBranch } from "@/lib/search/parser";

// When a query carries more than one category or area, we do NOT blend results.
// We ask the user which they meant, and offer "View both".

export function HaloSearchBranchSelector({
  query,
  branches,
}: {
  query: string;
  branches: SearchBranch[];
}) {
  return (
    <div className="rounded-halo border border-border bg-surface p-6">
      <h2 className="font-serif text-xl text-ink">What are you looking for?</h2>
      <div className="mt-4 flex flex-col gap-2">
        {branches.map((b, i) => (
          <Link
            key={i}
            href={`/search?q=${encodeURIComponent(query)}&branch=${i}`}
            className="flex items-center justify-between rounded-halo border border-border px-4 py-3 text-[15px] text-ink transition-colors hover:border-accent hover:bg-accent-soft"
          >
            <span>{b.label}</span>
            <span aria-hidden className="text-ink-faint">→</span>
          </Link>
        ))}
        <Link
          href={`/search?q=${encodeURIComponent(query)}&both=1`}
          className="mt-1 text-center text-sm font-medium text-accent-ink hover:underline"
        >
          View both
        </Link>
      </div>
    </div>
  );
}
