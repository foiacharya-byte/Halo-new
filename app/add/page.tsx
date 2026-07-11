import { HaloAddNumberFlow } from "@/components/HaloAddNumberFlow";
import { categoryOptions, areaOptions } from "@/lib/data/options";
import { Eyebrow } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function AddPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const initialName = typeof sp.name === "string" ? sp.name : "";

  return (
    <div className="mx-auto max-w-prose px-4 py-8 sm:px-6">
      <div className="mb-6">
        <Eyebrow>Give Vadodara a trusted number</Eyebrow>
        <h1 className="mt-3 font-serif text-3xl text-ink">Add a trusted number</h1>
        <p className="mt-2 text-sm text-ink-soft">
          If you have personally used a local service you would call again, add it here. We review
          every submission before it appears publicly. Only share a number that is publicly used for
          the service or that you have permission to submit.
        </p>
      </div>

      <HaloAddNumberFlow
        categoryOptions={categoryOptions()}
        areaOptions={areaOptions(false)}
        initialName={initialName}
      />
    </div>
  );
}
