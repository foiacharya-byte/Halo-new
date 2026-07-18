import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Halo brand palette — the dark cinematic "ae halo" system from the
        // product owner's own reference build (extracted 2026-07-18; see
        // public/assets/halo/vadodara/ASSET_SOURCES.md). This supersedes
        // the earlier light/editorial palette. Token *names* are kept
        // stable from the previous pass so existing components re-theme
        // without a rewrite; only the values changed.
        paper: "#0C0804", // page background (near-black, warm)
        "paper-deep": "#0A0603", // deeper background (fixed backdrop, footer)
        surface: "#160D06", // elevated dark surface (cards, inputs, secondary buttons)
        "panel-cream": "#F5EDE0", // the rare light-card-on-dark case (interactive demo panels)
        border: "#2E2013",
        ink: "#F0E4CC", // primary text — cream, not literal "ink" color, kept as the role name
        "ink-soft": "#C9BBA0",
        "ink-faint": "#8C7F68",
        accent: "#C2531F", // terracotta — primary action / the "ae" flourish
        "accent-soft": "#2A160C",
        "accent-ink": "#A1421A", // accent's hover/pressed shade
        gold: "#D4A443", // contribution / heritage highlight
        "gold-soft": "#2E2311",
        sand: "#CBB488", // muted UI accents
        good: "#4C9172",
        "good-soft": "#132119",
        warn: "#C9A227",
        "warn-soft": "#241D0A",
        coral: "#D2604B", // active-request / no-result moments
        "coral-soft": "#2B140E",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
        display: ["var(--font-display)", "Georgia", "serif"], // Bodoni Moda — major statements only
        script: ["var(--font-script)", "cursive"],
        gu: ["var(--font-gu)", "sans-serif"], // Mukta Vaani — Gujarati text
      },
      borderRadius: {
        halo: "14px",
      },
      maxWidth: {
        content: "68rem",
        prose: "44rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(0,0,0,0.2), 0 8px 24px -16px rgba(0,0,0,0.6)",
        focus: "0 0 0 3px rgba(194,83,31,0.35)",
      },
    },
  },
  plugins: [],
};

export default config;
