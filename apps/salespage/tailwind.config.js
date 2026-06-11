/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}',
    '!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',
    // Pull in classes used by the shared @dooform/ui components.
    '../../libs/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        'df-orange': '#ff8d28',
        'df-navy': '#1b1464',
        'df-sky': '#cce8f4',
        'df-link': '#0088ff',
        'df-grey': '#f1f1f0',
        'df-panel': '#f0f8ff',
      },
      fontFamily: {
        inter: ['var(--font-inter)', 'sans-serif'],
        sans: [
          'var(--font-ibm-plex-sans-thai)',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
