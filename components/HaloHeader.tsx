"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HaloWordmark } from "./HaloWordmark";

// Floating pill nav + fixed logo, matching the reference build's .tnav/.bLogo
// pattern. The reference has three real pages (main/biz/mission); this pass
// keeps everything on the single scrolling homepage, so "For Business" and
// "Mission" point at in-page sections rather than separate routes — a
// deliberate simplification, not an oversight (see chat for why).

const NAV_LINKS = [
  { href: "#top", label: "For Barodians" },
  { href: "#work", label: "For Business" },
  { href: "#vision", label: "Mission" },
];

export function HaloHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 40);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <Link
        href="#top"
        aria-label="ae halo — home"
        className={
          "fixed left-[clamp(14px,4vw,40px)] top-[13px] z-[90] block transition-opacity " +
          (scrolled ? "opacity-100" : "opacity-0")
        }
      >
        <HaloWordmark size="compact" />
      </Link>

      <nav
        className="fixed inset-x-0 top-4 z-[88] mx-auto flex w-max max-w-[calc(100vw-32px)] items-center gap-0.5 rounded-full border border-ink/10 bg-paper/85 p-1 shadow-card backdrop-blur-xl max-[860px]:bottom-4 max-[860px]:top-auto"
        aria-label="Primary"
      >
        {NAV_LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className="whitespace-nowrap rounded-full px-4 py-2.5 text-[13.5px] font-medium text-ink-soft transition-colors hover:text-ink"
          >
            {l.label}
          </a>
        ))}
      </nav>
    </>
  );
}
