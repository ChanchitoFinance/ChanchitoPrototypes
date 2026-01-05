CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
DROP TYPE IF EXISTS post_status CASCADE;
DROP TYPE IF EXISTS post_type CASCADE;
DROP TYPE IF EXISTS media_type CASCADE;
DROP TYPE IF EXISTS comment_reaction_type CASCADE;
DROP TYPE IF EXISTS idea_vote_type CASCADE;
DROP TYPE IF EXISTS pivot_state CASCADE;
DROP TYPE IF EXISTS idea_status_flag CASCADE;
DROP TYPE IF EXISTS space_visibility CASCADE;
DROP TYPE IF EXISTS membership_status CASCADE;
DROP TYPE IF EXISTS membership_role CASCADE;

CREATE TYPE membership_role AS ENUM ('admin', 'moderator', 'member', 'validator');
CREATE TYPE membership_status AS ENUM ('active', 'invited', 'blocked');
CREATE TYPE space_visibility AS ENUM ('public', 'invite_only', 'private');
CREATE TYPE idea_status_flag AS ENUM ('new', 'active_discussion', 'trending', 'validated', 'controversial');
CREATE TYPE pivot_state AS ENUM ('stable', 'pivot_suggested', 'kill_suggested');
CREATE TYPE idea_vote_type AS ENUM ('dislike', 'use', 'pay');
CREATE TYPE comment_reaction_type AS ENUM ('upvote', 'downvote', 'helpful');
CREATE TYPE media_type AS ENUM ('image', 'video', 'link');
CREATE TYPE post_type AS ENUM ('team_post', 'blog_post');
CREATE TYPE post_status AS ENUM ('draft', 'published', 'archived');

-- Users table (extended)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  wishlist UUID[],
  favorite_categories TEXT[],
  username VARCHAR(255) UNIQUE,
  profile_media_id UUID,
  reputation_score INT DEFAULT 0,
  streak_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Media Assets
CREATE TABLE media_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type media_type NOT NULL,
  url TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint after both tables are created
ALTER TABLE users ADD CONSTRAINT fk_users_profile_media_id FOREIGN KEY (profile_media_id) REFERENCES media_assets(id);

-- Public user profiles view (safe fields only) - moved after media_assets table creation
CREATE VIEW public_user_profiles AS
  SELECT
    u.id,
    u.username,
    u.full_name,
    u.profile_media_id,
    m.url as profile_image_url
  FROM users u
  LEFT JOIN media_assets m ON u.profile_media_id = m.id;

-- Teams
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  avatar_media_id UUID REFERENCES media_assets(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Memberships
CREATE TABLE team_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role membership_role NOT NULL,
  status membership_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, user_id)
);

-- Enterprise Spaces
CREATE TABLE enterprise_spaces (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  visibility space_visibility NOT NULL DEFAULT 'private',
  settings JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, name)
);

-- Space Memberships
CREATE TABLE space_memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES enterprise_spaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role membership_role NOT NULL DEFAULT 'member',
  status membership_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(space_id, user_id)
);

-- Topics
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE,
  icon_media_id UUID REFERENCES media_assets(id),
  description TEXT
);

-- Tags
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE
);

-- User Topics
CREATE TABLE user_topics (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  interest_level INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, topic_id)
);

-- Badges
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  icon_media_id UUID REFERENCES media_assets(id)
);

-- User Badges
CREATE TABLE user_badges (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
  awarded_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, badge_id)
);

-- User Preferences
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  preferences JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Content Refs
CREATE TABLE content_refs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider VARCHAR(255) NOT NULL,
  collection VARCHAR(255) NOT NULL,
  external_id VARCHAR(255) NOT NULL,
  version INT DEFAULT 1,
  checksum VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, collection, external_id)
);

