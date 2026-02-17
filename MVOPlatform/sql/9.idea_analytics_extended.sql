-- =====================================================
-- EXTENDED ANALYTICS: detail views, feed impressions, signal overview
-- Run after 7.idea_analytics.sql
-- =====================================================

-- Detail view sessions: one row per "open detail page" with optional dwell/scroll on exit
CREATE TABLE IF NOT EXISTS idea_detail_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    dwell_ms INTEGER,
    scroll_depth_pct INTEGER CHECK (scroll_depth_pct >= 0 AND scroll_depth_pct <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_idea_detail_views_idea_id ON idea_detail_views(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_detail_views_viewer_id ON idea_detail_views(viewer_id);
CREATE INDEX IF NOT EXISTS idx_idea_detail_views_started_at ON idea_detail_views(started_at);

-- Feed impressions: when an idea was shown in a feed (with optional dwell)
CREATE TABLE IF NOT EXISTS idea_feed_impressions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    idea_id UUID NOT NULL REFERENCES ideas(id) ON DELETE CASCADE,
    viewer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    feed_type TEXT NOT NULL CHECK (feed_type IN ('home', 'for_you', 'browse', 'activity', 'other')),
    shown_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    dwell_ms INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_idea_feed_impressions_idea_id ON idea_feed_impressions(idea_id);
CREATE INDEX IF NOT EXISTS idx_idea_feed_impressions_viewer_id ON idea_feed_impressions(viewer_id);
CREATE INDEX IF NOT EXISTS idx_idea_feed_impressions_shown_at ON idea_feed_impressions(shown_at);
CREATE INDEX IF NOT EXISTS idx_idea_feed_impressions_feed_type ON idea_feed_impressions(feed_type);

-- =====================================================
-- RPC: record detail view start (returns id for client to send on end)
-- =====================================================
CREATE OR REPLACE FUNCTION record_detail_view_start(
    p_idea_id UUID,
    p_viewer_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO public.idea_detail_views (idea_id, viewer_id)
    VALUES (p_idea_id, p_viewer_id)
    RETURNING id INTO v_id;
    RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- RPC: record detail view end (dwell and scroll)
-- =====================================================
CREATE OR REPLACE FUNCTION record_detail_view_end(
    p_detail_view_id UUID,
    p_dwell_ms INTEGER DEFAULT NULL,
    p_scroll_depth_pct INTEGER DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.idea_detail_views
    SET ended_at = NOW(),
        dwell_ms = COALESCE(p_dwell_ms, dwell_ms),
        scroll_depth_pct = COALESCE(p_scroll_depth_pct, scroll_depth_pct)
    WHERE id = p_detail_view_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- RPC: record feed impression (returns id for optional dwell update)
-- =====================================================
CREATE OR REPLACE FUNCTION record_feed_impression(
    p_idea_id UUID,
    p_viewer_id UUID DEFAULT NULL,
    p_feed_type TEXT DEFAULT 'other'
)
RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO public.idea_feed_impressions (idea_id, viewer_id, feed_type)
    VALUES (p_idea_id, p_viewer_id, p_feed_type)
    RETURNING id INTO v_id;
    RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION record_feed_impression_dwell(
    p_impression_id UUID,
    p_dwell_ms INTEGER
)
RETURNS VOID AS $$
BEGIN
    UPDATE public.idea_feed_impressions
    SET dwell_ms = p_dwell_ms
    WHERE id = p_impression_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- RPC: get creator signal overview (signal mix + drift for dashboard)
-- =====================================================
CREATE OR REPLACE FUNCTION get_creator_signal_overview(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
    v_total_use INT;
    v_total_dislike INT;
    v_total_pay INT;
BEGIN
    SELECT
        COALESCE(SUM(CASE WHEN vote_type = 'use' THEN 1 ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN vote_type = 'dislike' THEN 1 ELSE 0 END), 0),
        COALESCE(SUM(CASE WHEN vote_type = 'pay' THEN 1 ELSE 0 END), 0)
    INTO v_total_use, v_total_dislike, v_total_pay
    FROM idea_votes iv
    JOIN ideas i ON iv.idea_id = i.id
    WHERE i.creator_id = p_user_id AND i.is_active_version = TRUE AND COALESCE(i.is_article, FALSE) = FALSE;

    SELECT json_build_object(
        'totalIdeas', (SELECT COUNT(*) FROM ideas WHERE creator_id = p_user_id AND is_active_version = TRUE AND COALESCE(is_article, FALSE) = FALSE),
        'totalVotes', COALESCE(v_total_use + v_total_dislike + v_total_pay, 0),
        'totalComments', (SELECT COUNT(*) FROM comments c JOIN ideas i ON c.idea_id = i.id WHERE i.creator_id = p_user_id AND c.deleted_at IS NULL),
        'voteTypeBreakdown', json_build_object(
            'use', COALESCE(v_total_use, 0),
            'dislike', COALESCE(v_total_dislike, 0),
            'pay', COALESCE(v_total_pay, 0)
        ),
        'signalDriftLast30Days', (
            SELECT COALESCE(json_agg(row_to_json(t) ORDER BY t.date), '[]'::json)
            FROM (
                SELECT
                    d::date AS date,
                    CASE WHEN d::date = CURRENT_DATE THEN (SELECT COUNT(*) FROM idea_votes iv JOIN ideas i ON iv.idea_id = i.id WHERE i.creator_id = p_user_id AND iv.created_at::date = CURRENT_DATE AND iv.vote_type = 'use') ELSE COALESCE(SUM((v->>'use')::int), 0) END AS "use",
                    CASE WHEN d::date = CURRENT_DATE THEN (SELECT COUNT(*) FROM idea_votes iv JOIN ideas i ON iv.idea_id = i.id WHERE i.creator_id = p_user_id AND iv.created_at::date = CURRENT_DATE AND iv.vote_type = 'dislike') ELSE COALESCE(SUM((v->>'dislike')::int), 0) END AS dislike,
                    CASE WHEN d::date = CURRENT_DATE THEN (SELECT COUNT(*) FROM idea_votes iv JOIN ideas i ON iv.idea_id = i.id WHERE i.creator_id = p_user_id AND iv.created_at::date = CURRENT_DATE AND iv.vote_type = 'pay') ELSE COALESCE(SUM((v->>'pay')::int), 0) END AS pay,
                    (CASE WHEN d::date = CURRENT_DATE THEN (SELECT COUNT(*) FROM idea_votes iv JOIN ideas i ON iv.idea_id = i.id WHERE i.creator_id = p_user_id AND iv.created_at::date = CURRENT_DATE) ELSE (COALESCE(SUM((v->>'use')::int), 0) + COALESCE(SUM((v->>'dislike')::int), 0) + COALESCE(SUM((v->>'pay')::int), 0)) END) AS total,
                    (CASE WHEN d::date = CURRENT_DATE THEN (SELECT COUNT(*) FROM idea_votes iv JOIN ideas i ON iv.idea_id = i.id WHERE i.creator_id = p_user_id AND iv.created_at::date = CURRENT_DATE) ELSE (COALESCE(SUM((v->>'use')::int), 0) + COALESCE(SUM((v->>'dislike')::int), 0) + COALESCE(SUM((v->>'pay')::int), 0)) END) AS "voteChange"
                FROM generate_series(
                    CURRENT_DATE - INTERVAL '30 days',
                    CURRENT_DATE,
                    '1 day'::interval
                ) d
                LEFT JOIN idea_analytics a ON a.idea_id IN (SELECT id FROM ideas WHERE creator_id = p_user_id AND is_active_version = TRUE AND COALESCE(is_article, FALSE) = FALSE)
                LEFT JOIN LATERAL jsonb_array_elements(a.daily_votes) v ON (v->>'date')::date = d::date
                GROUP BY d::date
            ) t
        )
    ) INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- RPC: get creator attention/depth metrics (exposure + detail behavior)
-- =====================================================
CREATE OR REPLACE FUNCTION get_creator_attention_metrics(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
    v_idea_ids UUID[];
BEGIN
    SELECT ARRAY_AGG(id) INTO v_idea_ids FROM ideas WHERE creator_id = p_user_id AND is_active_version = TRUE AND COALESCE(is_article, FALSE) = FALSE;

    SELECT json_build_object(
        'totalFeedImpressions', (SELECT COALESCE(COUNT(*), 0) FROM public.idea_feed_impressions WHERE idea_id = ANY(COALESCE(v_idea_ids, ARRAY[]::UUID[]))),
        'reimpressionRate', (
            SELECT CASE WHEN (SELECT COUNT(*) FROM public.idea_feed_impressions WHERE idea_id = ANY(COALESCE(v_idea_ids, ARRAY[]::UUID[]))) > 0
                THEN (
                    (
                    (SELECT COUNT(*) FROM public.idea_feed_impressions fi
                     WHERE fi.idea_id = ANY(COALESCE(v_idea_ids, ARRAY[]::UUID[])) AND fi.viewer_id IS NOT NULL
                     AND EXISTS (SELECT 1 FROM public.idea_feed_impressions fi2 WHERE fi2.idea_id = fi.idea_id AND fi2.viewer_id = fi.viewer_id AND fi2.shown_at < fi.shown_at)
                    )::float / (SELECT COUNT(*) FROM public.idea_feed_impressions WHERE idea_id = ANY(COALESCE(v_idea_ids, ARRAY[]::UUID[])))
                    )
                ) ELSE 0 END
        ),
        'uniqueViewers', (SELECT COALESCE(SUM(a.unique_viewers), 0) FROM idea_analytics a WHERE a.idea_id = ANY(COALESCE(v_idea_ids, ARRAY[]::UUID[]))),
        'avgFeedDwellTimeMs', (SELECT COALESCE(AVG(dwell_ms), 0)::int FROM public.idea_feed_impressions WHERE idea_id = ANY(COALESCE(v_idea_ids, ARRAY[]::UUID[])) AND dwell_ms IS NOT NULL),
        'hoverDurationDesktopMs', (SELECT COALESCE(AVG(dwell_ms), 0)::int FROM public.idea_feed_impressions WHERE idea_id = ANY(COALESCE(v_idea_ids, ARRAY[]::UUID[])) AND dwell_ms IS NOT NULL),
        'detailViewStarts', (SELECT COALESCE(COUNT(*), 0) FROM public.idea_detail_views WHERE idea_id = ANY(COALESCE(v_idea_ids, ARRAY[]::UUID[]))),
        'avgDetailDwellTimeMs', (SELECT COALESCE(AVG(dwell_ms), 0)::int FROM public.idea_detail_views WHERE idea_id = ANY(COALESCE(v_idea_ids, ARRAY[]::UUID[])) AND dwell_ms IS NOT NULL),
        'medianDwellTimeMs', (SELECT COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY dwell_ms), 0)::int FROM public.idea_detail_views WHERE idea_id = ANY(COALESCE(v_idea_ids, ARRAY[]::UUID[])) AND dwell_ms IS NOT NULL),
        'scrollDepthAvgPct', (SELECT COALESCE(AVG(scroll_depth_pct), 0)::int FROM public.idea_detail_views WHERE idea_id = ANY(COALESCE(v_idea_ids, ARRAY[]::UUID[])) AND scroll_depth_pct IS NOT NULL),
        'returnToDetailRate', (
            SELECT CASE WHEN (SELECT COUNT(DISTINCT viewer_id) FROM public.idea_detail_views WHERE idea_id = ANY(COALESCE(v_idea_ids, ARRAY[]::UUID[])) AND viewer_id IS NOT NULL) > 0
                THEN (
                    (SELECT COUNT(DISTINCT viewer_id) FROM (SELECT viewer_id FROM public.idea_detail_views WHERE idea_id = ANY(COALESCE(v_idea_ids, ARRAY[]::UUID[])) AND viewer_id IS NOT NULL GROUP BY viewer_id HAVING COUNT(*) > 1) x)::float
                    / (SELECT COUNT(DISTINCT viewer_id) FROM public.idea_detail_views WHERE idea_id = ANY(COALESCE(v_idea_ids, ARRAY[]::UUID[])) AND viewer_id IS NOT NULL)
                ) ELSE 0 END
        ),
        'timeBetweenReturnsSec', (
            SELECT COALESCE((
                SELECT AVG(EXTRACT(EPOCH FROM (next_started - started_at)))::numeric(12,2)
                FROM (
                    SELECT viewer_id, started_at, LEAD(started_at) OVER (PARTITION BY viewer_id ORDER BY started_at) AS next_started
                    FROM public.idea_detail_views WHERE idea_id = ANY(COALESCE(v_idea_ids, ARRAY[]::UUID[])) AND viewer_id IS NOT NULL
                ) x WHERE next_started IS NOT NULL
            ), 0)
        ),
        'dwellTimeDistribution', (
            SELECT json_build_array(
                COALESCE(SUM(CASE WHEN dwell_ms < 2000 THEN 1 ELSE 0 END), 0),
                COALESCE(SUM(CASE WHEN dwell_ms >= 2000 AND dwell_ms < 5000 THEN 1 ELSE 0 END), 0),
                COALESCE(SUM(CASE WHEN dwell_ms >= 5000 AND dwell_ms < 10000 THEN 1 ELSE 0 END), 0),
                COALESCE(SUM(CASE WHEN dwell_ms >= 10000 AND dwell_ms < 30000 THEN 1 ELSE 0 END), 0),
                COALESCE(SUM(CASE WHEN dwell_ms >= 30000 THEN 1 ELSE 0 END), 0)
            )
            FROM public.idea_detail_views WHERE idea_id = ANY(COALESCE(v_idea_ids, ARRAY[]::UUID[])) AND dwell_ms IS NOT NULL
        ),
        'scrollDepthDistribution', (
            SELECT json_build_array(
                COALESCE(SUM(CASE WHEN scroll_depth_pct < 20 THEN 1 ELSE 0 END), 0),
                COALESCE(SUM(CASE WHEN scroll_depth_pct >= 20 AND scroll_depth_pct < 40 THEN 1 ELSE 0 END), 0),
                COALESCE(SUM(CASE WHEN scroll_depth_pct >= 40 AND scroll_depth_pct < 60 THEN 1 ELSE 0 END), 0),
                COALESCE(SUM(CASE WHEN scroll_depth_pct >= 60 AND scroll_depth_pct < 80 THEN 1 ELSE 0 END), 0),
                COALESCE(SUM(CASE WHEN scroll_depth_pct >= 80 THEN 1 ELSE 0 END), 0)
            )
            FROM public.idea_detail_views WHERE idea_id = ANY(COALESCE(v_idea_ids, ARRAY[]::UUID[])) AND scroll_depth_pct IS NOT NULL
        )
    ) INTO v_result;
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- =====================================================
-- RPC: get creator behavioral metrics (latency, comments, return, risk)
-- =====================================================
CREATE OR REPLACE FUNCTION get_creator_behavioral_metrics(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
    v_idea_ids UUID[];
    v_total_views BIGINT;
    v_total_votes BIGINT;
BEGIN
    SELECT ARRAY_AGG(id) INTO v_idea_ids
    FROM ideas
    WHERE creator_id = p_user_id AND is_active_version = TRUE AND COALESCE(is_article, FALSE) = FALSE;

    SELECT
        (SELECT COALESCE(SUM(total_views), 0) FROM idea_analytics WHERE idea_id = ANY(v_idea_ids)),
        (SELECT COUNT(*) FROM idea_votes iv JOIN ideas i ON iv.idea_id = i.id WHERE i.creator_id = p_user_id)
    INTO v_total_views, v_total_votes;

    SELECT json_build_object(
        'avgTimeDetailToSignalSec', (
            SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (iv.created_at - dv.started_at)))::int, 0)
            FROM idea_votes iv
            JOIN public.idea_detail_views dv ON dv.idea_id = iv.idea_id AND dv.viewer_id = iv.voter_id
                AND dv.started_at <= iv.created_at AND (dv.ended_at IS NULL OR dv.ended_at >= iv.created_at)
            JOIN ideas i ON i.id = iv.idea_id
            WHERE i.creator_id = p_user_id
        ),
        'medianVoteLatencySec', (
            SELECT COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM (iv.created_at - dv.started_at))), 0)::int
            FROM idea_votes iv
            JOIN public.idea_detail_views dv ON dv.idea_id = iv.idea_id AND dv.viewer_id = iv.voter_id
                AND dv.started_at <= iv.created_at AND (dv.ended_at IS NULL OR dv.ended_at >= iv.created_at)
            JOIN ideas i ON i.id = iv.idea_id
            WHERE i.creator_id = p_user_id
        ),
        'pctVotesUnder10Sec', (
            SELECT CASE WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE EXTRACT(EPOCH FROM (iv.created_at - dv.started_at)) < 10)::float / COUNT(*) * 100)::int ELSE 0 END
            FROM idea_votes iv
            JOIN public.idea_detail_views dv ON dv.idea_id = iv.idea_id AND dv.viewer_id = iv.voter_id
                AND dv.started_at <= iv.created_at AND (dv.ended_at IS NULL OR dv.ended_at >= iv.created_at)
            JOIN ideas i ON i.id = iv.idea_id
            WHERE i.creator_id = p_user_id
        ),
        'commentsPerIdeaAvg', (
            SELECT COALESCE(AVG(c.cnt), 0)
            FROM (SELECT idea_id, COUNT(*) AS cnt FROM comments WHERE deleted_at IS NULL GROUP BY idea_id) c
            WHERE c.idea_id = ANY(v_idea_ids)
        ),
        'avgCommentLength', (
            SELECT COALESCE(AVG(LENGTH(content)), 0)::int FROM comments WHERE idea_id = ANY(v_idea_ids) AND deleted_at IS NULL
        ),
        'replyDepthAvg', (
            SELECT COALESCE(AVG(depth), 0) FROM (
                SELECT idea_id, MAX(depth) AS depth FROM (
                    SELECT idea_id, id, 1 AS depth FROM comments WHERE parent_comment_id IS NULL AND idea_id = ANY(v_idea_ids)
                    UNION ALL
                    SELECT c.idea_id, c.id, 2 FROM comments c JOIN comments p ON c.parent_comment_id = p.id WHERE c.idea_id = ANY(v_idea_ids)
                ) x GROUP BY idea_id
            ) y
        ),
        'replyDepthDistribution', (
            SELECT json_build_array(
                COALESCE(SUM(CASE WHEN depth = 1 THEN 1 ELSE 0 END), 0),
                COALESCE(SUM(CASE WHEN depth = 2 THEN 1 ELSE 0 END), 0),
                COALESCE(SUM(CASE WHEN depth = 3 THEN 1 ELSE 0 END), 0),
                COALESCE(SUM(CASE WHEN depth = 4 THEN 1 ELSE 0 END), 0),
                COALESCE(SUM(CASE WHEN depth >= 5 THEN 1 ELSE 0 END), 0)
            ) FROM (
                SELECT idea_id, CASE WHEN parent_comment_id IS NULL THEN 1 ELSE 2 END AS depth
                FROM comments
                WHERE idea_id = ANY(v_idea_ids) AND deleted_at IS NULL
            ) d
        ),
        'threadParticipationRate', (
            SELECT CASE WHEN (SELECT COUNT(*) FROM comments WHERE idea_id = ANY(v_idea_ids) AND deleted_at IS NULL) > 0
                THEN (
                    (SELECT COUNT(DISTINCT user_id) FROM comments WHERE idea_id = ANY(v_idea_ids) AND deleted_at IS NULL AND parent_comment_id IS NOT NULL)::float /
                    (SELECT COUNT(DISTINCT user_id) FROM comments WHERE idea_id = ANY(v_idea_ids) AND deleted_at IS NULL)
                )::numeric(5,4)
                ELSE 0 END
        ),
        'commentEditRate', (
            SELECT CASE WHEN (SELECT COUNT(*) FROM comments WHERE idea_id = ANY(v_idea_ids) AND deleted_at IS NULL) > 0
                THEN (
                    (SELECT COUNT(*)::float FROM comments WHERE idea_id = ANY(v_idea_ids) AND deleted_at IS NULL AND updated_at IS NOT NULL AND created_at != updated_at)::float /
                    (SELECT COUNT(*) FROM comments WHERE idea_id = ANY(v_idea_ids) AND deleted_at IS NULL)
                )::numeric(5,4)
                ELSE 0 END
        ),
        'commentUpvoteDownvoteRatio', (
            SELECT CASE WHEN (SELECT COUNT(*) FROM comment_votes WHERE reaction_type = 'downvote' AND comment_id IN (SELECT id FROM comments WHERE idea_id = ANY(v_idea_ids))) > 0
                THEN (
                    (SELECT COUNT(*) FROM comment_votes WHERE reaction_type = 'upvote' AND comment_id IN (SELECT id FROM comments WHERE idea_id = ANY(v_idea_ids)))::float /
                    (SELECT COUNT(*) FROM comment_votes WHERE reaction_type = 'downvote' AND comment_id IN (SELECT id FROM comments WHERE idea_id = ANY(v_idea_ids)))
                )::numeric(10,2)
                ELSE 0 END
        ),
        'pctVotesAfterComment', (
            SELECT CASE WHEN v_total_votes > 0 THEN (
                (SELECT COUNT(DISTINCT iv.id) FROM idea_votes iv
                 JOIN comments c ON c.idea_id = iv.idea_id AND c.user_id = iv.voter_id AND c.created_at < iv.created_at
                 JOIN ideas i ON i.id = iv.idea_id WHERE i.creator_id = p_user_id)::float / v_total_votes * 100
            )::int ELSE 0 END
        ),
        'pctVotesAfterAIComment', 0,
        'earlyExitRatePct', (
            SELECT CASE WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE dwell_ms IS NOT NULL AND dwell_ms < 5000)::float / COUNT(*) * 100)::int ELSE 0 END
            FROM public.idea_detail_views WHERE idea_id = ANY(v_idea_ids)
        ),
        'highViewsLowSignalsRatio', (
            SELECT CASE WHEN v_total_votes > 0 AND v_total_views > 0 THEN ROUND((v_total_views::decimal / v_total_votes), 2) ELSE 0 END
        ),
        'commentsWithoutVotesPct', (
            SELECT CASE WHEN (SELECT COUNT(*) FROM comments WHERE idea_id = ANY(v_idea_ids) AND deleted_at IS NULL) > 0
                THEN (SELECT (COUNT(*) FILTER (WHERE NOT EXISTS (SELECT 1 FROM idea_votes v WHERE v.idea_id = c.idea_id AND v.voter_id = c.user_id)) * 100.0 / COUNT(*))::int
                      FROM comments c WHERE c.idea_id = ANY(v_idea_ids) AND c.deleted_at IS NULL)
                ELSE 0 END
        ),
        'votesWithoutCommentsPct', (
            SELECT CASE WHEN v_total_votes > 0 THEN (
                (SELECT COUNT(*) FROM idea_votes iv
                 JOIN ideas i ON i.id = iv.idea_id WHERE i.creator_id = p_user_id
                 AND NOT EXISTS (SELECT 1 FROM comments c WHERE c.idea_id = iv.idea_id AND c.user_id = iv.voter_id)
                )::float / v_total_votes * 100
            )::int ELSE 0 END
        ),
        'highDwellNoVotePct', (
            SELECT CASE WHEN (SELECT COUNT(*) FROM public.idea_detail_views WHERE idea_id = ANY(v_idea_ids) AND dwell_ms >= 10000) > 0
                THEN (SELECT (COUNT(*) FILTER (WHERE NOT EXISTS (SELECT 1 FROM idea_votes v WHERE v.idea_id = dv.idea_id AND v.voter_id = dv.viewer_id)) * 100.0 / COUNT(*))::int
                      FROM public.idea_detail_views dv WHERE dv.idea_id = ANY(v_idea_ids) AND dv.dwell_ms >= 10000)
                ELSE 0 END
        ),
        'returnSessionCountPerUser', (
            SELECT COALESCE(AVG(cnt), 0) FROM (
                SELECT viewer_id, COUNT(*) AS cnt FROM public.idea_detail_views
                WHERE idea_id = ANY(v_idea_ids) AND viewer_id IS NOT NULL
                GROUP BY viewer_id, idea_id
            ) x
        ),
        'engagementDecayRate', (
            SELECT COALESCE(
                (SELECT AVG(decay) FROM (
                    SELECT
                        viewer_id,
                        EXTRACT(EPOCH FROM (MAX(started_at) - MIN(started_at))) / NULLIF(COUNT(*) - 1, 0) AS decay
                    FROM public.idea_detail_views
                    WHERE idea_id = ANY(v_idea_ids) AND viewer_id IS NOT NULL
                    GROUP BY viewer_id, idea_id
                    HAVING COUNT(*) > 1
                ) d WHERE decay > 0),
                0
            )::numeric(12,4)
        ),
        'pctUsersReturningWithin7Days', (
            SELECT CASE
                WHEN (SELECT COUNT(DISTINCT viewer_id) FROM public.idea_detail_views WHERE idea_id = ANY(v_idea_ids) AND viewer_id IS NOT NULL) > 0
                THEN (
                    (SELECT COUNT(DISTINCT viewer_id) FROM (
                        SELECT viewer_id FROM public.idea_detail_views
                        WHERE idea_id = ANY(v_idea_ids) AND viewer_id IS NOT NULL
                        GROUP BY viewer_id, idea_id
                        HAVING COUNT(*) > 1 AND MIN(started_at) >= CURRENT_DATE - INTERVAL '7 days'
                    ) x)::float /
                    (SELECT COUNT(DISTINCT viewer_id) FROM public.idea_detail_views WHERE idea_id = ANY(v_idea_ids) AND viewer_id IS NOT NULL) * 100
                )::int
                ELSE 0
            END
        )
    ) INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- RLS for new tables
