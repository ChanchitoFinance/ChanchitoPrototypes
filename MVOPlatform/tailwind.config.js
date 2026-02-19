/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // All colors from globals.css CSS variables
        background: 'var(--background)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'premium-cta': 'var(--premium-cta)',
        'primary-accent': 'var(--primary-accent)',
        accent: 'var(--accent)',
        'accent-alt': 'var(--accent-alt)',
        'hover-accent': 'var(--hover-accent)',
        error: 'var(--error)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        white: 'var(--white)',
        black: 'var(--black)',
        'border-color': 'var(--border-color)',
        gray: {
          50: 'var(--gray-50)',
          100: 'var(--gray-100)',
          200: 'var(--gray-200)',
        },
      },
      fontFamily: {
        sans: ['var(--font-family-primary)'],
      },
      fontWeight: {
        normal: 'var(--font-weight-normal)',
        medium: 'var(--font-weight-medium)',
        semibold: 'var(--font-weight-semibold)',
      },
      fontSize: {
        xs: 'var(--font-size-xs)',
        sm: 'var(--font-size-sm)',
        base: 'var(--font-size-base)',
        lg: 'var(--font-size-lg)',
        xl: 'var(--font-size-xl)',
        '2xl': 'var(--font-size-2xl)',
        '3xl': 'var(--font-size-3xl)',
        '4xl': 'var(--font-size-4xl)',
        '5xl': 'var(--font-size-5xl)',
      },
      lineHeight: {
        tight: 'var(--line-height-tight)',
        normal: 'var(--line-height-normal)',
        relaxed: 'var(--line-height-relaxed)',
      },
      spacing: {
        xs: 'var(--spacing-xs)',
        sm: 'var(--spacing-sm)',
        md: 'var(--spacing-md)',
        lg: 'var(--spacing-lg)',
        xl: 'var(--spacing-xl)',
        '2xl': 'var(--spacing-2xl)',
        '3xl': 'var(--spacing-3xl)',
        '4xl': 'var(--spacing-4xl)',
        'card-padding': 'var(--spacing-lg)',
        'section-padding': 'var(--spacing-2xl)',
      },
      borderRadius: {
        sm: 'var(--border-radius-sm)',
        md: 'var(--border-radius-md)',
        lg: 'var(--border-radius-lg)',
        card: 'var(--border-radius-md)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        hover: 'var(--shadow-hover)',
      },
      transitionDuration: {
        fast: '150ms',
        normal: '250ms',
        slow: '350ms',
      },
      transitionTimingFunction: {
        'ease-fast': 'ease',
        'ease-normal': 'ease',
        'ease-slow': 'ease',
      },
    },
  },
  plugins: [],
}
