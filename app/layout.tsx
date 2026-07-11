import type { Metadata, Viewport } from "next";
import "./globals.css";
import { HaloHeader } from "@/components/HaloHeader";
import { HaloFooter } from "@/components/HaloFooter";

export const metadata: Metadata = {
  title: {
    default: "Halo — Vadodara's local directory",
    template: "%s · Halo",
  },
  description:
    "A simple local directory for finding useful people and services across Vadodara, strengthened by real experiences from people who have used them.",
};

export const viewport: Viewport = {
  themeColor: "#FBF9F5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-paper text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:shadow-card"
        >
          Skip to content
        </a>
        <HaloHeader />
        <main id="main">{children}</main>
        <HaloFooter />
      </body>
    </html>
  );
}
