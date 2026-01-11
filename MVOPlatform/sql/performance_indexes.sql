-- ============================================================================
-- PERFORMANCE OPTIMIZATION: Database Indexes
-- Run this script to add critical indexes for query performance
-- IMPORTANT: Run each index separately or remove CONCURRENTLY if running in transaction
-- ============================================================================

-- Drop existing indexes if they exist (for clean re-run)
DROP INDEX IF EXISTS idx_ideas_status_flag;
DROP INDEX IF EXISTS idx_ideas_created_at;
DROP INDEX IF EXISTS idx_idea_votes_idea_id;
DROP INDEX IF EXISTS idx_comments_idea_id;
DROP INDEX IF EXISTS idx_comments_parent_id;
DROP INDEX IF EXISTS idx_idea_tags_tag_id;
DROP INDEX IF EXISTS idx_idea_tags_idea_id;
DROP INDEX IF EXISTS idx_ideas_explore;
DROP INDEX IF EXISTS idx_idea_votes_user_idea;
DROP INDEX IF EXISTS idx_comment_votes_comment_id;
DROP INDEX IF EXISTS idx_space_memberships_user;
DROP INDEX IF EXISTS idx_ideas_creator_id;
DROP INDEX IF EXISTS idx_idea_engagement_score;
DROP INDEX IF EXISTS idx_idea_engagement_created;

-- ============================================================================
-- CRITICAL: Indexes for ideas queries
-- ============================================================================

-- Primary index for filtering by status_flag (used in most queries)
CREATE INDEX idx_ideas_status_flag ON ideas(status_flag);

-- Index for sorting by created_at (used in all feed queries)
CREATE INDEX idx_ideas_created_at ON ideas(created_at DESC);

-- Composite index for trending/explore queries (filter + sort)
CREATE INDEX idx_ideas_explore ON ideas(status_flag, created_at DESC) 
WHERE status_flag != 'validated';

-- Index for creator queries
CREATE INDEX idx_ideas_creator_id ON ideas(creator_id);

-- ============================================================================
-- CRITICAL: Indexes for votes queries
-- ============================================================================

-- Index for counting votes per idea
CREATE INDEX idx_idea_votes_idea_id ON idea_votes(idea_id);

-- Index for user's votes (used in getUserVotesForIdeas)
CREATE INDEX idx_idea_votes_user_idea ON idea_votes(voter_id, idea_id);

-- ============================================================================
-- CRITICAL: Indexes for comments queries
-- ============================================================================

-- Composite index for comments by idea
CREATE INDEX idx_comments_idea_id ON comments(idea_id, created_at DESC);

-- Index for parent-child comment relationship
CREATE INDEX idx_comments_parent_id ON comments(parent_comment_id);

-- Index for comment votes
CREATE INDEX idx_comment_votes_comment_id ON comment_votes(comment_id);

-- ============================================================================
-- Indexes for tags queries
-- ============================================================================

CREATE INDEX idx_idea_tags_idea_id ON idea_tags(idea_id);
CREATE INDEX idx_idea_tags_tag_id ON idea_tags(tag_id);

-- ============================================================================
-- Index for spaces queries
-- ============================================================================

CREATE INDEX idx_space_memberships_user ON space_memberships(user_id, status);

-- ============================================================================
-- Materialized View for engagement scoring (eliminates client-side sorting)
-- Run REFRESH MATERIALIZED VIEW CONCURRENTLY idea_engagement; periodically
-- ============================================================================

DROP MATERIALIZED VIEW IF EXISTS idea_engagement;
CREATE MATERIALIZED VIEW idea_engagement AS
SELECT 
  i.id,
  i.title,
  i.status_flag,
  i.content,
  i.created_at,
  i.anonymous,
  i.creator_id,
  i.space_id,
  -- Computed engagement metrics
  (SELECT COUNT(*) FROM idea_votes WHERE idea_id = i.id) as total_votes,
  (SELECT COUNT(*) FROM idea_votes WHERE idea_id = i.id AND vote_type = 'use') as use_votes,
  (SELECT COUNT(*) FROM idea_votes WHERE idea_id = i.id AND vote_type = 'dislike') as dislike_votes,
  (SELECT COUNT(*) FROM idea_votes WHERE idea_id = i.id AND vote_type = 'pay') as pay_votes,
  (SELECT COUNT(*) FROM comments WHERE idea_id = i.id AND deleted_at IS NULL) as comment_count,
  -- Calculated scores
  ((SELECT COUNT(*) FROM idea_votes WHERE idea_id = i.id AND vote_type = 'pay') * 3 +
   (SELECT COUNT(*) FROM idea_votes WHERE idea_id = i.id AND vote_type = 'use') * 2 -
   (SELECT COUNT(*) FROM idea_votes WHERE idea_id = i.id AND vote_type = 'dislike')) as score,
  ((SELECT COUNT(*) FROM idea_votes WHERE idea_id = i.id) + 
   (SELECT COUNT(*) FROM comments WHERE idea_id = i.id AND deleted_at IS NULL)) as engagement_score
FROM ideas i
ORDER BY i.created_at DESC;

-- Index on materialized view for fast sorting
CREATE INDEX idx_idea_engagement_score ON idea_engagement(engagement_score DESC);
CREATE INDEX idx_idea_engagement_created ON idea_engagement(created_at DESC);

COMMENT ON MATERIALIZED VIEW idea_engagement IS 
'Pre-computed engagement metrics for ideas. Refresh with: REFRESH MATERIALIZED VIEW CONCURRENTLY idea_engagement;';

-- ============================================================================
-- Verify indexes were created
-- ============================================================================
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('ideas', 'idea_votes', 'comments', 'idea_tags', 'space_memberships')
ORDER BY tablename, indexname;
