-- Articles: is_article flag and slug for readable URLs
-- Run after 1.init.sql (ideas table exists)

ALTER TABLE ideas
  ADD COLUMN IF NOT EXISTS is_article BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE ideas
  ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;

CREATE INDEX IF NOT EXISTS idx_ideas_slug ON ideas(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_ideas_is_article ON ideas(is_article) WHERE is_article = true;

COMMENT ON COLUMN ideas.is_article IS 'When true, idea is shown as an article with readable URL';
COMMENT ON COLUMN ideas.slug IS 'URL-safe unique slug for articles; required when is_article = true';
