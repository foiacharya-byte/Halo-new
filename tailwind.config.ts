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
        // Halo — calm, warm, premium light theme.
        paper: "#FBF9F5",
        surface: "#FFFFFF",
        border: "#E9E4DB",
        ink: "#1F1B16",
        "ink-soft": "#6B6259",
        "ink-faint": "#948A7E",
        accent: "#B4471F", // restrained terracotta, a nod to Vadodara
        "accent-soft": "#F3E7E0",
        "accent-ink": "#8E3416",
        good: "#2F6B4F",
        "good-soft": "#E6F0EA",
        warn: "#8A6D1F",
        "warn-soft": "#F3ECD8",
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
        card: "0 1px 2px rgba(31,27,22,0.04), 0 8px 24px -16px rgba(31,27,22,0.18)",
        focus: "0 0 0 3px rgba(180,71,31,0.22)",
      },
    },
  },
  plugins: [],
};

export default config;
