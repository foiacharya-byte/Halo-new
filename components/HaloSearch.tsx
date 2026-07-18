"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// One intelligent search surface. Submitting routes to /search?q=... where the
// server-side deterministic parser takes over. This is the one search
// mechanism in the product — every scene/flow that needs search calls into
// this component and the /search pipeline behind it; nothing forks it.

export function HaloSearch({
  size = "hero",
  initialQuery = "",
  rotatingPlaceholders,
}: {
  size?: "hero" | "compact";
  initialQuery?: string;
  /** Optional set of example queries cycled through the placeholder (hero only). Purely cosmetic — never affects submitted behavior. */
  rotatingPlaceholders?: string[];
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const isHero = size === "hero";
  const cyclePlaceholders = isHero && rotatingPlaceholders && rotatingPlaceholders.length > 1;

  useEffect(() => {
    if (!cyclePlaceholders) return;
    const id = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % rotatingPlaceholders!.length);
    }, 2800);
    return () => clearInterval(id);
  }, [cyclePlaceholders, rotatingPlaceholders]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    setLoading(true);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  const placeholder = cyclePlaceholders
    ? `Try “${rotatingPlaceholders![placeholderIndex]}”`
    : "Try ‘electrician in Gotri’ or paste a number";

  return (
    <form onSubmit={submit} role="search" className="w-full">
      <div
        className={
          "flex items-center gap-2 rounded-halo border border-border bg-surface shadow-card focus-within:shadow-focus " +
          (isHero ? "p-2" : "p-1.5")
        }
      >
        <span className="pl-2 text-ink-faint" aria-hidden>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
        <label htmlFor="halo-search" className="sr-only">
          Search Halo
        </label>
        <input
          id="halo-search"
          type="search"
          inputMode="search"
          autoComplete="off"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={placeholder}
          className={
            "min-w-0 flex-1 bg-transparent text-ink placeholder:text-ink-faint focus:outline-none " +
            (isHero ? "px-1 py-2 text-base" : "px-1 py-1.5 text-[15px]")
          }
        />
        <button
          type="submit"
          disabled={loading || !q.trim()}
          className="shrink-0 rounded-[10px] bg-accent px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-ink disabled:opacity-50"
        >
          {loading ? "Searching…" : "Search Halo"}
        </button>
      </div>
    </form>
  );
}
