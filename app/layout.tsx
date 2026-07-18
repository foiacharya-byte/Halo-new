import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Playfair_Display, DM_Sans, Mukta_Vaani } from "next/font/google";
import "./globals.css";
import { HaloHeader } from "@/components/HaloHeader";
import { HaloFooter } from "@/components/HaloFooter";
import { MotionProvider } from "@/components/home/MotionProvider";
import { WaitlistProvider } from "@/components/home/WaitlistProvider";

// Dark cinematic "ae halo" type system, matching the product owner's own
// reference build (see docs/HALO_ASSET_AUDIT.md and
// public/assets/halo/vadodara/ASSET_SOURCES.md). Bodoni Moda carries major
// display statements; Playfair Display carries secondary emphasis/quotes;
// DM Sans is the interface/body sans; Mukta Vaani renders Gujarati text.
const bodoniModa = Bodoni_Moda({
  subsets: ["latin"],
  variable: "--font-display",
  style: ["normal", "italic"],
  weight: ["400", "500"],
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const muktaVaani = Mukta_Vaani({
  subsets: ["gujarati", "latin"],
  variable: "--font-gu",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "ae halo! — Vadodara deserves a place of its own",
    template: "%s · ae halo!",
  },
  description:
    "For what Vadodara trusts, loves, recommends, returns to, creates and celebrates. Built with Barodians, shaped by trust.",
};

export const viewport: Viewport = {
  themeColor: "#0C0804",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${bodoniModa.variable} ${playfair.variable} ${dmSans.variable} ${muktaVaani.variable}`}
    >
      <body className="min-h-screen bg-paper text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:shadow-card"
        >
          Skip to content
        </a>
        <MotionProvider>
          <WaitlistProvider>
            <HaloHeader />
            <main id="main">{children}</main>
            <HaloFooter />
          </WaitlistProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
