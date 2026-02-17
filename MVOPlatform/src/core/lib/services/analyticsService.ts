/**
 * Analytics Service
 * Handles dual tracking to PostHog and Supabase for creator insights
 */

import posthog from 'posthog-js'
import { supabase } from '@/core/lib/supabase'
import {
  AnalyticsEventName,
  CreatorInsights,
  CreatorSignalOverview,
  CreatorAttentionMetrics,
  CreatorBehavioralMetrics,
  IdeaAnalytics,
  IdeaDecisionEvidence,
  TrackViewParams,
  TrackVoteParams,
  TrackCommentParams,
  TrackAIFeatureParams,
  TrackDetailViewStartParams,
  TrackDetailViewEndParams,
  TrackFeedImpressionParams,
  FeedType,
  FeatureType,
} from '@/core/types/analytics'

class AnalyticsService {
  private isClient = typeof window !== 'undefined'

  // =====================================================
  // TRACK EVENTS (PostHog + Supabase)
  // =====================================================

  /**
   * Track an idea view (with version info for comparing engagement across iterations)
   */
  async trackIdeaView(params: TrackViewParams): Promise<void> {
    const { ideaId, viewerId, isOwner, hasAIComments, hasDeepResearch, versionNumber, ideaGroupId } = params

    // Send to PostHog
    if (this.isClient) {
      posthog.capture('dc_idea_viewed', {
        idea_id: ideaId,
        viewer_id: viewerId,
        is_owner: isOwner,
        has_ai_comments: hasAIComments,
        has_deep_research: hasDeepResearch,
        version_number: versionNumber ?? 1,
        idea_group_id: ideaGroupId ?? ideaId,
        interaction_source: 'user',
        timestamp: new Date().toISOString(),
      })
    }

    // Record in Supabase via RPC
    try {
      const { error } = await supabase.rpc('record_idea_view', {
        p_idea_id: ideaId,
        p_viewer_id: viewerId || null,
      })

      if (error) {
        console.error('Error recording view in Supabase:', error)
      }
    } catch (err) {
      console.error('Failed to record view:', err)
    }
  }

  /**
   * Track a vote cast (with version info for comparing engagement across iterations)
   */
  async trackVoteCast(params: TrackVoteParams): Promise<void> {
    const { ideaId, voteType, voterId, isFirstVote, isRemoving, versionNumber, ideaGroupId } = params

    // Send to PostHog
    if (this.isClient) {
      posthog.capture('dc_vote_cast', {
        idea_id: ideaId,
        vote_type: voteType,
        voter_id: voterId,
        is_first_vote: isFirstVote,
        is_removing: isRemoving,
        version_number: versionNumber ?? 1,
        idea_group_id: ideaGroupId ?? ideaId,
        interaction_source: 'user',
        timestamp: new Date().toISOString(),
      })
    }

    // Only record in Supabase if not removing a vote
    if (!isRemoving) {
      try {
        const { error } = await supabase.rpc('record_vote_analytics', {
          p_idea_id: ideaId,
          p_vote_type: voteType,
        })

        if (error) {
          console.error('Error recording vote in Supabase:', error)
        }
      } catch (err) {
        console.error('Failed to record vote:', err)
      }
    }
  }

  /**
   * Track a comment added (with version info for comparing engagement across iterations)
   */
  async trackCommentAdded(params: TrackCommentParams): Promise<void> {
    const { ideaId, commentId, commenterId, isAIComment, isReply, mentionedPersonas, versionNumber, ideaGroupId } = params

    // Send to PostHog
    if (this.isClient) {
      posthog.capture('dc_comment_added', {
        idea_id: ideaId,
        comment_id: commentId,
        commenter_id: commenterId,
        is_ai_comment: isAIComment,
        is_reply: isReply,
        mentioned_personas: mentionedPersonas,
        version_number: versionNumber ?? 1,
        idea_group_id: ideaGroupId ?? ideaId,
        interaction_source: isAIComment ? 'ai' : 'user',
        timestamp: new Date().toISOString(),
      })
    }

    // Record in Supabase via RPC
    try {
      const { error } = await supabase.rpc('record_comment_analytics', {
        p_idea_id: ideaId,
        p_is_ai_comment: isAIComment,
      })

      if (error) {
        console.error('Error recording comment in Supabase:', error)
      }
    } catch (err) {
      console.error('Failed to record comment:', err)
    }
  }

