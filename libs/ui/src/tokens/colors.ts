/**
 * Dooform Salespage Color Palette
 *
 * Centralized color tokens extracted from the salespage.
 * Used as the source of truth for the design system.
 */

export const salespage = {
  brand: {
    purple: '#2c2585',
    purpleHover: '#231e6b',
    navy: '#1B1464',
    indigo: '#4338ca',
  },
  text: {
    dark: '#262626',
    body: '#4d4d4d',
    muted: '#737373',
  },
  surface: {
    white: '#ffffff',
    whiteSoft: '#fcfcfc',
    warm: '#f5f0ea',
    warmAlt: '#FAFAF8',
    neutral: '#f5f5f5',
  },
  border: {
    default: '#e7e7e7',
    warm: '#c9c1b6',
    divider: '#e5e0da',
    accordion: '#d4cec4',
  },
  cta: {
    lightBg: '#e4e4e4',
    lightHover: '#d4d4d4',
    darkBg: '#262626',
    darkHover: '#404040',
  },
  accent: {
    orange: '#ff8d28',
    navy: '#1b1464',
    sky: '#cce8f4',
    link: '#0088ff',
    grey: '#f1f1f0',
    panel: '#f0f8ff',
  },
} as const;

export type SalespageColors = typeof salespage;
