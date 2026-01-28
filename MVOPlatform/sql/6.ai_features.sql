-- AI Features Tables
-- Schema for storing AI-generated features including Market Validation and AI Personas Evaluation
-- Replaces previous combined table schema

-- Market Validation Results Table
-- Stores complete market validation results with versioning per idea version
CREATE TABLE IF NOT EXISTS market_validation_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    idea_version_number INTEGER NOT NULL,
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
    
    -- Ensure unique version per idea and idea version
    UNIQUE(idea_id, idea_version_number, version)
);

-- AI Personas Evaluation Table
-- Stores AI personas evaluation results with versioning per idea version
CREATE TABLE IF NOT EXISTS ai_personas_evaluation_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    idea_version_number INTEGER NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    
    -- AI Personas Evaluation
    ai_personas_evaluation JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Metadata
    language VARCHAR(5) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique version per idea and idea version
    UNIQUE(idea_id, idea_version_number, version)
);

-- Indexes for better query performance

-- Market Validation
CREATE INDEX IF NOT EXISTS idx_market_validation_idea_id ON market_validation_results(idea_id);
CREATE INDEX IF NOT EXISTS idx_market_validation_idea_version ON market_validation_results(idea_id, idea_version_number);
CREATE INDEX IF NOT EXISTS idx_market_validation_version ON market_validation_results(idea_id, idea_version_number, version DESC);
CREATE INDEX IF NOT EXISTS idx_market_validation_language ON market_validation_results(language);

-- Market Validation GIN indexes for JSONB columns (for efficient querying)
CREATE INDEX IF NOT EXISTS idx_market_validation_snapshot_gin ON market_validation_results USING GIN (market_snapshot);
CREATE INDEX IF NOT EXISTS idx_market_validation_hypotheses_gin ON market_validation_results USING GIN (behavioral_hypotheses);
CREATE INDEX IF NOT EXISTS idx_market_validation_signals_gin ON market_validation_results USING GIN (market_signals);

-- AI Personas Evaluation
CREATE INDEX IF NOT EXISTS idx_ai_personas_evaluation_idea_id ON ai_personas_evaluation_results(idea_id);
CREATE INDEX IF NOT EXISTS idx_ai_personas_evaluation_idea_version ON ai_personas_evaluation_results(idea_id, idea_version_number);
CREATE INDEX IF NOT EXISTS idx_ai_personas_evaluation_version ON ai_personas_evaluation_results(idea_id, idea_version_number, version DESC);
CREATE INDEX IF NOT EXISTS idx_ai_personas_evaluation_language ON ai_personas_evaluation_results(language);

-- AI Personas Evaluation GIN index for JSONB column (for efficient querying)
CREATE INDEX IF NOT EXISTS idx_ai_personas_evaluation_gin ON ai_personas_evaluation_results USING GIN (ai_personas_evaluation);

-- Row Level Security (RLS) Policies

-- Enable RLS on both tables
ALTER TABLE market_validation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_personas_evaluation_results ENABLE ROW LEVEL SECURITY;

-- Market Validation Results: Owner can view and manage their idea's validation results
CREATE POLICY market_validation_results_owner_select ON market_validation_results
    FOR SELECT
    USING (
        idea_id IN (
            SELECT id FROM ideas WHERE creator_id = auth.uid()
        )
    );

CREATE POLICY market_validation_results_owner_insert ON market_validation_results
    FOR INSERT
    WITH CHECK (
        idea_id IN (
            SELECT id FROM ideas WHERE creator_id = auth.uid()
        )
    );

CREATE POLICY market_validation_results_owner_update ON market_validation_results
    FOR UPDATE
    USING (
        idea_id IN (
            SELECT id FROM ideas WHERE creator_id = auth.uid()
        )
    );

CREATE POLICY market_validation_results_owner_delete ON market_validation_results
    FOR DELETE
    USING (
        idea_id IN (
            SELECT id FROM ideas WHERE creator_id = auth.uid()
        )
    );

-- AI Personas Evaluation Results: Owner can view and manage their idea's AI personas evaluation results
CREATE POLICY ai_personas_evaluation_results_owner_select ON ai_personas_evaluation_results
    FOR SELECT
    USING (
        idea_id IN (
            SELECT id FROM ideas WHERE creator_id = auth.uid()
        )
    );

CREATE POLICY ai_personas_evaluation_results_owner_insert ON ai_personas_evaluation_results
    FOR INSERT
    WITH CHECK (
        idea_id IN (
            SELECT id FROM ideas WHERE creator_id = auth.uid()
        )
    );

CREATE POLICY ai_personas_evaluation_results_owner_update ON ai_personas_evaluation_results
    FOR UPDATE
    USING (
        idea_id IN (
            SELECT id FROM ideas WHERE creator_id = auth.uid()
        )
    );

CREATE POLICY ai_personas_evaluation_results_owner_delete ON ai_personas_evaluation_results
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

-- Triggers for updated_at

-- Market Validation
DROP TRIGGER IF EXISTS update_market_validation_results_updated_at ON market_validation_results;
CREATE TRIGGER update_market_validation_results_updated_at
    BEFORE UPDATE ON market_validation_results
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- AI Personas Evaluation
DROP TRIGGER IF EXISTS update_ai_personas_evaluation_results_updated_at ON ai_personas_evaluation_results;
CREATE TRIGGER update_ai_personas_evaluation_results_updated_at
    BEFORE UPDATE ON ai_personas_evaluation_results
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
