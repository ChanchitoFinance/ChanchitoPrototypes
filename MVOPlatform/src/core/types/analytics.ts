/**
 * Analytics Type Definitions
 * Types for tracking and displaying creator insights
 */

// =====================================================
// EVENT TYPES (for PostHog tracking)
// =====================================================

export type AnalyticsEventName =
  | 'dc_idea_viewed'
  | 'dc_vote_cast'
  | 'dc_comment_added'
  | 'dc_ai_feature_used'
  | 'dc_deep_research_completed'
  | 'dc_personas_evaluation_completed'
  | 'dc_idea_created'
  | 'dc_idea_updated'
  | 'dc_idea_shared'

export interface BaseEventProperties {
  idea_id: string
  timestamp: string
  interaction_source: 'user' | 'ai'
}

export interface IdeaViewedEvent extends BaseEventProperties {
  viewer_id?: string
  is_owner: boolean
  has_ai_comments: boolean
  has_deep_research: boolean
}

export interface VoteCastEvent extends BaseEventProperties {
  vote_type: 'use' | 'dislike' | 'pay'
  voter_id: string
  is_first_vote: boolean
  is_removing: boolean
}

export interface CommentAddedEvent extends BaseEventProperties {
  comment_id: string
  commenter_id: string
  is_ai_comment: boolean
  is_reply: boolean
  mentioned_personas?: string[]
}

export interface AIFeatureUsedEvent extends BaseEventProperties {
  feature_type: 'deep_research' | 'personas_evaluation' | 'ai_comments' | 'risk_analysis'
  coins_spent: number
  user_id: string
}

// =====================================================
// DATABASE TYPES (from idea_analytics table)
// =====================================================

export interface DailyVoteEntry {
  date: string
  use: number
  dislike: number
  pay: number
}

export interface DailyViewEntry {
  date: string
  count: number
}

export interface IdeaAnalytics {
  id: string
  idea_id: string
  
  // View metrics
  total_views: number
  unique_viewers: number
  
  // Engagement velocity
  first_vote_at: string | null
  first_comment_at: string | null
  time_to_first_vote_seconds: number | null
  time_to_first_comment_seconds: number | null
  
  // AI feature tracking
  has_ai_comments: boolean
  has_deep_research: boolean
  has_personas_evaluation: boolean
  ai_comments_count: number
  
  // Daily snapshots
  daily_votes: DailyVoteEntry[]
  daily_views: DailyViewEntry[]
  
  // Computed metrics
  pay_conversion_rate: number
  
  created_at: string
  updated_at: string
}

// =====================================================
// CREATOR INSIGHTS (aggregated for dashboard)
// =====================================================

export interface AIComparisonMetrics {
  count: number
  avgVotes: number
  avgPayRate: number
}

export interface AIFeatureUsage {
  deepResearch: number
  personasEval: number
  aiComments: number
}

export interface CreatorInsights {
  // Validation Signals
  payConversionRate: number
  avgTimeToFirstVote: number // in seconds
  avgTimeToFirstComment: number // in seconds
  sentimentRatio: number // (use + pay) / dislike
  
  // Engagement Trends
  dailyVoteTrends: DailyVoteEntry[]
  voteVelocity: number // votes per day average
  
  // AI Value comparison
  ideasWithAI: AIComparisonMetrics
  ideasWithoutAI: AIComparisonMetrics
  aiFeatureUsage: AIFeatureUsage
  
  // Additional metrics
  totalViews: number
  totalUniqueViewers: number
}

// =====================================================
// ANALYTICS SERVICE TYPES
// =====================================================

// Version info for tracking progression across idea iterations
export interface VersionInfo {
  versionNumber?: number
  ideaGroupId?: string
}

export interface TrackViewParams extends VersionInfo {
  ideaId: string
  viewerId?: string
  isOwner: boolean
  hasAIComments: boolean
  hasDeepResearch: boolean
}

export interface TrackVoteParams extends VersionInfo {
  ideaId: string
  voteType: 'use' | 'dislike' | 'pay'
  voterId: string
  isFirstVote: boolean
  isRemoving: boolean
}

export interface TrackCommentParams extends VersionInfo {
  ideaId: string
  commentId: string
  commenterId: string
  isAIComment: boolean
  isReply: boolean
  mentionedPersonas?: string[]
}

export interface TrackAIFeatureParams extends VersionInfo {
  ideaId: string
  featureType: 'deep_research' | 'personas_evaluation' | 'ai_comments' | 'risk_analysis'
  userId: string
  coinsSpent: number
}

// =====================================================
// DASHBOARD DISPLAY TYPES
// =====================================================

export interface ValidationSignalsDisplay {
  payConversionRate: {
    value: number
    label: string
    trend?: 'up' | 'down' | 'stable'
  }
  timeToFirstVote: {
    value: string // formatted (e.g., "2h 30m")
    rawSeconds: number
    label: string
  }
  timeToFirstComment: {
    value: string // formatted
    rawSeconds: number
    label: string
  }
  sentimentRatio: {
    value: number
    label: string
    interpretation: 'positive' | 'neutral' | 'negative'
  }
}

export interface EngagementTrendsDisplay {
  chartData: DailyVoteEntry[]
  voteVelocity: number
  totalVotesLast30Days: number
  peakDay?: {
    date: string
    totalVotes: number
  }
}

export interface AIValueInsightsDisplay {
  comparison: {
    withAI: AIComparisonMetrics
    withoutAI: AIComparisonMetrics
    aiLift: {
      votesLift: number // percentage increase
      payRateLift: number // percentage increase
    }
  }
  usage: AIFeatureUsage
  recommendation?: string
}

// =====================================================
// UTILITY TYPES
// =====================================================

export type FeatureType = 'deep_research' | 'personas_evaluation' | 'ai_comments' | 'risk_analysis'

export function formatTimeToEngagement(seconds: number | null): string {
  if (seconds === null || seconds === 0) return 'N/A'
  
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  
  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `${days}d ${hours % 24}h`
  }
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  
  return `${minutes}m`
}

export function interpretSentiment(ratio: number): 'positive' | 'neutral' | 'negative' {
  if (ratio >= 2) return 'positive'
  if (ratio >= 0.5) return 'neutral'
  return 'negative'
}

export function calculateAILift(
  withAI: AIComparisonMetrics,
  withoutAI: AIComparisonMetrics
): { votesLift: number; payRateLift: number } {
  const votesLift = withoutAI.avgVotes > 0
    ? ((withAI.avgVotes - withoutAI.avgVotes) / withoutAI.avgVotes) * 100
    : 0
  
  const payRateLift = withoutAI.avgPayRate > 0
    ? ((withAI.avgPayRate - withoutAI.avgPayRate) / withoutAI.avgPayRate) * 100
    : 0
  
  return {
    votesLift: Math.round(votesLift * 10) / 10,
    payRateLift: Math.round(payRateLift * 10) / 10,
  }
}
