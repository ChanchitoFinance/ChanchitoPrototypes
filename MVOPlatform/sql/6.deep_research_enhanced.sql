-- Enhanced Deep Research Tables
-- Migration for storing hypothesis research, early adopters, and deep research results

-- Early Adopters Table
-- Stores curated list of potential early adopters from Twitter/X and Reddit
CREATE TABLE IF NOT EXISTS early_adopters (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('twitter', 'reddit')),
    username VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    profile_url TEXT NOT NULL,
    post_url TEXT NOT NULL,
    post_content TEXT NOT NULL,
    relevance_score DECIMAL(3, 2) DEFAULT 0.0 CHECK (relevance_score >= 0 AND relevance_score <= 1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hypothesis Research Table
-- Stores hypothesis research data with quantitative and qualitative segments
CREATE TABLE IF NOT EXISTS hypothesis_research (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    hypothesis_id VARCHAR(10) NOT NULL CHECK (hypothesis_id IN ('HY1', 'HY2', 'HY2.1', 'HY3', 'HY4')),
    title TEXT NOT NULL,
    quantitative_segment TEXT,
    qualitative_segment TEXT,
    serp_sources JSONB DEFAULT '[]'::jsonb,
    twitter_sources JSONB DEFAULT '[]'::jsonb,
    reddit_sources JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(idea_id, hypothesis_id)
);

-- Deep Research Results Table
-- Stores full enhanced deep research results with versioning
CREATE TABLE IF NOT EXISTS deep_research_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    is_enhanced BOOLEAN DEFAULT FALSE,
    google_results JSONB DEFAULT '[]'::jsonb,
    google_trends JSONB DEFAULT '[]'::jsonb,
    bing_results JSONB DEFAULT '[]'::jsonb,
    ai_summary TEXT,
    hypotheses JSONB DEFAULT '[]'::jsonb,
    twitter_results JSONB DEFAULT '[]'::jsonb,
    reddit_results JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(idea_id, version)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_early_adopters_idea_id ON early_adopters(idea_id);
CREATE INDEX IF NOT EXISTS idx_early_adopters_platform ON early_adopters(platform);
CREATE INDEX IF NOT EXISTS idx_early_adopters_relevance ON early_adopters(relevance_score DESC);

CREATE INDEX IF NOT EXISTS idx_hypothesis_research_idea_id ON hypothesis_research(idea_id);
CREATE INDEX IF NOT EXISTS idx_hypothesis_research_hypothesis_id ON hypothesis_research(hypothesis_id);

CREATE INDEX IF NOT EXISTS idx_deep_research_results_idea_id ON deep_research_results(idea_id);
CREATE INDEX IF NOT EXISTS idx_deep_research_results_version ON deep_research_results(idea_id, version DESC);

-- Row Level Security (RLS) Policies

-- Enable RLS on tables
ALTER TABLE early_adopters ENABLE ROW LEVEL SECURITY;
ALTER TABLE hypothesis_research ENABLE ROW LEVEL SECURITY;
ALTER TABLE deep_research_results ENABLE ROW LEVEL SECURITY;

-- Early Adopters: Owner can view and manage their idea's early adopters
CREATE POLICY early_adopters_owner_select ON early_adopters
    FOR SELECT
    USING (
        idea_id IN (
            SELECT id FROM ideas WHERE user_id = auth.uid()
        )
    );

CREATE POLICY early_adopters_owner_insert ON early_adopters
    FOR INSERT
    WITH CHECK (
        idea_id IN (
            SELECT id FROM ideas WHERE user_id = auth.uid()
        )
    );

CREATE POLICY early_adopters_owner_update ON early_adopters
    FOR UPDATE
    USING (
        idea_id IN (
            SELECT id FROM ideas WHERE user_id = auth.uid()
        )
    );

CREATE POLICY early_adopters_owner_delete ON early_adopters
    FOR DELETE
    USING (
        idea_id IN (
            SELECT id FROM ideas WHERE user_id = auth.uid()
        )
    );

-- Hypothesis Research: Owner can view and manage their idea's hypothesis research
CREATE POLICY hypothesis_research_owner_select ON hypothesis_research
    FOR SELECT
    USING (
        idea_id IN (
            SELECT id FROM ideas WHERE user_id = auth.uid()
        )
    );

CREATE POLICY hypothesis_research_owner_insert ON hypothesis_research
    FOR INSERT
    WITH CHECK (
        idea_id IN (
            SELECT id FROM ideas WHERE user_id = auth.uid()
        )
    );

CREATE POLICY hypothesis_research_owner_update ON hypothesis_research
    FOR UPDATE
    USING (
        idea_id IN (
            SELECT id FROM ideas WHERE user_id = auth.uid()
        )
    );

CREATE POLICY hypothesis_research_owner_delete ON hypothesis_research
    FOR DELETE
    USING (
        idea_id IN (
            SELECT id FROM ideas WHERE user_id = auth.uid()
        )
    );

-- Deep Research Results: Owner can view and manage their idea's research results
CREATE POLICY deep_research_results_owner_select ON deep_research_results
    FOR SELECT
    USING (
        idea_id IN (
            SELECT id FROM ideas WHERE user_id = auth.uid()
        )
    );

CREATE POLICY deep_research_results_owner_insert ON deep_research_results
    FOR INSERT
    WITH CHECK (
        idea_id IN (
            SELECT id FROM ideas WHERE user_id = auth.uid()
        )
    );

CREATE POLICY deep_research_results_owner_update ON deep_research_results
    FOR UPDATE
    USING (
        idea_id IN (
            SELECT id FROM ideas WHERE user_id = auth.uid()
        )
    );

CREATE POLICY deep_research_results_owner_delete ON deep_research_results
    FOR DELETE
    USING (
        idea_id IN (
            SELECT id FROM ideas WHERE user_id = auth.uid()
        )
    );

-- Updated at trigger function (reuse from existing if available)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_early_adopters_updated_at
    BEFORE UPDATE ON early_adopters
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hypothesis_research_updated_at
    BEFORE UPDATE ON hypothesis_research
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deep_research_results_updated_at
    BEFORE UPDATE ON deep_research_results
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
