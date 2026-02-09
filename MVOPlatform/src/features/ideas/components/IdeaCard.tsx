'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageSquare,
  ChevronUp,
  ChevronDown,
  Trash2,
  Eye,
  EyeOff,
  FileText,
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
  onConvertToArticle?: (idea: Idea) => void
  router?: any
  locale?: string
}

// Vote colors - updated palette with opacity
const BUTTON_COLORS = {
  background: 'rgba(118, 99, 99, 0.13)',
  backgroundPay: 'rgba(115, 49, 223, 0.13)',
  backgroundLike: 'rgba(111, 80, 145, 0.18)',
  backgroundDislike: 'rgba(173, 96, 52, 0.18)',
  iconDefault: '#686060',
  iconLike: '#6F5091',
  iconDislike: '#AD6034',
  iconPay: '#6619B9',
}

// Colors for hover overlay bars
const HOVER_BAR_COLORS = {
  use: '#C46DE4',
  pay: '#7600A1',
  dislike: '#FF922B',
}

export function IdeaCard({
  idea,
  variant = 'interactive',
  onMouseEnter,
  onMouseLeave,
  initialUserVotes,
  onDelete,
  onConvertToArticle,
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

    const nextVotes = {
      use: next === 'use',
      dislike: next === 'dislike',
      pay: next === 'pay',
    }
    userVoteRef.current = nextVotes
    setUserVote(nextVotes)

    setCurrentIdea(prev => {
      const nextVotesByType = { ...prev.votesByType }

      if (prevSelected) {
        nextVotesByType[prevSelected] = clampNonNegative(
          nextVotesByType[prevSelected] - 1
        )
      }

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

    pendingSelectionRef.current = next
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = setTimeout(() => {
      void flushVoteToServer()
    }, DEBOUNCE_MS)
  }

  const flushVoteToServer = async () => {
    const desired = pendingSelectionRef.current
    const lastSynced = lastSyncedSelectionRef.current
    if (desired === lastSynced) return

    const mySeq = ++requestSeqRef.current

    try {
      let updatedIdea: Idea | null = null

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

      if (mySeq !== requestSeqRef.current) return

      if (updatedIdea) {
        setCurrentIdea(updatedIdea)
        currentIdeaRef.current = updatedIdea
      }

      const updatedUserVotes = await ideaService.getUserVotes(
        currentIdeaRef.current.id
      )
      if (mySeq !== requestSeqRef.current) return

      setUserVote(updatedUserVotes)
      userVoteRef.current = updatedUserVotes

      lastSyncedSelectionRef.current = desired
      stableIdeaRef.current = currentIdeaRef.current
      stableUserVoteRef.current = updatedUserVotes
    } catch (error) {
      if (mySeq !== requestSeqRef.current) return

      console.error('Error voting:', error)
      toast.error(t('actions.error_voting'))

      setCurrentIdea(stableIdeaRef.current)
      currentIdeaRef.current = stableIdeaRef.current

      setUserVote(stableUserVoteRef.current)
      userVoteRef.current = stableUserVoteRef.current

      lastSyncedSelectionRef.current = getSelectedType(stableUserVoteRef.current)
      pendingSelectionRef.current = lastSyncedSelectionRef.current
    }
  }

  // -----------------------------
  // Click animations (smaller, no text)
  // -----------------------------
  const [likePulseKey, setLikePulseKey] = useState(0)
  const [dislikePulseKey, setDislikePulseKey] = useState(0)
  const [payBurstKey, setPayBurstKey] = useState(0)
  const [likeChargeKey, setLikeChargeKey] = useState(0)

  const triggerLikePulse = () => setLikePulseKey(k => k + 1)
  const triggerDislikePulse = () => setDislikePulseKey(k => k + 1)
  const triggerPayBurst = () => setPayBurstKey(k => k + 1)
  const triggerLikeCharge = () => setLikeChargeKey(k => k + 1)

  // Keep refs in sync
  useEffect(() => {
    currentIdeaRef.current = currentIdea
  }, [currentIdea])

  useEffect(() => {
    userVoteRef.current = userVote
  }, [userVote])

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
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

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast.warning(t('auth.sign_in_to_vote'))
      return
    }

    const currentSelected = getSelectedType(userVoteRef.current)

    if (currentSelected === 'pay') {
      applyOptimisticSelection(null)
      triggerLikePulse()
      return
    }

    likeClickCountRef.current += 1

    if (likeClickCountRef.current === 1) {
      const next = currentSelected === 'use' ? null : 'use'
      applyOptimisticSelection(next)
      triggerLikePulse()
      if (next === 'use') triggerLikeCharge()
    }

    if (likeClickTimeoutRef.current) clearTimeout(likeClickTimeoutRef.current)

    likeClickTimeoutRef.current = setTimeout(() => {
      likeClickCountRef.current = 0
    }, 260)

    if (likeClickCountRef.current === 2) {
      likeClickCountRef.current = 0
      if (likeClickTimeoutRef.current) {
        clearTimeout(likeClickTimeoutRef.current)
        likeClickTimeoutRef.current = null
      }
      applyOptimisticSelection('pay')
      triggerPayBurst()
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
    triggerDislikePulse()
  }

  const handleClick = () => {
    if (typeof window !== 'undefined') {
      const scrollContainer = document.querySelector(
        'main > div.overflow-y-auto'
      ) as HTMLElement
      const scrollY = scrollContainer ? scrollContainer.scrollTop : window.scrollY

      sessionStorage.setItem('previousPath', window.location.pathname)
      sessionStorage.setItem('previousScrollPosition', scrollY.toString())
    }
  }

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    if ((e.target as HTMLElement).closest('a')) return

    if (typeof window !== 'undefined') {
      const scrollContainer = document.querySelector(
        'main > div.overflow-y-auto'
      ) as HTMLElement
      const scrollY = scrollContainer ? scrollContainer.scrollTop : window.scrollY

      sessionStorage.setItem('previousPath', window.location.pathname)
      sessionStorage.setItem('previousScrollPosition', scrollY.toString())
    }

    const ideaUrl =
      currentIdea.is_article && currentIdea.slug
        ? `/${effectiveLocale}/articles/${currentIdea.slug}`
        : `/${effectiveLocale}/ideas/${currentIdea.id}`

    if (router && effectiveLocale) router.push(ideaUrl)
    else if (typeof window !== 'undefined') window.location.href = ideaUrl
  }

  const toggleMobileStats = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowMobileStats(!showMobileStats)
  }

  const totalVotes =
    currentIdea.votesByType.use +
    currentIdea.votesByType.pay +
    currentIdea.votesByType.dislike

  const votePercentages = {
    use: totalVotes > 0 ? Math.round((currentIdea.votesByType.use / totalVotes) * 100) : 0,
    pay: totalVotes > 0 ? Math.round((currentIdea.votesByType.pay / totalVotes) * 100) : 0,
    dislike:
      totalVotes > 0 ? Math.round((currentIdea.votesByType.dislike / totalVotes) * 100) : 0,
  }

  const isInteractive = variant === 'interactive'
  const upvoted = userVote.use
  const downvoted = userVote.dislike
  const votedPay = userVote.pay

  return (
    <motion.div
      ref={cardRef}
      className="relative idea-card-responsive cursor-pointer group"
      onClick={handleCardClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      whileHover={
        isMobile
          ? undefined
          : {
              y: -8,
              scale: 1.02,
              boxShadow: '0 10px 28px rgba(160, 123, 207, 0.38)',
              transition: { duration: 0.28, ease: 'easeOut' },
            }
      }
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

      {onConvertToArticle && !currentIdea.is_article && (
        <button
          onClick={e => {
            e.stopPropagation()
            onConvertToArticle(currentIdea)
          }}
          className="absolute top-3 right-12 z-50 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
          title={t('articles.convert_to_article')}
        >
          <FileText className="w-4 h-4" />
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
          zIndex: 1,
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
          zIndex: 2,
        }}
        onMouseEnter={() => {
          if (!isMobile) setShowHoverOverlay(true)
        }}
        onMouseLeave={() => {
          if (!isMobile) setShowHoverOverlay(false)
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
                    <div
                      className="absolute"
                      style={{
                        width: `${
                          votePercentages.use > 0
                            ? Math.min(Math.max(votePercentages.use * 2.5, 60), 260)
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
                            ? Math.min(Math.max(votePercentages.pay * 2.5, 60), 260)
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

      {!showHoverOverlay &&
        !(isMobile && showMobileStats) &&
        currentIdea.tags.length > 0 && (
          <div
            className="absolute flex flex-wrap gap-2 justify-end pointer-events-none"
            style={{
              right: '20px',
              top: '145px',
              maxWidth: '320px',
              zIndex: 3,
            }}
          >
            <TagRenderer tags={currentIdea.tags} />
          </div>
        )}

      <Link
        href={
          currentIdea.is_article && currentIdea.slug
            ? `/${effectiveLocale}/articles/${currentIdea.slug}`
            : `/${effectiveLocale}/ideas/${currentIdea.id}`
        }
        onClick={handleClick}
        className="absolute"
        style={{
          left: '16px',
          right: '16px',
          top: '195px',
          zIndex: 3,
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

      <div
        className="absolute flex items-center gap-1.5"
        style={{
          left: '130px',
          top: '284px',
          zIndex: 3,
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

      {isInteractive && (
        <>
          {/* LIKE BUTTON */}
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
                : upvoted
                  ? BUTTON_COLORS.backgroundLike
                  : BUTTON_COLORS.background,
              position: 'absolute',
              overflow: 'visible',
              zIndex: 3,
            }}
            title={
              upvoted
                ? t('actions.id_pay') || "Double-click: I'd pay for it"
                : t('actions.like') || 'Click: Like'
            }
          >
            <AnimatePresence>
              {!votedPay && likePulseKey > 0 && (
                <motion.span
                  key={`like-pulse-${likePulseKey}`}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{
                    opacity: [0, 0.7, 0],
                    scale: [0.85, 1.12, 1.22],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    inset: '-6px',
                    borderRadius: '9px',
                    border: `2px solid ${BUTTON_COLORS.iconLike}`,
                    boxShadow: `0 0 0 6px rgba(111, 80, 145, 0.10)`,
                    pointerEvents: 'none',
                  }}
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {likeChargeKey > 0 && !votedPay && upvoted && (
                <motion.span
                  key={`like-charge-${likeChargeKey}`}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{
                    opacity: [0, 0.75, 0.0],
                    scale: [0.92, 1.06, 1.0],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.85, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    inset: '-8px',
                    borderRadius: '10px',
                    border: `2px solid ${BUTTON_COLORS.iconPay}`,
                    boxShadow:
                      '0 0 0 10px rgba(102, 25, 185, 0.18), 0 10px 22px rgba(102, 25, 185, 0.18)',
                    pointerEvents: 'none',
                  }}
                />
              )}
            </AnimatePresence>

            <AnimatePresence>
              {payBurstKey > 0 && votedPay && (
                <motion.span
                  key={`pay-burst-${payBurstKey}`}
                  initial={{ opacity: 0, scale: 0.9, y: 3 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.9, 1.25, 1.45],
                    y: [3, -2, -4],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.55, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    inset: '-8px',
                    borderRadius: '10px',
                    border: `2px solid ${BUTTON_COLORS.iconPay}`,
                    boxShadow:
                      '0 0 0 10px rgba(102, 25, 185, 0.22), 0 10px 26px rgba(102, 25, 185, 0.30)',
                    pointerEvents: 'none',
                  }}
                />
              )}
            </AnimatePresence>

            <motion.div
              animate={
                votedPay
                  ? { scale: [1, 1.22, 1.1, 1.16, 1] }
                  : upvoted
                    ? { scale: [1, 1.08, 1] }
                    : { scale: 1 }
              }
              transition={
                votedPay
                  ? { duration: 0.45, ease: 'easeOut' }
                  : upvoted
                    ? { duration: 0.22, ease: 'easeOut' }
                    : { duration: 0.15 }
              }
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
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
                  filter: votedPay
                    ? 'drop-shadow(0 8px 16px rgba(102, 25, 185, 0.38))'
                    : upvoted
                      ? 'drop-shadow(0 6px 12px rgba(111, 80, 145, 0.28))'
                      : 'none',
                }}
              />
            </motion.div>
          </motion.button>

          {/* DISLIKE BUTTON */}
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
              backgroundColor: downvoted
                ? BUTTON_COLORS.backgroundDislike
                : BUTTON_COLORS.background,
              position: 'absolute',
              overflow: 'visible',
              zIndex: 3,
            }}
          >
            <AnimatePresence>
              {dislikePulseKey > 0 && (
                <motion.span
                  key={`dislike-pulse-${dislikePulseKey}`}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{
                    opacity: [0, 0.65, 0],
                    scale: [0.85, 1.1, 1.2],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.32, ease: 'easeOut' }}
                  style={{
                    position: 'absolute',
                    inset: '-6px',
                    borderRadius: '9px',
                    border: `2px solid ${BUTTON_COLORS.iconDislike}`,
                    boxShadow: `0 0 0 6px rgba(173, 96, 52, 0.10)`,
                    pointerEvents: 'none',
                  }}
                />
              )}
            </AnimatePresence>

            <motion.div
              animate={downvoted ? { scale: [1, 1.08, 1] } : { scale: 1 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ChevronDown
                className="w-6 h-56"
                strokeWidth={3}
                style={{
                  color: downvoted
                    ? BUTTON_COLORS.iconDislike
                    : BUTTON_COLORS.iconDefault,
                  filter: downvoted
                    ? 'drop-shadow(0 6px 12px rgba(173, 96, 52, 0.28))'
                    : 'none',
                }}
              />
            </motion.div>
          </motion.button>
        </>
      )}

      <p
        className="idea-card-text-secondary font-bold absolute"
        style={{
          fontSize: '13px',
          left: '16px',
          top: '330px',
          zIndex: 3,
        }}
      >
        {currentIdea.anonymous
          ? t('common.anonymous')
          : `${t('common.by')} ${currentIdea.author}`}
      </p>

      <p
        className="idea-card-text-secondary font-bold absolute text-right"
        style={{
          fontSize: '13px',
          right: '16px',
          top: '330px',
          zIndex: 3,
        }}
      >
        {formatDate(currentIdea.createdAt)}
      </p>
    </motion.div>
  )
}
