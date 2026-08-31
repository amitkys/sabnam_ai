import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        "dancing-script": ["var(--font-dancing-script)", "cursive"],
        brand: ["var(--font-dancing-script)", "cursive"],
      },
    },
  },
  plugins: [],
};

export default config;
