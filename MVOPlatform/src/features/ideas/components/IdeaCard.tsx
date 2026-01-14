'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  ArrowUp,
  ArrowDown,
  MessageSquare,
  DollarSign,
  Trash2,
} from 'lucide-react'
import {
  useLocale,
  useTranslations,
} from '@/shared/components/providers/I18nProvider'
import { Idea } from '@/core/types/idea'
import { useAppSelector } from '@/core/lib/hooks'
import { useVideoPlayer } from '@/core/hooks/useVideoPlayer'
import { useMediaValidation } from '@/core/hooks/useMediaValidation'
import { formatDate } from '@/core/lib/utils/date'
import { ideaService } from '@/core/lib/services/ideaService'
import { getMostVotedType } from '@/core/lib/utils/idea.utils'
import { VoteDistributionRing } from '@/shared/components/ui/VoteDistributionRing'
import { toast } from 'sonner'
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner'

type IdeaCardVariant = 'interactive' | 'metrics' | 'admin'

interface IdeaCardProps {
  idea: Idea
  variant?: IdeaCardVariant
  onMouseEnter?: () => void
  onMouseLeave?: () => void
  initialUserVotes?: {
    use: boolean
    dislike: boolean
    pay: boolean
  }
  onDelete?: () => void
  router?: any
  locale?: string
}