  /**
   * Track AI feature usage (with version info for comparing AI effectiveness across versions)
   */
  async trackAIFeatureUsed(params: TrackAIFeatureParams): Promise<void> {
    const { ideaId, featureType, userId, coinsSpent, versionNumber, ideaGroupId } = params

    // Map feature type to event name
    const eventName: AnalyticsEventName =
      featureType === 'deep_research'
        ? 'dc_deep_research_completed'
        : featureType === 'personas_evaluation'
        ? 'dc_personas_evaluation_completed'
        : 'dc_ai_feature_used'

    // Send to PostHog
    if (this.isClient) {
      posthog.capture(eventName, {
        idea_id: ideaId,
        feature_type: featureType,
        user_id: userId,
        coins_spent: coinsSpent,
        version_number: versionNumber ?? 1,
        idea_group_id: ideaGroupId ?? ideaId,
        interaction_source: 'user', // User triggered, AI performed
        timestamp: new Date().toISOString(),
      })
    }

    // Record in Supabase via RPC
    try {
      const { error } = await supabase.rpc('record_ai_feature_usage', {
        p_idea_id: ideaId,
        p_feature_type: featureType,
      })

      if (error) {
        console.error('Error recording AI feature usage in Supabase:', error)
      }
    } catch (err) {
      console.error('Failed to record AI feature usage:', err)
    }
  }

  /**
   * Track idea creation (with version info for tracking progression)
   */
  trackIdeaCreated(params: {
    ideaId: string
    creatorId?: string
    hasVideo: boolean
    hasImage: boolean
    tags?: string[]
    isAnonymous: boolean
    isVersion: boolean
    requestedAIComments: boolean
    versionNumber?: number
    ideaGroupId?: string
  }): void {
    if (this.isClient) {
      posthog.capture('dc_idea_created', {
        idea_id: params.ideaId,
        creator_id: params.creatorId,
        has_video: params.hasVideo,
        has_image: params.hasImage,
        tags: params.tags,
        is_anonymous: params.isAnonymous,
        is_version: params.isVersion,
        requested_ai_comments: params.requestedAIComments,
        version_number: params.versionNumber ?? 1,
        idea_group_id: params.ideaGroupId ?? params.ideaId,
        interaction_source: 'user',
        timestamp: new Date().toISOString(),
      })
    }
  }

  /**
   * Track idea updated/edited (for tracking iteration impact)
   */
  trackIdeaUpdated(params: {
    ideaId: string
    editorId?: string
    hasVideo: boolean
    hasImage: boolean
    tags?: string[]
    versionNumber?: number
    ideaGroupId?: string
    changedFields?: string[]
  }): void {
    if (this.isClient) {
      posthog.capture('dc_idea_updated', {
        idea_id: params.ideaId,
        editor_id: params.editorId,
        has_video: params.hasVideo,
        has_image: params.hasImage,
        tags: params.tags,
        version_number: params.versionNumber ?? 1,
        idea_group_id: params.ideaGroupId ?? params.ideaId,
        changed_fields: params.changedFields,
        interaction_source: 'user',
        timestamp: new Date().toISOString(),
      })
    }
  }

  /**
   * Track idea shared
   */
  trackIdeaShared(params: {
    ideaId: string
    shareMethod: 'native' | 'clipboard'
    userId?: string
  }): void {
    if (this.isClient) {
      posthog.capture('dc_idea_shared', {
        idea_id: params.ideaId,
        share_method: params.shareMethod,
        user_id: params.userId,
        interaction_source: 'user',
        timestamp: new Date().toISOString(),
      })
    }
  }

