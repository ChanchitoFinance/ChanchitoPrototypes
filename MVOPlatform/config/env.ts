/**
 * Centralized environment variables configuration
 * All environment variable access should go through this file
 * 
 * ESLint rule blocks direct process.env access elsewhere in the codebase
 * 
 * Uses ChanchitoTools.EnvValidation for schema-based validation
 */

// Server-side environment variables
/* eslint-disable no-restricted-syntax */
const rawServerEnv = {
  googleClientId: process.env.GOOGLE_CLIENT_ID!,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  nextAuthUrl: process.env.NEXTAUTH_URL!,
  nextAuthSecret: process.env.NEXTAUTH_SECRET!,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY!,
} as const

// Client-side environment variables (must be prefixed with NEXT_PUBLIC_)
const rawClientEnv = {
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  adminEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL!,
} as const
/* eslint-enable no-restricted-syntax */

// Validate environment variables using schema (server-side only)
// Import validation function only on server-side to avoid bundling issues
if (typeof window === 'undefined' && typeof require !== 'undefined') {
  try {
    // Use dynamic import with require to ensure it's only loaded server-side
    const validationModule = require('./env.validation')
    validationModule.validateEnvironmentVariables()
  } catch (error) {
    // Silently fail if validation module can't be loaded
    // This allows the app to work even if validation dependencies aren't available
  }
}

// Export validated environment variables
export const serverEnv = rawServerEnv
export const clientEnv = rawClientEnv
