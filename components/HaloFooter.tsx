import Link from "next/link";
import { HaloWordmark } from "./HaloWordmark";

// Only real routes/anchors are linked here — no placeholder pages
// (Careers, Terms, Support, etc. from the reference layout don't exist in
// this app yet, so those columns are trimmed to what's actually real).
const COLUMNS: { heading: string; links: { href: string; label: string }[] }[] = [
  {
    heading: "For Users",
    links: [
      { href: "/search", label: "Search" },
      { href: "/add", label: "Add a trusted number" },
      { href: "#how-it-works", label: "How it works" },
      { href: "#points", label: "Halo Points" },
    ],
  },
  {
    heading: "For Businesses",
    links: [
      { href: "/business", label: "For businesses" },
      { href: "/guidelines", label: "Contribution guidelines" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/privacy", label: "Privacy & data rights" },
      { href: "/submissions", label: "Your submissions" },
    ],
  },
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
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-[1.3fr_1fr_1fr_1fr]">
          <div className="max-w-xs">
            <HaloWordmark size="full" />
            <p className="mt-3 text-sm text-ink-soft">Vadodara&rsquo;s trust network.</p>
            <p className="mt-3 text-sm text-ink-faint">
              A simple local directory for Vadodara, strengthened by real experiences from people who
              have used these services.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">{col.heading}</p>
              <nav className="mt-3 flex flex-col gap-2 text-sm" aria-label={col.heading}>
                {col.links.map((l) =>
                  l.href.startsWith("#") ? (
                    <a key={l.href} href={l.href} className="text-ink-soft transition-colors hover:text-ink">
                      {l.label}
                    </a>
                  ) : (
                    <Link key={l.href} href={l.href} className="text-ink-soft transition-colors hover:text-ink">
                      {l.label}
                    </Link>
                  )
                )}
              </nav>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-border pt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-faint">Follow us</p>
          <div className="mt-3 flex items-center gap-3">
            <a
              href="mailto:halovadodara@gmail.com"
              aria-label="Email halovadodara@gmail.com"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-white transition-transform hover:-translate-y-0.5"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 6-10 7L2 6" />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/halovadodara/"
              target="_blank"
              rel="noopener"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full text-white transition-transform hover:-translate-y-0.5"
              style={{ background: "linear-gradient(45deg,#F9A03F 0%,#DB3D6E 48%,#8B3AB0 100%)" }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="2" y="2" width="20" height="20" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
              </svg>
            </a>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-xs text-ink-faint">
          <p>
            Halo is a directory. It connects people with local services; it does not transact,
            deliver, or guarantee outcomes. Listings show what was independently verified and what
            was not.
          </p>
          <p className="mt-2">© {new Date().getFullYear()} Halo · Vadodara — Made with ♥ in Vadodara</p>
        </div>
      </div>
    </footer>
  );
}
