'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  MessageSquare,
  ChevronUp,
  ChevronDown,
  Trash2,
  Eye,
  EyeOff,
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
import { toast } from 'sonner'
import { TagRenderer } from '@/shared/components/ui/TagRenderer'

type IdeaCardVariant = 'interactive' | 'metrics' | 'admin'
type VoteType = 'use' | 'dislike' | 'pay'

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
  const [showHoverOverlay, setShowHoverOverlay] = useState(false)
  const [showMobileStats, setShowMobileStats] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
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

  // -----------------------------
  // Debounced "YouTube-like" voting (no button blocking)
  // -----------------------------
  const DEBOUNCE_MS = 450

  const currentIdeaRef = useRef(currentIdea)
  const userVoteRef = useRef(userVote)

  const stableIdeaRef = useRef(currentIdea)
  const stableUserVoteRef = useRef(userVote)

  const lastSyncedSelectionRef = useRef<VoteType | null>(null)
  const pendingSelectionRef = useRef<VoteType | null>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const requestSeqRef = useRef(0)

  const getSelectedType = (votes: {
    use: boolean
    dislike: boolean
    pay: boolean
  }): VoteType | null => {
    if (votes.pay) return 'pay'
    if (votes.use) return 'use'
    if (votes.dislike) return 'dislike'
    return null
  }

  const clampNonNegative = (n: number) => Math.max(0, n)

  const applyOptimisticSelection = (next: VoteType | null) => {
    const prevVotes = userVoteRef.current
    const prevSelected = getSelectedType(prevVotes)

    // Update userVote immediately (no blocking)
    const nextVotes = {
      use: next === 'use',
      dislike: next === 'dislike',
      pay: next === 'pay',
    }
    userVoteRef.current = nextVotes
    setUserVote(nextVotes)

    // Update counts immediately and consistently
    setCurrentIdea(prev => {
      const nextVotesByType = { ...prev.votesByType }

      // Remove previous selection if any
      if (prevSelected) {
        nextVotesByType[prevSelected] = clampNonNegative(
          nextVotesByType[prevSelected] - 1
        )
      }

      // Add new selection if any
      if (next) {
        nextVotesByType[next] = (nextVotesByType[next] || 0) + 1
      }

      const nextTotal =
        (nextVotesByType.use || 0) +
        (nextVotesByType.pay || 0) +
        (nextVotesByType.dislike || 0)

      const updated = {
        ...prev,
        votesByType: nextVotesByType,
        votes: nextTotal,
      }

      currentIdeaRef.current = updated
      return updated
    })

    // Queue the last intent and debounce the network sync
    pendingSelectionRef.current = next
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = setTimeout(() => {
      void flushVoteToServer()
    }, DEBOUNCE_MS)
  }

  const flushVoteToServer = async () => {
    const desired = pendingSelectionRef.current
    const lastSynced = lastSyncedSelectionRef.current

    // Nothing to do
    if (desired === lastSynced) return

    const mySeq = ++requestSeqRef.current

    try {
      let updatedIdea: Idea | null = null

      // With toggleVote API, make the server end state match the desired state.
      // - If had previous and want none => toggle previous off
      // - If had none and want one => toggle desired on
      // - If switching => toggle previous off, then desired on
      if (lastSynced && !desired) {
        updatedIdea = await ideaService.toggleVote(
          currentIdeaRef.current.id,
          lastSynced,
          currentIdeaRef.current
        )
      } else if (!lastSynced && desired) {
        updatedIdea = await ideaService.toggleVote(
          currentIdeaRef.current.id,
          desired,
          currentIdeaRef.current
        )
      } else if (lastSynced && desired && lastSynced !== desired) {
        updatedIdea = await ideaService.toggleVote(
          currentIdeaRef.current.id,
          lastSynced,
          currentIdeaRef.current
        )
        updatedIdea = await ideaService.toggleVote(
          currentIdeaRef.current.id,
          desired,
          updatedIdea
        )
      }

      // Ignore stale in-flight results
      if (mySeq !== requestSeqRef.current) return

      if (updatedIdea) {
        setCurrentIdea(updatedIdea)
        currentIdeaRef.current = updatedIdea
      }

      // Reconcile user votes (guarded)
      const updatedUserVotes = await ideaService.getUserVotes(
        currentIdeaRef.current.id
      )
      if (mySeq !== requestSeqRef.current) return

      setUserVote(updatedUserVotes)
      userVoteRef.current = updatedUserVotes

      // Mark as stable/synced
      lastSyncedSelectionRef.current = desired
      stableIdeaRef.current = currentIdeaRef.current
      stableUserVoteRef.current = updatedUserVotes
    } catch (error) {
      if (mySeq !== requestSeqRef.current) return

      console.error('Error voting:', error)
      toast.error(t('actions.error_voting'))

      // Revert to last known stable state
      setCurrentIdea(stableIdeaRef.current)
      currentIdeaRef.current = stableIdeaRef.current

      setUserVote(stableUserVoteRef.current)
      userVoteRef.current = stableUserVoteRef.current

      lastSyncedSelectionRef.current = getSelectedType(stableUserVoteRef.current)
      pendingSelectionRef.current = lastSyncedSelectionRef.current
    }
  }

  // Keep refs in sync with state
  useEffect(() => {
    currentIdeaRef.current = currentIdea
  }, [currentIdea])

  useEffect(() => {
    userVoteRef.current = userVote
  }, [userVote])

  // Detect if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    setCurrentIdea(idea)
    currentIdeaRef.current = idea
    stableIdeaRef.current = idea
  }, [idea])

  useEffect(() => {
    if (initialUserVotes) {
      setUserVote(initialUserVotes)
      userVoteRef.current = initialUserVotes
      stableUserVoteRef.current = initialUserVotes
      lastSyncedSelectionRef.current = getSelectedType(initialUserVotes)
      pendingSelectionRef.current = getSelectedType(initialUserVotes)
    } else {
      const reset = { use: false, dislike: false, pay: false }
      setUserVote(reset)
      userVoteRef.current = reset
      stableUserVoteRef.current = reset
      lastSyncedSelectionRef.current = null
      pendingSelectionRef.current = null
    }
  }, [initialUserVotes])

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
      if (likeClickTimeoutRef.current) clearTimeout(likeClickTimeoutRef.current)
    }
  }, [])

  const videoRef = useVideoPlayer({
    videoSrc: validCardMedia.video,
    containerRef: cardRef,
    startTime: 10,
  })

  // Like button: immediate optimistic "use", quick double-click overrides to "pay"
  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast.warning(t('auth.sign_in_to_vote'))
      return
    }

    const currentSelected = getSelectedType(userVoteRef.current)

    // If already in pay state, single click should unvote (not switch to like)
    if (currentSelected === 'pay') {
      applyOptimisticSelection(null)
      return
    }

    likeClickCountRef.current += 1

    // First click: toggle Like immediately (no waiting)
    if (likeClickCountRef.current === 1) {
      const next = currentSelected === 'use' ? null : 'use'
      applyOptimisticSelection(next)
    }

    if (likeClickTimeoutRef.current) clearTimeout(likeClickTimeoutRef.current)

    // Short window to detect double click (fast YouTube-like)
    likeClickTimeoutRef.current = setTimeout(() => {
      likeClickCountRef.current = 0
    }, 260)

    // Second click within window: override to Pay
    if (likeClickCountRef.current === 2) {
      likeClickCountRef.current = 0
      if (likeClickTimeoutRef.current) {
        clearTimeout(likeClickTimeoutRef.current)
        likeClickTimeoutRef.current = null
      }
      applyOptimisticSelection('pay')
    }
  }

  const handleDislikeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast.warning(t('auth.sign_in_to_vote'))
      return
    }

    const currentSelected = getSelectedType(userVoteRef.current)
    const next = currentSelected === 'dislike' ? null : 'dislike'
    applyOptimisticSelection(next)
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
    // Don't navigate if clicking on a button
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    // Don't navigate if clicking on the title link
    if ((e.target as HTMLElement).closest('a')) {
      return
    }
    // Navigate to idea details
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
    if (router && effectiveLocale) {
      router.push(`/${effectiveLocale}/ideas/${currentIdea.id}`)
    } else if (typeof window !== 'undefined') {
      window.location.href = `/${effectiveLocale}/ideas/${currentIdea.id}`
    }
  }

  const toggleMobileStats = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMobileStats(!showMobileStats)
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
    <motion.div
      ref={cardRef}
      className={`relative idea-card-responsive cursor-pointer group`}
      onClick={handleCardClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      whileHover={{
        scale: 1.02,
        y: -8,
        boxShadow: '0 8px 24px rgba(160, 123, 207, 0.3)',
        transition: { duration: 0.3, ease: 'easeOut' },
      }}
      initial={{
        scale: 1,
        y: 0,
      }}
      style={{
        width: '100%',
        maxWidth: '100%',
        height: '280px',
        margin: '0 auto',
      }}
    >
      {onDelete && (
        <button
          onClick={e => {
            e.stopPropagation()
            onDelete()
          }}
          className="absolute top-3 right-3 z-50 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
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
          height: '400px',
          left: '0px',
          top: '10px',
        }}
      />

      {/* Cover Image */}
      <div
        className="absolute rounded-[12px] overflow-hidden cursor-pointer"
        style={{
          width: '100%',
          height: '180px',
          left: '0px',
          top: '0px',
        }}
        onMouseEnter={() => {
          if (!isMobile) {
            setShowHoverOverlay(true)
          }
        }}
        onMouseLeave={() => {
          if (!isMobile) {
            setShowHoverOverlay(false)
          }
        }}
        onTouchStart={e => {
          if (isMobile && !(e.target as HTMLElement).closest('button')) {
            e.stopPropagation()
          }
        }}
      >
        {validCardMedia.video ? (
          <video
            ref={videoRef}
            src={validCardMedia.video}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              showHoverOverlay || (isMobile && showMobileStats)
                ? 'opacity-40'
                : 'opacity-100'
            }`}
            loop
            muted
            playsInline
            preload="none"
          />
        ) : validCardMedia.image ? (
          <img
            src={validCardMedia.image}
            alt={currentIdea.title}
            className={`w-full h-full object-cover transition-opacity duration-300 ${
              showHoverOverlay || (isMobile && showMobileStats)
                ? 'opacity-40'
                : 'opacity-100'
            }`}
            loading="lazy"
          />
        ) : (
          <div
            className={`w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 transition-opacity duration-300 ${
              showHoverOverlay || (isMobile && showMobileStats)
                ? 'opacity-40'
                : 'opacity-100'
            }`}
          />
        )}

        {/* Mobile Stats Toggle Button */}
        {isMobile && currentIdea.decision_making && (
          <button
            onClick={toggleMobileStats}
            className="absolute z-30 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-1.5 rounded-md transition-all duration-200 shadow-sm"
            style={{
              right: '8px',
              top: '8px',
            }}
            title={
              showMobileStats
                ? t('actions.hide_stats')
                : t('actions.show_stats')
            }
          >
            {showMobileStats ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}

        {/* Hover Overlay with Decision Making Question and Vote Stats */}
        {(showHoverOverlay || (isMobile && showMobileStats)) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-20"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.55)',
              backdropFilter: 'blur(2px)',
              pointerEvents: 'auto',
            }}
            onClick={e => {
              if (!(e.target as HTMLElement).closest('button')) {
                handleCardClick(e)
              }
            }}
          >
            {currentIdea.decision_making ? (
              <>
                {/* Decision Making Question - Clickable */}
                <p
                  className="font-bold absolute text-white line-clamp-2 cursor-pointer hover:underline"
                  style={{
                    fontSize: '16px',
                    left: '20px',
                    top: '15px',
                    right: '20px',
                    lineHeight: '1.3',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                  onClick={e => {
                    e.stopPropagation()
                    handleCardClick(e)
                  }}
                >
                  {currentIdea.decision_making}
                </p>

                {totalVotes > 0 && (
                  <>
                    {/* Vote Distribution Bars */}
                    <div
                      className="absolute"
                      style={{
                        width: `${
                          votePercentages.use > 0
                            ? Math.min(
                                Math.max(votePercentages.use * 2.5, 60),
                                260
                              )
                            : 4
                        }px`,
                        height: '28px',
                        backgroundColor: HOVER_BAR_COLORS.use,
                        left: '20px',
                        top: '65px',
                      }}
                    />

                    <div
                      className="absolute"
                      style={{
                        width: `${
                          votePercentages.pay > 0
                            ? Math.min(
                                Math.max(votePercentages.pay * 2.5, 60),
                                260
                              )
                            : 4
                        }px`,
                        height: '28px',
                        backgroundColor: HOVER_BAR_COLORS.pay,
                        left: '20px',
                        top: '103px',
                      }}
                    />

                    <div
                      className="absolute"
                      style={{
                        width: `${
                          votePercentages.dislike > 0
                            ? Math.min(
                                Math.max(votePercentages.dislike * 2.5, 60),
                                260
                              )
                            : 4
                        }px`,
                        height: '28px',
                        backgroundColor: HOVER_BAR_COLORS.dislike,
                        left: '20px',
                        top: '141px',
                      }}
                    />

                    {/* Vote Percentages Text */}
                    <div
                      className="font-bold absolute text-white flex items-center"
                      style={{
                        fontSize: '13px',
                        left: '26px',
                        top: '65px',
                        height: '28px',
                      }}
                    >
                      {votePercentages.use}% Like
                    </div>

                    <div
                      className="font-bold absolute text-white flex items-center"
                      style={{
                        fontSize: '13px',
                        left: '26px',
                        top: '103px',
                        height: '28px',
                      }}
                    >
                      {votePercentages.pay}% I'd pay for it
                    </div>

                    <div
                      className="font-bold absolute text-white flex items-center"
                      style={{
                        fontSize: '13px',
                        left: '26px',
                        top: '141px',
                        height: '28px',
                      }}
                    >
                      {votePercentages.dislike}% Dislike
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
      {!showHoverOverlay &&
        !(isMobile && showMobileStats) &&
        currentIdea.tags.length > 0 && (
          <div
            className="absolute flex flex-wrap gap-2 justify-end pointer-events-none"
            style={{
              right: '20px',
              top: '145px',
              maxWidth: '320px',
            }}
          >
            <TagRenderer tags={currentIdea.tags} />
          </div>
        )}

      {/* Title */}
      <Link
        href={`/${effectiveLocale}/ideas/${currentIdea.id}`}
        onClick={handleClick}
        className="absolute"
        style={{
          left: '16px',
          right: '16px',
          top: '195px',
        }}
      >
        <h2
          className="idea-card-text font-bold line-clamp-3"
          style={{
            fontSize: '16px',
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
          top: '284px',
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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`absolute rounded-md transition-all duration-250 flex items-center justify-center ${
              upvoted || votedPay ? 'shadow-lg' : ''
            }`}
            style={{
              left: '16px',
              top: '272px',
              width: '44px',
              height: '44px',
              backgroundColor: votedPay
                ? BUTTON_COLORS.backgroundPay
                : BUTTON_COLORS.background,
            }}
            title={
              upvoted
                ? t('actions.id_pay') || "Double-click: I'd pay for it"
                : t('actions.like') || 'Click: Like'
            }
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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`absolute rounded-md transition-all duration-250 flex items-center justify-center ${
              downvoted ? 'shadow-lg' : ''
            }`}
            style={{
              left: '72px',
              top: '272px',
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
          fontSize: '13px',
          left: '16px',
          top: '330px',
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
          fontSize: '13px',
          right: '16px',
          top: '330px',
        }}
      >
        {formatDate(currentIdea.createdAt)}
      </p>
    </motion.div>
  )
}
