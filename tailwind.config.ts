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
        // Halo brand palette — sourced from HALO_PROJECT_MEMORY.md §4
        // (the locked "ae halo" system), which outranks any other palette
        // per the explicit conflict-resolution order given for this build.
        paper: "#F8F2E7",
        "paper-deep": "#EBE0CD",
        surface: "#FFFFFF",
        border: "#E9E4DB",
        ink: "#2A1E11",
        "ink-soft": "#6E5A40",
        "ink-faint": "#93826B",
        accent: "#C2531F", // "terra" — primary action / the "ae" flourish
        "accent-soft": "#F3E2D8",
        "accent-ink": "#7A2E22", // "maroon" — headings/accents, and accent's hover/pressed shade
        gold: "#BE9A4E", // contribution / Halo Points highlight
        "gold-soft": "#F5EDD9",
        sand: "#CBB488", // muted UI accents
        good: "#2F6B4F",
        "good-soft": "#E6F0EA",
        warn: "#8A6D1F",
        "warn-soft": "#F3ECD8",
        // Gap-filling addition (memory file has no equivalent): a distinct
        // tone for active-request/no-result moments, kept clearly apart
        // from terra so "primary action" and "no result yet" never read as
        // the same color (docs/HALO_ASSET_AUDIT.md §2).
        coral: "#AD4A3C",
        "coral-soft": "#F1DEDA",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
        // Reserved for a 2-5 word flourish only (e.g. the "ae" in the
        // wordmark) — never for controls or paragraphs. No file loaded yet;
        // wire via next/font when the wordmark component needs it.
        script: ["var(--font-script)", "cursive"],
      },
      borderRadius: {
        halo: "14px",
      },
      maxWidth: {
        content: "68rem",
        prose: "44rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(31,27,22,0.04), 0 8px 24px -16px rgba(31,27,22,0.18)",
        focus: "0 0 0 3px rgba(194,83,31,0.22)",
      },
    },
  },
  plugins: [],
};

export default config;
