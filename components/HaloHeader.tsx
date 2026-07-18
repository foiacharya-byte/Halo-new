"use client";

import Link from "next/link";
import { useState } from "react";
import { HaloWordmark } from "./HaloWordmark";
import { WaitlistTrigger } from "./home/WaitlistProvider";

const NAV_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "/business", label: "For businesses" },
  { href: "#reality", label: "About us" },
];

export function HaloHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-4 sm:px-6">
        <Link href="#top" aria-label="Halo — home">
          <HaloWordmark size="compact" />
        </Link>

        <nav className="hidden items-center gap-1 text-sm lg:flex" aria-label="Primary">
          {NAV_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="rounded-lg px-3 py-2 text-ink-soft transition-colors hover:bg-surface hover:text-ink">
              {l.label}
            </a>
          ))}
        </nav>

        <div className="hidden lg:block">
          <WaitlistTrigger className="rounded-full bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-ink">
            Join Halo
          </WaitlistTrigger>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface"
          >
            <MenuGlyph open={open} />
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" className="border-t border-border bg-paper px-4 pb-4 pt-2 lg:hidden" aria-label="Primary">
          <div className="flex flex-col">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-3 text-[15px] text-ink-soft hover:bg-surface hover:text-ink"
              >
                {l.label}
              </a>
            ))}
          </div>
          <div className="mt-2">
            <WaitlistTrigger className="block w-full rounded-full bg-accent px-5 py-2.5 text-center text-sm font-medium text-white">
              Join Halo
            </WaitlistTrigger>
          </div>
        </nav>
      )}
    </header>
  );
}

function MenuGlyph({ open }: { open: boolean }) {
  if (open) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
