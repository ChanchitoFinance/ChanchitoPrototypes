'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { User, Calendar, ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/core/lib/utils/date'
import { Idea, IdeaVersionGroup } from '@/core/types/idea'
import { VersionSelectionModal } from './VersionSelectionModal'
import { VersionIndicator } from './VersionIndicator'
import { VersionHistoryPanel } from './VersionHistoryPanel'
import { Comment } from '@/core/types/comment'
import { ideaService } from '@/core/lib/services/ideaService'
import { commentService } from '@/core/lib/services/commentService'
import {
  toggleVote,
  fetchUserVotes,
  setCurrentIdea,
} from '@/core/lib/slices/ideasSlice'
import { useVideoPlayer } from '@/core/hooks/useVideoPlayer'
import { CommentsBlock } from '../../comments/components/CommentsBlock'
import { IdeaActions } from './IdeaActions'
import { ContentRenderer } from './ContentRenderer'
import { IdeaDetailSkeleton } from '@/shared/components/ui/Skeleton'
import { useAppSelector, useAppDispatch } from '@/core/lib/hooks'
import { getCardMedia, isUrlValid } from '@/core/lib/utils/media'
import {
  useTranslations,
  useLocale,
} from '@/shared/components/providers/I18nProvider'
import { Button } from '@/shared/components/ui/Button'
import { IdeaAnalytics } from './IdeaAnalytics'
import { toast } from 'sonner'
import { AIPersonasEvaluation } from '@/features/ai/components/AIPersonasEvaluation'
import { AIDeepResearch } from '@/features/ai/components/AIDeepResearch'
import { loadUserCredits } from '@/core/lib/slices/creditsSlice'

interface IdeaDetailProps {
  ideaId: string
}

