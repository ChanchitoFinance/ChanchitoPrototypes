/**
 * Utility function for combining class names
 * Similar to clsx/classnames but simpler
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

