import { HaloBusinessFlow } from "@/components/HaloBusinessFlow";
import { categoryOptions, areaOptions } from "@/lib/data/options";
import { Eyebrow } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function BusinessPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const claimSlug = typeof sp.claim === "string" ? sp.claim : undefined;
  const correctSlug = typeof sp.correct === "string" ? sp.correct : undefined;
  const initialMode = correctSlug ? "correct" : claimSlug ? "claim" : null;

  return (
    <div className="mx-auto max-w-prose px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Eyebrow>For businesses</Eyebrow>
        <h1 className="mt-3 font-serif text-3xl text-ink">Manage how your business appears on Halo.</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Add accurate information or claim an existing profile. Community vouches remain separate.
        </p>
      </div>

      <HaloBusinessFlow
        categoryOptions={categoryOptions()}
        areaOptions={areaOptions(false)}
        initialMode={initialMode}
        initialListingSlug={claimSlug ?? correctSlug}
      />
    </div>
  );
}
