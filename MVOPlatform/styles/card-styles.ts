/**
 * Card styles - Uses Tailwind classes for consistency
 * Prefer using Tailwind utility classes directly in components
 * This file is kept for reference but should be migrated to Tailwind classes
 */

export const cardStyles = {
  base: 'bg-background border-2 border-border-color rounded-md p-6 shadow-sm transition-all duration-250',
  hover: 'hover:shadow-md hover:-translate-y-0.5',
  spacing: {
    vertical: 'py-6',
    horizontal: 'px-6',
  },
} as const
