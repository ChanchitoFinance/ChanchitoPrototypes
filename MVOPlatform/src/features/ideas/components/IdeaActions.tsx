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
} from 'lucide-react'

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
      } catch (error) {
        console.error('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className="flex items-center gap-4 md:gap-6 mb-8 pb-8 border-b border-border-color">
      {/* Upvote Button */}
      <motion.button
        onClick={onUpvote}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          upvoted
            ? 'bg-accent text-text-primary'
            : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
        }`}
      >
        <motion.div
          animate={upvoted ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <ArrowUp className="w-5 h-5" />
        </motion.div>
        <span className="font-semibold">{useCount}</span>
        <span className="text-sm hidden md:inline">{t('actions.up')}</span>
      </motion.button>

      {/* Downvote Button */}
      <motion.button
        onClick={onDownvote}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          downvoted
            ? 'bg-red-500 text-white'
            : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
        }`}
        title="Downvote"
      >
        <motion.div
          animate={downvoted ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <ArrowDown className="w-5 h-5" />
        </motion.div>
        <span className="font-semibold">{dislikeCount}</span>
        <span className="text-sm hidden md:inline">{t('actions.down')}</span>
      </motion.button>

      {/* I'd Pay For It Button */}
      <motion.button
        onClick={onLike}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          liked
            ? 'bg-accent-alt text-white'
            : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
        }`}
        title="I'd pay for it"
      >
        <DollarSign className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
        <span className="font-semibold">{likeCount}</span>
        <span className="text-sm hidden md:inline">{t('actions.id_pay')}</span>
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
    </div>
  )
}
