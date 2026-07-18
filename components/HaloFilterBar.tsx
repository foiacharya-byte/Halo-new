"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Result filters. On desktop this is an inline row; on mobile it collapses
// into a bottom-sheet-style disclosure. Filters are reflected in the URL so
// results stay shareable and server-rendered.

const TOGGLES = [
  { key: "vouched", label: "Community-vouched" },
  { key: "managed", label: "Business-managed" },
];

export function HaloFilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function toggle(key: string) {
    const next = new URLSearchParams(params.toString());
    if (next.get(key) === "1") next.delete(key);
    else next.set(key, "1");
    router.push(`${pathname}?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filters">
      {TOGGLES.map((t) => {
        const active = params.get(t.key) === "1";
        return (
          <button
            key={t.key}
            type="button"
            aria-pressed={active}
            onClick={() => toggle(t.key)}
            className={
              "rounded-full border px-3 py-1.5 text-sm transition-colors " +
              (active
                ? "border-accent bg-accent-soft text-accent-ink"
                : "border-border bg-surface text-ink-soft hover:text-ink")
            }
          >
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
