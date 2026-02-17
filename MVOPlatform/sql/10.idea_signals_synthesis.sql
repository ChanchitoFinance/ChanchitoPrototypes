-- Idea Signals Synthesis
-- Stores AI-generated decision synthesis (internal + external signals) per idea version.
-- Run after 6.ai_features.sql

CREATE TABLE IF NOT EXISTS idea_signals_synthesis (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    idea_version_number INTEGER NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,

    -- Synthesis sections (JSONB)
    synthesis_result JSONB NOT NULL DEFAULT '{}'::jsonb,

    -- Metadata
    language VARCHAR(5) DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(idea_id, idea_version_number, version)
);

CREATE INDEX IF NOT EXISTS idx_idea_signals_synthesis_idea_id ON idea_signals_synthesis(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_signals_synthesis_idea_version ON idea_signals_synthesis(idea_id, idea_version_number);
CREATE INDEX IF NOT EXISTS idx_idea_signals_synthesis_version ON idea_signals_synthesis(idea_id, idea_version_number, version DESC);
CREATE INDEX IF NOT EXISTS idx_idea_signals_synthesis_result_gin ON idea_signals_synthesis USING GIN (synthesis_result);

ALTER TABLE idea_signals_synthesis ENABLE ROW LEVEL SECURITY;

CREATE POLICY idea_signals_synthesis_owner_select ON idea_signals_synthesis
    FOR SELECT
    USING (
        idea_id IN (SELECT id FROM ideas WHERE creator_id = auth.uid())
    );

CREATE POLICY idea_signals_synthesis_owner_insert ON idea_signals_synthesis
    FOR INSERT
    WITH CHECK (
        idea_id IN (SELECT id FROM ideas WHERE creator_id = auth.uid())
    );

CREATE POLICY idea_signals_synthesis_owner_update ON idea_signals_synthesis
    FOR UPDATE
    USING (
        idea_id IN (SELECT id FROM ideas WHERE creator_id = auth.uid())
    );

CREATE POLICY idea_signals_synthesis_owner_delete ON idea_signals_synthesis
    FOR DELETE
    USING (
        idea_id IN (SELECT id FROM ideas WHERE creator_id = auth.uid())
    );

DROP TRIGGER IF EXISTS update_idea_signals_synthesis_updated_at ON idea_signals_synthesis;
CREATE TRIGGER update_idea_signals_synthesis_updated_at
    BEFORE UPDATE ON idea_signals_synthesis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
