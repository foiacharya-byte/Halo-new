import { notFound } from "next/navigation";
import { getListingById, toPublicListing } from "@/lib/data/store";
import { AREAS, ALL_VADODARA } from "@/lib/data/areas";
import { HaloVouchFlow } from "@/components/HaloVouchFlow";
import type { Option } from "@/components/HaloSelectors";

export const dynamic = "force-dynamic";

const areaOptions: Option[] = [ALL_VADODARA, ...AREAS].map((a) => ({
  id: a.id,
  label: a.canonicalName,
}));

export default async function VouchPage({ params }: { params: Promise<{ listingId: string }> }) {
  const { listingId } = await params;
  const raw = getListingById(listingId);
  if (!raw) notFound();
  const listing = toPublicListing(raw);

  return (
    <div className="mx-auto max-w-prose px-4 py-8 sm:px-6">
      <h1 className="sr-only">Add a vouch</h1>
      <HaloVouchFlow
        listingId={listing.id}
        listingSlug={listing.slug}
        listingName={listing.displayName}
        areaOptions={areaOptions}
      />
    </div>
  );
}
