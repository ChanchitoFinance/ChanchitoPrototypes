'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowUp,
  ArrowDown,
  User,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import Image from 'next/image'
import { useAppSelector } from '@/core/lib/hooks'
import { Comment } from '@/core/types/comment'
import { formatDate } from '@/core/lib/utils/date'
import { CommentReadMore } from './CommentReadMore'

const MAX_COMMENT_LENGTH = 3000

interface CommentTreeProps {
  comments: Comment[]
  depth: number
  maxDepth: number
  expandedReplies: Set<string>
  replyingTo: string | null
  replyText: Map<string, string>
  highlightedCommentId: string | null
  onToggleReplies: (commentId: string) => void
  onUpvote: (commentId: string) => void
  onDownvote: (commentId: string) => void
  onReply: (commentId: string) => void
  onReplyTextChange: (commentId: string, text: string) => void
  onReplySubmit: (parentId: string, e: React.FormEvent) => void
  submitting: boolean
  isDark?: boolean // For TikTok-style dark theme
}

export function CommentTree({
  comments,
  depth,
  maxDepth,
  expandedReplies,
  replyingTo,
  replyText,
  highlightedCommentId,
  onToggleReplies,
  onUpvote,
  onDownvote,
  onReply,
  onReplyTextChange,
  onReplySubmit,
  submitting,
  isDark = false,
}: CommentTreeProps) {
  const { user } = useAppSelector(state => state.auth)
  const textareaRefs = useRef<Map<string, HTMLTextAreaElement>>(new Map())

  const getIndentation = (currentDepth: number) => {
    // Progressive indentation that doesn't get too wide
    const baseIndent = 8 // Base indentation in pixels (further reduced)
    const indentStep = 12 // Pixels per level (further reduced)
    const maxIndent = 44 // Maximum indentation (further reduced)
    return Math.min(baseIndent + currentDepth * indentStep, maxIndent)
  }

  const getAvatarSize = (currentDepth: number) => {
    // Smaller avatars for deeper levels
    const sizes = [40, 32, 28, 24, 20] // Size for each depth level
    return sizes[Math.min(currentDepth, sizes.length - 1)] || 20
  }

  const getTextSize = (currentDepth: number) => {
    // Smaller text for deeper levels
    const sizes = [
      'text-text-primary',
      'text-sm text-text-primary',
      'text-sm text-text-primary',
      'text-xs text-text-primary',
      'text-xs text-text-primary',
    ]
    return (
      sizes[Math.min(currentDepth, sizes.length - 1)] ||
      'text-xs text-text-primary'
    )
  }

  const getSecondaryTextSize = (currentDepth: number) => {
    // Smaller secondary text for deeper levels
    const sizes = [
      'text-text-secondary text-sm',
      'text-text-secondary text-xs',
      'text-text-secondary text-xs',
      'text-text-secondary text-xs',
      'text-text-secondary text-xs',
    ]
    return (
      sizes[Math.min(currentDepth, sizes.length - 1)] ||
      'text-text-secondary text-xs'
    )
  }

  const getActionSize = (currentDepth: number) => {
    // Smaller action buttons for deeper levels
    const sizes = ['text-sm', 'text-xs', 'text-xs', 'text-xs', 'text-xs']
    return sizes[Math.min(currentDepth, sizes.length - 1)] || 'text-xs'
  }

  const getIconSize = (currentDepth: number) => {
    // Smaller icons for deeper levels
    const sizes = ['w-4 h-4', 'w-4 h-4', 'w-3.5 h-3.5', 'w-3 h-3', 'w-3 h-3']
    return sizes[Math.min(currentDepth, sizes.length - 1)] || 'w-3 h-3'
  }

  const renderComment = (comment: Comment, index: number) => {
    const indent = getIndentation(depth)
    const avatarSize = getAvatarSize(depth)
    const textSize = getTextSize(depth)
    const secondaryTextSize = getSecondaryTextSize(depth)
    const actionSize = getActionSize(depth)
    const iconSize = getIconSize(depth)

    const hasReplies = comment.replies && comment.replies.length > 0
    const canReply = depth < maxDepth - 1 // Allow replies up to maxDepth - 1

    return (
      <motion.div
        key={comment.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className={`relative ${depth > 0 ? 'ml-4' : ''}`}
        style={depth > 0 ? { marginLeft: `${indent}px` } : {}}
      >
        {/* Connecting line for nested comments */}
        {depth > 0 && (
          <div
            className={`absolute left-0 top-0 bottom-0 w-0.5 ${isDark ? 'bg-white' : 'bg-gray-400'}`}
            style={{ left: `${indent - 16 - depth * 7}px` }}
          />
        )}

        <div
          className={`p-3 rounded-lg transition-all duration-300 ${highlightedCommentId === comment.id
            ? isDark
              ? 'bg-accent/20 ring-2 ring-accent'
              : 'bg-accent/20 ring-2 ring-accent'
            : isDark
              ? 'bg-white/5 hover:bg-white/10'
              : 'bg-gray-50 hover:bg-gray-100'
            }`}
        >
          <div className="flex items-start gap-3">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {comment.authorImage ? (
                <Image
                  src={comment.authorImage}
                  alt={comment.author}
                  width={avatarSize}
                  height={avatarSize}
                  className="rounded-full"
                />
              ) : (
                <div
                  className={`rounded-full flex items-center justify-center ${isDark ? 'bg-accent' : 'bg-accent'}`}
                  style={{ width: avatarSize, height: avatarSize }}
                >
                  <User
                    className={`${iconSize} ${isDark ? 'text-text-primary' : 'text-text-primary'}`}
                  />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className={`font-semibold ${textSize} ${isDark ? 'text-white' : ''}`}>
                  @{comment.author}
                </span>
                <span className={`${secondaryTextSize} ${isDark ? 'text-white/60' : ''}`}>
                  •
                </span>
                <span className={`${secondaryTextSize} ${isDark ? 'text-white/60' : ''}`}>
                  {formatDate(comment.createdAt)}
                </span>
                {comment.usefulnessScore > 0 && (
                  <>
                    <span className={`${secondaryTextSize} ${isDark ? 'text-white/60' : ''}`}>
                      •
                    </span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full ${isDark
                        ? 'bg-accent/30 text-accent'
                        : 'bg-accent/20 text-accent'
                        }`}
                    >
                      {comment.usefulnessScore.toFixed(1)}
                    </span>
                  </>
                )}
              </div>

              <div className="mb-2">
                <CommentReadMore
                  content={comment.content}
                  maxLines={3}
                  className={depth >= 2 ? 'text-xs' : depth >= 1 ? 'text-sm' : ''}
                  isDark={isDark}
                />
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => onUpvote(comment.id)}
                  className={`flex items-center gap-1 transition-colors ${actionSize} ${comment.upvoted
                    ? 'text-accent'
                    : `${isDark ? 'text-white/60 hover:text-accent' : 'text-text-secondary hover:text-accent'}`
                    }`}
                  title="Upvote"
                >
                  <ArrowUp
                    className={`${iconSize} ${comment.upvoted ? 'fill-current' : ''}`}
                  />
                  <span>{comment.upvotes || 0}</span>
                </button>

                <button
                  onClick={() => onDownvote(comment.id)}
                  className={`flex items-center gap-1 transition-colors ${actionSize} ${comment.downvoted
                    ? 'text-red-500'
                    : `${isDark ? 'text-white/60 hover:text-red-500' : 'text-text-secondary hover:text-red-500'}`
                    }`}
                  title="Downvote"
                >
                  <ArrowDown
                    className={`${iconSize} ${comment.downvoted ? 'fill-current' : ''}`}
                  />
                  <span>{comment.downvotes || 0}</span>
                </button>

                {canReply && (
                  <button
                    onClick={() => onReply(comment.id)}
                    className={`flex items-center gap-1 transition-colors ${actionSize} ${isDark
                      ? 'text-white/60 hover:text-accent'
                      : 'text-text-secondary hover:text-accent'
                      }`}
                  >
                    <MessageSquare className={iconSize} />
                    <span>Reply</span>
                  </button>
                )}

                {hasReplies && (
                  <button
                    onClick={() => onToggleReplies(comment.id)}
                    className={`flex items-center gap-1 transition-colors ${actionSize} ${isDark
                      ? 'text-white/60 hover:text-accent'
                      : 'text-text-secondary hover:text-accent'
                      }`}
                  >
                    {expandedReplies.has(comment.id) ? (
                      <ChevronUp className={iconSize} />
                    ) : (
                      <ChevronDown className={iconSize} />
                    )}
                    <span>
                      {comment.replies!.length}{' '}
                      {comment.replies!.length === 1 ? 'reply' : 'replies'}
                    </span>
                  </button>
                )}
              </div>

              {/* Reply Form */}
              {replyingTo === comment.id && canReply && (
                <form
                  onSubmit={e => onReplySubmit(comment.id, e)}
                  className={`mt-3 pt-3 border-t ${isDark ? 'border-white/10' : 'border-border-color'}`}
                >
                  <div className="flex gap-2">
                    <textarea
                      ref={el => {
                        if (el) textareaRefs.current.set(comment.id, el)
                      }}
                      value={replyText.get(comment.id) || ''}
                      onChange={e => {
                        const value = e.target.value
                        // Enforce character limit
                        if (value.length <= MAX_COMMENT_LENGTH) {
                          onReplyTextChange(comment.id, value)
                        }
                        // Auto-resize
                        if (e.target) {
                          e.target.style.height = 'auto'
                          e.target.style.height = `${e.target.scrollHeight}px`
                        }
                      }}
                      placeholder="Write a reply..."
                      maxLength={MAX_COMMENT_LENGTH}
                      className={`flex-1 px-3 py-2 rounded-lg border resize-none overflow-hidden ${isDark
                        ? 'bg-white/10 placeholder-white/50 border-white/20 focus:ring-accent text-white'
                        : 'bg-gray-50 border-border-color focus:ring-accent'
                        } focus:outline-none focus:ring-2`}
                      style={{
                        minHeight: depth >= 2 ? '2rem' : '2.5rem',
                        maxHeight: depth >= 2 ? '8rem' : '10rem',
                        fontSize:
                          depth >= 2 ? '12px' : depth >= 1 ? '14px' : '16px',
                      }}
                      rows={1}
                    />
                    <button
                      type="submit"
                      disabled={
                        !replyText.get(comment.id)?.trim() || submitting
                      }
                      className={`px-3 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${isDark
                        ? 'bg-accent text-text-primary hover:bg-accent/90'
                        : 'bg-accent text-text-primary hover:bg-accent/90'
                        }`}
                    >
                      <ArrowUp className={iconSize} />
                    </button>
                  </div>
                </form>
              )}

              {/* Nested Replies */}
              {expandedReplies.has(comment.id) && hasReplies && (
                <div className="mt-3 space-y-2">
                  <CommentTree
                    comments={comment.replies!}
                    depth={depth + 1}
                    maxDepth={maxDepth}
                    expandedReplies={expandedReplies}
                    replyingTo={replyingTo}
                    replyText={replyText}
                    highlightedCommentId={highlightedCommentId}
                    onToggleReplies={onToggleReplies}
                    onUpvote={onUpvote}
                    onDownvote={onDownvote}
                    onReply={onReply}
                    onReplyTextChange={onReplyTextChange}
                    onReplySubmit={onReplySubmit}
                    submitting={submitting}
                    isDark={isDark}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  return <>{comments.map((comment, index) => renderComment(comment, index))}</>
}
