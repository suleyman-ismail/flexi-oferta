import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Map primary accent scale to Flexi Home brand Navy (#1B365D)
        indigo: {
          50: "#f1f5fa",
          100: "#dde6f3",
          200: "#bfd0e8",
          300: "#91afd7",
          400: "#5d87c2",
          500: "#35609e",
          600: "#1B365D",
          700: "#162c4d",
          800: "#122440",
          900: "#0e1c33",
          950: "#091222",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
