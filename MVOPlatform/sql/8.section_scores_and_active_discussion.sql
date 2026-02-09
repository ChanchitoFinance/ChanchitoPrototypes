-- Pre-computed scores for homepage sections and active_discussion trigger
-- Run after 7.articles.sql (ideas has is_article)

-- Add columns for section ordering (only meaningful for is_active_version = true)
ALTER TABLE ideas
  ADD COLUMN IF NOT EXISTS detail_score INT NOT NULL DEFAULT 0;

ALTER TABLE ideas
  ADD COLUMN IF NOT EXISTS pay_intention_ratio NUMERIC(10, 6) NOT NULL DEFAULT 0;

ALTER TABLE ideas
  ADD COLUMN IF NOT EXISTS iteration_count INT NOT NULL DEFAULT 1;

-- Cached counts for triggers (votes and comment_count)
ALTER TABLE ideas
  ADD COLUMN IF NOT EXISTS cached_votes_use INT NOT NULL DEFAULT 0;

ALTER TABLE ideas
  ADD COLUMN IF NOT EXISTS cached_votes_dislike INT NOT NULL DEFAULT 0;

ALTER TABLE ideas
  ADD COLUMN IF NOT EXISTS cached_votes_pay INT NOT NULL DEFAULT 0;

ALTER TABLE ideas
  ADD COLUMN IF NOT EXISTS cached_comment_count INT NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_ideas_detail_score ON ideas(detail_score DESC) WHERE is_active_version = true AND (is_article = false OR is_article IS NULL);
CREATE INDEX IF NOT EXISTS idx_ideas_pay_intention ON ideas(pay_intention_ratio DESC) WHERE is_active_version = true AND (is_article = false OR is_article IS NULL);
CREATE INDEX IF NOT EXISTS idx_ideas_iteration_count ON ideas(iteration_count DESC) WHERE is_active_version = true AND (is_article = false OR is_article IS NULL);

-- Compute detail_score from content.blocks: block count + (distinct types) * 2
CREATE OR REPLACE FUNCTION compute_detail_score(content_json JSONB)
RETURNS INT AS $$
DECLARE
  blocks JSONB;
  block_count INT;
  type_count INT;
  block JSONB;
  types_seen TEXT[] := '{}';
  t TEXT;
BEGIN
  IF content_json IS NULL THEN
    RETURN 0;
  END IF;
  blocks := content_json->'blocks';
  IF blocks IS NULL OR jsonb_typeof(blocks) != 'array' THEN
    RETURN 0;
  END IF;
  block_count := jsonb_array_length(blocks);
  FOR i IN 0 .. block_count - 1 LOOP
    block := blocks->i;
    t := block->>'type';
    IF t IS NOT NULL AND NOT (t = ANY(types_seen)) THEN
      types_seen := types_seen || t;
    END IF;
  END LOOP;
  type_count := array_length(types_seen, 1);
  IF type_count IS NULL THEN
    type_count := 0;
  END IF;
  RETURN block_count + type_count * 2;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Set detail_score on insert/update of idea (from content)
CREATE OR REPLACE FUNCTION trigger_set_detail_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.detail_score := compute_detail_score(NEW.content);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ideas_detail_score ON ideas;
CREATE TRIGGER trigger_ideas_detail_score
  BEFORE INSERT OR UPDATE OF content ON ideas
  FOR EACH ROW EXECUTE FUNCTION trigger_set_detail_score();

-- Update cached vote counts and comment count for an idea (and pay_intention_ratio)
CREATE OR REPLACE FUNCTION update_idea_scores(p_idea_id UUID)
RETURNS VOID AS $$
DECLARE
  v_use INT;
  v_dislike INT;
  v_pay INT;
  v_total_votes INT;
  v_comment_count INT;
  v_ratio NUMERIC(10, 6);
BEGIN
  SELECT
    COUNT(*) FILTER (WHERE vote_type = 'use'),
    COUNT(*) FILTER (WHERE vote_type = 'dislike'),
    COUNT(*) FILTER (WHERE vote_type = 'pay')
  INTO v_use, v_dislike, v_pay
  FROM idea_votes
  WHERE idea_id = p_idea_id;

  v_total_votes := COALESCE(v_use, 0) + COALESCE(v_dislike, 0) + COALESCE(v_pay, 0);

  SELECT COUNT(*) INTO v_comment_count FROM comments WHERE idea_id = p_idea_id;

  v_ratio := 0;
  IF (v_total_votes + COALESCE(v_comment_count, 0)) > 0 THEN
    v_ratio := COALESCE(v_pay, 0)::NUMERIC / (v_total_votes + v_comment_count);
  END IF;

  UPDATE ideas
  SET
    cached_votes_use = COALESCE(v_use, 0),
    cached_votes_dislike = COALESCE(v_dislike, 0),
    cached_votes_pay = COALESCE(v_pay, 0),
    cached_comment_count = COALESCE(v_comment_count, 0),
    pay_intention_ratio = v_ratio
  WHERE id = p_idea_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: after idea_votes change, update that idea's scores
