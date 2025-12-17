import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",   // ✅ THIS is the missing key
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",      // ✅ ensures components in lib are scanned
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#4C6EF5",   // Soft Indigo Blue
          accent: "#10B981",    // Soft Green
          text: "#1E293B",      // Deep Neutral Text
          subtext: "#64748B",   // Muted Gray Blue
          bg: "#F3F5F9",        // Soft Blue-Grey Background
          card: "#FFFFFF"       // Clean White Cards
        }
      }
    },
  },
  plugins: [],
};

export default config;