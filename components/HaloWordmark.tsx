// The Halo wordmark, recreated in code from the supplied "ae halo!" logo
// (HALO_PROJECT_MEMORY.md §4: Fraunces serif + Caveat script "ae" flourish,
// terra/ink pairing). No raster logo file exists in the repo yet — this
// component IS the logo until one is supplied, not a placeholder standing
// in for it, so it can render crisply at any size without an image asset.
//
// Two locked-up sizes, matching the memory file's own ".mk / .mk-sm" split:
// "full" carries the "ae" script flourish (hero/footer brand moments);
// "compact" is "halo!" alone, sized for the header where the flourish
// would just be noise.

export function HaloWordmark({
  size = "full",
  className,
}: {
  size?: "full" | "compact";
  className?: string;
}) {
  if (size === "compact") {
    return (
      <span className={"font-serif text-lg tracking-tight text-ink " + (className ?? "")} aria-hidden>
        halo<span className="text-accent">!</span>
      </span>
    );
  }

  return (
    <span className={"relative inline-block " + (className ?? "")} aria-hidden>
      <span
        className="absolute -top-3 left-0 -rotate-6 font-script text-lg leading-none text-accent sm:-top-4 sm:text-xl"
        style={{ fontFamily: "var(--font-script), cursive" }}
      >
        ae
      </span>
      <span className="font-serif text-3xl leading-none text-ink sm:text-4xl">
        halo<span className="text-accent">!</span>
      </span>
    </span>
  );
}
