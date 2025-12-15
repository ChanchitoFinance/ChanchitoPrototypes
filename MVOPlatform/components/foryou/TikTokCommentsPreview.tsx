'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User } from 'lucide-react'
import Image from 'next/image'
import { Comment } from '@/lib/types/comment'
import { commentService } from '@/lib/services/commentService'

interface TikTokCommentsPreviewProps {
  ideaId: string
  maxComments?: number
  onCommentCountChange?: (count: number) => void
  refreshTrigger?: number // Trigger refresh when this changes
}

export function TikTokCommentsPreview({
  ideaId,
  maxComments = 3,
  onCommentCountChange,
  refreshTrigger,
}: TikTokCommentsPreviewProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadComments()
  }, [ideaId, refreshTrigger])

  const loadComments = async () => {
    setLoading(true)
    try {
      const allComments = await commentService.getComments(ideaId)
      const previewComments = allComments.slice(0, maxComments)
      setComments(previewComments)
      onCommentCountChange?.(allComments.length)
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || comments.length === 0) {
    return null
  }

  return (
    <div className="absolute right-4 bottom-20 md:bottom-24 flex flex-col gap-2 max-w-[200px] md:max-w-[240px] pointer-events-none">
      {comments.map((comment, index) => (
        <motion.div
          key={comment.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-black/60 backdrop-blur-md rounded-lg p-2.5 pointer-events-auto"
        >
          <div className="flex gap-2 items-start">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {comment.authorImage ? (
                <Image
                  src={comment.authorImage}
                  alt={comment.author}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center">
                  <User className="w-3 h-3 text-text-primary" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="mb-0.5">
                <span className="text-xs font-semibold text-white">@{comment.author}</span>
              </div>
              <p className="text-xs text-white/90 line-clamp-2 break-words leading-tight">
                {comment.content}
              </p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
