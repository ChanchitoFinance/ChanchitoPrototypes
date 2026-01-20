'use client'

import { Idea } from '@/core/types/idea'
import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { motion } from 'framer-motion'
import {
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Share2,
  DollarSign,
  Pencil,
} from 'lucide-react'
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner'
import { toast } from 'sonner'

interface IdeaActionsProps {
  idea: Idea
  upvoted: boolean
  downvoted: boolean
  liked: boolean
  useCount: number
  dislikeCount: number
  likeCount: number
  commentCount: number
  onUpvote: () => void
  onDownvote: () => void
  onLike: () => void
  onCommentsClick?: () => void
  isVoting?: boolean
  isOwner?: boolean
  onEdit?: () => void
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
  onUpvote,
  onDownvote,
  onLike,
  onCommentsClick,
  isVoting = false,
  isOwner = false,
  onEdit,
}: IdeaActionsProps) {
  const t = useTranslations()

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
      {/* Mobile: Grid layout for better button distribution */}
      <div className="grid grid-cols-2 gap-2 sm:hidden">
        {/* Vote buttons in first row */}
        <motion.button
          onClick={onUpvote}
          whileTap={{ scale: 0.95 }}
          disabled={isVoting}
          className={`flex items-center justify-center gap-2 px-3 py-3 rounded-lg transition-colors ${
            upvoted
              ? 'bg-accent text-text-primary'
              : 'bg-gray-200 text-text-secondary hover:bg-gray-300'
          } ${isVoting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isVoting ? (
            <LoadingSpinner size={18} color="var(--text-secondary)" />
          ) : (
            <motion.div
              animate={upvoted ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <ArrowUp className="w-5 h-5" />
            </motion.div>
          )}
          <span className="font-semibold">{useCount}</span>
        </motion.button>

        <motion.button
          onClick={onDownvote}
          whileTap={{ scale: 0.95 }}
          disabled={isVoting}
          className={`flex items-center justify-center gap-2 px-3 py-3 rounded-lg transition-colors ${
            downvoted
              ? 'bg-red-500 text-white'
              : 'bg-gray-200 text-text-secondary hover:bg-gray-300'
          } ${isVoting ? 'opacity-70 cursor-not-allowed' : ''}`}
          title="Downvote"
        >
          {isVoting ? (
            <LoadingSpinner size={18} color="var(--text-secondary)" />
          ) : (
            <motion.div
              animate={downvoted ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <ArrowDown className="w-5 h-5" />
            </motion.div>
          )}
          <span className="font-semibold">{dislikeCount}</span>
        </motion.button>

        {/* Second row */}
        <motion.button
          onClick={onLike}
          whileTap={{ scale: 0.95 }}
          disabled={isVoting}
          className={`flex items-center justify-center gap-2 px-3 py-3 rounded-lg transition-colors ${
            liked
              ? 'bg-accent-alt text-white'
              : 'bg-gray-200 text-text-secondary hover:bg-gray-300'
          } ${isVoting ? 'opacity-70 cursor-not-allowed' : ''}`}
          title="I'd pay for it"
        >
          {isVoting ? (
            <LoadingSpinner size={18} color="var(--text-secondary)" />
          ) : (
            <DollarSign className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
          )}
          <span className="font-semibold">{likeCount}</span>
        </motion.button>

        <button
          onClick={onCommentsClick}
          className="flex items-center justify-center gap-2 px-3 py-3 rounded-lg bg-gray-100 text-text-secondary hover:bg-gray-200 transition-colors"
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
          </motion.button>
        )}
      </div>

      {/* Desktop: Original horizontal layout */}
      <div className="hidden sm:flex sm:flex-wrap sm:items-center sm:gap-4 md:gap-6">
        {/* Upvote Button */}
        <motion.button
          onClick={onUpvote}
          whileTap={{ scale: 0.95 }}
          disabled={isVoting}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            upvoted
              ? 'bg-accent text-text-primary'
              : 'bg-gray-200 text-text-secondary hover:bg-gray-300'
          } ${isVoting ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isVoting ? (
            <LoadingSpinner size={18} color="var(--text-secondary)" />
          ) : (
            <motion.div
              animate={upvoted ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <ArrowUp className="w-5 h-5" />
            </motion.div>
          )}
          <span className="font-semibold">{useCount}</span>
          <span className="text-sm hidden md:inline">{t('actions.up')}</span>
        </motion.button>

        {/* Downvote Button */}
        <motion.button
          onClick={onDownvote}
          whileTap={{ scale: 0.95 }}
          disabled={isVoting}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            downvoted
              ? 'bg-red-500 text-white'
              : 'bg-gray-200 text-text-secondary hover:bg-gray-300'
          } ${isVoting ? 'opacity-70 cursor-not-allowed' : ''}`}
          title="Downvote"
        >
          {isVoting ? (
            <LoadingSpinner size={18} color="var(--text-secondary)" />
          ) : (
            <motion.div
              animate={downvoted ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <ArrowDown className="w-5 h-5" />
            </motion.div>
          )}
          <span className="font-semibold">{dislikeCount}</span>
          <span className="text-sm hidden md:inline">{t('actions.down')}</span>
        </motion.button>

        {/* I'd Pay For It Button */}
        <motion.button
          onClick={onLike}
          whileTap={{ scale: 0.95 }}
          disabled={isVoting}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            liked
              ? 'bg-accent-alt text-white'
              : 'bg-gray-200 text-text-secondary hover:bg-gray-300'
          } ${isVoting ? 'opacity-70 cursor-not-allowed' : ''}`}
          title="I'd pay for it"
        >
          {isVoting ? (
            <LoadingSpinner size={18} color="var(--text-secondary)" />
          ) : (
            <DollarSign className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
          )}
          <span className="font-semibold">{likeCount}</span>
          <span className="text-sm hidden md:inline">
            {t('actions.id_pay')}
          </span>
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
            <span className="text-sm hidden md:inline">{t('actions.edit')}</span>
          </motion.button>
        )}
      </div>
    </div>
  )
}