-- Ideas
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID NOT NULL REFERENCES enterprise_spaces(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  status_flag idea_status_flag NOT NULL DEFAULT 'new',
  pivot_state pivot_state NOT NULL DEFAULT 'stable',
  anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  content JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Idea Variants
CREATE TABLE idea_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  variant_type VARCHAR(255),
  title VARCHAR(255) NOT NULL,
  content_ref_id UUID NOT NULL REFERENCES content_refs(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Idea Topics
CREATE TABLE idea_topics (
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  PRIMARY KEY (idea_id, topic_id)
);

-- Idea Tags
CREATE TABLE idea_tags (
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (idea_id, tag_id)
);

-- Idea Media
CREATE TABLE idea_media (
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
  sort_order INT DEFAULT 0,
  PRIMARY KEY (idea_id, media_id)
);

-- Variant Media
CREATE TABLE variant_media (
  variant_id UUID NOT NULL REFERENCES idea_variants(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
  sort_order INT DEFAULT 0,
  PRIMARY KEY (variant_id, media_id)
);

-- Idea Votes
CREATE TABLE idea_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES idea_variants(id) ON DELETE CASCADE,
  vote_type idea_vote_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(idea_id, voter_id, vote_type)
);

-- Comments
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Comment Votes
CREATE TABLE comment_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reaction_type comment_reaction_type NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(comment_id, user_id, reaction_type)
);

-- Posts
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  space_id UUID REFERENCES enterprise_spaces(id) ON DELETE CASCADE,
  author_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_type post_type NOT NULL,
  status post_status NOT NULL DEFAULT 'draft',
  title VARCHAR(255) NOT NULL,
  content_ref_id UUID NOT NULL REFERENCES content_refs(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  published_at TIMESTAMPTZ
);

-- Post Media
CREATE TABLE post_media (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  media_id UUID NOT NULL REFERENCES media_assets(id) ON DELETE CASCADE,
  sort_order INT DEFAULT 0,
  PRIMARY KEY (post_id, media_id)
);

-- Newsletters
CREATE TABLE newsletters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  space_id UUID REFERENCES enterprise_spaces(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter Blocks
CREATE TABLE newsletter_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  newsletter_id UUID NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,
  block_type VARCHAR(255) NOT NULL,
  content JSONB,
  sort_order INT DEFAULT 0
);

-- Newsletter Featured Ideas
CREATE TABLE newsletter_featured_ideas (
  newsletter_id UUID NOT NULL REFERENCES newsletters(id) ON DELETE CASCADE,
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  sort_order INT DEFAULT 0,
  PRIMARY KEY (newsletter_id, idea_id)
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(255) NOT NULL,
  payload JSONB,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

-- Follow Users
CREATE TABLE follow_users (
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  followed_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, followed_user_id),
  CHECK (follower_id != followed_user_id)
);

-- Follow Ideas
CREATE TABLE follow_ideas (
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, idea_id)
);

-- Follow Teams
CREATE TABLE follow_teams (
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, team_id)
);

-- Follow Topics
CREATE TABLE follow_topics (
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (follower_id, topic_id)
);

-- Indexes
CREATE INDEX idx_media_assets_type ON media_assets(type);
CREATE INDEX idx_media_assets_created_at ON media_assets(created_at);
CREATE INDEX idx_teams_created_at ON teams(created_at);
CREATE INDEX idx_ideas_space_created_at ON ideas(space_id, created_at);
CREATE INDEX idx_ideas_space_status ON ideas(space_id, status_flag);
CREATE INDEX idx_ideas_creator_created_at ON ideas(creator_id, created_at);
CREATE INDEX idx_idea_variants_idea_created_at ON idea_variants(idea_id, created_at);
CREATE INDEX idx_idea_variants_type ON idea_variants(variant_type);
CREATE INDEX idx_idea_votes_idea ON idea_votes(idea_id);
CREATE INDEX idx_idea_votes_variant ON idea_votes(variant_id);
CREATE INDEX idx_idea_votes_voter_created_at ON idea_votes(voter_id, created_at);
CREATE INDEX idx_comments_idea_created_at ON comments(idea_id, created_at);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX idx_comments_user_created_at ON comments(user_id, created_at);
CREATE INDEX idx_comment_votes_comment ON comment_votes(comment_id);
CREATE INDEX idx_comment_votes_user_created_at ON comment_votes(user_id, created_at);
CREATE INDEX idx_posts_team_created_at ON posts(team_id, created_at);
CREATE INDEX idx_posts_space_created_at ON posts(space_id, created_at);
CREATE INDEX idx_posts_status_published ON posts(status, published_at);
CREATE INDEX idx_newsletters_space_created_at ON newsletters(space_id, created_at);
CREATE INDEX idx_newsletter_blocks_newsletter_sort ON newsletter_blocks(newsletter_id, sort_order);
CREATE INDEX idx_newsletter_featured_ideas_newsletter_sort ON newsletter_featured_ideas(newsletter_id, sort_order);
CREATE INDEX idx_newsletter_featured_ideas_idea ON newsletter_featured_ideas(idea_id);
CREATE INDEX idx_notifications_user_read_created_at ON notifications(user_id, is_read, created_at);
CREATE INDEX idx_user_topics_topic ON user_topics(topic_id);
CREATE INDEX idx_user_badges_badge ON user_badges(badge_id);
CREATE INDEX idx_idea_topics_topic ON idea_topics(topic_id);
CREATE INDEX idx_idea_tags_tag ON idea_tags(tag_id);
CREATE INDEX idx_follow_users_followed ON follow_users(followed_user_id);
CREATE INDEX idx_follow_ideas_idea ON follow_ideas(idea_id);
CREATE INDEX idx_follow_teams_team ON follow_teams(team_id);
CREATE INDEX idx_follow_topics_topic ON follow_topics(topic_id);
CREATE INDEX idx_content_refs_provider_collection_external ON content_refs(provider, collection, external_id);
CREATE INDEX idx_content_refs_collection ON content_refs(collection);

