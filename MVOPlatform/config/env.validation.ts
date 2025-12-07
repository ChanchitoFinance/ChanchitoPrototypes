/**
 * Server-side environment variable validation
 * This file is only imported and executed on the server
 * Uses ChanchitoTools.EnvValidation for schema-based validation
 */

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
    const adapter = require('../lib/env-validation/javascript_adapter.js')
    const EnvValidator = adapter.EnvValidator

    // Get the path to lua files relative to project root
    const luaPath = path.join(
      process.cwd(),
      'lib',
      'env-validation',
      'lua'
    )
    const validator = new EnvValidator(luaPath)

    // Use process.env directly for validation (matches schema keys)
    const envVarsForValidation = {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      NEXT_PUBLIC_ADMIN_EMAIL: process.env.NEXT_PUBLIC_ADMIN_EMAIL,
    }

    // Load schema from config directory
    const schemaPath = path.join(process.cwd(), 'config', 'env.schema.json')

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

