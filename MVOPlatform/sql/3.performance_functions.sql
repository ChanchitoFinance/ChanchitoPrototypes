-- ============================================================================
-- PERFORMANCE OPTIMIZATION: Database Functions
-- Run this script to create optimized functions for atomic operations
-- ============================================================================

-- ============================================================================
-- STEP 1: Clean up existing function versions using dynamic SQL
-- This avoids the "function not unique" error
-- ============================================================================
DO $$
DECLARE
  func_oid OID;
BEGIN
  -- Drop all toggle_idea_vote versions
  FOR func_oid IN SELECT oid FROM pg_proc WHERE proname = 'toggle_idea_vote' LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || func_oid::regprocedure::text || ' CASCADE';
  END LOOP;
  
  -- Drop all get_user_votes_for_ideas versions
  FOR func_oid IN SELECT oid FROM pg_proc WHERE proname = 'get_user_votes_for_ideas' LOOP
    EXECUTE 'DROP FUNCTION IF EXISTS ' || func_oid::regprocedure::text || ' CASCADE';
  END LOOP;
  
  -- Drop other functions
  DROP FUNCTION IF EXISTS get_idea_with_engagement(UUID) CASCADE;
  DROP FUNCTION IF EXISTS get_comments_tree(UUID, INTEGER) CASCADE;
  DROP FUNCTION IF EXISTS get_ideas_feed(TEXT, INTEGER, INTEGER, TEXT) CASCADE;
END $$;

-- ============================================================================
-- FUNCTION: Toggle idea vote atomically
-- Replaces 4-5 sequential queries with a single database call
-- Uses auth.uid() to get the current user
-- ============================================================================

CREATE OR REPLACE FUNCTION toggle_idea_vote(
  p_idea_id UUID,
  p_vote_type TEXT
) RETURNS JSON AS $$
DECLARE
  v_existing_vote TEXT;
  v_user_id UUID;
  v_result JSON;
BEGIN
  -- Get the current user from auth
  v_user_id := auth.uid();
  
  -- Check if user has this specific vote type
  SELECT vote_type INTO v_existing_vote
  FROM idea_votes
  WHERE idea_id = p_idea_id 
    AND voter_id = v_user_id
    AND vote_type = p_vote_type::idea_vote_type
  LIMIT 1;

  -- All votes are mutually exclusive - delete any existing votes first
  DELETE FROM idea_votes
  WHERE idea_id = p_idea_id 
    AND voter_id = v_user_id;
    
  -- If clicking same vote type, don't insert (toggle off)
  -- If clicking different type or no vote existed, insert new vote
  IF v_existing_vote IS NULL THEN
    INSERT INTO idea_votes (idea_id, voter_id, vote_type)
    VALUES (p_idea_id, v_user_id, p_vote_type::idea_vote_type);
  END IF;

  -- Return updated idea with all computed fields
  SELECT json_build_object(
    'id', i.id,
    'title', i.title,
    'status_flag', i.status_flag,
    'content', i.content,
    'created_at', i.created_at,
    'anonymous', i.anonymous,
    'creator_id', i.creator_id,
    'version_number', i.version_number,
    'idea_group_id', i.idea_group_id,
    'is_active_version', i.is_active_version,
    'total_votes', (
      SELECT COUNT(*) FROM idea_votes WHERE idea_id = i.id
    ),
    'use_votes', (
      SELECT COUNT(*) FROM idea_votes WHERE idea_id = i.id AND vote_type = 'use'::idea_vote_type
    ),
    'dislike_votes', (
      SELECT COUNT(*) FROM idea_votes WHERE idea_id = i.id AND vote_type = 'dislike'::idea_vote_type
    ),
    'pay_votes', (
      SELECT COUNT(*) FROM idea_votes WHERE idea_id = i.id AND vote_type = 'pay'::idea_vote_type
    ),
    'comment_count', (
      SELECT COUNT(*) FROM comments WHERE idea_id = i.id AND deleted_at IS NULL
    ),
    'score', (
      (SELECT COUNT(*) FROM idea_votes WHERE idea_id = i.id AND vote_type = 'pay'::idea_vote_type) * 3 +
      (SELECT COUNT(*) FROM idea_votes WHERE idea_id = i.id AND vote_type = 'use'::idea_vote_type) * 2 -
      (SELECT COUNT(*) FROM idea_votes WHERE idea_id = i.id AND vote_type = 'dislike'::idea_vote_type)
    )
  ) INTO v_result
  FROM ideas i
  WHERE i.id = p_idea_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION toggle_idea_vote IS 
'Atomically toggle idea vote. Handles use/dislike mutual exclusivity and pay vote independence. Uses auth.uid() for current user.';

-- ============================================================================
-- FUNCTION: Get user votes for multiple ideas in single query
-- Replaces N+1 query pattern with batch fetch
-- ============================================================================

CREATE OR REPLACE FUNCTION get_user_votes_for_ideas(
  p_idea_ids UUID[]
) RETURNS JSON AS $$
DECLARE
  v_user_id UUID;
  v_result JSON;