-- Updated function for new user
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  avatar_url TEXT;
  media_id UUID;
BEGIN
  -- Check if user has an avatar from OAuth
  avatar_url := NEW.raw_user_meta_data->>'avatar_url';

  -- If avatar exists, create media asset
  IF avatar_url IS NOT NULL THEN
    INSERT INTO public.media_assets (type, url)
    VALUES ('image', avatar_url)
    RETURNING id INTO media_id;
  END IF;

  -- Insert user with profile_media_id if available
  INSERT INTO public.users (id, email, full_name, role, wishlist, favorite_categories, username, profile_media_id)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'user',
    '{}',
    '{}',
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    media_id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE enterprise_spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE space_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_refs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE variant_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletters ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_featured_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_topics ENABLE ROW LEVEL SECURITY;

-- Basic policies (users can view their own data, admins can view all)
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Allow viewing user profiles for non-anonymous idea creators
CREATE POLICY "Public read user profiles for idea creators" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM ideas
      WHERE ideas.creator_id = users.id
      AND ideas.anonymous = false
    )
  );

DROP POLICY IF EXISTS "Users can update their own profile" ON users;
CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Public read for media_assets, topics, tags, badges
CREATE POLICY "Public read media_assets" ON media_assets FOR SELECT USING (true);
CREATE POLICY "Public read topics" ON topics FOR SELECT USING (true);
CREATE POLICY "Public read tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Authenticated insert tags" ON tags FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Public read badges" ON badges FOR SELECT USING (true);

-- Ideas: public read, authenticated create/update
CREATE POLICY "Public read ideas" ON ideas FOR SELECT USING (true);
CREATE POLICY "Authenticated create ideas" ON ideas FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Creators update ideas" ON ideas FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Admins can delete ideas" ON ideas FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Comments: public read, authenticated create
CREATE POLICY "Public read comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated create comments" ON comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);

-- Votes: authenticated insert, users can view their own
CREATE POLICY "Authenticated insert idea_votes" ON idea_votes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users delete own idea_votes" ON idea_votes FOR DELETE USING (auth.uid() = voter_id);
CREATE POLICY "Users view own idea_votes" ON idea_votes FOR SELECT USING (auth.uid() = voter_id);
CREATE POLICY "Anyone can read votes" ON idea_votes FOR SELECT USING (true);

CREATE POLICY "Authenticated insert comment_votes" ON comment_votes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users delete own comment_votes" ON comment_votes FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users view own comment_votes" ON comment_votes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read votes" ON comment_votes FOR SELECT USING (true);

-- Notifications: users can view/update their own
CREATE POLICY "Users view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Follows: authenticated insert, users view own
CREATE POLICY "Authenticated insert follow_users" ON follow_users FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users view own follow_users" ON follow_users FOR SELECT USING (auth.uid() = follower_id);

CREATE POLICY "Authenticated insert follow_ideas" ON follow_ideas FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users view own follow_ideas" ON follow_ideas FOR SELECT USING (auth.uid() = follower_id);

CREATE POLICY "Authenticated insert follow_teams" ON follow_teams FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users view own follow_teams" ON follow_teams FOR SELECT USING (auth.uid() = follower_id);

