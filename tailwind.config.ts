import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        status: {
          open: "#3B82F6",
          triaged: "#8B5CF6",
          inprogress: "#4F46E5",
          onhold: "#F59E0B",
          resolved: "#059669",
          closed: "#6B7280",
        },
        priority: {
          critical: "#EF4444",
          high: "#F97316",
          medium: "#3B82F6",
          low: "#9CA3AF",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;