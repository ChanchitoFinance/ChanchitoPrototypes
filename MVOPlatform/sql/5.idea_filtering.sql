DROP FUNCTION IF EXISTS get_filtered_ideas_with_counts(
    search_query TEXT,
    filter_conditions JSONB,
    sort_field TEXT,
    sort_direction TEXT,
    limit_int INT,
    offset_int INT,
    OUT total_count BIGINT,
    OUT ideas JSONB
);

DROP FUNCTION IF EXISTS rpc_get_filtered_ideas(
    search_query TEXT,
    filter_conditions JSONB,
    sort_field TEXT,
    sort_direction TEXT,
    limit_int INT,
    offset_int INT
);

CREATE OR REPLACE FUNCTION get_filtered_ideas_with_counts(
    search_query TEXT DEFAULT NULL,
    filter_conditions JSONB DEFAULT NULL,
    sort_field TEXT DEFAULT 'created_at',
    sort_direction TEXT DEFAULT 'desc',
    limit_int INT DEFAULT 20,
    offset_int INT DEFAULT 0
)
RETURNS TABLE (
    total_count BIGINT,
    ideas JSONB
)
LANGUAGE plpgsql
AS $$
DECLARE
    filter_item JSONB;
    filter_field TEXT;
    filter_operator TEXT;
    filter_value NUMERIC;
    computed_value NUMERIC;
