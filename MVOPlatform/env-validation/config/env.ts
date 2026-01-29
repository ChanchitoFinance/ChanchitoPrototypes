/**
 * Centralized environment variables configuration
 * All environment variable access should go through this file
 *
 * ESLint rule blocks direct process.env access elsewhere in the codebase
 *
 * Uses ChanchitoTools.EnvValidation for schema-based validation
 */

// Server-side environment variables
const rawServerEnv = {
  nextAuthUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  supabaseStorageEndpoint: process.env.SUPABASE_STORAGE_ENDPOINT!,
  paypalClientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
  paypalEnvironment: process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT!,
  paypalClientSecret: process.env.PAYPAL_CLIENT_SECRET,
  paypalMerchantId: process.env.PAYPAL_MERCHANT_ID,
  paypalEnableFunding: process.env.PAYPAL_ENABLE_FUNDING,
  paypalDisableFunding: process.env.PAYPAL_DISABLE_FUNDING,
  supabaseStorageRegion: process.env.SUPABASE_STORAGE_REGION!,
  supabaseStorageAccessKeyId: process.env.SUPABASE_STORAGE_ACCESS_KEY_ID!,
  supabaseStorageSecretAccessKey:
    process.env.SUPABASE_STORAGE_SECRET_ACCESS_KEY!,
  supabaseStorageBucketName: process.env.SUPABASE_STORAGE_BUCKET_NAME!,
  serpapiApiKey: process.env.SERPAPI_API_KEY!,
  openaiApiKey: process.env.OPENAI_API_KEY!,
  openaiOrgId: process.env.OPENAI_ORG_ID!,
} as const

// Client-side environment variables (must be prefixed with NEXT_PUBLIC_)
const rawClientEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  paypalClientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
  paypalEnvironment: process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT!,
  paypalCurrency: process.env.NEXT_PUBLIC_PAYPAL_CURRENCY!,
  paypalIntent: process.env.NEXT_PUBLIC_PAYPAL_INTENT!,
  paypalLocale: process.env.NEXT_PUBLIC_PAYPAL_LOCALE!,
} as const

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
