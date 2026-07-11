import { Button } from "./ui";

export function HaloEmptySearch({ query }: { query?: string }) {
  return (
    <div className="rounded-halo border border-dashed border-border bg-surface p-10 text-center">
      <h2 className="font-serif text-xl text-ink">No matching number yet.</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-soft">
        Try another area or service name. If you already know someone useful, add them to Halo.
      </p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button href={query ? `/add?name=${encodeURIComponent(query)}` : "/add"}>
          Give Vadodara a trusted number
        </Button>
        <Button href="/search" variant="secondary">
          Change search
        </Button>
      </div>
    </div>
  );
}