BEGIN
  -- Get the current user from auth
  v_user_id := auth.uid();

  -- Build result for all idea_ids, with votes where they exist
  SELECT json_object_agg(
    i.idea_id::TEXT,
    json_build_object(
      'use', COALESCE(vote_data.use_vote, false),
      'dislike', COALESCE(vote_data.dislike_vote, false),
      'pay', COALESCE(vote_data.pay_vote, false)
    )
  ) INTO v_result
  FROM unnest(p_idea_ids) AS i(idea_id)
  LEFT JOIN (
    SELECT
      idea_id,
      bool_or(vote_type = 'use'::idea_vote_type) as use_vote,
      bool_or(vote_type = 'dislike'::idea_vote_type) as dislike_vote,
      bool_or(vote_type = 'pay'::idea_vote_type) as pay_vote
    FROM idea_votes
    WHERE voter_id = v_user_id
      AND idea_id = ANY(p_idea_ids)
    GROUP BY idea_id
  ) vote_data ON i.idea_id = vote_data.idea_id;

  RETURN COALESCE(v_result, '{}'::JSON);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_votes_for_ideas IS 
'Batch fetch user votes for multiple ideas in a single query. Uses auth.uid() for current user.';

-- ============================================================================
-- FUNCTION: Get comments tree with depth limit (database-level)
-- Replaces client-side tree building with efficient SQL
-- ============================================================================

