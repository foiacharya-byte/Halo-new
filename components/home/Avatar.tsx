// Deterministic initials avatar — replaces generic cartoon-clipart icon
// packs across the scroll-story. No fabricated faces, no stock illustration
// style; just a name's initial on a muted tint, picked consistently from
// the site's own palette so it always looks native, never like a borrowed
// icon set.
const TINTS = [
  { bg: "#E4EAE6", fg: "#173F31" }, // accent-soft / accent
  { bg: "#FFF6D9", fg: "#9C6508" }, // gold-soft / deep gold
  { bg: "#FFE7E1", fg: "#B23F2C" }, // coral-soft / deep coral
  { bg: "#E9DDF7", fg: "#5B3FA6" }, // lilac-soft / deep lilac
];

function tintFor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return TINTS[hash % TINTS.length];
}

export function Avatar({
  name,
  size = 32,
  className = "",
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const initial = name.trim()[0]?.toUpperCase() ?? "?";
  const { bg, fg } = tintFor(name);
  return (
    <span
      className={`inline-flex shrink-0 select-none items-center justify-center rounded-full font-serif font-medium leading-none ${className}`}
      style={{ width: size, height: size, background: bg, color: fg, fontSize: Math.round(size * 0.42) }}
      aria-hidden
    >
      {initial}
    </span>
  );
}