export function IdeaCard({
  idea,
  variant = 'interactive',
  onMouseEnter,
  onMouseLeave,
  initialUserVotes,
  onDelete,
  router,
  locale: propLocale,
}: IdeaCardProps) {
  const t = useTranslations()
  const { locale } = useLocale()
  const [currentIdea, setCurrentIdea] = useState(idea)
  const [isVoting, setIsVoting] = useState(false)
  const [userVote, setUserVote] = useState<{
    use: boolean
    dislike: boolean
    pay: boolean
  }>(
    initialUserVotes || {
      use: false,
      dislike: false,
      pay: false,
    }
  )
  const cardRef = useRef<HTMLDivElement>(null)
  const { isAuthenticated } = useAppSelector(state => state.auth)
  const validCardMedia = useMediaValidation(currentIdea)
  const effectiveLocale = propLocale || locale

  // Update user votes when initialUserVotes prop changes
  useEffect(() => {
    if (initialUserVotes) {
      setUserVote(initialUserVotes)
    } else {
      // Ensure userVote is initialized with default values if initialUserVotes is undefined
      setUserVote({
        use: false,
        dislike: false,
        pay: false,
      })
    }
  }, [initialUserVotes])

  // Use reusable video player hook with start time at 10 seconds
  const videoRef = useVideoPlayer({
    videoSrc: validCardMedia.video,
    containerRef: cardRef,
    startTime: 10,
  })

  const handleVote = async (
    e: React.MouseEvent,
    voteType: 'use' | 'dislike' | 'pay'
  ) => {
    e.preventDefault()
    if (!isAuthenticated) {
      toast.warning(t('auth.sign_in_to_vote'))
      return
    }
    if (isVoting) return

    // Optimistic update: immediately update UI
    const previousIdea = currentIdea
    const previousUserVote = userVote
    const isRemovingVote = userVote[voteType]

    setIsVoting(true)

    // Only update UI optimistically if we're adding a vote, not removing
    if (!isRemovingVote) {
      setCurrentIdea(prev => ({
        ...prev,
        votes: prev.votes + 1,
        votesByType: {
          ...prev.votesByType,
          [voteType]: prev.votesByType[voteType] + 1,
        },
      }))
    }

    // Update user vote state optimistically
    if (voteType === 'use' || voteType === 'dislike') {
      setUserVote(prev => ({
        ...prev,
        use: voteType === 'use' ? !prev.use : false,
        dislike: voteType === 'dislike' ? !prev.dislike : false,
      }))
    } else {
      setUserVote(prev => ({
        ...prev,
        pay: !prev.pay,
      }))
    }

    try {
      const updatedIdea = await ideaService.toggleVote(currentIdea.id, voteType)
      setCurrentIdea(updatedIdea)
      // After successful vote, refresh the user votes to ensure consistency
      const updatedUserVotes = await ideaService.getUserVotes(currentIdea.id)

      // Debug: Log the updated user votes
      console.log('Updated user votes after toggle:', updatedUserVotes)

      setUserVote(updatedUserVotes)
    } catch (error) {
      // Rollback on error
      setCurrentIdea(previousIdea)
      setUserVote(previousUserVote)
      console.error('Error voting:', error)
      toast.error(t('actions.error_voting'))
    } finally {
      setIsVoting(false)
    }
  }

  const handleUpVote = async (e: React.MouseEvent) => await handleVote(e, 'use')
  const handleDownVote = async (e: React.MouseEvent) =>
    await handleVote(e, 'dislike')

  const handleClick = () => {
    // Save current path and scroll position before navigating
    if (typeof window !== 'undefined') {
      // Find the scrollable container (div inside main with overflow-y-auto)
      const scrollContainer = document.querySelector(
        'main > div.overflow-y-auto'
      ) as HTMLElement
      const scrollY = scrollContainer
        ? scrollContainer.scrollTop
        : window.scrollY

      sessionStorage.setItem('previousPath', window.location.pathname)
      sessionStorage.setItem('previousScrollPosition', scrollY.toString())
    }
  }

  const mostVoted =
    currentIdea.status_flag === 'validated'
      ? getMostVotedType(currentIdea.votesByType)
      : null
  const upvoted = userVote.use
  const downvoted = userVote.dislike
  const votedPay = userVote.pay

  const isInteractive = variant === 'interactive'
  const isAdmin = variant === 'admin'

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if delete button was clicked
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    // Navigate to idea details page with proper locale
    if (router && effectiveLocale) {
      router.push(`/${effectiveLocale}/ideas/${currentIdea.id}`)
    }
  }

  return (
    <div
      ref={cardRef}
      className={`card-hover overflow-hidden h-full ${isAdmin ? 'relative group cursor-pointer' : ''}`}
      onClick={isAdmin ? handleCardClick : undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {isAdmin && onDelete && (
        <button
          onClick={e => {
            e.stopPropagation()
            onDelete()
          }}
          className="absolute top-3 right-3 z-10 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
          title={t('admin.dashboard.delete_idea')}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      {isAdmin ? (
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 flex flex-col h-full light-theme-card"
        >
          {/* Media Section */}
          <div className="relative w-full aspect-video mb-3 rounded-md overflow-hidden">
            {validCardMedia.video ? (
              <video
                ref={videoRef}
                src={validCardMedia.video}
                className="w-full h-full object-cover"
                loop
                muted
                playsInline
                preload="none"
              />
            ) : validCardMedia.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={validCardMedia.image}
                alt={currentIdea.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
                <div className="text-center px-4">
                  <h3 className="text-lg font-bold text-white line-clamp-2">
                    {currentIdea.title}
                  </h3>
                </div>
              </div>
            )}
          </div>

          {/* Content Section - Title Only */}
          <div className="mb-4 flex-1">
            <h2 className="text-xl font-bold text-text-primary line-clamp-3 break-words leading-tight">
              {currentIdea.title}
            </h2>
          </div>

          {/* Engagement Metrics - Prominent Display */}
          <div className="flex items-center gap-4 mb-3 p-3 bg-background/50 rounded-lg">
            {/* Upvote Metric */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <ArrowUp className="w-5 h-5 text-green-500" />
              <span className="text-lg font-bold text-text-primary">
                {currentIdea.votesByType.use}
              </span>
            </div>

            {/* Downvote Metric */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <ArrowDown className="w-5 h-5 text-red-500" />
              <span className="text-lg font-bold text-text-primary">
                {currentIdea.votesByType.dislike}
              </span>
            </div>

            {/* Pay Vote Metric */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <DollarSign className="w-5 h-5 text-blue-500" />
              <span className="text-lg font-bold text-text-primary">
                {currentIdea.votesByType.pay}
              </span>
            </div>

            {/* Comments Metric */}
            <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
              <MessageSquare className="w-5 h-5 text-text-secondary" />
              <span className="text-lg font-bold text-text-primary">
                {currentIdea.commentCount}
              </span>
            </div>
          </div>

          {/* Tags Section */}
          <div className="flex items-center gap-1.5 flex-wrap mb-2 overflow-hidden">
            {currentIdea.tags.slice(0, 3).map(tag => {
              const truncatedTag =
                tag.length > 7 ? `${tag.substring(0, 7)}...` : tag
              return (
                <span
                  key={tag}
                  className="badge-gray text-xs px-2 py-0.5 whitespace-nowrap flex-shrink-0"
                  title={tag}
                >
                  #{truncatedTag}
                </span>
              )
            })}
            {currentIdea.tags.length > 3 && (
              <span className="text-xs text-text-secondary whitespace-nowrap flex-shrink-0">
                +{currentIdea.tags.length - 3}
              </span>
            )}
          </div>

          {/* Author and Date */}
          <div className="flex items-center justify-between text-xs text-text-secondary pt-2 border-t border-background">
            <span>By {currentIdea.author}</span>
            <span>{formatDate(currentIdea.createdAt)}</span>
          </div>
        </motion.article>
      ) : (
        <Link
          href={`/${effectiveLocale}/ideas/${currentIdea.id}`}
          onClick={handleClick}
          className="h-full"
        >
          <motion.article
            whileHover={{ y: -2 }}
            className="p-4 flex flex-col h-full light-theme-card"
          >
            {/* Media Section */}
            <div className="relative w-full aspect-video mb-3 rounded-md overflow-hidden">
              {validCardMedia.video ? (
                <video
                  ref={videoRef}
                  src={validCardMedia.video}
                  className="w-full h-full object-cover"
                  loop
                  muted
                  playsInline
                  preload="none"
                />
              ) : validCardMedia.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={validCardMedia.image}
                  alt={currentIdea.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
                  <div className="text-center px-4">
                    <h3 className="text-lg font-bold text-white line-clamp-2">
                      {currentIdea.title}
                    </h3>
                  </div>
                </div>
              )}
            </div>

            {/* Content Section - Title with Sentiment Indicator */}
            <div className="flex items-center justify-between gap-3 mb-4 flex-1">
              {/* Title */}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-text-primary line-clamp-3 break-words leading-tight">
                  {currentIdea.title}
                </h2>
              </div>

              {/* Vote Distribution Ring - Right Side */}
              {isInteractive && (
                <div className="flex-shrink-0">
                  <VoteDistributionRing
                    votes={currentIdea.votesByType}
                    size={40}
                  />
                </div>
              )}
            </div>

            {/* Actions Section - Prominent Voting Buttons */}
            {isInteractive ? (
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={handleUpVote}
                  disabled={isVoting}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-250 font-medium whitespace-nowrap flex-1 justify-center ${
                    upvoted
                      ? 'bg-green-500 text-white shadow-md'
                      : 'bg-gray-200 text-text-secondary hover:bg-gray-300'
                  } ${isVoting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isVoting ? (
                    <LoadingSpinner size={18} color="currentColor" />
                  ) : (
                    <motion.div
                      animate={upvoted ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </motion.div>
                  )}
                  <span className="text-sm font-semibold">
                    {currentIdea.votesByType.use}
                  </span>
                </button>
                <button
                  onClick={handleDownVote}
                  disabled={isVoting}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-250 font-medium whitespace-nowrap flex-1 justify-center ${
                    downvoted
                      ? 'bg-red-500 text-white shadow-md'
                      : 'bg-gray-200 text-text-secondary hover:bg-gray-300'
                  } ${isVoting ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isVoting ? (
                    <LoadingSpinner size={18} color="currentColor" />
                  ) : (
                    <motion.div
                      animate={downvoted ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </motion.div>
                  )}
                  <span className="text-sm font-semibold">
                    {currentIdea.votesByType.dislike}
                  </span>
                </button>
                <button
                  onClick={e => handleVote(e, 'pay')}
                  disabled={isVoting}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all duration-250 font-medium whitespace-nowrap flex-1 justify-center ${
                    votedPay
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-gray-200 text-text-secondary hover:bg-gray-300'
                  } ${isVoting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  title="I'd pay for it"
                >
                  {isVoting ? (
                    <LoadingSpinner size={18} color="currentColor" />
                  ) : (
                    <motion.div
                      animate={votedPay ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0"
                    >
                      <DollarSign className="w-4 h-4" />
                    </motion.div>
                  )}
                  <span className="text-sm font-semibold">
                    {currentIdea.votesByType.pay}
                  </span>
                </button>
              </div>
            ) : null}

            {/* Comments and Tags Section */}
            <div className="flex items-center justify-between gap-2 mb-2">
              {/* Comments indicator */}
              <motion.div
                className={`flex items-center gap-1.5 ${
                  currentIdea.status_flag === 'active_discussion'
                    ? 'text-accent'
                    : 'text-text-secondary'
                }`}
                animate={
                  currentIdea.status_flag === 'active_discussion'
                    ? {
                        opacity: [0.7, 1, 0.7],
                      }
                    : {}
                }
                transition={{
                  duration: 3,
                  repeat:
                    currentIdea.status_flag === 'active_discussion'
                      ? Infinity
                      : 0,
                  ease: 'easeInOut',
                }}
              >
                <MessageSquare
                  className={
                    currentIdea.status_flag === 'active_discussion'
                      ? 'w-4 h-4'
                      : 'w-4 h-4'
                  }
                />
                <span className="text-sm font-medium">
                  {currentIdea.commentCount}{' '}
                  {t('common.comments') || 'comments'}
                </span>
              </motion.div>

              {/* Tags Section */}
              <div className="flex items-center gap-1.5 flex-wrap overflow-hidden">
                {currentIdea.tags.slice(0, 2).map(tag => {
                  const truncatedTag =
                    tag.length > 8 ? `${tag.substring(0, 8)}...` : tag
                  return (
                    <span
                      key={tag}
                      className="badge-gray text-xs px-2 py-0.5 whitespace-nowrap flex-shrink-0"
                      title={tag}
                    >
                      #{truncatedTag}
                    </span>
                  )
                })}
                {currentIdea.tags.length > 2 && (
                  <span className="text-xs text-text-secondary whitespace-nowrap flex-shrink-0">
                    +{currentIdea.tags.length - 2}
                  </span>
                )}
              </div>
            </div>

            {/* Author and Date */}
            <div className="flex items-center justify-between text-xs text-text-secondary pt-2 border-t border-background">
              <span>
                {currentIdea.anonymous
                  ? t('common.anonymous')
                  : `${t('common.by')} ${currentIdea.author}`}
              </span>
              <span>{formatDate(currentIdea.createdAt)}</span>
            </div>
          </motion.article>
        </Link>
      )}
    </div>
  )
}
