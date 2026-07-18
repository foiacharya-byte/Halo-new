// The Halo wordmark. Real logo file, extracted from the product owner's
// own reference build (public/assets/halo/vadodara/supplied/logo-ae-halo.png
// — see ASSET_SOURCES.md). Two sizes: "full" for hero/footer brand moments,
// "compact" for the header.

const SIZES = {
  full: "h-16 sm:h-20",
  compact: "h-9 sm:h-10",
};

export function HaloWordmark({
  size = "full",
  className,
}: {
  size?: "full" | "compact";
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/assets/halo/vadodara/supplied/logo-ae-halo.png"
      alt="ae halo"
      className={`${SIZES[size]} w-auto ${className ?? ""}`}
    />
  );
}
