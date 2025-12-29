/**
 * Design tokens - Derived from CSS variables in globals.css
 * This file provides TypeScript access to design tokens
 * All values should match globals.css as the single source of truth
 */

export const designTokens = {
  colors: {
    background: '#FDFDFD',
    textPrimary: '#111111',
    textSecondary: '#6A6A6A',
    accent: '#66D3FF',
    accentAlt: '#CFF56A',
    white: '#FFFFFF',
    black: '#000000',
    borderColor: '#F3F4F6',
  },
  typography: {
    fontFamily: {
      primary: "'Inter', system-ui, sans-serif",
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
    },
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px',
      '5xl': '48px',
    },
    lineHeight: {
      tight: '1.2',
      normal: '1.5',
      relaxed: '1.75',
    },
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
    '4xl': '96px',
  },
  borderRadius: {
    sm: '2px',
    md: '4px',
    lg: '8px',
  },
  shadows: {
    card: '0 1px 3px rgba(0, 0, 0, 0.05)',
    hover: '0 4px 12px rgba(0, 0, 0, 0.08)',
  },
  transitions: {
    fast: '150ms ease',
    normal: '250ms ease',
    slow: '350ms ease',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
} as const
