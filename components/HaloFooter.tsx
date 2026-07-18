import { HaloWordmark } from "./HaloWordmark";
import { WaitlistTrigger } from "./home/WaitlistProvider";

// Real contact details from the product owner's reference build
// (halovadodara@gmail.com, instagram.com/halovadodara) — not invented.

const FOOTER_LINKS = [
  { href: "#why", label: "Why Halo" },
  { href: "#work", label: "For Business" },
  { href: "#vision", label: "The Mission" },
  { href: "#gallery", label: "Vadodara" },
];

export function HaloFooter() {
  return (
    <footer id="footer" className="relative overflow-hidden bg-paper-deep/80 py-16 sm:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-[clamp(24px,5vw,80px)] top-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent"
      />
      <div className="relative mx-auto max-w-content px-4 sm:px-6">
        <p className="font-gu mb-8 text-center text-[clamp(32px,6vw,64px)] font-medium leading-none text-accent opacity-90 sm:mb-12">
          વડોદરા, હવે પોતાનું.
        </p>

        <div className="mx-auto mb-10 h-px max-w-content bg-ink/10 sm:mb-14" />

        <div className="mx-auto max-w-lg text-center">
          <HaloWordmark size="full" className="mx-auto" />
          <p className="mt-5 font-serif text-lg italic text-ink-soft sm:text-xl">
            Built for Vadodara, with Vadodara.
          </p>
          <p className="mt-2 text-[10.5px] font-semibold uppercase tracking-[0.28em] text-accent">
            Homegrown
          </p>
          <div className="mt-7 flex items-center justify-center gap-3.5">
            <a
              href="mailto:halovadodara@gmail.com"
              aria-label="Email halovadodara@gmail.com"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-accent text-white transition-transform hover:-translate-y-0.5"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 6-10 7L2 6" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/halovadodara/"
              target="_blank"
              rel="noopener"
              aria-label="Instagram"
              className="flex h-11 w-11 items-center justify-center rounded-full text-white transition-transform hover:-translate-y-0.5"
              style={{ background: "linear-gradient(45deg,#F9A03F 0%,#DB3D6E 48%,#8B3AB0 100%)" }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
              </svg>
            </a>
          </div>
        </div>

        <nav
          className="mx-auto mt-12 flex max-w-2xl flex-wrap items-center justify-center gap-x-8 gap-y-3 sm:mt-16"
          aria-label="Footer"
        >
          {FOOTER_LINKS.map((l) => (
            <a key={l.href} href={l.href} className="text-sm text-ink-soft transition-colors hover:text-ink">
              {l.label}
            </a>
          ))}
          <WaitlistTrigger className="text-sm font-medium text-accent transition-colors hover:text-ink">
            Join Waitlist →
          </WaitlistTrigger>
        </nav>

        <div className="mx-auto mt-12 h-px max-w-content bg-ink/10 sm:mt-16" />
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center">
          <p className="text-[13px] tracking-wide text-ink-soft">
            Made in Vadodara · {new Date().getFullYear()}
          </p>
          <span className="text-ink-faint">·</span>
          <p className="font-serif text-[13px] italic text-ink-faint">Vadodara deserves a place of its own.</p>
        </div>
      </div>
    </footer>
  );
}
