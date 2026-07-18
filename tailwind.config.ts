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
        // Halo brand palette — sourced directly from the approved scroll-
        // story reference and its matched asset pack (colors read out of
        // the supplied SVGs: public/assets/halo/matched/). This is the
        // approved light design; the dark cinematic system from the
        // previous pass was a different, unapproved exploration and has
        // been reverted. Token *names* are kept stable across passes so
        // every page re-themes without a rewrite.
        paper: "#F5F1E8", // warm cream background (trust_shield.svg backing circle)
        "paper-deep": "#EDE6D6",
        surface: "#FFFFFF",
        border: "#D6D3CC", // message_bubble_01.svg stroke
        ink: "#27352F", // message_bubble_01.svg text strokes — dark charcoal-green, not literal black
        "ink-soft": "#5B6A63",
        "ink-faint": "#8E978F",
        accent: "#173F31", // forest green — halo_convergence_orb.svg core, trust_shield.svg icon strokes; primary brand/CTA
        "accent-soft": "#E4EAE6",
        "accent-ink": "#0E2921", // accent's hover/pressed shade
        gold: "#F2A826", // passing_line_localities.svg, sun_doodle.svg, halo_points badges
        "gold-soft": "#FFF6D9",
        coral: "#FF725B", // coral_sparkles.svg — search/discovery, no-result moments
        "coral-soft": "#FFE7E1",
        lilac: "#8E72D9", // join_lilac_blob.svg accent dot
        "lilac-soft": "#E9DDF7",
        good: "#173F31",
        "good-soft": "#E4EAE6",
        warn: "#B8790F",
        "warn-soft": "#FBEFD9",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
      },
      borderRadius: {
        halo: "14px",
      },
      maxWidth: {
        content: "68rem",
        prose: "44rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(39,53,47,0.04), 0 8px 24px -16px rgba(39,53,47,0.18)",
        focus: "0 0 0 3px rgba(23,63,49,0.28)",
      },
    },
  },
  plugins: [],
};

export default config;
