import { cn } from "./ui";
import type { PublicState } from "@/lib/data/types";

// Public trust-state badges. "Under review" is intentionally NOT a public
// state — it lives only in contributor and admin surfaces.

const STATES: Record<
  PublicState,
  { label: string; className: string; dot: string }
> = {
  community_vouched: {
    label: "Community-vouched",
    className: "bg-good-soft text-good border-good/20",
    dot: "bg-good",
  },
  business_managed: {
    label: "Business-managed",
    className: "bg-warn-soft text-warn border-warn/20",
    dot: "bg-warn",
  },
  public_listing: {
    label: "Public listing",
    className: "bg-paper text-ink-soft border-border",
    dot: "bg-ink-faint",
  },
};

export function HaloListingState({
  state,
  businessManaged,
  size = "md",
}: {
  state: PublicState;
  businessManaged?: boolean;
  size?: "sm" | "md";
}) {
  // A listing can be BOTH community-vouched and business-managed — show both.
  const badges: PublicState[] = [];
  badges.push(state);
  if (businessManaged && state !== "business_managed") badges.push("business_managed");

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {badges.map((s) => {
        const cfg = STATES[s];
        return (
          <span
            key={s}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border font-medium",
              size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-[13px]",
              cfg.className
            )}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} aria-hidden />
            {cfg.label}
          </span>
        );
      })}
    </div>
  );
}
