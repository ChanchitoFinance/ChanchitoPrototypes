'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { User, Calendar } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils/date'
import { useVideoPlayer } from '@/hooks/useVideoPlayer'
import { CommentsBlock } from './CommentsBlock'
import { IdeaActions } from './IdeaActions'
import { ContentRenderer } from './ContentRenderer'
import { IdeaDetailSkeleton } from '@/components/ui/Skeleton'
import { useAppSelector } from '@/lib/hooks'
import {
  useGetIdeaByIdQuery,
  useGetUserVotesQuery,
  useToggleVoteMutation,
} from '@/lib/api/ideasApi'
import { getCardMedia } from '@/lib/utils/media'
import { useTranslations } from '@/components/providers/I18nProvider'

interface IdeaDetailProps {
  ideaId: string
}

export function IdeaDetail({ ideaId }: IdeaDetailProps) {
  const t = useTranslations()
  const containerRef = useRef<HTMLDivElement>(null)
  const commentsSectionRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { isAuthenticated } = useAppSelector(state => state.auth)

  // RTK Query hooks - uses cache if idea was already fetched in feed
  const { data: idea, isLoading: isLoadingIdea } = useGetIdeaByIdQuery(ideaId)

  // Fetch user votes for this idea (only when authenticated)
  const { data: userVotes } = useGetUserVotesQuery(ideaId, {
    skip: !isAuthenticated,
  })

  // Vote mutation with optimistic updates
  const [toggleVote, { isLoading: isVoting }] = useToggleVoteMutation()

  const handleBack = () => {
    // Get the previous path from sessionStorage (set when navigating to idea)
    const previousPath = sessionStorage.getItem('previousPath') || '/'
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

  const cardMedia = idea ? getCardMedia(idea) : {}
  // Use video player hook - auto-play when in viewport
  const videoPlayerRef = useVideoPlayer({
    videoSrc: cardMedia.video,
    containerRef: containerRef,
    startTime: 35,
    threshold: 0.1,
  })

  const handleVoteUp = () => {
    if (!isAuthenticated) {
      alert(t('auth.sign_in_to_vote'))
      return
    }
    if (!idea || isVoting) return

    toggleVote({ ideaId: idea.id, voteType: 'use' })
  }

  const handleVoteDown = () => {
    if (!isAuthenticated) {
      alert(t('auth.sign_in_to_vote'))
      return
    }
    if (!idea || isVoting) return

    toggleVote({ ideaId: idea.id, voteType: 'dislike' })
  }

  const handleLike = () => {
    if (!isAuthenticated) {
      alert(t('auth.sign_in_to_vote'))
      return
    }
    if (!idea || isVoting) return

    toggleVote({ ideaId: idea.id, voteType: 'pay' })
  }

  const handleCommentsClick = () => {
    if (commentsSectionRef.current) {
      commentsSectionRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }

  if (isLoadingIdea) {
    return <IdeaDetailSkeleton />
  }

  if (!idea) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-text-primary">{t('messages.idea_not_found')}</div>
      </div>
    )
  }

  // Default user votes if not loaded
  const votes = userVotes || { use: false, dislike: false, pay: false }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section - Main content at the top */}
      <div className="relative w-full bg-black">
        {/* Media Section */}
        {cardMedia.video ? (
          <div ref={containerRef} className="relative w-full aspect-video">
            <video
              ref={videoPlayerRef}
              src={cardMedia.video}
              className="w-full h-full object-cover pointer-events-none"
              loop
              muted
              playsInline
              autoPlay
              preload="metadata"
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
        ) : cardMedia.image ? (
          <div className="relative w-full aspect-video">
            <Image
              src={cardMedia.image}
              alt={idea.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        ) : (
          <div className="relative w-full aspect-video bg-gradient-to-br from-accent/20 via-background to-accent/10 flex items-center justify-center">
            <div className="text-center px-6 max-w-2xl">
              <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-4">
                {idea.title}
              </h1>
            </div>
          </div>
        )}

        {/* Overlay Content - Title and Meta */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 md:p-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-4">
              {idea.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs font-medium text-white bg-white/20 backdrop-blur-sm rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
            <h1
              className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg break-words"
              style={{
                overflowWrap: 'break-word',
                wordBreak: 'break-word',
                maxWidth: '100%',
              }}
            >
              {idea.title}
            </h1>
            <div className="flex items-center gap-4 text-white/80 text-sm md:text-base">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>@{idea.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(idea.createdAt)}</span>
              </div>
              <div className="text-accent font-semibold text-lg md:text-xl">
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
          idea={idea}
          upvoted={votes.use}
          downvoted={votes.dislike}
          liked={votes.pay}
          useCount={idea.votesByType.use}
          dislikeCount={idea.votesByType.dislike}
          likeCount={idea.votesByType.pay}
          commentCount={idea.commentCount}
          onUpvote={handleVoteUp}
          onDownvote={handleVoteDown}
          onLike={handleLike}
          onCommentsClick={handleCommentsClick}
        />

        {/* Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="prose prose-invert max-w-none mb-12"
        >
          <div
            className="text-body-large text-text-secondary leading-relaxed whitespace-pre-line break-words"
            style={{
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              maxWidth: '100%',
            }}
          >
            {idea.description}
          </div>
        </motion.div>

        {/* Rich Content */}
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

        {/* Additional Images Section - Show image if there's a video being displayed and an image is available */}
        {cardMedia.video && idea.image && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="relative w-full aspect-video rounded-lg overflow-hidden">
              <Image
                src={idea.image}
                alt={idea.title}
                fill
                className="object-cover"
              />
            </div>
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
      </article>
    </div>
  )
}
