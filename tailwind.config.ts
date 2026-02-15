import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sora)", "Sora", "ui-sans-serif", "system-ui"],
        display: [
          "var(--font-bricolage)",
          "Bricolage Grotesque",
          "ui-sans-serif",
          "system-ui",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