CREATE POLICY "Authenticated insert follow_topics" ON follow_topics FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users view own follow_topics" ON follow_topics FOR SELECT USING (auth.uid() = follower_id);

-- User preferences: users manage own
CREATE POLICY "Users manage own preferences" ON user_preferences FOR ALL USING (auth.uid() = user_id);

-- User topics/badges: users manage own
CREATE POLICY "Users manage own topics" ON user_topics FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own badges" ON user_badges FOR ALL USING (auth.uid() = user_id);

-- For teams/spaces: members can view, admins manage
CREATE POLICY "Public read teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Authenticated create teams" ON teams FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Public read spaces" ON enterprise_spaces FOR SELECT USING (true);
CREATE POLICY "Authenticated create spaces" ON enterprise_spaces FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Space owners (admins) can update and delete spaces
CREATE POLICY "Space owners can update spaces" ON enterprise_spaces FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM space_memberships
    WHERE space_memberships.space_id = enterprise_spaces.id
    AND space_memberships.user_id = auth.uid()
    AND space_memberships.role = 'admin'
  )
);

CREATE POLICY "Space owners can delete spaces" ON enterprise_spaces FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM space_memberships
    WHERE space_memberships.space_id = enterprise_spaces.id
    AND space_memberships.user_id = auth.uid()
    AND space_memberships.role = 'admin'
  )
);

-- Add RLS policy to allow users to add themselves to teams
CREATE POLICY "Users can add themselves to teams" 
ON team_memberships 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Also allow users to add themselves to spaces
CREATE POLICY "Users can add themselves to spaces" 
ON space_memberships 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Memberships: users view their own, admins view all
CREATE POLICY "Users view own team_memberships" ON team_memberships FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own space_memberships" ON space_memberships FOR SELECT USING (auth.uid() = user_id);

-- Content refs: authenticated insert, public read
CREATE POLICY "Public read content_refs" ON content_refs FOR SELECT USING (true);
CREATE POLICY "Authenticated insert content_refs" ON content_refs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Posts: public read published, authenticated create
CREATE POLICY "Public read published posts" ON posts FOR SELECT USING (status = 'published' OR auth.uid() = author_user_id);
CREATE POLICY "Authenticated create posts" ON posts FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authors update posts" ON posts FOR UPDATE USING (auth.uid() = author_user_id);

-- Newsletters: public read, authenticated create in spaces
CREATE POLICY "Public read newsletters" ON newsletters FOR SELECT USING (true);
CREATE POLICY "Authenticated create newsletters" ON newsletters FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Newsletter blocks/featured: same as newsletters
CREATE POLICY "Public read newsletter_blocks" ON newsletter_blocks FOR SELECT USING (true);
CREATE POLICY "Authenticated insert newsletter_blocks" ON newsletter_blocks FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Public read newsletter_featured_ideas" ON newsletter_featured_ideas FOR SELECT USING (true);
CREATE POLICY "Authenticated insert newsletter_featured_ideas" ON newsletter_featured_ideas FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Idea variants, topics, tags, media: follow parent permissions
CREATE POLICY "Public read idea_variants" ON idea_variants FOR SELECT USING (true);
CREATE POLICY "Authenticated insert idea_variants" ON idea_variants FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Public read idea_topics" ON idea_topics FOR SELECT USING (true);
CREATE POLICY "Authenticated insert idea_topics" ON idea_topics FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Public read idea_tags" ON idea_tags FOR SELECT USING (true);
CREATE POLICY "Authenticated insert idea_tags" ON idea_tags FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Public read idea_media" ON idea_media FOR SELECT USING (true);
CREATE POLICY "Authenticated insert idea_media" ON idea_media FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Public read variant_media" ON variant_media FOR SELECT USING (true);
CREATE POLICY "Authenticated insert variant_media" ON variant_media FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Public read post_media" ON post_media FOR SELECT USING (true);
CREATE POLICY "Authenticated insert post_media" ON post_media FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

ALTER PUBLICATION supabase_realtime DROP TABLE idea_votes;
ALTER PUBLICATION supabase_realtime DROP TABLE comments;
ALTER PUBLICATION supabase_realtime DROP TABLE ideas;

ALTER PUBLICATION supabase_realtime ADD TABLE idea_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE comments;
ALTER PUBLICATION supabase_realtime ADD TABLE ideas;

SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';
