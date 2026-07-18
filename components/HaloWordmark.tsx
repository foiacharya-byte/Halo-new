// The Halo wordmark. No logo image was supplied for the approved light
// design (the matched-assets pack is explicit that text stays coded, not
// baked into images), so this is a coded text wordmark, not a placeholder
// standing in for a missing file.

const SIZES = {
  full: "text-4xl sm:text-5xl",
  compact: "text-xl",
};

export function HaloWordmark({
  size = "full",
  className,
}: {
  size?: "full" | "compact";
  className?: string;
}) {
  return (
    <span className={`font-serif font-medium tracking-tight text-ink ${SIZES[size]} ${className ?? ""}`}>
      halo<span className="text-coral">!</span>
    </span>
  );
}
