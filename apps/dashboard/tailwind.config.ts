import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
    "../../packages/convex/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        halo: "0 22px 80px -36px rgba(15, 23, 42, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;

