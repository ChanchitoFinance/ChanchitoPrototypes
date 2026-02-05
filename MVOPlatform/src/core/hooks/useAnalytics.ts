/**
 * useAnalytics Hook
 * React hook for tracking analytics events with dual PostHog + Supabase storage
 * Supports version tracking for comparing engagement across idea iterations
 */

'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useAppSelector } from '@/core/lib/hooks'
import { analyticsService } from '@/core/lib/services/analyticsService'
import {
  CreatorInsights,
  FeatureType,
  VersionInfo,
} from '@/core/types/analytics'

// Version info type for idea context
interface IdeaVersionContext extends VersionInfo {
  ideaId: string
}

interface UseAnalyticsReturn {
  // Track events (version-aware)
  trackView: (ideaId: string, hasAIComments: boolean, hasDeepResearch: boolean, versionInfo?: VersionInfo) => void
  trackVote: (ideaId: string, voteType: 'use' | 'dislike' | 'pay', isRemoving: boolean, versionInfo?: VersionInfo) => void
  trackComment: (ideaId: string, commentId: string, isAIComment: boolean, isReply: boolean, mentionedPersonas?: string[], versionInfo?: VersionInfo) => void
  trackAIFeature: (ideaId: string, featureType: FeatureType, coinsSpent: number, versionInfo?: VersionInfo) => void
  trackIdeaCreated: (params: {
    ideaId: string
    hasVideo: boolean
    hasImage: boolean
    tags?: string[]
    isAnonymous: boolean
    isVersion: boolean
    requestedAIComments: boolean
    versionNumber?: number
    ideaGroupId?: string
  }) => void
  trackIdeaUpdated: (params: {
    ideaId: string
    hasVideo: boolean
    hasImage: boolean
    tags?: string[]
    versionNumber?: number
    ideaGroupId?: string
    changedFields?: string[]
  }) => void
  trackShare: (ideaId: string, shareMethod: 'native' | 'clipboard') => void
  
  // Fetch data
  getCreatorInsights: () => Promise<CreatorInsights | null>
  
  // Utility
  isAIComment: (content: string) => boolean
}

