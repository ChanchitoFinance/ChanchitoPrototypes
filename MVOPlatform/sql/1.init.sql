CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enums
DROP TYPE IF EXISTS media_type CASCADE;
DROP TYPE IF EXISTS comment_reaction_type CASCADE;
DROP TYPE IF EXISTS idea_vote_type CASCADE;
DROP TYPE IF EXISTS pivot_state CASCADE;
DROP TYPE IF EXISTS idea_status_flag CASCADE;

CREATE TYPE idea_status_flag AS ENUM ('new', 'active_discussion', 'trending', 'validated', 'controversial');
CREATE TYPE pivot_state AS ENUM ('stable', 'pivot_suggested', 'kill_suggested');
CREATE TYPE idea_vote_type AS ENUM ('dislike', 'use', 'pay');
CREATE TYPE comment_reaction_type AS ENUM ('upvote', 'downvote', 'helpful');
CREATE TYPE media_type AS ENUM ('image', 'video', 'link');

-- Users table (extended)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255),
  role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  username VARCHAR(255) UNIQUE,
  profile_media_id UUID,
  plan VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'premium', 'innovator')),
  daily_credits_used INT NOT NULL DEFAULT 0,
  last_credits_reset DATE NOT NULL DEFAULT CURRENT_DATE,
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

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  payment_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('free', 'pro', 'premium', 'innovator')),
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  payment_method VARCHAR(50) NOT NULL DEFAULT 'paypal',
  transaction_id VARCHAR(255) UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
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


-- Tags
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL UNIQUE
);


-- Ideas
CREATE TABLE ideas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  status_flag idea_status_flag NOT NULL DEFAULT 'new',
  pivot_state pivot_state NOT NULL DEFAULT 'stable',
  anonymous BOOLEAN NOT NULL DEFAULT FALSE,
  content JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
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


-- Idea Votes
CREATE TABLE idea_votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
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


-- Indexes
CREATE INDEX idx_media_assets_type ON media_assets(type);
CREATE INDEX idx_media_assets_created_at ON media_assets(created_at);
CREATE INDEX idx_ideas_creator_created_at ON ideas(creator_id, created_at);
CREATE INDEX idx_idea_votes_idea ON idea_votes(idea_id);
CREATE INDEX idx_idea_votes_voter_created_at ON idea_votes(voter_id, created_at);
CREATE INDEX idx_comments_idea_created_at ON comments(idea_id, created_at);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX idx_comments_user_created_at ON comments(user_id, created_at);
CREATE INDEX idx_comment_votes_comment ON comment_votes(comment_id);
CREATE INDEX idx_comment_votes_user_created_at ON comment_votes(user_id, created_at);
CREATE INDEX idx_notifications_user_read_created_at ON notifications(user_id, is_read, created_at);
CREATE INDEX idx_idea_tags_tag ON idea_tags(tag_id);
CREATE INDEX idx_payments_user_date ON payments(user_id, payment_date);
CREATE INDEX idx_payments_transaction ON payments(transaction_id);

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
  INSERT INTO public.users (id, email, full_name, role, username, profile_media_id, plan, daily_credits_used, last_credits_reset)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'user',
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    media_id,
    'free',
    0,
    CURRENT_DATE
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to reset daily credits and check plan renewals
CREATE OR REPLACE FUNCTION reset_daily_credits_and_check_plans()
RETURNS VOID AS $$
BEGIN
  -- Reset daily credits for all users where last reset was not today
  UPDATE users
  SET daily_credits_used = 0, last_credits_reset = CURRENT_DATE
  WHERE last_credits_reset < CURRENT_DATE;

  -- Check for plan renewals: if no payment in the last 30 days for paid plans, revert to free
  UPDATE users
  SET plan = 'free'
  WHERE plan IN ('pro', 'premium', 'innovator')
    AND NOT EXISTS (
      SELECT 1 FROM payments
      WHERE payments.user_id = users.id
        AND payments.status = 'completed'
        AND payments.payment_date >= CURRENT_DATE - INTERVAL '30 days'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE ideas ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

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

-- Public read for media_assets, tags
CREATE POLICY "Public read media_assets" ON media_assets FOR SELECT USING (true);
CREATE POLICY "Public read tags" ON tags FOR SELECT USING (true);
CREATE POLICY "Authenticated insert tags" ON tags FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

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

-- Idea tags, media: follow parent permissions
CREATE POLICY "Public read idea_tags" ON idea_tags FOR SELECT USING (true);
CREATE POLICY "Authenticated insert idea_tags" ON idea_tags FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Public read idea_media" ON idea_media FOR SELECT USING (true);
CREATE POLICY "Authenticated insert idea_media" ON idea_media FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Payments: users can view their own, admins can view all
CREATE POLICY "Users view own payments" ON payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins view all payments" ON payments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin'
  )
);
CREATE POLICY "Authenticated insert payments" ON payments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Configure realtime publication (safely handle if publication doesn't exist)
DO $$
BEGIN
    -- Only configure realtime if publication exists and user has permissions
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        -- Safely remove tables from publication
        BEGIN
            ALTER PUBLICATION supabase_realtime DROP TABLE idea_votes;
        EXCEPTION WHEN OTHERS THEN
            -- Ignore errors (table not in publication or permission issues)
            NULL;
        END;

        BEGIN
            ALTER PUBLICATION supabase_realtime DROP TABLE comments;
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;

        BEGIN
            ALTER PUBLICATION supabase_realtime DROP TABLE ideas;
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;

        -- Add tables to publication
        BEGIN
            ALTER PUBLICATION supabase_realtime ADD TABLE idea_votes;
            ALTER PUBLICATION supabase_realtime ADD TABLE comments;
            ALTER PUBLICATION supabase_realtime ADD TABLE ideas;
        EXCEPTION WHEN OTHERS THEN
            -- Ignore if we can't modify publication
            NULL;
        END;
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- Completely ignore any realtime configuration errors
    -- This ensures the schema creation doesn't fail due to realtime issues
    NULL;
END $$;
