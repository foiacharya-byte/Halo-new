import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getListingBySlug,
  toPublicListing,
  computeSignalSummary,
  getApprovedPublicVouches,
} from "@/lib/data/store";
import { HaloListingState } from "@/components/HaloListingState";
import { HaloContactActions } from "@/components/HaloContactActions";
import { HaloExperienceSignals } from "@/components/HaloExperienceSignals";
import { HaloVouchList } from "@/components/HaloVouchList";
import { Button } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const raw = getListingBySlug(slug);
  if (!raw) notFound();

  const listing = toPublicListing(raw);
  const summary = computeSignalSummary(raw.id);
  const vouches = getApprovedPublicVouches(raw.id);
  const highStakes = listing.categories.some((c) => c.riskLevel === "high_stakes");
  const sensitive = listing.categories.some((c) => c.riskLevel === "sensitive");

  return (
    <div className="mx-auto max-w-prose px-4 py-8 sm:px-6">
      <Link href="/search" className="text-sm text-ink-soft hover:text-ink">
        ← Back to results
      </Link>

      {/* 1. Identity + 2. Trust state */}
      <header className="mt-4">
        <h1 className="font-serif text-3xl text-ink">{listing.displayName}</h1>
        <p className="mt-1 text-ink-soft">
          {listing.primaryCategory?.name}
          {listing.primaryArea ? ` · ${listing.primaryArea.name}` : ""}
        </p>
        {listing.serviceAreas.length > 0 && (
          <p className="mt-1 text-sm text-ink-faint">
            Also serves {listing.serviceAreas.map((a) => a.name).join(", ")}
          </p>
        )}
        <div className="mt-3">
          <HaloListingState state={listing.publicState} businessManaged={listing.businessManaged} />
        </div>
        <p className="mt-2 text-sm text-ink-soft">
          {listing.vouchCount > 0
            ? `${listing.vouchCount} reviewed ${listing.vouchCount === 1 ? "vouch" : "vouches"}`
            : "No community vouches yet."}
          {" · "}Updated {listing.updatedLabel}
        </p>
      </header>

      {(highStakes || sensitive) && (
        <div className="mt-4 rounded-halo border border-warn/30 bg-warn-soft/60 p-4 text-sm text-ink">
          {highStakes
            ? "This is a high-stakes category. Community experience does not imply professional competence, licensing, or medical/legal advice. Verify credentials and registration independently."
            : "This is a sensitive category. Please verify credentials and references independently before engaging."}
        </div>
      )}

      {/* 3. Contact actions */}
      <section className="mt-6 rounded-halo border border-border bg-surface p-5" aria-label="Contact">
        <HaloContactActions
          listingId={listing.id}
          masked={listing.contactPreview?.maskedValue ?? ""}
          hasPublicContact={listing.hasPublicContact}
          whatsapp={listing.contactPreview?.whatsapp}
        />
        <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
          <Button href={`/vouch/${listing.id}`} variant="secondary" size="sm">
            Add my vouch
          </Button>
          <Button href={`/business?claim=${listing.slug}`} variant="ghost" size="sm">
            Suggest a correction
          </Button>
        </div>
      </section>

      {/* 4. Why people used this service */}
      <section className="mt-8">
        <h2 className="font-serif text-xl text-ink">Why people used this service</h2>
        {listing.useReasons.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {listing.useReasons.map((r) => (
              <span
                key={r}
                className="rounded-full border border-border bg-surface px-3 py-1 text-sm text-ink-soft"
              >
                {r}
              </span>
            ))}
          </div>
        ) : (
          <div className="mt-3 rounded-halo border border-dashed border-border p-5">
            <p className="text-sm text-ink-soft">
              No reviewed community experience has been added yet.
            </p>
            <Button href={`/vouch/${listing.id}`} size="sm" className="mt-3">
              Be the first to vouch
            </Button>
          </div>
        )}
      </section>

      {/* 5. Halo community signals */}
      <section className="mt-8">
        <h2 className="font-serif text-xl text-ink">Halo community signals</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Based only on reviewed Halo contributions — not external ratings.
        </p>
        <div className="mt-3">
          <HaloExperienceSignals summary={summary} />
        </div>
      </section>

      {/* 6. Reviewed vouches */}
      <section className="mt-8">
        <h2 className="font-serif text-xl text-ink">From people who used the service</h2>
        <div className="mt-3">
          <HaloVouchList vouches={vouches} />
        </div>
      </section>

      {/* 7. Business information + 8. Information source */}
      <section className="mt-8 rounded-halo border border-border bg-surface p-5">
        <h2 className="font-serif text-lg text-ink">Information source</h2>
        <ul className="mt-3 space-y-2 text-sm text-ink-soft">
          {listing.sourceRefs.map((s, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="rounded-full bg-paper px-2 py-0.5 text-xs text-ink-faint">
                {sourceLabel(s.sourceType)}
              </span>
              {s.sourceUrl && (
                <a href={s.sourceUrl} className="text-accent-ink hover:underline" rel="nofollow">
                  Source reference
                </a>
              )}
            </li>
          ))}
        </ul>
        {listing.googlePlaceId && (
          <p className="mt-3 text-xs text-ink-faint">
            Public source reference: a Google Maps listing exists for this business. Any Google data,
            when shown, is kept separate from Halo community trust and is not a Halo rating.
            {" "}
            <span className="text-ink-faint">Powered by Google.</span>
          </p>
        )}
      </section>

      {/* 9. Correction and claim actions */}
      <section className="mt-8 flex flex-wrap gap-2">
        <Button href={`/business?claim=${listing.slug}`} variant="secondary" size="sm">
          List or claim this business
        </Button>
        <Button href={`/business?correct=${listing.slug}`} variant="ghost" size="sm">
          Suggest a correction
        </Button>
      </section>
    </div>
  );
}

function sourceLabel(type: string): string {
  switch (type) {
    case "google_places":
      return "Google (public source)";
    case "justdial":
      return "Justdial (cross-check)";
    case "sulekha":
      return "Sulekha (cross-check)";
    case "official_business":
      return "Official business source";
    case "user_contribution":
      return "Added by a contributor";
    case "provider_claim":
      return "Provider-managed";
    default:
      return type;
  }
}
