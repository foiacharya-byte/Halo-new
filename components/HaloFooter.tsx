import Link from "next/link";
import { HaloWordmark } from "./HaloWordmark";
import { WaitlistTrigger } from "./home/WaitlistProvider";

const FOOTER_LINKS = [
  { href: "/search", label: "Browse the directory" },
  { href: "/add", label: "Add a trusted number" },
  { href: "/business", label: "For businesses" },
  { href: "/submissions", label: "Your submissions" },
  { href: "/guidelines", label: "Contribution guidelines" },
  { href: "/privacy", label: "Privacy & data rights" },
];

export function HaloFooter() {
  return (
    <footer className="relative mt-8 border-t border-border bg-paper-deep/60 pt-10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/assets/halo/matched/09_scene_footer/footer_wave_line.svg"
        alt=""
        aria-hidden
        className="pointer-events-none absolute -top-3 left-0 h-6 w-full opacity-60"
      />
      <div className="mx-auto max-w-content px-4 pb-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <HaloWordmark size="full" />
            <p className="mt-3 text-sm text-ink-soft">
              A simple local directory for Vadodara, strengthened by real experiences from people who
              have used these services.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href="mailto:halovadodara@gmail.com"
                aria-label="Email halovadodara@gmail.com"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white transition-transform hover:-translate-y-0.5"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 6-10 7L2 6" />
                </svg>
              </a>
              <a
                href="https://www.instagram.com/halovadodara/"
                target="_blank"
                rel="noopener"
                aria-label="Instagram"
                className="flex h-10 w-10 items-center justify-center rounded-full text-white transition-transform hover:-translate-y-0.5"
                style={{ background: "linear-gradient(45deg,#F9A03F 0%,#DB3D6E 48%,#8B3AB0 100%)" }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
                </svg>
              </a>
            </div>
          </div>

          <nav className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm" aria-label="Footer">
            {FOOTER_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-ink-soft transition-colors hover:text-ink">
                {l.label}
              </Link>
            ))}
            <WaitlistTrigger className="text-left font-medium text-accent transition-colors hover:text-accent-ink">
              Join Halo →
            </WaitlistTrigger>
          </nav>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-xs text-ink-faint">
          <p>
            Halo is a directory. It connects people with local services; it does not transact,
            deliver, or guarantee outcomes. Listings show what was independently verified and what
            was not.
          </p>
          <p className="mt-2">© {new Date().getFullYear()} Halo · Vadodara</p>
        </div>
      </div>
    </footer>
  );
}
