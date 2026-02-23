import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#07090f",
        surface: "#0c1119",
        card: "#101722",
        border: "#1a2535",
        accent: {
          DEFAULT: "#00d9ff",
          dim: "rgba(0,217,255,0.12)",
        },
        violet: {
          DEFAULT: "#8b5cf6",
          dim: "rgba(139,92,246,0.12)",
        },
        emerald: {
          defi: "#10b981",
        },
        amber: {
          defi: "#f59e0b",
        },
      },
      fontFamily: {
        mono: ["'IBM Plex Mono'", "monospace"],
        display: ["'Syne'", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 24px rgba(0,217,255,0.18)",
        "glow-sm": "0 0 12px rgba(0,217,255,0.12)",
        "glow-v": "0 0 24px rgba(139,92,246,0.18)",
      },
      animation: {
        "slide-up": "slideUp 0.4s ease forwards",
        "fade-in": "fadeIn 0.3s ease forwards",
        pulse2: "pulse2 2s ease-in-out infinite",
        scan: "scan 3s linear infinite",
      },
      keyframes: {
        slideUp: {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        pulse2: {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        scan: {
          from: { transform: "translateY(-100%)" },
          to: { transform: "translateY(100vh)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
