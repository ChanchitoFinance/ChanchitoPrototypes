-- =====================================================
-- IDEA ANALYTICS TABLE & FUNCTIONS
-- For tracking engagement metrics and providing creator insights
-- =====================================================

-- Analytics table for storing aggregated metrics per idea
CREATE TABLE IF NOT EXISTS idea_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE UNIQUE,
    
    -- View metrics
    total_views INTEGER DEFAULT 0,
    unique_viewers INTEGER DEFAULT 0,
    
    -- Engagement velocity (time-based)
    first_vote_at TIMESTAMPTZ,
    first_comment_at TIMESTAMPTZ,
    time_to_first_vote_seconds INTEGER,
    time_to_first_comment_seconds INTEGER,
    
    -- AI feature tracking
    has_ai_comments BOOLEAN DEFAULT FALSE,
    has_deep_research BOOLEAN DEFAULT FALSE,
    has_personas_evaluation BOOLEAN DEFAULT FALSE,
    ai_comments_count INTEGER DEFAULT 0,
    
    -- Daily snapshots (JSONB array for trend charts)
    -- Format: [{date: "2024-01-01", use: 5, dislike: 1, pay: 2}]
    daily_votes JSONB DEFAULT '[]'::jsonb,
    -- Format: [{date: "2024-01-01", count: 10}]
    daily_views JSONB DEFAULT '[]'::jsonb,
    
    -- Computed metrics (updated by triggers/functions)
    pay_conversion_rate DECIMAL(5,2) DEFAULT 0,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table to track unique viewers per idea (for accurate unique counts)
