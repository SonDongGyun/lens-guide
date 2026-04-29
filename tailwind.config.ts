import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#F9FAFB",
          card: "#FFFFFF",
          muted: "#F2F4F6",
        },
        ink: {
          900: "#191F28",
          700: "#333D4B",
          500: "#4E5968",
          400: "#6B7684",
          300: "#8B95A1",
          200: "#B0B8C1",
          100: "#D1D6DB",
          50: "#E5E8EB",
        },
        brand: {
          DEFAULT: "#3182F6",
          dark: "#1B64DA",
          light: "#DBE8FE",
          soft: "#EBF3FF",
        },
        accent: {
          purple: "#7B61FF",
          mint: "#00C896",
          coral: "#FF6B6B",
          amber: "#FF8A00",
        },
      },
      fontFamily: {
        sans: ["var(--font-pretendard)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["80px", { lineHeight: "1.1", letterSpacing: "-0.04em", fontWeight: "700" }],
        "display-lg": ["64px", { lineHeight: "1.1", letterSpacing: "-0.03em", fontWeight: "700" }],
        "display": ["48px", { lineHeight: "1.15", letterSpacing: "-0.03em", fontWeight: "700" }],
        "headline": ["32px", { lineHeight: "1.25", letterSpacing: "-0.02em", fontWeight: "700" }],
        "title": ["24px", { lineHeight: "1.3", letterSpacing: "-0.02em", fontWeight: "600" }],
      },
      boxShadow: {
        soft: "0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.06)",
        card: "0 4px 16px rgba(15,23,42,0.06)",
        elevated: "0 12px 32px rgba(15,23,42,0.10)",
        glow: "0 0 0 6px rgba(49,130,246,0.12)",
      },
      borderRadius: {
        "2xl": "20px",
        "3xl": "24px",
        "4xl": "32px",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        shimmer: "shimmer 3s linear infinite",
        float: "float 4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
