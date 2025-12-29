'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUp, ArrowDown, MessageSquare, DollarSign } from 'lucide-react'
import { useLocale, useTranslations } from '@/shared/components/providers/I18nProvider'
import { Idea } from '@/core/types/idea'
import { useAppSelector } from '@/core/lib/hooks'
import { getCardMedia } from '@/core/lib/utils/media'
import { useVideoPlayer } from '@/core/hooks/useVideoPlayer'
import { formatDate } from '@/core/lib/utils/date'
import { ideaService } from '@/core/lib/services/ideaService'
import { getMostVotedType, VoteDistributionBar } from '@/shared/components/ui/VoteDistributionBar'

type IdeaCardVariant = 'interactive' | 'metrics'

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
}

export function IdeaCard({
  idea,
  variant = 'interactive',
  onMouseEnter,
  onMouseLeave,
  initialUserVotes,
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

  // Update user votes when initialUserVotes prop changes
  useEffect(() => {
    if (initialUserVotes) {
      setUserVote(initialUserVotes)
    }
  }, [initialUserVotes])

  const cardMedia = getCardMedia(currentIdea)

  // Use reusable video player hook with start time at 10 seconds
  const videoRef = useVideoPlayer({
    videoSrc: cardMedia.video,
    containerRef: cardRef,
    startTime: 10,
  })

  const handleVote = async (
    e: React.MouseEvent,
    voteType: 'use' | 'dislike' | 'pay'
  ) => {
    e.preventDefault()
    if (!isAuthenticated) {
      alert(t('auth.sign_in_to_vote'))
      return
    }
    if (isVoting) return

    setIsVoting(true)
    try {
      const updatedIdea = await ideaService.toggleVote(currentIdea.id, voteType)
      setCurrentIdea(updatedIdea)
      // Update local state based on the vote type
      if (voteType === 'use' || voteType === 'dislike') {
        // For use/dislike, toggle the specific vote and ensure the other is false
        setUserVote(prev => ({
          ...prev,
          use: voteType === 'use' ? !prev.use : false,
          dislike: voteType === 'dislike' ? !prev.dislike : false,
          pay: prev.pay, // pay remains unchanged
        }))
      } else if (voteType === 'pay') {
        // For pay, just toggle it
        setUserVote(prev => ({
          ...prev,
          pay: !prev.pay,
        }))
      }
    } catch (error) {
      console.error('Error voting:', error)
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

  return (
    <div
      ref={cardRef}
      className="card-hover overflow-hidden h-full"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Link href={`/${locale}/ideas/${currentIdea.id}`} onClick={handleClick} className="h-full">
        <motion.article whileHover={{ y: -2 }} className="p-4 flex flex-col h-full">
          {/* Media Section */}
          <div className="relative w-full aspect-video mb-3 rounded-md overflow-hidden">
            {cardMedia.video ? (
              <video
                ref={videoRef}
                src={cardMedia.video}
                className="w-full h-full object-cover"
                loop
                muted
                playsInline
                preload="none"
              />
            ) : cardMedia.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cardMedia.image}
                alt={currentIdea.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
                <div className="text-center px-4">
                  <h3 className="text-lg font-bold text-text-primary line-clamp-2">
                    {currentIdea.title}
                  </h3>
                </div>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="flex items-start justify-between gap-3 mb-3 flex-1">
            <div className="flex-1 min-w-0 max-w-[calc(100%-80px)]">
              <h2 className="text-lg font-semibold text-text-primary mb-1 line-clamp-2 break-words">
                {currentIdea.title}
              </h2>
              <p className="text-sm text-text-secondary line-clamp-2 mb-2 break-words">
                {currentIdea.description}
              </p>
            </div>
            <div className="text-right flex-shrink-0 w-16">
              <div className="text-2xl font-semibold text-accent whitespace-nowrap">
                {currentIdea.score}
              </div>
              <div className="text-xs text-text-secondary whitespace-nowrap">
                {t('common.score')}
              </div>
            </div>
          </div>

          {/* Vote Distribution Bar - Only for interactive variant */}
          {isInteractive && (
            <div className="mb-3">
              <VoteDistributionBar votes={currentIdea.votesByType} />
            </div>
          )}

          {/* Actions and Tags */}
          <div className="flex items-center justify-between gap-2 mb-2 min-h-[32px] overflow-hidden">
            {isInteractive ? (
              // Interactive variant: Show voting buttons
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={handleUpVote}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all duration-250 text-sm whitespace-nowrap flex-shrink-0 ${
                    upvoted
                      ? 'bg-accent text-text-primary'
                      : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                  }`}
                >
                  <motion.div
                    animate={upvoted ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </motion.div>
                  <span className="font-medium">
                    {currentIdea.votesByType.use}
                  </span>
                </button>
                <button
                  onClick={handleDownVote}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all duration-250 text-sm whitespace-nowrap flex-shrink-0 ${
                    downvoted
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                  }`}
                >
                  <motion.div
                    animate={downvoted ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </motion.div>
                  <span className="font-medium">
                    {currentIdea.votesByType.dislike}
                  </span>
                </button>
                <button
                  onClick={e => handleVote(e, 'pay')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all duration-250 text-sm whitespace-nowrap flex-shrink-0 ${
                    votedPay
                      ? 'bg-accent-alt text-white'
                      : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                  }`}
                  title="I'd pay for it"
                >
                  <motion.div
                    animate={votedPay ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <DollarSign className="w-3.5 h-3.5" />
                  </motion.div>
                  <span className="font-medium">
                    {currentIdea.votesByType.pay}
                  </span>
                </button>
                <motion.div
                  className={`flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 ${
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
                        ? 'w-[15px] h-[15px]'
                        : 'w-3.5 h-3.5'
                    }
                  />
                  <span className="text-sm">{currentIdea.commentCount}</span>
                </motion.div>
              </div>
            ) : (
              // Metrics variant: Show vote counts as metrics
              <div className="flex items-center gap-3 flex-shrink-0">
                {/* Upvote Metric */}
                <div className="flex items-center gap-1.5 text-text-secondary whitespace-nowrap flex-shrink-0">
                  <ArrowUp className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-sm font-medium">
                    {currentIdea.votesByType.use}
                  </span>
                </div>

                {/* Downvote Metric */}
                <div className="flex items-center gap-1.5 text-text-secondary whitespace-nowrap flex-shrink-0">
                  <ArrowDown className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-sm font-medium">
                    {currentIdea.votesByType.dislike}
                  </span>
                </div>

                {/* Pay Vote Metric */}
                <div className="flex items-center gap-1.5 text-text-secondary whitespace-nowrap flex-shrink-0">
                  <DollarSign className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-sm font-medium">
                    {currentIdea.votesByType.pay}
                  </span>
                </div>

                {/* Comments Metric */}
                <div className="flex items-center gap-1.5 text-text-secondary whitespace-nowrap flex-shrink-0">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span className="text-sm">{currentIdea.commentCount}</span>
                </div>
              </div>
            )}

            <div className="flex items-center gap-1.5 flex-shrink-0 overflow-hidden">
              {currentIdea.tags.slice(0, isInteractive ? 2 : 3).map(tag => (
                <span
                  key={tag}
                  className="badge-gray text-xs px-2 py-0.5 whitespace-nowrap flex-shrink-0 truncate max-w-[80px]"
                  title={tag}
                >
                  {tag}
                </span>
              ))}
              {currentIdea.tags.length > (isInteractive ? 2 : 3) && (
                <span className="text-xs text-text-secondary whitespace-nowrap flex-shrink-0">
                  +{currentIdea.tags.length - (isInteractive ? 2 : 3)}
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
    </div>
  )
}
