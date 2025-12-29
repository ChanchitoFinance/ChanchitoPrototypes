/**
 * Shared style utilities and common class combinations
 * Single source of truth for frequently used style patterns
 */

/**
 * Common text styles
 */
export const textStyles = {
  heading1: 'text-4xl font-semibold text-text-primary',
  heading2: 'text-3xl font-semibold text-text-primary',
  heading3: 'text-2xl font-semibold text-text-primary',
  heading4: 'text-xl font-semibold text-text-primary',
  body: 'text-base text-text-secondary',
  bodyLarge: 'text-lg text-text-secondary',
  bodySmall: 'text-sm text-text-secondary',
  label: 'text-sm font-medium text-text-primary',
  caption: 'text-xs text-text-secondary',
  
  // Accent colors
  accent: 'text-accent',
  accentAlt: 'text-accent-alt',
  
  // Interactive states
  link: 'text-text-secondary hover:text-text-primary transition-colors',
  linkActive: 'text-text-primary',
} as const

/**
 * Common button/link styles
 */
export const interactiveStyles = {
  navLink: 'text-base font-normal text-text-secondary hover:text-text-primary transition-colors',
  navLinkActive: 'text-base font-normal text-text-primary',
  buttonSecondary: 'px-6 py-3 text-base font-medium text-text-secondary border-2 border-gray-100 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50',
  cardHover: 'hover:shadow-md hover:-translate-y-0.5 transition-all duration-250',
} as const

/**
 * Common container styles
 */
export const containerStyles = {
  card: 'bg-background border-2 border-border-color rounded-md p-6 shadow-sm',
  cardHover: 'bg-background border-2 border-border-color rounded-md p-6 shadow-sm hover:shadow-md transition-all duration-250',
  section: 'max-w-7xl mx-auto px-6',
  sectionPadding: 'py-12 md:py-24',
} as const

/**
 * Common spacing utilities
 */
export const spacingStyles = {
  sectionGap: 'space-y-6',
  cardGap: 'space-y-4',
  flexGap: 'gap-4',
  flexGapSmall: 'gap-2',
  flexGapLarge: 'gap-6',
} as const

