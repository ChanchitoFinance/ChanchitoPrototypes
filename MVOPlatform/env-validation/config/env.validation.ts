/**
 * Server-side environment variable validation
 * This file is only imported and executed on the server
 * Uses ChanchitoTools.EnvValidation for schema-based validation
 */
/* eslint-disable no-restricted-syntax */

export function validateEnvironmentVariables() {
  if (typeof window !== 'undefined') {
    // Skip validation on client-side
    return
  }

  // Only run validation in Node.js environment
  if (typeof require === 'undefined') {
    return
  }

  try {
    // Dynamic require to avoid bundler issues
    const path = require('path')
    const adapter = require('../javascript_adapter.js')
    const EnvValidator = adapter.EnvValidator

    // Get the path to lua files relative to project root
    const luaPath = path.join(process.cwd(), 'env-validation', 'lua')
    const validator = new EnvValidator(luaPath)

    // Use process.env directly for validation (matches schema keys)
    const envVarsForValidation = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_STORAGE_ENDPOINT: process.env.SUPABASE_STORAGE_ENDPOINT,
      SUPABASE_STORAGE_REGION: process.env.SUPABASE_STORAGE_REGION,
      SUPABASE_STORAGE_ACCESS_KEY_ID:
        process.env.SUPABASE_STORAGE_ACCESS_KEY_ID,
      SUPABASE_STORAGE_SECRET_ACCESS_KEY:
        process.env.SUPABASE_STORAGE_SECRET_ACCESS_KEY,
      SUPABASE_STORAGE_BUCKET_NAME: process.env.SUPABASE_STORAGE_BUCKET_NAME,
      SERPAPI_API_KEY: process.env.SERPAPI_API_KEY,
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      NEXT_PUBLIC_PAYPAL_CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
      NEXT_PUBLIC_PAYPAL_ENVIRONMENT:
        process.env.NEXT_PUBLIC_PAYPAL_ENVIRONMENT,
      NEXT_PUBLIC_PAYPAL_CURRENCY: process.env.NEXT_PUBLIC_PAYPAL_CURRENCY,
      NEXT_PUBLIC_PAYPAL_INTENT: process.env.NEXT_PUBLIC_PAYPAL_INTENT,
      NEXT_PUBLIC_PAYPAL_LOCALE: process.env.NEXT_PUBLIC_PAYPAL_LOCALE,
      PAYPAL_CLIENT_SECRET: process.env.PAYPAL_CLIENT_SECRET,
      PAYPAL_MERCHANT_ID: process.env.PAYPAL_MERCHANT_ID,
      PAYPAL_ENABLE_FUNDING: process.env.PAYPAL_ENABLE_FUNDING,
      PAYPAL_DISABLE_FUNDING: process.env.PAYPAL_DISABLE_FUNDING,
      OPENAI_ORG_ID: process.env.OPENAI_ORG_ID,
    }

    // Load schema from config directory
    const schemaPath = path.join(
      process.cwd(),
      'env-validation',
      'config',
      'env.schema.json'
    )

    // Validate using schema
    const result = validator.validate(schemaPath, envVarsForValidation)

    if (!result.valid) {
      // Ensure errors is an array
      const errors = Array.isArray(result.errors)
        ? result.errors
        : result.errors
          ? Object.values(result.errors)
          : []

      const errorMessages = errors
        .map((err: any) => {
          if (err && typeof err === 'object') {
            return `${err.variable || 'unknown'}: ${err.error || 'unknown error'}`
          }
          return String(err)
        })
        .join('\n')

      if (errorMessages) {
        throw new Error(
          `Environment variable validation failed:\n${errorMessages}`
        )
      } else {
        throw new Error('Environment variable validation failed')
      }
    }
  } catch (error: any) {
    if (error.message && error.message.includes('validation failed')) {
      throw error
    }
    // If validation library fails to load, warn but don't block
    // This allows the app to run even if fengari is not installed
    if (typeof console !== 'undefined' && console.warn) {
      console.warn('Environment validation warning:', error.message || error)
    }
  }
}
