import Link from "next/link";
import type { PublicListing } from "@/lib/data/store";
import { HaloListingState } from "./HaloListingState";

// Elegant list rows with separators — not a card grid.

export function HaloDirectoryRow({ listing }: { listing: PublicListing }) {
  const reasons = listing.useReasons;
  return (
    <li>
      <Link
        href={`/listing/${listing.slug}`}
        className="group flex flex-col gap-3 px-1 py-5 transition-colors hover:bg-surface/60 sm:px-2"
      >
        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
          <div className="min-w-0">
            <h3 className="font-serif text-lg text-ink group-hover:text-accent-ink">
              {listing.displayName}
            </h3>
            <p className="mt-0.5 text-sm text-ink-soft">
              {listing.primaryCategory?.name}
              {listing.primaryArea ? ` · ${listing.primaryArea.name}` : ""}
            </p>
          </div>
          <HaloListingState state={listing.publicState} businessManaged={listing.businessManaged} size="sm" />
        </div>

        <div className="text-sm text-ink-soft">
          {listing.vouchCount > 0 ? (
            <span>{listing.vouchCount} reviewed {listing.vouchCount === 1 ? "vouch" : "vouches"}</span>
          ) : (
            <span className="text-ink-faint">No community vouches yet</span>
          )}
          {reasons.length > 0 && (
            <span> · Often used for {reasons.slice(0, 3).join(", ")}.</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-faint">
          <span>
            {listing.hasPublicContact ? "Public business number available" : "Number not yet public"}
          </span>
          <span>Updated {listing.updatedLabel}</span>
          <span className="ml-auto text-accent-ink group-hover:underline">View details →</span>
        </div>
      </Link>
    </li>
  );
}

export function HaloDirectoryList({ listings }: { listings: PublicListing[] }) {
  return (
    <ul className="divide-y divide-border" role="list">
      {listings.map((l) => (
        <HaloDirectoryRow key={l.id} listing={l} />
      ))}
    </ul>
  );
}
