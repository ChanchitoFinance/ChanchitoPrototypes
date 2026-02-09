'use client'

import { useState, useRef, useEffect } from 'react'
import { Idea } from '@/core/types/idea'
import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronUp,
  ChevronDown,
  MessageSquare,
  Share2,
  Pencil,
  GitBranch,
} from 'lucide-react'
import { toast } from 'sonner'

type VoteType = 'use' | 'dislike' | 'pay'

// Same as IdeaCard for consistency
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

const DEBOUNCE_MS = 450
const DOUBLE_CLICK_MS = 260

interface IdeaActionsProps {
  idea: Idea
  upvoted: boolean
  downvoted: boolean
  liked: boolean
  useCount: number
  dislikeCount: number
  likeCount: number
  commentCount: number
  onVoteTarget: (target: VoteType | null) => void | Promise<void>
  onCommentsClick?: () => void
  isAuthenticated?: boolean
  isVoting?: boolean
  isOwner?: boolean
  onEdit?: () => void
  versionNumber?: number
  showVersionBadge?: boolean
}

function getSelectedType(v: {
  use: boolean
  dislike: boolean
  pay: boolean
}): VoteType | null {
  if (v.pay) return 'pay'
  if (v.use) return 'use'
  if (v.dislike) return 'dislike'
  return null
}

