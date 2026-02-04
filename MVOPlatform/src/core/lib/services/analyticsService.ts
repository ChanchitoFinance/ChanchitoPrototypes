/**
 * Analytics Service
 * Handles dual tracking to PostHog and Supabase for creator insights
 */

import posthog from 'posthog-js'
import { supabase } from '@/core/lib/supabase'
import {
  AnalyticsEventName,
  CreatorInsights,
  IdeaAnalytics,
  TrackViewParams,
  TrackVoteParams,
  TrackCommentParams,
  TrackAIFeatureParams,
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
