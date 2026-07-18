import type { Metadata, Viewport } from "next";
import { Fraunces, DM_Sans } from "next/font/google";
import "./globals.css";
import { HaloHeader } from "@/components/HaloHeader";
import { HaloFooter } from "@/components/HaloFooter";
import { MotionProvider } from "@/components/home/MotionProvider";
import { WaitlistProvider } from "@/components/home/WaitlistProvider";

// Type system for the approved light scroll-story design (reverted from an
// unapproved dark exploration — see public/assets/halo/matched/README_FIRST.md).
// Fraunces carries headlines; DM Sans carries interface/body text.
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Halo — What do you need in Vadodara?",
    template: "%s · Halo",
  },
  description:
    "Ask. Search. Get trusted answers from real people in Vadodara — verified, not scraped.",
};

export const viewport: Viewport = {
  themeColor: "#F5F1E8",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable}`}>
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
