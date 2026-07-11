import Link from "next/link";

// Compact light header. The logo sits on a matching light surface (no white
// rectangle) until a transparent vector exists.

export function HaloHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-content items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2" aria-label="Halo — Vadodara's local directory">
          <span
            className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-sm font-semibold text-white"
            aria-hidden
          >
            h
          </span>
          <span className="font-serif text-lg tracking-tight text-ink">Halo</span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm sm:flex" aria-label="Primary">
          <Link href="/search" className="rounded-lg px-3 py-2 text-ink-soft hover:bg-surface hover:text-ink">
            Browse
          </Link>
          <Link href="/add" className="rounded-lg px-3 py-2 text-ink-soft hover:bg-surface hover:text-ink">
            Add a trusted number
          </Link>
          <Link href="/business" className="rounded-lg px-3 py-2 text-ink-soft hover:bg-surface hover:text-ink">
            For businesses
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:hidden">
          <Link
            href="/search"
            aria-label="Search Halo"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface"
          >
            <SearchGlyph />
          </Link>
        </div>
      </div>
    </header>
  );
}

function SearchGlyph() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
