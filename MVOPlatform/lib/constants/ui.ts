/**
 * UI Constants - Single source of truth for common UI strings and labels
 * All UI text should reference these constants to maintain consistency
 */

export const UI_LABELS = {
  // Navigation
  HOME: 'Home',
  FOR_YOU: 'For You',
  EXPLORE: 'Explore',
  ACTIVITY: 'Activity',
  UPLOAD: 'Upload',
  PROFILE: 'Profile',
  MORE: 'More',
  ADMIN: 'Admin',
  
  // Actions
  SIGN_IN: 'Sign In',
  SIGN_OUT: 'Sign Out',
  SUBMIT_IDEA: 'Submit Idea',
  SUBMIT_YOUR_IDEA: 'Submit Your Idea',
  SUBMIT_YOUR_IDEA_NOW: 'Submit Your Idea Now',
  SUBMITTING: 'Submitting...',
  LOAD_MORE: 'Load More',
  CHECKOUT: 'Checkout',
  PROCESSING: 'Processing...',
  
  // Status
  LOADING: 'Loading...',
  LOADING_MORE_IDEAS: 'Loading more ideas...',
  NO_MORE_IDEAS: 'No more ideas to load',
  
  // Common labels
  SCORE: 'Score',
  OVERALL_SCORE: 'Overall Score',
  OVERALL_VALIDATION_SCORE: 'Overall Validation Score',
  SUBMITTED: 'Submitted',
  VALIDATION_REPORT: 'Validation Report',
  
  // Auth
  SIGN_IN_REQUIRED: 'Sign In Required',
  SIGN_IN_WITH_GOOGLE: 'Sign In with Google',
  SIGN_IN_DESCRIPTION: 'Please sign in with your Google account to submit an idea.',
  
  // Ideas
  BROWSE_IDEAS: 'Browse Ideas',
  DISCOVER_IDEAS: 'Discover and vote on validated business ideas',
  FOR_YOU_TITLE: 'For You',
  FOR_YOU_SUBTITLE: 'Ideas curated just for you',
  
  // Brand
  BRAND_NAME: 'MVO',
} as const

export const UI_MESSAGES = {
  // Errors
  GENERIC_ERROR: 'Something went wrong. Please try again.',
  
  // Success
  IDEA_SUBMITTED: 'Your idea has been submitted successfully!',
  
  // Info
  NO_IDEAS: 'No ideas found.',
} as const