export function IdeaDetail({ ideaId }: IdeaDetailProps) {
  const t = useTranslations()
  const { locale } = useLocale()
  const [idea, setIdea] = useState<Idea | null>(null)
  const [loading, setLoading] = useState(true)
  const [commentCount, setCommentCount] = useState(0)
  const [comments, setComments] = useState<Comment[]>([])
  const [validCardMedia, setValidCardMedia] = useState<{
    video?: string
    image?: string
  }>({})
  const [showVersionModal, setShowVersionModal] = useState(false)
  const [versionGroup, setVersionGroup] = useState<IdeaVersionGroup | null>(
    null
  )
  const dispatch = useAppDispatch()
  const { currentIdea, userVotes, isVoting } = useAppSelector(
    state => state.ideas
  )
  const containerRef = useRef<HTMLDivElement>(null)
  const commentsSectionRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { isAuthenticated, user } = useAppSelector(state => state.auth)

  const handleBack = () => {
    // Get the previous path from sessionStorage (set when navigating to idea)
    const previousPath = sessionStorage.getItem('previousPath') || `/${locale}`
    const scrollPosition = sessionStorage.getItem('previousScrollPosition')

    // Save scroll position to localStorage before navigating
    if (scrollPosition && previousPath) {
      localStorage.setItem(`scrollPosition_${previousPath}`, scrollPosition)
      // Set a flag to indicate we need to restore scroll
      sessionStorage.setItem('shouldRestoreScroll', 'true')
      sessionStorage.setItem('restoreScrollPath', previousPath)
      sessionStorage.setItem('restoreScrollPosition', scrollPosition)
    }

    // Navigate back using router.back() if possible, otherwise push
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push(previousPath)
    }
  }

  useEffect(() => {
    const loadIdea = async () => {
      try {
        const loadedIdea = await ideaService.getIdeaById(ideaId)
        if (loadedIdea) {
          setIdea(loadedIdea)
          dispatch(setCurrentIdea(loadedIdea))
          setCommentCount(loadedIdea.commentCount)

          // Fetch user votes if authenticated
          if (isAuthenticated) {
            dispatch(fetchUserVotes(ideaId))
            // Load user credits to ensure they are up to date for AI features
            if (user?.id) {
              dispatch(loadUserCredits(user.id))
            }
          }
        }
      } catch (error) {
        console.error('Error loading idea:', error)
      } finally {
        setLoading(false)
      }
    }

    loadIdea()
  }, [ideaId, isAuthenticated, user?.id])

  // Fetch comments when idea is loaded
  useEffect(() => {
    if (ideaId) {
      const fetchComments = async () => {
        try {
          const commentsData = await commentService.getComments(ideaId)
          setComments(commentsData)
        } catch (error) {
          console.error('Error fetching comments:', error)
        }
      }

      fetchComments()
    }
  }, [ideaId])

  // Fetch version group for owners
  useEffect(() => {
    if (isAuthenticated && idea?.creatorEmail === user?.email && ideaId) {
      const fetchVersionGroup = async () => {
        try {
          const group = await ideaService.getVersionGroup(ideaId)
          setVersionGroup(group)
        } catch (error) {
          console.error('Error fetching version group:', error)
        }
      }

      fetchVersionGroup()
    }
  }, [ideaId, isAuthenticated, idea?.creatorEmail, user?.email])

  const ideaData = currentIdea || idea

  // Check and filter invalid media URLs
  useEffect(() => {
    if (!ideaData) return

    const checkMediaValidity = async () => {
      const media = getCardMedia(ideaData)
      const validMedia: { video?: string; image?: string } = {}

      if (media.video) {
        const isValid = await isUrlValid(media.video)
        if (isValid) validMedia.video = media.video
      }

      if (media.image) {
        const isValid = await isUrlValid(media.image)
        if (isValid) validMedia.image = media.image
      }

      setValidCardMedia(validMedia)
    }

    checkMediaValidity()
  }, [ideaData])

  // Use video player hook - auto-play when in viewport
  const videoPlayerRef = useVideoPlayer({
    videoSrc: validCardMedia.video,
    containerRef: containerRef,
    startTime: 35,
    threshold: 0.1, // Start playing when 10% visible
  })

  const handleVoteUp = () => {
    if (!isAuthenticated) {
      toast.warning(t('auth.sign_in_to_vote'))
      return
    }
    if (!ideaData || isVoting) return

    dispatch(toggleVote({ ideaId: ideaData.id, voteType: 'use' }))
  }

  const handleVoteDown = () => {
    if (!isAuthenticated) {
      toast.warning(t('auth.sign_in_to_vote'))
      return
    }
    if (!ideaData || isVoting) return

    dispatch(toggleVote({ ideaId: ideaData.id, voteType: 'dislike' }))
  }

  const handleLike = () => {
    if (!isAuthenticated) {
      toast.warning(t('auth.sign_in_to_vote'))
      return
    }
    if (!ideaData || isVoting) return

    dispatch(toggleVote({ ideaId: ideaData.id, voteType: 'pay' }))
  }

  const handleCommentsClick = () => {
    if (commentsSectionRef.current) {
      commentsSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }

  const handleEdit = () => {
    if (ideaData) {
      // If there are multiple versions, show the version selection modal
      if (versionGroup && versionGroup.totalVersions > 1) {
        setShowVersionModal(true)
      } else {
        // Single version or no version info - show modal to allow creating new version
        setShowVersionModal(true)
      }
    }
  }

  const handleEditCurrentVersion = () => {
    if (ideaData) {
      router.push(`/${locale}/edit/${ideaData.id}`)
    }
  }

  const handleCreateNewVersion = () => {
    if (ideaData) {
      router.push(`/${locale}/edit/${ideaData.id}?mode=new-version`)
    }
  }

  const handleSetActiveVersion = async (versionId: string) => {
    try {
      await ideaService.setActiveVersion(versionId)
      // Refresh version group
      const group = await ideaService.getVersionGroup(ideaId)
      setVersionGroup(group)
      toast.success(t('versioning.version_activated'))
    } catch (error) {
      console.error('Error setting active version:', error)
      toast.error(t('messages.error_occurred'))
    }
  }

  const handleViewVersion = (versionId: string) => {
    router.push(`/${locale}/ideas/${versionId}`)
  }

  const handleEditVersion = (versionId: string) => {
    router.push(`/${locale}/edit/${versionId}`)
  }

  // Use the original 'idea' state for ownership check, not 'ideaData'
  // because ideaData may come from Redux currentIdea which doesn't include creatorEmail after voting
  const isOwner =
    isAuthenticated &&
    user?.email === idea?.creatorEmail &&
    idea?.creatorEmail !== undefined

  if (loading) {
    return <IdeaDetailSkeleton />
  }

  if (!idea) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-text-primary">{t('messages.idea_not_found')}</div>
      </div>
    )
  }

  return (
    <div className="bg-background relative">
      {/* Back Button - Top Left, next to sidebar - fixed on scroll - Hidden on mobile */}
      <div className="fixed top-4 left-4 md:left-[272px] z-50 hidden md:block">
        <Button
          onClick={handleBack}
          variant="outline"
          className="
            !text-gray-400
            !border-gray-400
            px-3 py-2 md:px-4 md:py-2
            backdrop-blur
          "
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline ml-2">{t('actions.back')}</span>
        </Button>
      </div>

      {/* Hero Section - Main content at the top */}
      <div className="relative w-full bg-black">
        {/* Media Section */}
        {validCardMedia.video ? (
          <div ref={containerRef} className="relative w-full aspect-video">
            <video
              ref={videoPlayerRef}
              src={validCardMedia.video}
              className="w-full h-full object-cover pointer-events-none"
              loop
              muted
              playsInline
              autoPlay
              onPause={e => {
                // Prevent pausing - immediately resume playback
                e.preventDefault()
                const video = e.currentTarget
                if (video.paused) {
                  video.play().catch(() => {
                    // Ignore play() errors
                  })
                }
              }}
              onContextMenu={e => {
                // Prevent right-click context menu
                e.preventDefault()
              }}
              style={{ pointerEvents: 'none' }}
            />
          </div>
        ) : validCardMedia.image ? (
          <div className="relative w-full aspect-video">
            <Image
              src={validCardMedia.image}
              alt={idea.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        ) : (
          <div className="relative w-full aspect-video bg-gradient-to-br from-accent/20 via-background to-accent/10 flex items-center justify-center">
            {/* Title hidden on mobile to avoid duplication with overlay */}
            <div className="text-center px-4 sm:px-6 max-w-2xl hidden md:block">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary mb-4 break-words">
                {idea.title}
              </h1>
            </div>
          </div>
        )}

        {/* Overlay Content - Title and Meta */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 sm:p-6 md:p-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-3 sm:mb-4">
              {idea.tags.map(tag => (
                <span
                  key={tag}
                  className="px-2 sm:px-3 py-1 text-xs font-medium text-white bg-white/20 backdrop-blur-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <h1
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg break-words"
                style={{
                  overflowWrap: 'break-word',
                  wordBreak: 'break-word',
                  maxWidth: '100%',
                }}
              >
                {idea.title}
              </h1>
              {isOwner && idea.versionNumber && (
                <VersionIndicator
                  versionNumber={idea.versionNumber}
                  isActiveVersion={idea.isActiveVersion ?? true}
                  totalVersions={versionGroup?.totalVersions}
                  onClick={() => setShowVersionModal(true)}
                  size="md"
                />
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-white text-sm md:text-base">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                {!idea.anonymous && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">@{idea.author}</span>
                  </div>
                )}
                {idea.anonymous && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 flex-shrink-0" />
                    <span>{t('common.anonymous')}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{formatDate(idea.createdAt)}</span>
                </div>
              </div>
              <div className="text-accent font-semibold text-base sm:text-lg md:text-xl">
                {t('common.score')}: {idea.score}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Actions Bar */}
        <IdeaActions
          idea={ideaData}
          upvoted={userVotes.use}
          downvoted={userVotes.dislike}
          liked={userVotes.pay}
          useCount={ideaData.votesByType.use}
          dislikeCount={ideaData.votesByType.dislike}
          likeCount={ideaData.votesByType.pay}
          commentCount={commentCount}
          onUpvote={handleVoteUp}
          onDownvote={handleVoteDown}
          onLike={handleLike}
          onCommentsClick={handleCommentsClick}
          isVoting={isVoting}
          isOwner={isOwner}
          onEdit={handleEdit}
          versionNumber={idea.versionNumber}
          showVersionBadge={isOwner && (versionGroup?.totalVersions ?? 0) > 1}
        />

        {/* Rich Content - show all content blocks */}
        {idea.content && idea.content.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-12"
          >
            <ContentRenderer content={idea.content} />
          </motion.div>
        )}

        {/* Comments Section */}
        <motion.div
          ref={commentsSectionRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <CommentsBlock ideaId={ideaId} />
        </motion.div>

        {/* Version History Panel - Only show for idea owner with multiple versions */}
        {isOwner && versionGroup && versionGroup.totalVersions > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          >
            <VersionHistoryPanel
              versions={versionGroup.versions}
              currentVersionId={ideaId}
              onSetActive={handleSetActiveVersion}
              onViewVersion={handleViewVersion}
              onEditVersion={handleEditVersion}
            />
          </motion.div>
        )}

        {/* Idea Analytics Section - Only show for idea owner */}
        {isAuthenticated && ideaData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <IdeaAnalytics ideaId={ideaId} idea={ideaData} isOwner={isOwner} />
          </motion.div>
        )}

        {isOwner && ideaData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <AIDeepResearch
              ideaId={ideaId}
              ideaVersionNumber={ideaData.versionNumber}
              title={ideaData.title}
              description={
                ideaData.content?.find(b => b.type === 'text')?.content || ''
              }
              content={ideaData.content || []}
              tags={ideaData.tags}
              onRequestResearch={undefined}
            />
          </motion.div>
        )}

        {/* {isOwner && ideaData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <AIPersonasEvaluation idea={ideaData} comments={comments} />
          </motion.div>
        )} */}
      </article>

      {/* Version Selection Modal */}
      {isOwner && (
        <VersionSelectionModal
          isOpen={showVersionModal}
          onClose={() => setShowVersionModal(false)}
          currentVersionNumber={idea.versionNumber ?? 1}
          totalVersions={versionGroup?.totalVersions ?? 1}
          onEditCurrent={handleEditCurrentVersion}
          onCreateNewVersion={handleCreateNewVersion}
        />
      )}
    </div>
  )
}
