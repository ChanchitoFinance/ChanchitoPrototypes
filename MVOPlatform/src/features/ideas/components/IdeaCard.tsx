'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { MessageSquare, ChevronUp, ChevronDown, Trash2 } from 'lucide-react'
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
import { toast } from 'sonner'

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

// Vote colors - updated palette with opacity
const BUTTON_COLORS = {
  background: 'rgba(118, 99, 99, 0.13)', // Default button background with 13% opacity
  backgroundPay: 'rgba(115, 49, 223, 0.13)', // Background when double-clicked for pay with 13% opacity
  iconDefault: '#686060', // Icon color when not voted (100% opacity)
  iconLike: '#6F5091', // Icon color when liked (100% opacity)
  iconDislike: '#AD6034', // Icon color when disliked (100% opacity)
  iconPay: '#6619B9', // Icon color when double-clicked for pay (100% opacity)
}

// Colors for hover overlay bars
const HOVER_BAR_COLORS = {
  use: '#C46DE4', // Pink for like bar in overlay
  pay: '#7600A1', // Purple for pay bar in overlay
  dislike: '#FF922B', // Orange for dislike bar in overlay
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
  const [showHoverOverlay, setShowHoverOverlay] = useState(false)
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
  const likeClickTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const likeClickCountRef = useRef(0)
  const { isAuthenticated } = useAppSelector(state => state.auth)
  const validCardMedia = useMediaValidation(currentIdea)
  const effectiveLocale = propLocale || locale

  useEffect(() => {
    setCurrentIdea(idea)
  }, [idea])

  useEffect(() => {
    if (initialUserVotes) {
      setUserVote(initialUserVotes)
    } else {
      setUserVote({
        use: false,
        dislike: false,
        pay: false,
      })
    }
  }, [initialUserVotes])

  const videoRef = useVideoPlayer({
    videoSrc: validCardMedia.video,
    containerRef: cardRef,
    startTime: 10,
  })

  const handleVote = async (voteType: 'use' | 'dislike' | 'pay') => {
    if (!isAuthenticated) {
      toast.warning(t('auth.sign_in_to_vote'))
      return
    }
    if (isVoting) return

    const previousIdea = currentIdea
    const previousUserVote = userVote
    const isRemovingVote = userVote[voteType]

    setIsVoting(true)

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
      const updatedUserVotes = await ideaService.getUserVotes(currentIdea.id)
      setUserVote(updatedUserVotes)
    } catch (error) {
      setCurrentIdea(previousIdea)
      setUserVote(previousUserVote)
      console.error('Error voting:', error)
      toast.error(t('actions.error_voting'))
    } finally {
      setIsVoting(false)
    }
  }

  // Handle like button with double-click detection (2s debounce)
  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    likeClickCountRef.current += 1

    if (likeClickTimeoutRef.current) {
      clearTimeout(likeClickTimeoutRef.current)
    }

    // If double-click detected, trigger "pay for it"
    if (likeClickCountRef.current === 2) {
      likeClickCountRef.current = 0
      handleVote('pay')
      return
    }

    // Set timeout for single click (2 seconds)
    likeClickTimeoutRef.current = setTimeout(() => {
      if (likeClickCountRef.current === 1) {
        handleVote('use')
      }
      likeClickCountRef.current = 0
    }, 2000)
  }

  const handleDislikeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    handleVote('dislike')
  }

  const handleClick = () => {
    if (typeof window !== 'undefined') {
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

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    if (router && effectiveLocale) {
      router.push(`/${effectiveLocale}/ideas/${currentIdea.id}`)
    }
  }

  // Calculate vote percentages
  const totalVotes =
    currentIdea.votesByType.use +
    currentIdea.votesByType.pay +
    currentIdea.votesByType.dislike
  const votePercentages = {
    use:
      totalVotes > 0
        ? Math.round((currentIdea.votesByType.use / totalVotes) * 100)
        : 0,
    pay:
      totalVotes > 0
        ? Math.round((currentIdea.votesByType.pay / totalVotes) * 100)
        : 0,
    dislike:
      totalVotes > 0
        ? Math.round((currentIdea.votesByType.dislike / totalVotes) * 100)
        : 0,
  }

  const isInteractive = variant === 'interactive'
  const isAdmin = variant === 'admin'
  const upvoted = userVote.use
  const downvoted = userVote.dislike
  const votedPay = userVote.pay

  return (
    <div
      ref={cardRef}
      className={`relative idea-card-responsive ${isAdmin ? 'cursor-pointer group' : ''}`}
      onClick={isAdmin ? handleCardClick : undefined}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        width: '100%',
        maxWidth: '650px',
        height: '430px',
        margin: '0 auto',
      }}
    >
      {isAdmin && onDelete && (
        <button
          onClick={e => {
            e.stopPropagation()
            onDelete()
          }}
          className="absolute top-3 right-3 z-20 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
          title={t('admin.dashboard.delete_idea')}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      {/* Background Layer */}
      <div
        className="absolute idea-card-bg rounded-[12px]"
        style={{
          width: '100%',
          height: '470px',
          left: '0px',
          top: '10px',
        }}
      />

      {/* Cover Image */}
      <div
        className="absolute rounded-[12px] overflow-hidden cursor-pointer"
        style={{
          width: '100%',
          height: '220px',
          left: '0px',
          top: '0px',
        }}
        onMouseEnter={() => {
          console.log(
            'Mouse enter - decision_making:',
            currentIdea.decision_making
          )
          setShowHoverOverlay(true)
        }}
        onMouseLeave={() => {
          console.log('Mouse leave')
          setShowHoverOverlay(false)
        }}
      >
        {validCardMedia.video ? (
          <video
            ref={videoRef}
            src={validCardMedia.video}
            className={`w-full h-full object-cover transition-opacity duration-300 ${showHoverOverlay ? 'opacity-40' : 'opacity-100'}`}
            loop
            muted
            playsInline
            preload="none"
          />
        ) : validCardMedia.image ? (
          <img
            src={validCardMedia.image}
            alt={currentIdea.title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${showHoverOverlay ? 'opacity-40' : 'opacity-100'}`}
            loading="lazy"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 transition-opacity duration-300 ${showHoverOverlay ? 'opacity-40' : 'opacity-100'}`}
          />
        )}

        {/* Hover Overlay with Decision Making Question and Vote Stats */}
        {showHoverOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.85)',
            }}
          >
            {currentIdea.decision_making ? (
              <>
                {/* Decision Making Question */}
                <p
                  className="font-bold absolute text-white"
                  style={{
                    fontSize: '16px',
                    left: '20px',
                    top: '15px',
                    right: '20px',
                    lineHeight: '1.3',
                  }}
                >
                  {currentIdea.decision_making}
                </p>

                {totalVotes > 0 && (
                  <>
                    {/* Vote Distribution Bars */}
                    {/* Like Bar */}
                    <div
                      className="absolute"
                      style={{
                        width: `${Math.max(votePercentages.use * 4.5, 60)}px`,
                        height: '28px',
                        backgroundColor: HOVER_BAR_COLORS.use,
                        left: '20px',
                        top: '80px',
                      }}
                    />

                    {/* Pay Bar */}
                    <div
                      className="absolute"
                      style={{
                        width: `${Math.max(votePercentages.pay * 4.5, 60)}px`,
                        height: '28px',
                        backgroundColor: HOVER_BAR_COLORS.pay,
                        left: '20px',
                        top: '118px',
                      }}
                    />

                    {/* Dislike Bar */}
                    <div
                      className="absolute"
                      style={{
                        width: `${Math.max(votePercentages.dislike * 4.5, 60)}px`,
                        height: '28px',
                        backgroundColor: HOVER_BAR_COLORS.dislike,
                        left: '20px',
                        top: '156px',
                      }}
                    />

                    {/* Vote Percentages Text */}
                    <div
                      className="font-bold absolute text-white"
                      style={{
                        fontSize: '13px',
                        left: '26px',
                        top: '84px',
                        lineHeight: '1.3',
                      }}
                    >
                      <div className="mb-4">{votePercentages.use}% Like</div>
                      <div className="mb-4">
                        {votePercentages.pay}% I'd pay for it
                      </div>
                      <div>{votePercentages.dislike}% Dislike</div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <p
                className="font-bold absolute text-white text-center"
                style={{
                  fontSize: '14px',
                  left: '20px',
                  right: '20px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              >
                No decision making question set
              </p>
            )}
          </motion.div>
        )}
      </div>

      {/* Tags - Right aligned, overlaying image bottom */}
      {!showHoverOverlay && currentIdea.tags.length > 0 && (() => {
        const maxCharsPerTag = 10
        const truncateTag = (tag: string) => tag.length > maxCharsPerTag ? tag.slice(0, maxCharsPerTag) + '...' : tag

        // Get first 3 tags with truncation
        const displayTags = currentIdea.tags.slice(0, 3).map(truncateTag)

        // Check if we need to show +1 indicator
        // If there are 3 tags and the first 2 combined exceed 15 chars, show only 2 tags + "+1"
        let tagsToShow = displayTags
        let showPlusOne = false

        if (currentIdea.tags.length >= 3) {
          const firstTwoLength = displayTags[0].length + displayTags[1].length
          if (firstTwoLength > 15) {
            tagsToShow = displayTags.slice(0, 2)
            showPlusOne = true
          }
        }

        return (
          <div
            className="absolute flex flex-wrap gap-2 justify-end pointer-events-none"
            style={{
              right: '20px',
              top: '175px',
              maxWidth: '320px',
            }}
          >
            {tagsToShow.map((tag, index) => (
              <span
                key={currentIdea.tags[index]}
                className="font-bold px-2.5 py-1 rounded-md"
                style={{
                  fontSize: '13px',
                  backgroundColor: 'rgba(100, 100, 100, 0.8)',
                  color: 'rgba(255, 255, 255, 0.9)',
                }}
              >
                #{tag}
              </span>
            ))}
            {showPlusOne && (
              <span
                className="font-bold px-2.5 py-1 rounded-md"
                style={{
                  fontSize: '13px',
                  backgroundColor: 'rgba(100, 100, 100, 0.8)',
                  color: 'rgba(255, 255, 255, 0.9)',
                }}
              >
                +1
              </span>
            )}
          </div>
        )
      })()}

      {/* Title */}
      <Link
        href={`/${effectiveLocale}/ideas/${currentIdea.id}`}
        onClick={handleClick}
        className="absolute"
        style={{
          left: '16px',
          right: '16px',
          top: '235px',
        }}
      >
        <h2
          className="idea-card-text font-bold line-clamp-3"
          style={{
            fontSize: '18px',
            lineHeight: '1.3',
          }}
        >
          {currentIdea.title}
        </h2>
      </Link>

      {/* Comments with icon - positioned to the right of buttons */}
      <div
        className="absolute flex items-center gap-1.5"
        style={{
          left: '130px',
          top: '344px',
        }}
      >
        <MessageSquare className="w-4 h-4 idea-card-text" />
        <p
          className="idea-card-text font-bold whitespace-nowrap"
          style={{
            fontSize: '14px',
          }}
        >
          {currentIdea.commentCount} {t('common.comments')}
        </p>
      </div>

      {/* Voting Buttons - Only show in interactive mode */}
      {isInteractive && (
        <>
          {/* Like Button - Double-click for "Pay for it" */}
          <motion.button
            onClick={handleLikeClick}
            disabled={isVoting}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`absolute rounded-md transition-all duration-250 flex items-center justify-center ${
              upvoted || votedPay ? 'shadow-lg' : ''
            } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{
              left: '16px',
              top: '332px',
              width: '44px',
              height: '44px',
              backgroundColor: votedPay
                ? BUTTON_COLORS.backgroundPay
                : BUTTON_COLORS.background,
            }}
            title={t('actions.id_pay') || "Double-click: I'd pay for it"}
          >
            <ChevronUp
              className="w-6 h-56"
              strokeWidth={3}
              style={{
                color: votedPay
                  ? BUTTON_COLORS.iconPay
                  : upvoted
                    ? BUTTON_COLORS.iconLike
                    : BUTTON_COLORS.iconDefault,
              }}
            />
          </motion.button>

          {/* Dislike Button */}
          <motion.button
            onClick={handleDislikeClick}
            disabled={isVoting}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`absolute rounded-md transition-all duration-250 flex items-center justify-center ${
              downvoted ? 'shadow-lg' : ''
            } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
            style={{
              left: '72px',
              top: '332px',
              width: '44px',
              height: '44px',
              backgroundColor: BUTTON_COLORS.background,
            }}
          >
            <ChevronDown
              className="w-6 h-56"
              strokeWidth={3}
              style={{
                color: downvoted
                  ? BUTTON_COLORS.iconDislike
                  : BUTTON_COLORS.iconDefault,
              }}
            />
          </motion.button>
        </>
      )}

      {/* Author */}
      <p
        className="idea-card-text-secondary font-bold absolute"
        style={{
          fontSize: '14px',
          left: '16px',
          top: '390px',
        }}
      >
        {currentIdea.anonymous
          ? t('common.anonymous')
          : `${t('common.by')} ${currentIdea.author}`}
      </p>

      {/* Date */}
      <p
        className="idea-card-text-secondary font-bold absolute text-right"
        style={{
          fontSize: '14px',
          right: '16px',
          top: '390px',
        }}
      >
        {formatDate(currentIdea.createdAt)}
      </p>
    </div>
  )
}