  /**
   * Start a detail view session (call when user opens idea detail page). Returns detailViewId to pass to trackDetailViewEnd.
   */
  async trackDetailViewStart(params: TrackDetailViewStartParams): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('record_detail_view_start', {
        p_idea_id: params.ideaId,
        p_viewer_id: params.viewerId ?? null,
      })
      if (error) {
        console.error('Error recording detail view start:', error)
        return null
      }
      if (this.isClient) {
        posthog.capture('dc_detail_view_start', {
          idea_id: params.ideaId,
          viewer_id: params.viewerId,
          timestamp: new Date().toISOString(),
        })
      }
      return data as string
    } catch (err) {
      console.error('Failed to record detail view start:', err)
      return null
    }
  }

  /**
   * End a detail view session (call when user leaves or tab hides). Pass dwellMs and scrollDepthPct.
   */
  async trackDetailViewEnd(params: TrackDetailViewEndParams): Promise<void> {
    try {
      const { error } = await supabase.rpc('record_detail_view_end', {
        p_detail_view_id: params.detailViewId,
        p_dwell_ms: params.dwellMs,
        p_scroll_depth_pct: params.scrollDepthPct ?? null,
      })
      if (error) console.error('Error recording detail view end:', error)
      if (this.isClient) {
        posthog.capture('dc_detail_view_end', {
          detail_view_id: params.detailViewId,
          dwell_ms: params.dwellMs,
          scroll_depth_pct: params.scrollDepthPct,
          timestamp: new Date().toISOString(),
        })
      }
    } catch (err) {
      console.error('Failed to record detail view end:', err)
    }
  }

  /**
   * Record feed impression (idea shown in feed). Returns impressionId for optional dwell update.
   */
  async trackFeedImpression(params: TrackFeedImpressionParams): Promise<string | null> {
    try {
      const { data, error } = await supabase.rpc('record_feed_impression', {
        p_idea_id: params.ideaId,
        p_viewer_id: params.viewerId ?? null,
        p_feed_type: params.feedType,
      })
      if (error) {
        console.error('Error recording feed impression:', error)
        return null
      }
      if (this.isClient) {
        posthog.capture('dc_feed_impression', {
          idea_id: params.ideaId,
          feed_type: params.feedType,
          viewer_id: params.viewerId,
          timestamp: new Date().toISOString(),
        })
      }
      return data as string
    } catch (err) {
      console.error('Failed to record feed impression:', err)
      return null
    }
  }

  /**
   * Update feed impression with dwell time (call when idea leaves viewport or after threshold).
   */
  async trackFeedImpressionDwell(impressionId: string, dwellMs: number): Promise<void> {
    try {
      const { error } = await supabase.rpc('record_feed_impression_dwell', {
        p_impression_id: impressionId,
        p_dwell_ms: dwellMs,
      })
      if (error) console.error('Error recording feed impression dwell:', error)
    } catch (err) {
      console.error('Failed to record feed impression dwell:', err)
    }
  }

  // =====================================================
  // FETCH DATA (for Creator Dashboard)
  // =====================================================

  /**
   * Get aggregated creator insights
   */
  async getCreatorInsights(userId: string): Promise<CreatorInsights | null> {
    try {
      const { data, error } = await supabase.rpc('get_creator_insights', {
        p_user_id: userId,
      })

      if (error) {
        console.error('Error fetching creator insights:', error)
        return null
      }

      // Parse the JSON response
      const insights: CreatorInsights = {
        payConversionRate: data?.payConversionRate ?? 0,
        avgTimeToFirstVote: data?.avgTimeToFirstVote ?? 0,
        avgTimeToFirstComment: data?.avgTimeToFirstComment ?? 0,
        sentimentRatio: data?.sentimentRatio ?? 0,
        dailyVoteTrends: data?.dailyVoteTrends ?? [],
        voteVelocity: data?.voteVelocity ?? 0,
        ideasWithAI: data?.ideasWithAI ?? { count: 0, avgVotes: 0, avgPayRate: 0 },
        ideasWithoutAI: data?.ideasWithoutAI ?? { count: 0, avgVotes: 0, avgPayRate: 0 },
        aiFeatureUsage: data?.aiFeatureUsage ?? { deepResearch: 0, personasEval: 0, aiComments: 0 },
        totalViews: data?.totalViews ?? 0,
        totalUniqueViewers: data?.totalUniqueViewers ?? 0,
      }

      return insights
    } catch (err) {
      console.error('Failed to fetch creator insights:', err)
      return null
    }
  }

  /**
   * Get analytics for a specific idea
   */
  async getIdeaAnalytics(ideaId: string): Promise<IdeaAnalytics | null> {
    try {
      const { data, error } = await supabase
        .from('idea_analytics')
        .select('*')
        .eq('idea_id', ideaId)
        .single()

      if (error) {
        // Not found is okay - idea might not have analytics yet
        if (error.code === 'PGRST116') {
          return null
        }
        console.error('Error fetching idea analytics:', error)
        return null
      }

      return data as IdeaAnalytics
    } catch (err) {
      console.error('Failed to fetch idea analytics:', err)
      return null
    }
  }

  /**
   * Get analytics for all ideas by a creator
   */
  async getCreatorIdeasAnalytics(userId: string): Promise<IdeaAnalytics[]> {
    try {
      const { data, error } = await supabase
        .from('idea_analytics')
        .select(`
          *,
          ideas!inner (
            id,
            creator_id,
            title
          )
        `)
        .eq('ideas.creator_id', userId)

      if (error) {
        console.error('Error fetching creator ideas analytics:', error)
        return []
      }

      return (data || []) as IdeaAnalytics[]
    } catch (err) {
      console.error('Failed to fetch creator ideas analytics:', err)
      return []
    }
  }

  /**
   * Get creator signal overview (mix + drift) for Signal Overview tab
   */
  async getCreatorSignalOverview(userId: string): Promise<CreatorSignalOverview | null> {
    try {
      const { data, error } = await supabase.rpc('get_creator_signal_overview', {
        p_user_id: userId,
      })
      if (error) {
        console.error('Error fetching creator signal overview:', error)
        return null
      }
      const drift = (data?.signalDriftLast30Days || []).map((d: { date: string; voteChange: number }) => ({
        date: typeof d.date === 'string' ? new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : d.date,
        voteChange: d.voteChange ?? 0,
      }))
      return {
        totalIdeas: data?.totalIdeas ?? 0,
        totalVotes: data?.totalVotes ?? 0,
        totalComments: data?.totalComments ?? 0,
        voteTypeBreakdown: data?.voteTypeBreakdown ?? { use: 0, dislike: 0, pay: 0 },
        signalDriftLast30Days: drift,
      }
    } catch (err) {
      console.error('Failed to fetch creator signal overview:', err)
      return null
    }
  }

  /**
   * Get creator attention/depth metrics for Attention tab
   */
  async getCreatorAttentionMetrics(userId: string): Promise<CreatorAttentionMetrics | null> {
    try {
      const { data, error } = await supabase.rpc('get_creator_attention_metrics', {
        p_user_id: userId,
      })
      if (error) {
        console.error('Error fetching creator attention metrics:', error)
        return null
      }
      return {
        totalFeedImpressions: data?.totalFeedImpressions ?? 0,
        reimpressionRate: data?.reimpressionRate ?? 0,
        uniqueViewers: data?.uniqueViewers ?? 0,
        avgFeedDwellTimeMs: data?.avgFeedDwellTimeMs ?? 0,
        hoverDurationDesktopMs: data?.hoverDurationDesktopMs ?? 0,
        detailViewStarts: data?.detailViewStarts ?? 0,
        avgDetailDwellTimeMs: data?.avgDetailDwellTimeMs ?? 0,
        medianDwellTimeMs: data?.medianDwellTimeMs ?? 0,
        scrollDepthAvgPct: data?.scrollDepthAvgPct ?? 0,
        returnToDetailRate: data?.returnToDetailRate ?? 0,
        timeBetweenReturnsSec: data?.timeBetweenReturnsSec ?? 0,
        dwellTimeDistribution: Array.isArray(data?.dwellTimeDistribution) ? data.dwellTimeDistribution : [0, 0, 0, 0, 0],
        scrollDepthDistribution: Array.isArray(data?.scrollDepthDistribution) ? data.scrollDepthDistribution : [0, 0, 0, 0, 0],
      }
    } catch (err) {
      console.error('Failed to fetch creator attention metrics:', err)
      return null
    }
  }

  /**
   * Get creator behavioral metrics for Behavioral tab
   */
  async getCreatorBehavioralMetrics(userId: string): Promise<CreatorBehavioralMetrics | null> {
    try {
      const { data, error } = await supabase.rpc('get_creator_behavioral_metrics', {
        p_user_id: userId,
      })
      if (error) {
        console.error('Error fetching creator behavioral metrics:', error)
        return null
      }
      return {
        avgTimeDetailToSignalSec: data?.avgTimeDetailToSignalSec ?? 0,
        medianVoteLatencySec: data?.medianVoteLatencySec ?? 0,
        pctVotesUnder10Sec: data?.pctVotesUnder10Sec ?? 0,
        pctVotesAfterComment: data?.pctVotesAfterComment ?? 0,
        pctVotesAfterAIComment: data?.pctVotesAfterAIComment,
        commentsPerIdeaAvg: Number(data?.commentsPerIdeaAvg ?? 0),
        avgCommentLength: data?.avgCommentLength ?? 0,
        replyDepthAvg: Number(data?.replyDepthAvg ?? 0),
        replyDepthDistribution: Array.isArray(data?.replyDepthDistribution) ? data.replyDepthDistribution : [0, 0, 0, 0, 0],
        threadParticipationRate: data?.threadParticipationRate ?? 0,
        commentEditRate: data?.commentEditRate ?? 0,
        commentUpvoteDownvoteRatio: Number(data?.commentUpvoteDownvoteRatio ?? 0),
        earlyExitRatePct: data?.earlyExitRatePct ?? 0,
        highViewsLowSignalsRatio: Number(data?.highViewsLowSignalsRatio ?? 0),
        commentsWithoutVotesPct: data?.commentsWithoutVotesPct ?? 0,
        votesWithoutCommentsPct: data?.votesWithoutCommentsPct ?? 0,
        highDwellNoVotePct: data?.highDwellNoVotePct ?? 0,
        returnSessionCountPerUser: Number(data?.returnSessionCountPerUser ?? 0),
        engagementDecayRate: data?.engagementDecayRate ?? 0,
        pctUsersReturningWithin7Days: data?.pctUsersReturningWithin7Days ?? 0,
      }
    } catch (err) {
      console.error('Failed to fetch creator behavioral metrics:', err)
      return null
    }
  }

  /**
   * Get idea decision evidence for idea details page
   */
  async getIdeaDecisionEvidence(ideaId: string): Promise<IdeaDecisionEvidence | null> {
    try {
      const { data, error } = await supabase.rpc('get_idea_decision_evidence', {
        p_idea_id: ideaId,
      })
      if (error) {
        console.error('Error fetching idea decision evidence:', error)
        return null
      }
      // Parse vote change over time
      const voteChangeOverTime = (data?.voteChangeOverTime || []).map((d: { date: string; use: number; dislike: number; pay: number; total: number }) => ({
        date: typeof d.date === 'string' ? new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : d.date,
        use: d.use ?? 0,
        dislike: d.dislike ?? 0,
        pay: d.pay ?? 0,
        total: d.total ?? 0,
      }))
      // Parse segments
      const segments = (data?.segments || []).map((s: { segment: string; signals: number; avgDwellMs: number; voteTypePct: { use: number; dislike: number; pay: number } }) => ({
        segment: s.segment,
        signals: s.signals ?? 0,
        avgDwellMs: s.avgDwellMs ?? 0,
        voteTypePct: {
          use: s.voteTypePct?.use ?? 0,
          dislike: s.voteTypePct?.dislike ?? 0,
          pay: s.voteTypePct?.pay ?? 0,
        },
      }))
      return {
        totalVotes: data?.totalVotes ?? 0,
        voteTypeBreakdown: {
          use: data?.voteTypeBreakdown?.use ?? 0,
          dislike: data?.voteTypeBreakdown?.dislike ?? 0,
          pay: data?.voteTypeBreakdown?.pay ?? 0,
        },
        signalVolatility: Number(data?.signalVolatility ?? 0),
        voteChangeOverTime,
        detailViews: data?.detailViews ?? 0,
        avgDwellTimeMs: data?.avgDwellTimeMs ?? 0,
        medianDwellTimeMs: data?.medianDwellTimeMs ?? 0,
        scrollDepthPct: data?.scrollDepthPct ?? 0,
        returnRate: Number(data?.returnRate ?? 0),
        timeToFirstSignalSec: data?.timeToFirstSignalSec ?? 0,
        timeToFirstCommentSec: data?.timeToFirstCommentSec ?? 0,
        voteLatencyAvgSec: data?.voteLatencyAvgSec ?? 0,
        pctVotesAfterComment: data?.pctVotesAfterComment ?? 0,
        pctVotesAfterAIComment: data?.pctVotesAfterAIComment ?? 0,
        commentDepth: Number(data?.commentDepth ?? 0),
        avgCommentLength: data?.avgCommentLength ?? 0,
        earlyExitRatePct: data?.earlyExitRatePct ?? 0,
        highDwellNoVotePct: data?.highDwellNoVotePct ?? 0,
        dwellDistribution: Array.isArray(data?.dwellDistribution) ? data.dwellDistribution : [0, 0, 0, 0, 0],
        segments,
      }
    } catch (err) {
      console.error('Failed to fetch idea decision evidence:', err)
      return null
    }
  }

  // =====================================================
  // UTILITY METHODS
  // =====================================================

  /**
   * Check if a comment is from an AI persona
   */
  isAIComment(content: string): boolean {
    const aiPersonaNames = [
      'AI · The Architect',
      'AI · The Delivery Lead',
      'AI · The Challenger',
      'AI · The Strategist',
      'AI · The Capital Lens',
    ]
    return aiPersonaNames.some(name => content.startsWith(`${name}:`))
  }

  /**
   * Identify user for PostHog
   */
  identifyUser(userId: string, properties?: Record<string, any>): void {
    if (this.isClient) {
      posthog.identify(userId, properties)
    }
  }

  /**
   * Reset user identification (on logout)
   */
  resetUser(): void {
    if (this.isClient) {
      posthog.reset()
    }
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService()