CREATE OR REPLACE FUNCTION trigger_idea_votes_after_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM update_idea_scores(OLD.idea_id);
    RETURN OLD;
  ELSE
    PERFORM update_idea_scores(NEW.idea_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_idea_votes_scores ON idea_votes;
CREATE TRIGGER trigger_idea_votes_scores
  AFTER INSERT OR DELETE ON idea_votes
  FOR EACH ROW EXECUTE FUNCTION trigger_idea_votes_after_change();

-- Trigger: after comments change, update that idea's scores
CREATE OR REPLACE FUNCTION trigger_comments_after_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM update_idea_scores(OLD.idea_id);
    RETURN OLD;
  ELSE
    PERFORM update_idea_scores(NEW.idea_id);
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_comments_scores ON comments;
CREATE TRIGGER trigger_comments_scores
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION trigger_comments_after_change();

-- Refresh active_discussion: set top 10 most active (by cached_comment_count + cached votes) to active_discussion, rest to new
CREATE OR REPLACE FUNCTION refresh_active_discussion()
RETURNS VOID AS $$
DECLARE
  active_idea_ids UUID[];
BEGIN
  -- Reset current active_discussion to new
  UPDATE ideas
  SET status_flag = 'new'
  WHERE status_flag = 'active_discussion'
    AND COALESCE(is_article, false) = false
    AND is_active_version = true;

  -- Set top 10 by activity (comment_count + total votes), then by updated_at desc
  WITH ranked AS (
    SELECT id,
      (cached_comment_count + cached_votes_use + cached_votes_dislike + cached_votes_pay) AS activity
    FROM ideas
    WHERE is_active_version = true
      AND (COALESCE(is_article, false) = false)
    ORDER BY (cached_comment_count + cached_votes_use + cached_votes_dislike + cached_votes_pay) DESC,
             updated_at DESC NULLS LAST
    LIMIT 10
  )
  UPDATE ideas i
  SET status_flag = 'active_discussion'
  FROM ranked r
  WHERE i.id = r.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Refresh active_discussion at the end of each score update (keeps top 10 current)
CREATE OR REPLACE FUNCTION update_idea_scores(p_idea_id UUID)
RETURNS VOID AS $$
DECLARE
  v_use INT;
  v_dislike INT;
  v_pay INT;
  v_total_votes INT;
  v_comment_count INT;
  v_ratio NUMERIC(10, 6);
BEGIN
  SELECT
    COUNT(*) FILTER (WHERE vote_type = 'use'),
    COUNT(*) FILTER (WHERE vote_type = 'dislike'),
    COUNT(*) FILTER (WHERE vote_type = 'pay')
  INTO v_use, v_dislike, v_pay
  FROM idea_votes
  WHERE idea_id = p_idea_id;

  v_total_votes := COALESCE(v_use, 0) + COALESCE(v_dislike, 0) + COALESCE(v_pay, 0);

  SELECT COUNT(*) INTO v_comment_count FROM comments WHERE idea_id = p_idea_id;

  v_ratio := 0;
  IF (v_total_votes + COALESCE(v_comment_count, 0)) > 0 THEN
    v_ratio := COALESCE(v_pay, 0)::NUMERIC / (v_total_votes + v_comment_count);
  END IF;

  UPDATE ideas
  SET
    cached_votes_use = COALESCE(v_use, 0),
    cached_votes_dislike = COALESCE(v_dislike, 0),
    cached_votes_pay = COALESCE(v_pay, 0),
    cached_comment_count = COALESCE(v_comment_count, 0),
    pay_intention_ratio = v_ratio
  WHERE id = p_idea_id;

  PERFORM refresh_active_discussion();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update iteration_count for the active version(s) in a group
CREATE OR REPLACE FUNCTION update_iteration_count_for_group(p_idea_group_id UUID)
RETURNS VOID AS $$
DECLARE
  v_count INT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM ideas WHERE idea_group_id = p_idea_group_id;
  UPDATE ideas
  SET iteration_count = v_count
  WHERE idea_group_id = p_idea_group_id AND is_active_version = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION trigger_ideas_after_insert_iteration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.idea_group_id IS NOT NULL THEN
    PERFORM update_iteration_count_for_group(NEW.idea_group_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ideas_iteration_count ON ideas;
CREATE TRIGGER trigger_ideas_iteration_count
  AFTER INSERT ON ideas
  FOR EACH ROW EXECUTE FUNCTION trigger_ideas_after_insert_iteration();

CREATE OR REPLACE FUNCTION trigger_ideas_after_update_active_version()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_active_version = true AND (OLD.is_active_version = false OR OLD.is_active_version IS DISTINCT FROM true) THEN
    IF NEW.idea_group_id IS NOT NULL THEN
      PERFORM update_iteration_count_for_group(NEW.idea_group_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_ideas_set_active_iteration ON ideas;
CREATE TRIGGER trigger_ideas_set_active_iteration
  AFTER UPDATE OF is_active_version ON ideas
  FOR EACH ROW EXECUTE FUNCTION trigger_ideas_after_update_active_version();

-- Backfill: set detail_score and cached counts for existing rows
UPDATE ideas SET detail_score = compute_detail_score(content);
UPDATE ideas i SET
  cached_votes_use = (SELECT COUNT(*) FROM idea_votes WHERE idea_id = i.id AND vote_type = 'use'),
  cached_votes_dislike = (SELECT COUNT(*) FROM idea_votes WHERE idea_id = i.id AND vote_type = 'dislike'),
  cached_votes_pay = (SELECT COUNT(*) FROM idea_votes WHERE idea_id = i.id AND vote_type = 'pay'),
  cached_comment_count = (SELECT COUNT(*) FROM comments WHERE idea_id = i.id);
UPDATE ideas i SET
  pay_intention_ratio = CASE
    WHEN (cached_votes_use + cached_votes_dislike + cached_votes_pay + cached_comment_count) > 0
    THEN cached_votes_pay::NUMERIC / (cached_votes_use + cached_votes_dislike + cached_votes_pay + cached_comment_count)
    ELSE 0
  END;
UPDATE ideas i SET iteration_count = (SELECT COUNT(*) FROM ideas i2 WHERE i2.idea_group_id = i.idea_group_id)
WHERE idea_group_id IS NOT NULL AND is_active_version = true;
SELECT refresh_active_discussion();