CREATE OR REPLACE FUNCTION get_comments_tree(
  p_idea_id UUID,
  p_max_depth INTEGER DEFAULT 4
) RETURNS TABLE (
  id UUID,
  idea_id UUID,
  user_id UUID,
  parent_comment_id UUID,
  content TEXT,
  created_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  author_username TEXT,
  author_full_name TEXT,
  author_image TEXT,
  upvotes INTEGER,
  downvotes INTEGER,
  depth INTEGER,
  path UUID[]
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE comment_tree AS (
    -- Base case: top-level comments
    SELECT 
      c.id,
      c.idea_id,
      c.user_id,
      c.parent_comment_id,
      c.content,
      c.created_at,
      c.deleted_at,
      p.username as author_username,
      p.full_name as author_full_name,
      p.profile_image_url as author_image,
      (SELECT COUNT(*) FROM comment_votes WHERE comment_id = c.id AND reaction_type = 'upvote'::comment_reaction_type) as upvotes,
      (SELECT COUNT(*) FROM comment_votes WHERE comment_id = c.id AND reaction_type = 'downvote'::comment_reaction_type) as downvotes,
      0 as depth,
      ARRAY[c.id] as path
    FROM comments c
    JOIN public_user_profiles p ON c.user_id = p.id
    WHERE c.idea_id = p_idea_id 
      AND c.parent_comment_id IS NULL
      AND c.deleted_at IS NULL
    
    UNION ALL
    
    -- Recursive case: child comments
    SELECT 
      c.id,
      c.idea_id,
      c.user_id,
      c.parent_comment_id,
      c.content,
      c.created_at,
      c.deleted_at,
      p.username as author_username,
      p.full_name as author_full_name,
      p.profile_image_url as author_image,
      (SELECT COUNT(*) FROM comment_votes WHERE comment_id = c.id AND reaction_type = 'upvote'::comment_reaction_type) as upvotes,
      (SELECT COUNT(*) FROM comment_votes WHERE comment_id = c.id AND reaction_type = 'downvote'::comment_reaction_type) as downvotes,
      ct.depth + 1,
      ct.path || c.id
    FROM comments c
    JOIN public_user_profiles p ON c.user_id = p.id
    JOIN comment_tree ct ON c.parent_comment_id = ct.id
    WHERE c.deleted_at IS NULL
      AND ct.depth < p_max_depth
  )
  SELECT * FROM comment_tree
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_comments_tree IS 
'Get comment tree with depth limit. Replaces client-side tree building.';

-- ============================================================================
-- FUNCTION: Get ideas feed with pagination and sorting (database-level)
-- Eliminates client-side sorting
-- ============================================================================

CREATE OR REPLACE FUNCTION get_ideas_feed(
  p_sort_by TEXT DEFAULT 'date',
  p_limit INTEGER DEFAULT 10,
  p_offset INTEGER DEFAULT 0,
  p_status_exclude TEXT DEFAULT 'validated'
) RETURNS TABLE (
  id UUID,
  title TEXT,
  status_flag TEXT,
  content JSONB,
  created_at TIMESTAMPTZ,
  anonymous BOOLEAN,
  creator_id UUID,
  author_username TEXT,
  author_full_name TEXT,
  author_email TEXT,
  use_votes INTEGER,
  dislike_votes INTEGER,
  pay_votes INTEGER,
  comment_count INTEGER,
  tags TEXT[],
  total_votes INTEGER,
  score INTEGER,
  engagement_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.title,
    i.status_flag,
    i.content,
    i.created_at,
    i.anonymous,
    i.creator_id,
    p.username as author_username,
    p.full_name as author_full_name,
    p.email as author_email,
    (SELECT COUNT(*) FROM idea_votes WHERE idea_id = i.id AND vote_type = 'use'::idea_vote_type) as use_votes,
    (SELECT COUNT(*) FROM idea_votes WHERE idea_id = i.id AND vote_type = 'dislike'::idea_vote_type) as dislike_votes,
    (SELECT COUNT(*) FROM idea_votes WHERE idea_id = i.id AND vote_type = 'pay'::idea_vote_type) as pay_votes,
    (SELECT COUNT(*) FROM comments WHERE idea_id = i.id AND deleted_at IS NULL) as comment_count,
    i.tags,
    (SELECT COUNT(*) FROM idea_votes WHERE idea_id = i.id) as total_votes,
    ((SELECT COUNT(*) FROM idea_votes WHERE idea_id = i.id AND vote_type = 'pay'::idea_vote_type) * 3 +
     (SELECT COUNT(*) FROM idea_votes WHERE idea_id = i.id AND vote_type = 'use'::idea_vote_type) * 2 -
     (SELECT COUNT(*) FROM idea_votes WHERE idea_id = i.id AND vote_type = 'dislike'::idea_vote_type)) as score,
    ((SELECT COUNT(*) FROM idea_votes WHERE idea_id = i.id) + 
     (SELECT COUNT(*) FROM comments WHERE idea_id = i.id AND deleted_at IS NULL)) as engagement_score
  FROM ideas i
  JOIN public_user_profiles p ON i.creator_id = p.id
  WHERE i.status_flag != p_status_exclude
  ORDER BY 
    CASE 
      WHEN p_sort_by = 'popularity' THEN 
        ((SELECT COUNT(*) FROM idea_votes WHERE idea_id = i.id) + 
         (SELECT COUNT(*) FROM comments WHERE idea_id = i.id AND deleted_at IS NULL))
      WHEN p_sort_by = 'date' THEN EXTRACT(EPOCH FROM i.created_at)
      ELSE NULL
    END DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_ideas_feed IS
'Get paginated ideas feed with database-level sorting. Eliminates client-side processing.';

-- ============================================================================
-- FUNCTION: Toggle comment vote atomically
-- Replaces 4-5 sequential queries with a single database call
-- Uses auth.uid() to get the current user
-- ============================================================================

CREATE OR REPLACE FUNCTION toggle_comment_vote(
  p_comment_id UUID,
  p_reaction_type TEXT
) RETURNS JSON AS $$
DECLARE
  v_existing_vote TEXT;
  v_user_id UUID;
  v_result JSON;
BEGIN
  -- Get the current user from auth
  v_user_id := auth.uid();

  -- Check if user has this specific reaction type
  SELECT reaction_type INTO v_existing_vote
  FROM comment_votes
  WHERE comment_id = p_comment_id
    AND user_id = v_user_id
    AND reaction_type = p_reaction_type::comment_reaction_type
  LIMIT 1;

  -- Handle upvote/downvote votes (mutually exclusive)
  IF p_reaction_type = 'upvote' OR p_reaction_type = 'downvote' THEN
    -- Delete any existing upvote/downvote votes first
    DELETE FROM comment_votes
    WHERE comment_id = p_comment_id
      AND user_id = v_user_id
      AND reaction_type IN ('upvote'::comment_reaction_type, 'downvote'::comment_reaction_type);

    -- If clicking same reaction type, don't insert (toggle off)
    -- If clicking different type or no vote existed, insert new vote
    IF v_existing_vote IS NULL THEN
      INSERT INTO comment_votes (comment_id, user_id, reaction_type)
      VALUES (p_comment_id, v_user_id, p_reaction_type::comment_reaction_type);
    END IF;

  END IF;

  -- Return updated comment with all computed fields
  SELECT json_build_object(
    'id', c.id,
    'idea_id', c.idea_id,
    'user_id', c.user_id,
    'parent_comment_id', c.parent_comment_id,
    'content', c.content,
    'created_at', c.created_at,
    'deleted_at', c.deleted_at,
    'upvotes', (
      SELECT COUNT(*) FROM comment_votes WHERE comment_id = c.id AND reaction_type = 'upvote'::comment_reaction_type
    ),
    'downvotes', (
      SELECT COUNT(*) FROM comment_votes WHERE comment_id = c.id AND reaction_type = 'downvote'::comment_reaction_type
    ),
    'author_username', p.username,
    'author_full_name', p.full_name,
    'author_image', p.profile_image_url
  ) INTO v_result
  FROM comments c
  JOIN public_user_profiles p ON c.user_id = p.id
  WHERE c.id = p_comment_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION toggle_comment_vote IS
'Atomically toggle comment vote. Handles upvote/downvote mutual exclusivity. Uses auth.uid() for current user.';

-- ============================================================================
-- Force PostgREST schema cache refresh
-- ============================================================================
NOTIFY pgrst, 'reload schema';
