import type { Config } from 'tailwindcss';

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        'pp-primary': '#B87333', // Rust Copper
        'pp-surface': '#F5F0EB', // Base Cream
        'pp-text': '#1E1E1E',    // Main Heading
      },
      borderRadius: {
        'pp-card': '8px',
      },
      spacing: {
        'pp-gap': '32px',
        'pp-pad': '24px',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        sans: ['var(--font-sans)', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
