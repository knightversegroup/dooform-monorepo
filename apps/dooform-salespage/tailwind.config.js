/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './{src,pages,components,app}/**/*.{ts,tsx,js,jsx,html}',
    '!./{src,pages,components,app}/**/*.{stories,spec}.{ts,tsx,js,jsx,html}',
  ],
  theme: {
    extend: {
      // Design Tokens from Figma
      colors: {
        primary: {
          navy: '#2C2585',
          DEFAULT: '#2C2585',
        },
        grey: {
          98: '#FDFDFD',
          border: '#E7E7E7',
        },
        // Figma color palette
        onyx: {
          DEFAULT: '#262626',
          100: '#2B2B2B',
        },
        carbon: {
          DEFAULT: '#4D4D4D',
          100: '#737373',
        },
        pearl: {
          DEFAULT: '#D4CEC4',
          100: '#C9C1B6',
        },
        sand: {
          DEFAULT: '#E6DED1',
          light: '#F4F3FC',
        },
        stroke: {
          DEFAULT: '#E6E6E6',
        },
      },
      fontFamily: {
        kanit: ['var(--font-kanit)', 'Kanit', 'sans-serif'],
        'ibm-plex-thai': ['var(--font-ibm-plex-thai)', 'IBM Plex Sans Thai', 'sans-serif'],
        'ibm-plex': ['var(--font-ibm-plex)', 'IBM Plex Sans', 'sans-serif'],
      },
      fontSize: {
        // Hero typography
        'hero-headline': ['36px', { lineHeight: '43px', fontWeight: '600' }],
        'hero-subheadline': ['24px', { lineHeight: 'auto', fontWeight: '500' }],
        // Nav typography
        'nav-link': ['16px', { lineHeight: '19px', fontWeight: '600' }],
        'nav-cta': ['14px', { lineHeight: '23px', fontWeight: '400' }],
        // Button typography
        'btn-hero': ['16px', { lineHeight: '26px', fontWeight: '500' }],
        // Section typography
        'section-title': ['36px', { lineHeight: '43px', fontWeight: '600' }],
        'section-subtitle': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'card-title': ['16px', { lineHeight: '24px', fontWeight: '600' }],
        'card-body': ['12px', { lineHeight: '18px', fontWeight: '400' }],
        'price': ['24px', { lineHeight: '32px', fontWeight: '700' }],
      },
      maxWidth: {
        'container': '1280px',
        'full-width': '1512px',
      },
      spacing: {
        // Navbar
        'nav-height': '83px',
        // Hero padding
        'hero-left': '94px',
        'hero-vertical': '64px',
        // Section spacing
        'section-y': '96px',
      },
      boxShadow: {
        'btn-subtle': '0px 2px 4px rgba(0, 0, 0, 0.05)',
        'card': '0px 4px 12px rgba(0, 0, 0, 0.08)',
      },
      borderRadius: {
        'pill': '100px',
        'card': '12px',
        'footer': '28px',
      },
      // Figma card dimensions
      width: {
        'pricing-card': '250px',
        'feature-card': '410px',
      },
      height: {
        'pricing-card': '400px',
        'feature-card': '333px',
      },
    },
  },
  plugins: [],
};