ALTER TABLE idea_detail_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE idea_feed_impressions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow insert detail view" ON idea_detail_views;
CREATE POLICY "Allow insert detail view" ON idea_detail_views FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow update detail view" ON idea_detail_views;
CREATE POLICY "Allow update detail view" ON idea_detail_views FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Creators can read detail views" ON idea_detail_views;
CREATE POLICY "Creators can read detail views" ON idea_detail_views
    FOR SELECT USING (idea_id IN (SELECT id FROM ideas WHERE creator_id = auth.uid()));

DROP POLICY IF EXISTS "Allow insert feed impression" ON idea_feed_impressions;
CREATE POLICY "Allow insert feed impression" ON idea_feed_impressions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow update feed impression" ON idea_feed_impressions;
CREATE POLICY "Allow update feed impression" ON idea_feed_impressions FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Creators can read feed impressions" ON idea_feed_impressions;
CREATE POLICY "Creators can read feed impressions" ON idea_feed_impressions
    FOR SELECT USING (idea_id IN (SELECT id FROM ideas WHERE creator_id = auth.uid()));

GRANT EXECUTE ON FUNCTION record_detail_view_start(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION record_detail_view_start(UUID, UUID) TO anon;
GRANT EXECUTE ON FUNCTION record_detail_view_end(UUID, INTEGER, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION record_detail_view_end(UUID, INTEGER, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION record_feed_impression(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION record_feed_impression(UUID, UUID, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION record_feed_impression_dwell(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION record_feed_impression_dwell(UUID, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION get_creator_signal_overview(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_creator_attention_metrics(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_creator_behavioral_metrics(UUID) TO authenticated;

-- =====================================================
-- RPC: get idea decision evidence (per-idea analytics for idea details page)
-- =====================================================
CREATE OR REPLACE FUNCTION get_idea_decision_evidence(p_idea_id UUID)
RETURNS JSON AS $$
DECLARE
    v_result JSON;
    v_creator_id UUID;
BEGIN
    -- Get the creator_id for RLS
    SELECT creator_id INTO v_creator_id FROM ideas WHERE id = p_idea_id;

    SELECT json_build_object(
        -- Signal composition
        'totalVotes', (
            SELECT COUNT(*) FROM idea_votes WHERE idea_id = p_idea_id
        ),
        'voteTypeBreakdown', json_build_object(
            'use', (SELECT COUNT(*) FROM idea_votes WHERE idea_id = p_idea_id AND vote_type = 'use'),
            'dislike', (SELECT COUNT(*) FROM idea_votes WHERE idea_id = p_idea_id AND vote_type = 'dislike'),
            'pay', (SELECT COUNT(*) FROM idea_votes WHERE idea_id = p_idea_id AND vote_type = 'pay')
        ),
        'signalVolatility', 0,
        'voteChangeOverTime', (
            SELECT COALESCE(json_agg(row_to_json(t) ORDER BY t.date), '[]'::json)
            FROM (
                SELECT
                    d::date AS date,
                    CASE WHEN d::date = CURRENT_DATE THEN (SELECT COUNT(*) FROM idea_votes WHERE idea_id = p_idea_id AND created_at::date = CURRENT_DATE AND vote_type = 'use') ELSE COALESCE(SUM((v->>'use')::int), 0) END AS "use",
                    CASE WHEN d::date = CURRENT_DATE THEN (SELECT COUNT(*) FROM idea_votes WHERE idea_id = p_idea_id AND created_at::date = CURRENT_DATE AND vote_type = 'dislike') ELSE COALESCE(SUM((v->>'dislike')::int), 0) END AS dislike,
                    CASE WHEN d::date = CURRENT_DATE THEN (SELECT COUNT(*) FROM idea_votes WHERE idea_id = p_idea_id AND created_at::date = CURRENT_DATE AND vote_type = 'pay') ELSE COALESCE(SUM((v->>'pay')::int), 0) END AS pay,
                    (CASE WHEN d::date = CURRENT_DATE THEN (SELECT COUNT(*) FROM idea_votes WHERE idea_id = p_idea_id AND created_at::date = CURRENT_DATE) ELSE (COALESCE(SUM((v->>'use')::int), 0) + COALESCE(SUM((v->>'dislike')::int), 0) + COALESCE(SUM((v->>'pay')::int), 0)) END) AS total
                FROM generate_series(
                    CURRENT_DATE - INTERVAL '14 days',
                    CURRENT_DATE,
                    '1 day'::interval
                ) d
                LEFT JOIN idea_analytics a ON a.idea_id = p_idea_id
                LEFT JOIN LATERAL jsonb_array_elements(a.daily_votes) v ON (v->>'date')::date = d::date
                GROUP BY d::date
            ) t
        ),
        -- Attention & Depth
        'detailViews', (
            SELECT COUNT(*) FROM public.idea_detail_views WHERE idea_id = p_idea_id
        ),
        'avgDwellTimeMs', (
            SELECT COALESCE(AVG(dwell_ms), 0)::int FROM public.idea_detail_views WHERE idea_id = p_idea_id AND dwell_ms IS NOT NULL
        ),
        'medianDwellTimeMs', (
            SELECT COALESCE(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY dwell_ms), 0)::int
            FROM public.idea_detail_views WHERE idea_id = p_idea_id AND dwell_ms IS NOT NULL
        ),
        'scrollDepthPct', (
            SELECT COALESCE(AVG(scroll_depth_pct), 0)::int FROM public.idea_detail_views WHERE idea_id = p_idea_id AND scroll_depth_pct IS NOT NULL
        ),
        'returnRate', (
            SELECT CASE WHEN COUNT(*) > 0 THEN (
                COUNT(*) FILTER (WHERE viewer_id IN (
                    SELECT viewer_id FROM public.idea_detail_views WHERE idea_id = p_idea_id GROUP BY viewer_id HAVING COUNT(*) > 1
                ))::float / COUNT(*)
            )::numeric(5,4) ELSE 0 END
            FROM public.idea_detail_views WHERE idea_id = p_idea_id
        ),
        'timeToFirstSignalSec', (
            SELECT GREATEST(0, COALESCE((
                SELECT MIN(EXTRACT(EPOCH FROM (iv.created_at - dv.started_at)))::int
                FROM idea_votes iv
                JOIN public.idea_detail_views dv ON dv.idea_id = iv.idea_id AND dv.viewer_id = iv.voter_id
                    AND dv.started_at <= iv.created_at AND (dv.ended_at IS NULL OR dv.ended_at >= iv.created_at)
                WHERE iv.idea_id = p_idea_id
            ), 0))
        ),
        'timeToFirstCommentSec', (
            SELECT GREATEST(0, COALESCE((
                SELECT MIN(EXTRACT(EPOCH FROM (c.created_at - dv.started_at)))::int
                FROM comments c
                JOIN public.idea_detail_views dv ON dv.idea_id = c.idea_id AND dv.viewer_id = c.user_id
                    AND dv.started_at <= c.created_at AND (dv.ended_at IS NULL OR dv.ended_at >= c.created_at)
                WHERE c.idea_id = p_idea_id AND c.deleted_at IS NULL
            ), 0))
        ),
        'dwellDistribution', (
            SELECT json_build_array(
                COALESCE(SUM(CASE WHEN dwell_ms < 2000 THEN 1 ELSE 0 END), 0),
                COALESCE(SUM(CASE WHEN dwell_ms >= 2000 AND dwell_ms < 5000 THEN 1 ELSE 0 END), 0),
                COALESCE(SUM(CASE WHEN dwell_ms >= 5000 AND dwell_ms < 10000 THEN 1 ELSE 0 END), 0),
                COALESCE(SUM(CASE WHEN dwell_ms >= 10000 AND dwell_ms < 30000 THEN 1 ELSE 0 END), 0),
                COALESCE(SUM(CASE WHEN dwell_ms >= 30000 THEN 1 ELSE 0 END), 0)
            )
            FROM public.idea_detail_views WHERE idea_id = p_idea_id AND dwell_ms IS NOT NULL
        ),
        -- Behavioral context
        'voteLatencyAvgSec', (
            SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (iv.created_at - dv.started_at)))::int, 0)
            FROM idea_votes iv
            JOIN public.idea_detail_views dv ON dv.idea_id = iv.idea_id AND dv.viewer_id = iv.voter_id
                AND dv.started_at <= iv.created_at AND (dv.ended_at IS NULL OR dv.ended_at >= iv.created_at)
            WHERE iv.idea_id = p_idea_id
        ),
        'pctVotesAfterComment', (
            SELECT CASE WHEN (SELECT COUNT(*) FROM idea_votes WHERE idea_id = p_idea_id) > 0 THEN (
                (SELECT COUNT(DISTINCT iv.id) FROM idea_votes iv
                 JOIN comments c ON c.idea_id = iv.idea_id AND c.user_id = iv.voter_id AND c.created_at < iv.created_at
                 WHERE iv.idea_id = p_idea_id)::float /
                (SELECT COUNT(*) FROM idea_votes WHERE idea_id = p_idea_id) * 100
            )::int ELSE 0 END
        ),
        'pctVotesAfterAIComment', (
            SELECT CASE WHEN (SELECT COUNT(*) FROM idea_votes WHERE idea_id = p_idea_id) > 0 THEN (
                (SELECT COUNT(*) FROM idea_votes iv
                 WHERE iv.idea_id = p_idea_id
                 AND iv.created_at > (SELECT MIN(c.created_at) FROM comments c WHERE c.idea_id = p_idea_id AND c.deleted_at IS NULL AND c.content LIKE 'AI ·%')
                )::float / (SELECT COUNT(*) FROM idea_votes WHERE idea_id = p_idea_id) * 100
            )::int ELSE 0 END
        ),
        'commentDepth', (
            SELECT COALESCE(AVG(depth), 0) FROM (
                SELECT MAX(depth) AS depth FROM (
                    SELECT 1 AS depth FROM comments WHERE idea_id = p_idea_id AND parent_comment_id IS NULL AND deleted_at IS NULL
                    UNION ALL
                    SELECT 2 AS depth FROM comments c JOIN comments p ON c.parent_comment_id = p.id WHERE c.idea_id = p_idea_id AND c.deleted_at IS NULL
                ) x
            ) y
        ),
        'avgCommentLength', (
            SELECT COALESCE(AVG(LENGTH(content)), 0)::int FROM comments WHERE idea_id = p_idea_id AND deleted_at IS NULL
        ),
        'earlyExitRatePct', (
            SELECT CASE WHEN COUNT(*) > 0 THEN (COUNT(*) FILTER (WHERE dwell_ms IS NOT NULL AND dwell_ms < 5000)::float / COUNT(*) * 100)::int ELSE 0 END
            FROM public.idea_detail_views WHERE idea_id = p_idea_id
        ),
        'highDwellNoVotePct', (
            SELECT CASE WHEN (SELECT COUNT(*) FROM public.idea_detail_views WHERE idea_id = p_idea_id AND dwell_ms >= 10000) > 0
                THEN (SELECT (COUNT(*) FILTER (WHERE NOT EXISTS (SELECT 1 FROM idea_votes v WHERE v.idea_id = dv.idea_id AND v.voter_id = dv.viewer_id)) * 100.0 / COUNT(*))::int
                      FROM public.idea_detail_views dv WHERE dv.idea_id = p_idea_id AND dv.dwell_ms >= 10000)
                ELSE 0 END
        ),
        -- Segments
        'segments', (
            SELECT COALESCE(json_agg(row_to_json(s)), '[]'::json)
            FROM (
                SELECT
                    'First-time viewers' AS segment,
                    COUNT(DISTINCT iv.id) AS signals,
                    COALESCE(AVG(dv.dwell_ms), 0)::int AS avgDwellMs,
                    json_build_object(
                        'use', COALESCE(ROUND((COUNT(*) FILTER (WHERE iv.vote_type = 'use')::float / NULLIF(COUNT(*), 0)) * 100), 0)::int,
                        'dislike', COALESCE(ROUND((COUNT(*) FILTER (WHERE iv.vote_type = 'dislike')::float / NULLIF(COUNT(*), 0)) * 100), 0)::int,
                        'pay', COALESCE(ROUND((COUNT(*) FILTER (WHERE iv.vote_type = 'pay')::float / NULLIF(COUNT(*), 0)) * 100), 0)::int
                    ) AS voteTypePct
                FROM idea_votes iv
                LEFT JOIN public.idea_detail_views dv ON dv.idea_id = iv.idea_id AND dv.viewer_id = iv.voter_id
                WHERE iv.idea_id = p_idea_id AND dv.id IS NULL

                UNION ALL

                SELECT
                    'Returning viewers' AS segment,
                    COUNT(DISTINCT iv.id) AS signals,
                    COALESCE(AVG(dv.dwell_ms), 0)::int AS avgDwellMs,
                    json_build_object(
                        'use', COALESCE(ROUND((COUNT(*) FILTER (WHERE iv.vote_type = 'use')::float / NULLIF(COUNT(*), 0)) * 100), 0)::int,
                        'dislike', COALESCE(ROUND((COUNT(*) FILTER (WHERE iv.vote_type = 'dislike')::float / NULLIF(COUNT(*), 0)) * 100), 0)::int,
                        'pay', COALESCE(ROUND((COUNT(*) FILTER (WHERE iv.vote_type = 'pay')::float / NULLIF(COUNT(*), 0)) * 100), 0)::int
                    ) AS voteTypePct
                FROM idea_votes iv
                JOIN public.idea_detail_views dv ON dv.idea_id = iv.idea_id AND dv.viewer_id = iv.voter_id
                WHERE iv.idea_id = p_idea_id
                AND dv.viewer_id IN (
                    SELECT viewer_id FROM public.idea_detail_views WHERE idea_id = p_idea_id GROUP BY viewer_id HAVING COUNT(*) > 1
                )
                GROUP BY dv.viewer_id
            ) s
        )
    ) INTO v_result;

    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

GRANT EXECUTE ON FUNCTION get_idea_decision_evidence(UUID) TO authenticated;



-- idea_detail_views: add viewer_id if missing
ALTER TABLE public.idea_detail_views
ADD COLUMN IF NOT EXISTS viewer_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_idea_detail_views_viewer_id ON public.idea_detail_views(viewer_id);

-- idea_feed_impressions: add viewer_id if missing
ALTER TABLE public.idea_feed_impressions
ADD COLUMN IF NOT EXISTS viewer_id UUID REFERENCES public.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_idea_feed_impressions_viewer_id ON public.idea_feed_impressions(viewer_id);