export function useAnalytics(): UseAnalyticsReturn {
  const { user, isAuthenticated } = useAppSelector(state => state.auth)
  const hasIdentified = useRef(false)
  
  // Identify user with PostHog when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.id && !hasIdentified.current) {
      analyticsService.identifyUser(user.id, {
        email: user.email,
      })
      hasIdentified.current = true
    }
  }, [isAuthenticated, user?.id, user?.email])
  
  // Reset on logout
  useEffect(() => {
    if (!isAuthenticated && hasIdentified.current) {
      analyticsService.resetUser()
      hasIdentified.current = false
    }
  }, [isAuthenticated])
  
  /**
   * Track idea view (with optional version info)
   */
  const trackView = useCallback((
    ideaId: string,
    hasAIComments: boolean,
    hasDeepResearch: boolean,
    versionInfo?: VersionInfo
  ) => {
    const isOwner = false // Will be determined by the component
    
    analyticsService.trackIdeaView({
      ideaId,
      viewerId: user?.id,
      isOwner,
      hasAIComments,
      hasDeepResearch,
      versionNumber: versionInfo?.versionNumber,
      ideaGroupId: versionInfo?.ideaGroupId,
    })
  }, [user?.id])
  
  /**
   * Track vote cast (with optional version info)
   */
  const trackVote = useCallback((
    ideaId: string,
    voteType: 'use' | 'dislike' | 'pay',
    isRemoving: boolean,
    versionInfo?: VersionInfo
  ) => {
    if (!user?.id) return
    
    analyticsService.trackVoteCast({
      ideaId,
      voteType,
      voterId: user.id,
      isFirstVote: false, // Component should track this
      isRemoving,
      versionNumber: versionInfo?.versionNumber,
      ideaGroupId: versionInfo?.ideaGroupId,
    })
  }, [user?.id])
  
  /**
   * Track comment added (with optional version info)
   */
  const trackComment = useCallback((
    ideaId: string,
    commentId: string,
    isAIComment: boolean,
    isReply: boolean,
    mentionedPersonas?: string[],
    versionInfo?: VersionInfo
  ) => {
    const commenterId = isAIComment ? 'ai_system' : (user?.id || 'anonymous')
    
    analyticsService.trackCommentAdded({
      ideaId,
      commentId,
      commenterId,
      isAIComment,
      isReply,
      mentionedPersonas,
      versionNumber: versionInfo?.versionNumber,
      ideaGroupId: versionInfo?.ideaGroupId,
    })
  }, [user?.id])
  
  /**
   * Track AI feature usage (with optional version info)
   */
  const trackAIFeature = useCallback((
    ideaId: string,
    featureType: FeatureType,
    coinsSpent: number,
    versionInfo?: VersionInfo
  ) => {
    if (!user?.id) return
    
    analyticsService.trackAIFeatureUsed({
      ideaId,
      featureType,
      userId: user.id,
      coinsSpent,
      versionNumber: versionInfo?.versionNumber,
      ideaGroupId: versionInfo?.ideaGroupId,
    })
  }, [user?.id])
  
  /**
   * Track idea created (with version info for new versions)
   */
  const trackIdeaCreated = useCallback((params: {
    ideaId: string
    hasVideo: boolean
    hasImage: boolean
    tags?: string[]
    isAnonymous: boolean
    isVersion: boolean
    requestedAIComments: boolean
    versionNumber?: number
    ideaGroupId?: string
  }) => {
    analyticsService.trackIdeaCreated({
      ...params,
      creatorId: user?.id,
    })
  }, [user?.id])
  
  /**
   * Track idea updated/edited
   */
  const trackIdeaUpdated = useCallback((params: {
    ideaId: string
    hasVideo: boolean
    hasImage: boolean
    tags?: string[]
    versionNumber?: number
    ideaGroupId?: string
    changedFields?: string[]
  }) => {
    analyticsService.trackIdeaUpdated({
      ...params,
      editorId: user?.id,
    })
  }, [user?.id])
  
  /**
   * Track share
   */
  const trackShare = useCallback((
    ideaId: string,
    shareMethod: 'native' | 'clipboard'
  ) => {
    analyticsService.trackIdeaShared({
      ideaId,
      shareMethod,
      userId: user?.id,
    })
  }, [user?.id])
  
  /**
   * Get creator insights
   */
  const getCreatorInsights = useCallback(async (): Promise<CreatorInsights | null> => {
    if (!user?.id) return null
    return analyticsService.getCreatorInsights(user.id)
  }, [user?.id])
  
  /**
   * Check if comment is from AI
   */
  const isAIComment = useCallback((content: string): boolean => {
    return analyticsService.isAIComment(content)
  }, [])
  
  return {
    trackView,
    trackVote,
    trackComment,
    trackAIFeature,
    trackIdeaCreated,
    trackIdeaUpdated,
    trackShare,
    getCreatorInsights,
    isAIComment,
  }
}

/**
 * Hook for tracking idea detail page views
 * Auto-tracks view on mount and provides ownership context
 * Now supports version tracking
 */
export function useIdeaViewTracking(
  ideaId: string | undefined,
  creatorId: string | undefined,
  hasAIComments: boolean = false,
  hasDeepResearch: boolean = false,
  versionNumber?: number,
  ideaGroupId?: string
): void {
  const { user } = useAppSelector(state => state.auth)
  const hasTracked = useRef(false)
  
  useEffect(() => {
    if (!ideaId || hasTracked.current) return
    
    const isOwner = user?.id === creatorId
    
    analyticsService.trackIdeaView({
      ideaId,
      viewerId: user?.id,
      isOwner,
      hasAIComments,
      hasDeepResearch,
      versionNumber,
      ideaGroupId,
    })
    
    hasTracked.current = true
  }, [ideaId, creatorId, user?.id, hasAIComments, hasDeepResearch, versionNumber, ideaGroupId])
}
