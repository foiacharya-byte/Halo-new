import Link from "next/link";
import { SocialLinks } from "@/components/ui/social-links";
import { HaloWordmark } from "./HaloWordmark";

const haloSocials = [
  { name: "Instagram", image: "/social/instagram.svg" },
  { name: "X", image: "/social/x.svg" },
  { name: "WhatsApp", image: "/social/whatsapp.svg" },
  { name: "LinkedIn", image: "/social/linkedin.svg" },
];

export function HaloFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-paper">
      <div className="mx-auto max-w-content px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <HaloWordmark size="full" />
            <p className="mt-4 text-sm text-ink-soft">
              A simple local directory for Vadodara, strengthened by real experiences from people
              who have used these services.
            </p>
            <SocialLinks socials={haloSocials} className="mt-6 justify-start" />
          </div>

          <nav className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm" aria-label="Footer">
            <FooterLink href="/search">Browse the directory</FooterLink>
            <FooterLink href="/add">Add a trusted number</FooterLink>
            <FooterLink href="/business">For businesses</FooterLink>
            <FooterLink href="/submissions">Your submissions</FooterLink>
            <FooterLink href="/guidelines">Contribution guidelines</FooterLink>
            <FooterLink href="/privacy">Privacy & data rights</FooterLink>
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

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-ink-soft hover:text-ink">
      {children}
    </Link>
  );
}