export function IdeaActions({
  idea,
  upvoted,
  downvoted,
  liked,
  useCount,
  dislikeCount,
  likeCount,
  commentCount,
  onVoteTarget,
  onCommentsClick,
  isAuthenticated = true,
  isVoting = false,
  isOwner = false,
  onEdit,
  versionNumber,
  showVersionBadge = false,
}: IdeaActionsProps) {
  const t = useTranslations()
  const [displayVote, setDisplayVote] = useState({
    use: upvoted,
    dislike: downvoted,
    pay: liked,
  })
  const [likePulseKey, setLikePulseKey] = useState(0)
  const [dislikePulseKey, setDislikePulseKey] = useState(0)
  const [payBurstKey, setPayBurstKey] = useState(0)

  const likeClickCountRef = useRef(0)
  const likeClickTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingVoteRef = useRef<VoteType | null>(getSelectedType(displayVote))
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSyncedRef = useRef<VoteType | null>(getSelectedType(displayVote))
  const isPendingRef = useRef(false)

  // Sync display from props when Redux updates (and we're not in a pending flush)
  useEffect(() => {
    if (!isPendingRef.current) {
      const next = { use: upvoted, dislike: downvoted, pay: liked }
      setDisplayVote(next)
      const sel = getSelectedType(next)
      lastSyncedRef.current = sel
      pendingVoteRef.current = sel
    }
  }, [upvoted, downvoted, liked])

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
      if (likeClickTimeoutRef.current) clearTimeout(likeClickTimeoutRef.current)
    }
  }, [])

  const flushVote = () => {
    const pending = pendingVoteRef.current
    const lastSynced = lastSyncedRef.current
    if (pending === lastSynced) {
      isPendingRef.current = false
      return
    }
    isPendingRef.current = false
    void Promise.resolve(onVoteTarget(pending)).catch(() => {})
    lastSyncedRef.current = pending
  }

  const applyOptimistic = (target: VoteType | null) => {
    const next = {
      use: target === 'use',
      dislike: target === 'dislike',
      pay: target === 'pay',
    }
    setDisplayVote(next)
    pendingVoteRef.current = target
    isPendingRef.current = true
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = setTimeout(flushVote, DEBOUNCE_MS)
  }

  const triggerLikePulse = () => setLikePulseKey(k => k + 1)
  const triggerDislikePulse = () => setDislikePulseKey(k => k + 1)
  const triggerPayBurst = () => setPayBurstKey(k => k + 1)

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!idea) return
    if (!isAuthenticated) {
      toast.warning(t('auth.sign_in_to_vote'))
      return
    }
    const current = getSelectedType(displayVote)
    if (current === 'pay') {
      applyOptimistic(null)
      triggerLikePulse()
      return
    }
    likeClickCountRef.current += 1
    if (likeClickCountRef.current === 1) {
      const next = current === 'use' ? null : 'use'
      applyOptimistic(next)
      triggerLikePulse()
    }
    if (likeClickTimeoutRef.current) clearTimeout(likeClickTimeoutRef.current)
    likeClickTimeoutRef.current = setTimeout(() => {
      likeClickCountRef.current = 0
    }, DOUBLE_CLICK_MS)
    if (likeClickCountRef.current === 2) {
      likeClickCountRef.current = 0
      if (likeClickTimeoutRef.current) {
        clearTimeout(likeClickTimeoutRef.current)
        likeClickTimeoutRef.current = null
      }
      applyOptimistic('pay')
      triggerPayBurst()
    }
  }

  const handleDislikeClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!idea) return
    if (!isAuthenticated) {
      toast.warning(t('auth.sign_in_to_vote'))
      return
    }
    const current = getSelectedType(displayVote)
    const next = current === 'dislike' ? null : 'dislike'
    applyOptimistic(next)
    triggerDislikePulse()
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: idea.title,
          text: idea.description,
          url: window.location.href,
        })
        // Show success feedback
        toast.success(t('actions.share_success'))
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Error sharing:', error)
          // Fallback to clipboard
          navigator.clipboard.writeText(window.location.href)
          toast.success(t('actions.link_copied'))
        }
        // If user canceled, don't show any message
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      toast.success(t('actions.link_copied'))
    }
  }

  return (
    <div className="mb-8 pb-8 border-b border-border-color">
      {/* Mobile: Like (single = use, double = pay) + Dislike, same as IdeaCard */}
      <div className="grid grid-cols-2 gap-2 sm:hidden">
        <motion.button
          onClick={handleLikeClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative flex items-center justify-center gap-2 rounded-md transition-all min-w-[44px] h-11 overflow-visible ${
            displayVote.use || displayVote.pay ? 'shadow-lg' : ''
          }`}
          style={{
            backgroundColor: displayVote.pay
              ? BUTTON_COLORS.backgroundPay
              : displayVote.use
                ? BUTTON_COLORS.backgroundLike
                : BUTTON_COLORS.background,
          }}
          title={displayVote.use ? t('actions.id_pay') : t('actions.like')}
        >
          <AnimatePresence>
            {!displayVote.pay && likePulseKey > 0 && (
              <motion.span
                key={`like-pulse-${likePulseKey}`}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: [0, 0.7, 0], scale: [0.85, 1.12, 1.22] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="absolute inset-[-6px] rounded-[9px] border-2 pointer-events-none"
                style={{
                  borderColor: BUTTON_COLORS.iconLike,
                  boxShadow: '0 0 0 6px rgba(111, 80, 145, 0.10)',
                }}
              />
            )}
          </AnimatePresence>
          <AnimatePresence>
            {payBurstKey > 0 && displayVote.pay && (
              <motion.span
                key={`pay-burst-${payBurstKey}`}
                initial={{ opacity: 0, scale: 0.9, y: 3 }}
                animate={{ opacity: [0, 1, 0], scale: [0.9, 1.25, 1.45], y: [3, -2, -4] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                className="absolute inset-[-8px] rounded-[10px] border-2 pointer-events-none"
                style={{
                  borderColor: BUTTON_COLORS.iconPay,
                  boxShadow: '0 0 0 10px rgba(102, 25, 185, 0.22), 0 10px 26px rgba(102, 25, 185, 0.30)',
                }}
              />
            )}
          </AnimatePresence>
          <motion.div
            animate={
              displayVote.pay
                ? { scale: [1, 1.22, 1.1, 1.16, 1] }
                : displayVote.use
                  ? { scale: [1, 1.08, 1] }
                  : { scale: 1 }
            }
            transition={
              displayVote.pay
                ? { duration: 0.45, ease: 'easeOut' }
                : displayVote.use
                  ? { duration: 0.22, ease: 'easeOut' }
                  : { duration: 0.15 }
            }
            className="flex items-center justify-center"
          >
            <ChevronUp
              className="w-5 h-5 flex-shrink-0"
              strokeWidth={3}
              style={{
                color: displayVote.pay
                  ? BUTTON_COLORS.iconPay
                  : displayVote.use
                    ? BUTTON_COLORS.iconLike
                    : BUTTON_COLORS.iconDefault,
                filter: displayVote.pay
                  ? 'drop-shadow(0 8px 16px rgba(102, 25, 185, 0.38))'
                  : displayVote.use
                    ? 'drop-shadow(0 6px 12px rgba(111, 80, 145, 0.28))'
                    : 'none',
              }}
            />
          </motion.div>
        </motion.button>

        <motion.button
          onClick={handleDislikeClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative flex items-center justify-center gap-2 rounded-md transition-all min-w-[44px] h-11 overflow-visible ${
            displayVote.dislike ? 'shadow-lg' : ''
          }`}
          style={{
            backgroundColor: displayVote.dislike
              ? BUTTON_COLORS.backgroundDislike
              : BUTTON_COLORS.background,
          }}
          title={t('actions.down')}
        >
          <AnimatePresence>
            {dislikePulseKey > 0 && (
              <motion.span
                key={`dislike-pulse-${dislikePulseKey}`}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: [0, 0.65, 0], scale: [0.85, 1.1, 1.2] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.32, ease: 'easeOut' }}
                className="absolute inset-[-6px] rounded-[9px] border-2 pointer-events-none"
                style={{
                  borderColor: BUTTON_COLORS.iconDislike,
                  boxShadow: '0 0 0 6px rgba(173, 96, 52, 0.10)',
                }}
              />
            )}
          </AnimatePresence>
          <motion.div
            animate={displayVote.dislike ? { scale: [1, 1.08, 1] } : { scale: 1 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex items-center justify-center"
          >
            <ChevronDown
              className="w-5 h-5 flex-shrink-0"
              strokeWidth={3}
              style={{
                color: displayVote.dislike ? BUTTON_COLORS.iconDislike : BUTTON_COLORS.iconDefault,
                filter: displayVote.dislike ? 'drop-shadow(0 6px 12px rgba(173, 96, 52, 0.28))' : 'none',
              }}
            />
          </motion.div>
        </motion.button>

        <button
          onClick={onCommentsClick}
          className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg bg-gray-100 text-text-secondary hover:bg-gray-200 transition-colors col-span-2"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="font-semibold">{commentCount}</span>
        </button>
      </div>

      {/* Share and Edit buttons on mobile - separate row */}
      <div className="mt-2 sm:hidden flex gap-2">
        <motion.button
          onClick={handleShare}
          whileTap={{ scale: 0.95 }}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gray-100 text-text-secondary hover:bg-gray-200 transition-colors"
        >
          <Share2 className="w-5 h-5" />
          <span className="font-medium">{t('actions.share')}</span>
        </motion.button>
        {isOwner && onEdit && (
          <motion.button
            onClick={onEdit}
            whileTap={{ scale: 0.95 }}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
          >
            <Pencil className="w-5 h-5" />
            <span className="font-medium">{t('actions.edit')}</span>
            {showVersionBadge && versionNumber && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                <GitBranch className="w-3 h-3" />v{versionNumber}
              </span>
            )}
          </motion.button>
        )}
      </div>

      {/* Desktop: Like (single = use, double = pay) + Dislike, same as IdeaCard */}
      <div className="hidden sm:flex sm:flex-wrap sm:items-center sm:gap-4 md:gap-6">
        <motion.button
          onClick={handleLikeClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative flex items-center justify-center gap-2 rounded-md transition-all min-w-[44px] h-11 px-3 overflow-visible ${
            displayVote.use || displayVote.pay ? 'shadow-lg' : ''
          }`}
          style={{
            backgroundColor: displayVote.pay
              ? BUTTON_COLORS.backgroundPay
              : displayVote.use
                ? BUTTON_COLORS.backgroundLike
                : BUTTON_COLORS.background,
          }}
          title={displayVote.use ? t('actions.id_pay') : t('actions.like')}
        >
          <AnimatePresence>
            {!displayVote.pay && likePulseKey > 0 && (
              <motion.span
                key={`like-pulse-d-${likePulseKey}`}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: [0, 0.7, 0], scale: [0.85, 1.12, 1.22] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="absolute inset-[-6px] rounded-[9px] border-2 pointer-events-none"
                style={{
                  borderColor: BUTTON_COLORS.iconLike,
                  boxShadow: '0 0 0 6px rgba(111, 80, 145, 0.10)',
                }}
              />
            )}
          </AnimatePresence>
          <AnimatePresence>
            {payBurstKey > 0 && displayVote.pay && (
              <motion.span
                key={`pay-burst-d-${payBurstKey}`}
                initial={{ opacity: 0, scale: 0.9, y: 3 }}
                animate={{ opacity: [0, 1, 0], scale: [0.9, 1.25, 1.45], y: [3, -2, -4] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: 'easeOut' }}
                className="absolute inset-[-8px] rounded-[10px] border-2 pointer-events-none"
                style={{
                  borderColor: BUTTON_COLORS.iconPay,
                  boxShadow: '0 0 0 10px rgba(102, 25, 185, 0.22), 0 10px 26px rgba(102, 25, 185, 0.30)',
                }}
              />
            )}
          </AnimatePresence>
          <motion.div
            animate={
              displayVote.pay
                ? { scale: [1, 1.22, 1.1, 1.16, 1] }
                : displayVote.use
                  ? { scale: [1, 1.08, 1] }
                  : { scale: 1 }
            }
            transition={
              displayVote.pay
                ? { duration: 0.45, ease: 'easeOut' }
                : displayVote.use
                  ? { duration: 0.22, ease: 'easeOut' }
                  : { duration: 0.15 }
            }
            className="flex items-center justify-center"
          >
            <ChevronUp
              className="w-5 h-5 flex-shrink-0"
              strokeWidth={3}
              style={{
                color: displayVote.pay
                  ? BUTTON_COLORS.iconPay
                  : displayVote.use
                    ? BUTTON_COLORS.iconLike
                    : BUTTON_COLORS.iconDefault,
                filter: displayVote.pay
                  ? 'drop-shadow(0 8px 16px rgba(102, 25, 185, 0.38))'
                  : displayVote.use
                    ? 'drop-shadow(0 6px 12px rgba(111, 80, 145, 0.28))'
                    : 'none',
              }}
            />
          </motion.div>
          <span className="text-sm hidden md:inline">{t('actions.up')}</span>
        </motion.button>

        <motion.button
          onClick={handleDislikeClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative flex items-center justify-center gap-2 rounded-md transition-all min-w-[44px] h-11 px-3 overflow-visible ${
            displayVote.dislike ? 'shadow-lg' : ''
          }`}
          style={{
            backgroundColor: displayVote.dislike
              ? BUTTON_COLORS.backgroundDislike
              : BUTTON_COLORS.background,
          }}
          title={t('actions.down')}
        >
          <AnimatePresence>
            {dislikePulseKey > 0 && (
              <motion.span
                key={`dislike-pulse-d-${dislikePulseKey}`}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: [0, 0.65, 0], scale: [0.85, 1.1, 1.2] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.32, ease: 'easeOut' }}
                className="absolute inset-[-6px] rounded-[9px] border-2 pointer-events-none"
                style={{
                  borderColor: BUTTON_COLORS.iconDislike,
                  boxShadow: '0 0 0 6px rgba(173, 96, 52, 0.10)',
                }}
              />
            )}
          </AnimatePresence>
          <motion.div
            animate={displayVote.dislike ? { scale: [1, 1.08, 1] } : { scale: 1 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex items-center justify-center"
          >
            <ChevronDown
              className="w-5 h-5 flex-shrink-0"
              strokeWidth={3}
              style={{
                color: displayVote.dislike ? BUTTON_COLORS.iconDislike : BUTTON_COLORS.iconDefault,
                filter: displayVote.dislike ? 'drop-shadow(0 6px 12px rgba(173, 96, 52, 0.28))' : 'none',
              }}
            />
          </motion.div>
          <span className="text-sm hidden md:inline">{t('actions.down')}</span>
        </motion.button>

        {/* Comments Button */}
        <button
          onClick={onCommentsClick}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-text-secondary hover:bg-gray-200 transition-colors"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="font-semibold">{commentCount}</span>
          <span className="text-sm hidden md:inline">
            {t('actions.comments')}
          </span>
        </button>

        {/* Share Button */}
        <motion.button
          onClick={handleShare}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-text-secondary hover:bg-gray-200 transition-colors ml-auto"
        >
          <Share2 className="w-5 h-5" />
          <span className="text-sm hidden md:inline">{t('actions.share')}</span>
        </motion.button>

        {/* Edit Button - Only shown to owner */}
        {isOwner && onEdit && (
          <motion.button
            onClick={onEdit}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 text-accent hover:bg-accent/20 transition-colors"
          >
            <Pencil className="w-5 h-5" />
            <span className="text-sm hidden md:inline">
              {t('actions.edit')}
            </span>
            {showVersionBadge && versionNumber && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                <GitBranch className="w-3 h-3" />v{versionNumber}
              </span>
            )}
          </motion.button>
        )}
      </div>
    </div>
  )
}
