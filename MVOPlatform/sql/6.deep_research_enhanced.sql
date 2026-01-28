-- AI Market Validation & Analysis Tables
-- Schema for storing market validation results with 5 sections
-- Replaces previous deep research enhanced schema

-- Market Validation Results Table
-- Stores complete market validation results with versioning
CREATE TABLE IF NOT EXISTS deep_research_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,

    -- Market Validation sections (JSONB for flexible storage)
    market_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    behavioral_hypotheses JSONB NOT NULL DEFAULT '[]'::jsonb,
    market_signals JSONB NOT NULL DEFAULT '[]'::jsonb,
    conflicts_and_gaps JSONB NOT NULL DEFAULT '{}'::jsonb,
    synthesis_and_next_steps JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Raw search data for transparency
    search_data JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Metadata
    language VARCHAR(5) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Ensure unique version per idea
    UNIQUE(idea_id, version)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_deep_research_results_idea_id ON deep_research_results(idea_id);
CREATE INDEX IF NOT EXISTS idx_deep_research_results_version ON deep_research_results(idea_id, version DESC);
CREATE INDEX IF NOT EXISTS idx_deep_research_results_language ON deep_research_results(language);

-- GIN indexes for JSONB columns (for efficient querying)
CREATE INDEX IF NOT EXISTS idx_market_snapshot_gin ON deep_research_results USING GIN (market_snapshot);
CREATE INDEX IF NOT EXISTS idx_behavioral_hypotheses_gin ON deep_research_results USING GIN (behavioral_hypotheses);
CREATE INDEX IF NOT EXISTS idx_market_signals_gin ON deep_research_results USING GIN (market_signals);

-- Row Level Security (RLS) Policies

-- Enable RLS on table
ALTER TABLE deep_research_results ENABLE ROW LEVEL SECURITY;

-- Market Validation Results: Owner can view and manage their idea's validation results
CREATE POLICY deep_research_results_owner_select ON deep_research_results
    FOR SELECT
    USING (
        idea_id IN (
            SELECT id FROM ideas WHERE creator_id = auth.uid()
        )
    );

CREATE POLICY deep_research_results_owner_insert ON deep_research_results
    FOR INSERT
    WITH CHECK (
        idea_id IN (
            SELECT id FROM ideas WHERE creator_id = auth.uid()
        )
    );

CREATE POLICY deep_research_results_owner_update ON deep_research_results
    FOR UPDATE
    USING (
        idea_id IN (
            SELECT id FROM ideas WHERE creator_id = auth.uid()
        )
    );

CREATE POLICY deep_research_results_owner_delete ON deep_research_results
    FOR DELETE
    USING (
        idea_id IN (
            SELECT id FROM ideas WHERE creator_id = auth.uid()
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

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_deep_research_results_updated_at ON deep_research_results;
CREATE TRIGGER update_deep_research_results_updated_at
    BEFORE UPDATE ON deep_research_results
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Drop old tables that are no longer needed
DROP TABLE IF EXISTS early_adopters CASCADE;
DROP TABLE IF EXISTS hypothesis_research CASCADE;

-- Comments for documentation
COMMENT ON TABLE deep_research_results IS 'Stores AI Market Validation & Analysis results with 5 sections: Market Snapshot, Behavioral Hypotheses, Market Signals, Conflicts & Gaps, and Synthesis & Next Steps';
COMMENT ON COLUMN deep_research_results.market_snapshot IS 'Market Snapshot section: customer segment, market context, geography, timing';
COMMENT ON COLUMN deep_research_results.behavioral_hypotheses IS 'Array of 5 behavioral hypotheses validating existence, awareness, consideration, intent, and pay intention';
COMMENT ON COLUMN deep_research_results.market_signals IS 'Array of 9 market-level signals including demand intensity, competitive landscape, etc.';
COMMENT ON COLUMN deep_research_results.conflicts_and_gaps IS 'Contradictions, missing signals, and risk flags identified in the analysis';
COMMENT ON COLUMN deep_research_results.synthesis_and_next_steps IS 'Summary of strong/weak points, unknowns, and suggested validation steps';
COMMENT ON COLUMN deep_research_results.search_data IS 'Raw search data from SerpAPI (Google, Bing, Trends) for transparency and citation';