BEGIN
    RETURN QUERY
    WITH filtered_ideas AS (
         SELECT
            i.id,
            i.title,
            i.decision_making,
            i.status_flag,
            i.content,
            i.created_at,
            i.anonymous,
            i.creator_id,
            (SELECT COUNT(*) FROM idea_votes WHERE idea_id = i.id AND vote_type = 'use') AS use_votes,
            (SELECT COUNT(*) FROM idea_votes WHERE idea_id = i.id AND vote_type = 'dislike') AS dislike_votes,
            (SELECT COUNT(*) FROM idea_votes WHERE idea_id = i.id AND vote_type = 'pay') AS pay_votes,
            (SELECT COUNT(*) FROM idea_votes WHERE idea_id = i.id) AS total_votes,
            (3 * (SELECT COUNT(*) FROM idea_votes WHERE idea_id = i.id AND vote_type = 'pay') +
             2 * (SELECT COUNT(*) FROM idea_votes WHERE idea_id = i.id AND vote_type = 'use') -
             (SELECT COUNT(*) FROM idea_votes WHERE idea_id = i.id AND vote_type = 'dislike')) AS score,
            (SELECT COUNT(*) FROM comments WHERE idea_id = i.id) AS comment_count,
            i.tags,
            (SELECT jsonb_build_object('username', pup.username, 'full_name', pup.full_name)
             FROM public_user_profiles pup WHERE pup.id = i.creator_id) AS creator
         FROM ideas i
         WHERE 1=1
             AND i.is_active_version = TRUE
             AND COALESCE(i.is_article, FALSE) = FALSE
             AND (search_query IS NULL OR search_query = '' OR (
                i.title ILIKE '%' || search_query || '%' OR 
                i.content->>'description' ILIKE '%' || search_query || '%' OR
                EXISTS (SELECT 1 FROM jsonb_array_elements_text(i.tags) AS tag WHERE tag ILIKE '%' || search_query || '%')
            ))
    ),
    applied_filters AS (
        SELECT f.*
        FROM filtered_ideas f
        WHERE (
            filter_conditions IS NULL 
            OR filter_conditions = '[]'::jsonb 
            OR jsonb_array_length(filter_conditions) = 0
            OR (
                SELECT bool_and(
                    CASE
                        WHEN (item->>'field') = 'score' THEN
                            CASE (item->>'operator')
                                WHEN '>' THEN f.score > (item->>'value')::numeric
                                WHEN '<' THEN f.score < (item->>'value')::numeric
                                WHEN '=' THEN f.score = (item->>'value')::numeric
                                WHEN '>=' THEN f.score >= (item->>'value')::numeric
                                WHEN '<=' THEN f.score <= (item->>'value')::numeric
                                ELSE TRUE
                            END
                        WHEN (item->>'field') = 'votes' THEN
                            CASE (item->>'operator')
                                WHEN '>' THEN f.total_votes > (item->>'value')::numeric
                                WHEN '<' THEN f.total_votes < (item->>'value')::numeric
                                WHEN '=' THEN f.total_votes = (item->>'value')::numeric
                                WHEN '>=' THEN f.total_votes >= (item->>'value')::numeric
                                WHEN '<=' THEN f.total_votes <= (item->>'value')::numeric
                                ELSE TRUE
                            END
                        WHEN (item->>'field') = 'votesByType.use' THEN
                            CASE (item->>'operator')
                                WHEN '>' THEN f.use_votes > (item->>'value')::numeric
WHEN '<' THEN f.use_votes < (item->>'value')::numeric
WHEN '=' THEN f.use_votes = (item->>'value')::numeric
WHEN '>=' THEN f.use_votes >= (item->>'value')::numeric
WHEN '<=' THEN f.use_votes <= (item->>'value')::numeric
ELSE TRUE
END
WHEN (item->>'field') = 'votesByType.dislike' THEN
CASE (item->>'operator')
WHEN '>' THEN f.dislike_votes > (item->>'value')::numeric
WHEN '<' THEN f.dislike_votes < (item->>'value')::numeric
WHEN '=' THEN f.dislike_votes = (item->>'value')::numeric
WHEN '>=' THEN f.dislike_votes >= (item->>'value')::numeric
WHEN '<=' THEN f.dislike_votes <= (item->>'value')::numeric
ELSE TRUE
END
WHEN (item->>'field') = 'votesByType.pay' THEN
CASE (item->>'operator')
WHEN '>' THEN f.pay_votes > (item->>'value')::numeric
WHEN '<' THEN f.pay_votes < (item->>'value')::numeric
WHEN '=' THEN f.pay_votes = (item->>'value')::numeric
WHEN '>=' THEN f.pay_votes >= (item->>'value')::numeric
WHEN '<=' THEN f.pay_votes <= (item->>'value')::numeric
ELSE TRUE
END
WHEN (item->>'field') = 'commentCount' THEN
CASE (item->>'operator')
WHEN '>' THEN f.comment_count > (item->>'value')::numeric
WHEN '<' THEN f.comment_count < (item->>'value')::numeric
WHEN '=' THEN f.comment_count = (item->>'value')::numeric
WHEN '>=' THEN f.comment_count >= (item->>'value')::numeric
WHEN '<=' THEN f.comment_count <= (item->>'value')::numeric
ELSE TRUE
END
ELSE TRUE
END
)
FROM jsonb_array_elements(filter_conditions) AS item
)
)
),
sorted_ideas AS (
SELECT *
FROM applied_filters
ORDER BY
CASE WHEN sort_direction = 'asc' THEN
CASE sort_field
WHEN 'title' THEN title
ELSE NULL
END
END ASC,
CASE WHEN sort_direction = 'desc' THEN
CASE sort_field
WHEN 'title' THEN title
ELSE NULL
END
END DESC,
CASE WHEN sort_direction = 'asc' THEN
CASE sort_field
WHEN 'score' THEN score
WHEN 'votes' THEN total_votes
WHEN 'votesByType.use' THEN use_votes
WHEN 'votesByType.dislike' THEN dislike_votes
WHEN 'votesByType.pay' THEN pay_votes
WHEN 'commentCount' THEN comment_count
ELSE NULL
END
END ASC,
CASE WHEN sort_direction = 'desc' THEN
CASE sort_field
WHEN 'score' THEN score
WHEN 'votes' THEN total_votes
WHEN 'votesByType.use' THEN use_votes
WHEN 'votesByType.dislike' THEN dislike_votes
WHEN 'votesByType.pay' THEN pay_votes
WHEN 'commentCount' THEN comment_count
ELSE NULL
END
END DESC,
CASE WHEN sort_direction = 'asc' THEN
CASE sort_field
WHEN 'createdAt' THEN created_at
ELSE NULL
END
END ASC,
CASE WHEN sort_direction = 'desc' THEN
CASE sort_field
WHEN 'createdAt' THEN created_at
ELSE NULL
END
END DESC,
CASE WHEN sort_field NOT IN ('title', 'score', 'votes', 'votesByType.use', 'votesByType.dislike', 'votesByType.pay', 'commentCount', 'createdAt') THEN
CASE WHEN sort_direction = 'desc' THEN created_at END
END DESC,
CASE WHEN sort_field NOT IN ('title', 'score', 'votes', 'votesByType.use', 'votesByType.dislike', 'votesByType.pay', 'commentCount', 'createdAt') THEN
CASE WHEN sort_direction = 'asc' THEN created_at END
END ASC,
id
)
SELECT
(SELECT COUNT(*) FROM applied_filters) AS total_count,
COALESCE((
SELECT jsonb_agg(
jsonb_build_object(
'id', s.id,
'title', s.title,
'decision_making', s.decision_making,
'status_flag', s.status_flag,
'content', s.content,
'createdAt', s.created_at,
'anonymous', s.anonymous,
'score', s.score,
'votes', s.total_votes,
'votesByType', jsonb_build_object('use', s.use_votes, 'dislike', s.dislike_votes, 'pay', s.pay_votes),
'commentCount', s.comment_count,
'tags', s.tags,
'creator', s.creator
)
)
FROM (
SELECT *
FROM sorted_ideas
LIMIT limit_int OFFSET offset_int
) s
), '[]'::jsonb) AS ideas;
END;
$$;
CREATE OR REPLACE FUNCTION rpc_get_filtered_ideas(
search_query TEXT,
filter_conditions JSONB,
sort_field TEXT,
sort_direction TEXT,
limit_int INT,
offset_int INT
)
RETURNS TABLE (
total_count BIGINT,
ideas JSONB
)
LANGUAGE sql
SECURITY DEFINER
AS $$
SELECT * FROM get_filtered_ideas_with_counts(
search_query,
filter_conditions,
sort_field,
sort_direction,
limit_int,
offset_int
);
$$;