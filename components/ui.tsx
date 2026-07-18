import Link from "next/link";
import type { ReactNode } from "react";

// Small shared primitives. shadcn is used only as infrastructure conceptually;
// these are custom, deliberately restrained components.

export function cn(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}

type ButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "ghost" | "coral";
  size?: "sm" | "md";
  disabled?: boolean;
  className?: string;
  full?: boolean;
};

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-halo font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none focus-visible:shadow-focus";

const buttonVariants: Record<string, string> = {
  primary: "bg-accent text-white hover:bg-accent-ink",
  secondary: "bg-surface text-ink border border-border hover:bg-paper",
  ghost: "text-ink-soft hover:text-ink hover:bg-paper",
  // Reserved for active-request / no-result moments (docs/HALO_ASSET_AUDIT.md §2).
  coral: "bg-coral text-white hover:bg-coral/90",
};

const buttonSizes: Record<string, string> = {
  sm: "text-sm px-3 py-1.5 min-h-[36px]",
  md: "text-[15px] px-5 py-2.5 min-h-[44px]",
};

export function Button({
  children,
  href,
  onClick,
  type = "button",
  variant = "primary",
  size = "md",
  disabled,
  className,
  full,
}: ButtonProps) {
  const classes = cn(
    buttonBase,
    buttonVariants[variant],
    buttonSizes[size],
    full && "w-full",
    className
  );
  if (href) {
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {children}
      </Link>
    );
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes}>
      {children}
    </button>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-accent-ink">{children}</p>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="font-serif text-2xl text-ink sm:text-[26px]">{children}</h2>;
}

export function Chip({ children, active }: { children: ReactNode; active?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-sm",
        active ? "border-accent bg-accent-soft text-accent-ink" : "border-border bg-surface text-ink-soft"
      )}
    >
      {children}
    </span>
  );
}