CREATE TABLE IF NOT EXISTS idea_view_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    viewer_fingerprint TEXT, -- For anonymous viewers (optional)
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    -- Prevent duplicate views from same user within short timeframe
    UNIQUE(idea_id, viewer_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_idea_analytics_idea_id ON idea_analytics(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_analytics_has_ai ON idea_analytics(has_ai_comments);
CREATE INDEX IF NOT EXISTS idx_idea_view_logs_idea_id ON idea_view_logs(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_view_logs_viewer_id ON idea_view_logs(viewer_id);
CREATE INDEX IF NOT EXISTS idx_idea_view_logs_viewed_at ON idea_view_logs(viewed_at);

-- =====================================================
-- RPC FUNCTIONS FOR ATOMIC UPDATES
-- =====================================================

-- Function to record a view and update analytics atomically
CREATE OR REPLACE FUNCTION record_idea_view(
    p_idea_id UUID,
    p_viewer_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
    v_idea_record RECORD;
    v_today DATE := CURRENT_DATE;
    v_daily_views JSONB;
    v_today_entry JSONB;
    v_new_entry JSONB;
    v_is_new_viewer BOOLEAN := FALSE;
BEGIN
    -- Get or create analytics record
    INSERT INTO idea_analytics (idea_id)
    VALUES (p_idea_id)
    ON CONFLICT (idea_id) DO NOTHING;
    
    -- Check if this is a unique viewer
    IF p_viewer_id IS NOT NULL THEN
        INSERT INTO idea_view_logs (idea_id, viewer_id)
        VALUES (p_idea_id, p_viewer_id)
        ON CONFLICT (idea_id, viewer_id) DO NOTHING;
        
        GET DIAGNOSTICS v_is_new_viewer = ROW_COUNT;
    END IF;

    -- Update view counts
    UPDATE idea_analytics
    SET 
        total_views = total_views + 1,
        unique_viewers = CASE WHEN v_is_new_viewer THEN unique_viewers + 1 ELSE unique_viewers END,
        daily_views = (
            SELECT COALESCE(
                jsonb_agg(
                    CASE 
                        WHEN (elem->>'date')::date = v_today THEN
                            jsonb_build_object('date', v_today, 'count', (elem->>'count')::int + 1)
                        ELSE elem
                    END
                ),
                '[]'::jsonb
            )
            FROM jsonb_array_elements(
                CASE 
                    WHEN daily_views @> jsonb_build_array(jsonb_build_object('date', v_today::text))
                        OR EXISTS (SELECT 1 FROM jsonb_array_elements(daily_views) e WHERE (e->>'date')::date = v_today)
                    THEN daily_views
                    ELSE daily_views || jsonb_build_array(jsonb_build_object('date', v_today::text, 'count', 0))
                END
            ) AS elem
        ),
        updated_at = NOW()
    WHERE idea_id = p_idea_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to record a vote and update analytics
CREATE OR REPLACE FUNCTION record_vote_analytics(
    p_idea_id UUID,
    p_vote_type TEXT -- 'use', 'dislike', 'pay'
)
RETURNS VOID AS $$
DECLARE
    v_idea RECORD;
    v_analytics RECORD;
    v_today DATE := CURRENT_DATE;
    v_is_first_vote BOOLEAN := FALSE;
    v_total_votes INTEGER;
    v_pay_votes INTEGER;
BEGIN
    -- Get idea creation time
    SELECT created_at INTO v_idea FROM ideas WHERE id = p_idea_id;

    -- Get or create analytics record
    INSERT INTO idea_analytics (idea_id)
    VALUES (p_idea_id)
    ON CONFLICT (idea_id) DO NOTHING;

    -- Check if this is the first vote
    SELECT first_vote_at INTO v_analytics FROM idea_analytics WHERE idea_id = p_idea_id;
    v_is_first_vote := v_analytics.first_vote_at IS NULL;
    
    -- Get current vote counts for pay conversion calculation
    SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE vote_type = 'pay') as pay_count
    INTO v_total_votes, v_pay_votes
    FROM idea_votes 
    WHERE idea_id = p_idea_id;

    -- Update analytics
    UPDATE idea_analytics
    SET 
        first_vote_at = CASE WHEN v_is_first_vote THEN NOW() ELSE first_vote_at END,
        time_to_first_vote_seconds = CASE 
            WHEN v_is_first_vote THEN EXTRACT(EPOCH FROM (NOW() - v_idea.created_at))::INTEGER
            ELSE time_to_first_vote_seconds 
        END,
        daily_votes = update_daily_votes(daily_votes, v_today, p_vote_type),
        pay_conversion_rate = CASE 
            WHEN v_total_votes > 0 THEN ROUND((v_pay_votes::DECIMAL / v_total_votes) * 100, 2)
            ELSE 0 
        END,
        updated_at = NOW()
    WHERE idea_id = p_idea_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to update daily votes JSONB
CREATE OR REPLACE FUNCTION update_daily_votes(
    p_daily_votes JSONB,
    p_date DATE,
    p_vote_type TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_found BOOLEAN := FALSE;
    v_result JSONB := '[]'::jsonb;
    v_elem JSONB;
BEGIN
    -- Iterate through existing entries
    FOR v_elem IN SELECT * FROM jsonb_array_elements(p_daily_votes)
    LOOP
        IF (v_elem->>'date')::date = p_date THEN
            v_found := TRUE;
            v_result := v_result || jsonb_build_array(
                jsonb_build_object(
                    'date', p_date::text,
                    'use', COALESCE((v_elem->>'use')::int, 0) + CASE WHEN p_vote_type = 'use' THEN 1 ELSE 0 END,
                    'dislike', COALESCE((v_elem->>'dislike')::int, 0) + CASE WHEN p_vote_type = 'dislike' THEN 1 ELSE 0 END,
                    'pay', COALESCE((v_elem->>'pay')::int, 0) + CASE WHEN p_vote_type = 'pay' THEN 1 ELSE 0 END
                )
            );
        ELSE
            v_result := v_result || jsonb_build_array(v_elem);
        END IF;
    END LOOP;
    
    -- Add new entry if not found
    IF NOT v_found THEN
        v_result := v_result || jsonb_build_array(
            jsonb_build_object(
                'date', p_date::text,
                'use', CASE WHEN p_vote_type = 'use' THEN 1 ELSE 0 END,
                'dislike', CASE WHEN p_vote_type = 'dislike' THEN 1 ELSE 0 END,
                'pay', CASE WHEN p_vote_type = 'pay' THEN 1 ELSE 0 END
            )
        );
    END IF;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to record a comment and update analytics
CREATE OR REPLACE FUNCTION record_comment_analytics(
    p_idea_id UUID,
    p_is_ai_comment BOOLEAN DEFAULT FALSE
)
RETURNS VOID AS $$
DECLARE
    v_idea RECORD;
    v_analytics RECORD;
    v_is_first_comment BOOLEAN := FALSE;
BEGIN
    -- Get idea creation time
    SELECT created_at INTO v_idea FROM ideas WHERE id = p_idea_id;
    
    -- Get or create analytics record
    INSERT INTO idea_analytics (idea_id)
    VALUES (p_idea_id)
    ON CONFLICT (idea_id) DO NOTHING;
    
    -- Check if this is the first comment
    SELECT first_comment_at INTO v_analytics FROM idea_analytics WHERE idea_id = p_idea_id;
    v_is_first_comment := v_analytics.first_comment_at IS NULL;
    
    -- Update analytics
    UPDATE idea_analytics
    SET 
        first_comment_at = CASE WHEN v_is_first_comment THEN NOW() ELSE first_comment_at END,
        time_to_first_comment_seconds = CASE 
            WHEN v_is_first_comment THEN EXTRACT(EPOCH FROM (NOW() - v_idea.created_at))::INTEGER
            ELSE time_to_first_comment_seconds 
        END,
        has_ai_comments = CASE WHEN p_is_ai_comment THEN TRUE ELSE has_ai_comments END,
        ai_comments_count = CASE WHEN p_is_ai_comment THEN ai_comments_count + 1 ELSE ai_comments_count END,
        updated_at = NOW()
    WHERE idea_id = p_idea_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark AI feature usage
CREATE OR REPLACE FUNCTION record_ai_feature_usage(
    p_idea_id UUID,
    p_feature_type TEXT -- 'deep_research', 'personas_evaluation', 'ai_comments'
)
RETURNS VOID AS $$
BEGIN
    -- Get or create analytics record
    INSERT INTO idea_analytics (idea_id)
    VALUES (p_idea_id)
    ON CONFLICT (idea_id) DO NOTHING;
    
    -- Update the appropriate flag
    UPDATE idea_analytics
    SET 
        has_deep_research = CASE WHEN p_feature_type = 'deep_research' THEN TRUE ELSE has_deep_research END,
        has_personas_evaluation = CASE WHEN p_feature_type = 'personas_evaluation' THEN TRUE ELSE has_personas_evaluation END,
        has_ai_comments = CASE WHEN p_feature_type = 'ai_comments' THEN TRUE ELSE has_ai_comments END,
        updated_at = NOW()
    WHERE idea_id = p_idea_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get creator insights aggregated from all their ideas
CREATE OR REPLACE FUNCTION get_creator_insights(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
BEGIN
    SELECT json_build_object(
        -- Validation Signals
        'payConversionRate', COALESCE(AVG(a.pay_conversion_rate), 0),
        'avgTimeToFirstVote', COALESCE(AVG(a.time_to_first_vote_seconds), 0),
        'avgTimeToFirstComment', COALESCE(AVG(a.time_to_first_comment_seconds), 0),
        'sentimentRatio', (
            SELECT CASE 
                WHEN SUM(CASE WHEN iv.vote_type = 'dislike' THEN 1 ELSE 0 END) > 0 
                THEN ROUND(
                    SUM(CASE WHEN iv.vote_type IN ('use', 'pay') THEN 1 ELSE 0 END)::DECIMAL / 
                    NULLIF(SUM(CASE WHEN iv.vote_type = 'dislike' THEN 1 ELSE 0 END), 0),
                    2
                )
                ELSE 0
            END
            FROM idea_votes iv
            JOIN ideas i ON iv.idea_id = i.id
            WHERE i.creator_id = p_user_id
        ),
        
        -- Engagement Trends (last 30 days aggregated)
        'dailyVoteTrends', COALESCE((
            SELECT json_agg(row_to_json(t))
            FROM (
                SELECT 
                    d::date as date,
                    COALESCE(SUM((v->>'use')::int), 0) as use,
                    COALESCE(SUM((v->>'dislike')::int), 0) as dislike,
                    COALESCE(SUM((v->>'pay')::int), 0) as pay
                FROM generate_series(
                    CURRENT_DATE - INTERVAL '30 days',
                    CURRENT_DATE,
                    '1 day'::interval
                ) d
                LEFT JOIN idea_analytics a ON a.idea_id IN (SELECT id FROM ideas WHERE creator_id = p_user_id)
                LEFT JOIN LATERAL jsonb_array_elements(a.daily_votes) v ON (v->>'date')::date = d::date
                GROUP BY d::date
                ORDER BY d::date
            ) t
        ), '[]'::json),
        'voteVelocity', (
            SELECT COALESCE(ROUND(COUNT(*)::DECIMAL / NULLIF(EXTRACT(DAY FROM (MAX(iv.created_at) - MIN(iv.created_at))), 0), 2), 0)
            FROM idea_votes iv
            JOIN ideas i ON iv.idea_id = i.id
            WHERE i.creator_id = p_user_id
            AND iv.created_at >= CURRENT_DATE - INTERVAL '30 days'
        ),
        
        -- AI Value comparison
        'ideasWithAI', (
            SELECT json_build_object(
                'count', COUNT(DISTINCT i.id),
                'avgVotes', COALESCE(ROUND(AVG(vote_counts.total)::DECIMAL, 1), 0),
                'avgPayRate', COALESCE(ROUND(AVG(a.pay_conversion_rate)::DECIMAL, 1), 0)
            )
            FROM ideas i
            LEFT JOIN idea_analytics a ON a.idea_id = i.id
            LEFT JOIN (
                SELECT idea_id, COUNT(*) as total
                FROM idea_votes
                GROUP BY idea_id
            ) vote_counts ON vote_counts.idea_id = i.id
            WHERE i.creator_id = p_user_id
            AND (a.has_ai_comments = TRUE OR a.has_deep_research = TRUE OR a.has_personas_evaluation = TRUE)
        ),
        'ideasWithoutAI', (
            SELECT json_build_object(
                'count', COUNT(DISTINCT i.id),
                'avgVotes', COALESCE(ROUND(AVG(vote_counts.total)::DECIMAL, 1), 0),
                'avgPayRate', COALESCE(ROUND(AVG(COALESCE(a.pay_conversion_rate, 0))::DECIMAL, 1), 0)
            )
            FROM ideas i
            LEFT JOIN idea_analytics a ON a.idea_id = i.id
            LEFT JOIN (
                SELECT idea_id, COUNT(*) as total
                FROM idea_votes
                GROUP BY idea_id
            ) vote_counts ON vote_counts.idea_id = i.id
            WHERE i.creator_id = p_user_id
            AND (a.id IS NULL OR (COALESCE(a.has_ai_comments, FALSE) = FALSE AND COALESCE(a.has_deep_research, FALSE) = FALSE AND COALESCE(a.has_personas_evaluation, FALSE) = FALSE))
        ),
        'aiFeatureUsage', (
            SELECT json_build_object(
                'deepResearch', COUNT(*) FILTER (WHERE a.has_deep_research = TRUE),
                'personasEval', COUNT(*) FILTER (WHERE a.has_personas_evaluation = TRUE),
                'aiComments', COUNT(*) FILTER (WHERE a.has_ai_comments = TRUE)
            )
            FROM ideas i
            LEFT JOIN idea_analytics a ON a.idea_id = i.id
            WHERE i.creator_id = p_user_id
        ),
        
        -- Total counts
        'totalViews', COALESCE(SUM(a.total_views), 0),
        'totalUniqueViewers', COALESCE(SUM(a.unique_viewers), 0)
    ) INTO v_result
    FROM ideas i
    LEFT JOIN idea_analytics a ON a.idea_id = i.id
    WHERE i.creator_id = p_user_id
    AND i.is_active_version = TRUE;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE idea_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_view_logs ENABLE ROW LEVEL SECURITY;

-- Analytics: owners can view their idea analytics, anyone can update via RPC
DROP POLICY IF EXISTS "Owners can view their idea analytics" ON idea_analytics;
CREATE POLICY "Owners can view their idea analytics" ON idea_analytics
    FOR SELECT
    USING (
        idea_id IN (SELECT id FROM ideas WHERE creator_id = auth.uid())
    );

-- Allow insert/update via RPC (service role)
DROP POLICY IF EXISTS "Allow analytics updates" ON idea_analytics;
CREATE POLICY "Allow analytics updates" ON idea_analytics
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- View logs: anyone can insert (for tracking), owners can view
DROP POLICY IF EXISTS "Anyone can log views" ON idea_view_logs;
CREATE POLICY "Anyone can log views" ON idea_view_logs
    FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Owners can view their view logs" ON idea_view_logs;
CREATE POLICY "Owners can view their view logs" ON idea_view_logs
    FOR SELECT
    USING (
        idea_id IN (SELECT id FROM ideas WHERE creator_id = auth.uid())
    );

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION record_idea_view(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION record_idea_view(UUID, UUID) TO anon;
GRANT EXECUTE ON FUNCTION record_vote_analytics(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION record_comment_analytics(UUID, BOOLEAN) TO authenticated;
GRANT EXECUTE ON FUNCTION record_ai_feature_usage(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION get_creator_insights(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_daily_votes(JSONB, DATE, TEXT) TO authenticated;

-- Updated at trigger
DROP TRIGGER IF EXISTS update_idea_analytics_updated_at ON idea_analytics;
CREATE TRIGGER update_idea_analytics_updated_at
    BEFORE UPDATE ON idea_analytics
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
