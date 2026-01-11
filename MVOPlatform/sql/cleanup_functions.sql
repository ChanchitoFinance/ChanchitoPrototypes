-- ============================================================================
-- STEP 1: Find all existing function versions
-- Run this first to see what exists
-- ============================================================================

SELECT 
  oid::regprocedure::text AS function_signature
FROM pg_proc
WHERE proname = 'toggle_idea_vote';

-- ============================================================================
-- STEP 2: Drop all found versions manually
-- Copy the signatures from above and run DROP FUNCTION with CASCADE
-- Example:
-- DROP FUNCTION IF EXISTS toggle_idea_vote(UUID, TEXT, UUID) CASCADE;
-- DROP FUNCTION IF EXISTS toggle_idea_vote(UUID, TEXT) CASCADE;
-- ============================================================================
