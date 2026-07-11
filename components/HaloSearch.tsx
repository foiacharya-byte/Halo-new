"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

// One intelligent search surface. Submitting routes to /search?q=... where the
// server-side deterministic parser takes over.

export function HaloSearch({
  size = "hero",
  initialQuery = "",
}: {
  size?: "hero" | "compact";
  initialQuery?: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery);
  const [loading, setLoading] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (!query) return;
    setLoading(true);
    router.push(`/search?q=${encodeURIComponent(query)}`);
  }

  const isHero = size === "hero";

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
          placeholder="Try &lsquo;electrician in Gotri&rsquo; or paste a number"
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
