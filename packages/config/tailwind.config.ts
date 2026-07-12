import type { Config } from 'tailwindcss';

/**
 * Tailwind CSS v4 configuration.
 *
 * Systematic design tokens live in `src/index.css` inside the `@theme` block.
 * The `pp-*` aliases below are legacy tokens kept for backward compatibility
 * during the P5.0 design-system convergence. They will be removed once all
 * component and page migrations are complete (tracked in
 * `docs/notes/p5-deprecated-components.md`).
 */
const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './apps/web/src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Legacy aliases — do not use in new code.
      colors: {
        'pp-primary': '#B87333',
        'pp-surface': '#F5F0EB',
        'pp-text': '#1E1E1E',
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
