import Link from "next/link";
import { listAllListings } from "@/lib/data/store";
import { HaloListingState } from "@/components/HaloListingState";

export const dynamic = "force-dynamic";

export default function AdminListings() {
  const listings = listAllListings();

  return (
    <div>
      <h2 className="font-serif text-xl text-ink">Listing management</h2>
      <p className="mt-1 text-sm text-ink-soft">
        {listings.length} published listings. Duplicate resolution merges listings that share a
        phone hash, Google Place ID, or a close name in the same area/category.
      </p>

      <ul className="mt-4 divide-y divide-border rounded-halo border border-border">
        {listings.map((l) => (
          <li key={l.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <Link href={`/listing/${l.slug}`} className="text-sm font-medium text-ink hover:text-accent-ink">
                {l.displayName}
              </Link>
              <p className="text-xs text-ink-faint">
                {l.primaryCategory?.name}
                {l.primaryArea ? ` · ${l.primaryArea.name}` : ""} · {l.vouchCount} vouches ·{" "}
                {l.hasPublicContact ? "public number" : "no public number"}
              </p>
            </div>
            <HaloListingState state={l.publicState} businessManaged={l.businessManaged} size="sm" />
          </li>
        ))}
      </ul>
    </div>
  );
}
