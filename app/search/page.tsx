import { HaloSearch } from "@/components/HaloSearch";
import { HaloDirectoryList } from "@/components/HaloDirectoryList";
import { HaloSearchBranchSelector } from "@/components/HaloSearchBranchSelector";
import { HaloEmptySearch } from "@/components/HaloEmptySearch";
import { HaloFilterBar } from "@/components/HaloFilterBar";
import { search, searchBranch, type PublicListing } from "@/lib/data/store";

export const dynamic = "force-dynamic";

function applyFilters(listings: PublicListing[], params: URLSearchParams): PublicListing[] {
  let out = listings;
  if (params.get("vouched") === "1") out = out.filter((l) => l.publicState === "community_vouched");
  if (params.get("managed") === "1") out = out.filter((l) => l.businessManaged);
  return out;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const branchParam = typeof sp.branch === "string" ? sp.branch : undefined;
  const both = sp.both === "1";
  const params = new URLSearchParams(
    Object.entries(sp).flatMap(([k, v]) => (typeof v === "string" ? [[k, v]] : []))
  );

  if (!q) {
    return (
      <div className="mx-auto max-w-content px-4 py-8 sm:px-6">
        <HaloSearch size="compact" />
        <div className="mt-8">
          <HaloEmptySearch />
        </div>
      </div>
    );
  }

  // Resolve results based on branch selection state.
  let result = search(q);
  let grouped = result.groupedResults;

  const needsBranch = result.requiresBranchSelection && branchParam === undefined && !both;

  if (result.requiresBranchSelection && branchParam !== undefined) {
    const idx = Number(branchParam) || 0;
    result = searchBranch(q, idx);
    grouped = undefined;
  }

  return (
    <div className="mx-auto max-w-content px-4 py-6 sm:px-6">
      {/* Sticky search on mobile */}
      <div className="sticky top-14 z-30 -mx-4 bg-paper/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
        <HaloSearch size="compact" initialQuery={q} />
      </div>

      {needsBranch ? (
        <div className="mt-6">
          <HaloSearchBranchSelector query={q} branches={result.branches} />
        </div>
      ) : (
        <div className="mt-6 lg:grid lg:grid-cols-[220px_1fr] lg:gap-10">
          {/* Filter column */}
          <aside className="mb-4 lg:mb-0">
            <h2 className="mb-3 text-sm font-semibold text-ink">Filters</h2>
            <HaloFilterBar />
          </aside>

          <div>
            <header className="mb-4">
              <h1 className="font-serif text-2xl text-ink">
                {result.branches[0]?.label ?? `Results for “${q}”`}
              </h1>
              <p className="mt-1 text-sm text-ink-soft">
                Showing local listings and reviewed community context.
              </p>
            </header>

            {grouped && both ? (
              <div className="space-y-8">
                {grouped.map((g) => {
                  const filtered = applyFilters(g.results, params);
                  return (
                    <section key={g.label}>
                      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-ink-faint">
                        {g.label}
                      </h2>
                      {filtered.length ? (
                        <HaloDirectoryList listings={filtered} />
                      ) : (
                        <p className="py-4 text-sm text-ink-faint">No listings yet.</p>
                      )}
                    </section>
                  );
                })}
              </div>
            ) : (
              (() => {
                const filtered = applyFilters(result.results, params);
                return filtered.length ? (
                  <HaloDirectoryList listings={filtered} />
                ) : (
                  <HaloEmptySearch query={q} />
                );
              })()
            )}
          </div>
        </div>
      )}
    </div>
  );
}
