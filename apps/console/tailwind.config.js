const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}',
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: {
        // Linear-flavored indigo. Single accent, used sparingly for primary actions
        // and focus rings; everything else stays monochrome.
        primary: {
          DEFAULT: '#5e6ad2',
          hover: '#4f5acb',
          subtle: '#f0f1fb',
        },
        // Page + surface scale.
        bg: {
          DEFAULT: '#fafafa',          // page
          subtle: '#f4f4f5',           // sidebar, hover, muted areas
          muted: '#f0f0f1',            // pressed / chip
        },
        surface: {
          DEFAULT: '#ffffff',
          alt: '#f4f4f5',              // legacy alias kept so existing classes still work
        },
        // Hairline borders.
        border: {
          DEFAULT: '#d4d4d4',
          subtle: '#e6e6e6',
          default: '#d4d4d4',          // legacy alias
        },
        // Text scale.
        ink: {
          DEFAULT: '#0f0f10',          // headings
          subtle: '#3f3f46',
          muted: '#6b7280',
          faint: '#9ca3af',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          'Noto Sans Thai',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      letterSpacing: {
        tightish: '-0.005em',
      },
      borderRadius: {
        DEFAULT: '6px',
      },
      ringColor: {
        DEFAULT: '#5e6ad2',
      },
      boxShadow: {
        // No drop shadows in Linear; keep this for one-off floating menus.
        pop: '0 1px 2px rgba(0,0,0,0.04), 0 6px 24px rgba(15,15,16,0.08)',
      },
    },
  },
  plugins: [],
};
