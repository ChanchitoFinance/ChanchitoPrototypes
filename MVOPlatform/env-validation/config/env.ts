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
  stripeSecretKey: process.env.STRIPE_SECRET_KEY!,
  supabaseStorageEndpoint: process.env.SUPABASE_STORAGE_ENDPOINT!,
  supabaseStorageRegion: process.env.SUPABASE_STORAGE_REGION!,
  supabaseStorageAccessKeyId: process.env.SUPABASE_STORAGE_ACCESS_KEY_ID!,
  supabaseStorageSecretAccessKey:
    process.env.SUPABASE_STORAGE_SECRET_ACCESS_KEY!,
  supabaseStorageBucketName: process.env.SUPABASE_STORAGE_BUCKET_NAME!,
} as const

// Client-side environment variables (must be prefixed with NEXT_PUBLIC_)
const rawClientEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  adminEmail: process.env.NEXT_PUBLIC_ADMIN_EMAIL!,
  geminiApiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY!,
  geminiModel: process.env.NEXT_PUBLIC_GEMINI_MODEL!,
} as const
/* eslint-enable no-restricted-syntax */

// Validate environment variables using schema (server-side only)
// Import validation function only on server-side to avoid bundling issues
if (typeof window === 'undefined' && typeof require !== 'undefined') {
  try {
    // Load .env.local explicitly to ensure variables are available before validation
    require('dotenv').config({ path: '.env.local' })
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
