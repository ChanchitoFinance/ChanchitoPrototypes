'use client'

import { motion } from 'framer-motion'
import {
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Share2,
  DollarSign,
} from 'lucide-react'
import { Idea } from '@/lib/types/idea'
import { useAppSelector } from '@/lib/hooks'

interface IdeaActionsProps {
  idea: Idea
  votedUp: boolean
  votedDown: boolean
  liked: boolean
  useCount: number
  dislikeCount: number
  likeCount: number
  commentCount: number
  onVoteUp: () => void
  onVoteDown: () => void
  onLike: () => void
  onCommentsClick?: () => void
}

export function IdeaActions({
  idea,
  votedUp,
  votedDown,
  liked,
  useCount,
  dislikeCount,
  likeCount,
  commentCount,
  onVoteUp,
  onVoteDown,
  onLike,
  onCommentsClick,
}: IdeaActionsProps) {
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
        onClick={onVoteUp}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          votedUp
            ? 'bg-accent text-text-primary'
            : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
        }`}
      >
        <motion.div
          animate={votedUp ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <ArrowUp className="w-5 h-5" />
        </motion.div>
        <span className="font-semibold">{useCount}</span>
        <span className="text-sm hidden md:inline">Up</span>
      </motion.button>

      {/* Downvote Button */}
      <motion.button
        onClick={onVoteDown}
        whileTap={{ scale: 0.95 }}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          votedDown
            ? 'bg-red-500 text-white'
            : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
        }`}
        title="Downvote"
      >
        <motion.div
          animate={votedDown ? { scale: [1, 1.2, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <ArrowDown className="w-5 h-5" />
        </motion.div>
        <span className="font-semibold">{dislikeCount}</span>
        <span className="text-sm hidden md:inline">Down</span>
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
        <span className="text-sm hidden md:inline">I'd pay</span>
      </motion.button>

      {/* Comments Button */}
      <button
        onClick={onCommentsClick}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-text-secondary hover:bg-gray-200 transition-colors"
      >
        <MessageSquare className="w-5 h-5" />
        <span className="font-semibold">{commentCount}</span>
        <span className="text-sm hidden md:inline">Comments</span>
      </button>

      {/* Share Button */}
      <motion.button
        onClick={handleShare}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-text-secondary hover:bg-gray-200 transition-colors ml-auto"
      >
        <Share2 className="w-5 h-5" />
        <span className="text-sm hidden md:inline">Share</span>
      </motion.button>
    </div>
  )
}
