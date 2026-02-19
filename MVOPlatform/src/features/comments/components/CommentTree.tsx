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
import {
  aiCommentService,
  AI_PERSONA_NAMES,
  AI_PERSONA_HANDLES,
  AI_PERSONA_IMAGES,
} from '@/core/lib/services/aiCommentService'

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
  isVoting?: string | null // ID of comment currently being voted on
  isDark?: boolean // For TikTok-style dark theme
  compactMode?: boolean // For tighter indentation in TikTok-style panels
}

interface CommentTreeWithMentionsProps extends CommentTreeProps {
  showMentionSuggestions: boolean
  mentionSuggestions: string[]
  onMentionSelect: (commentId: string, handle: string) => void
  onMentionInputChange: (commentId: string, value: string) => void
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
  isVoting = null,
  isDark = false,
  compactMode = false,
}: CommentTreeProps) {
  const { user } = useAppSelector(state => state.auth)
  const { theme } = useAppSelector(state => state.theme)
  const textareaRefs = useRef<Map<string, HTMLTextAreaElement>>(new Map())
  const [showMentionSuggestions, setShowMentionSuggestions] = useState<
    Map<string, boolean>
  >(new Map())
  const [mentionSuggestions, setMentionSuggestions] = useState<
    Map<string, string[]>
  >(new Map())

  const getIndentation = (currentDepth: number) => {
    // Progressive indentation that doesn't get too wide
    // Use much smaller values on mobile to prevent excessive nesting
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    const baseIndent = isMobile ? 0 : compactMode ? 4 : 8
    const indentStep = isMobile ? 0.25 : compactMode ? 8 : 12
    const maxIndent = isMobile ? 1 : compactMode ? 28 : 44
    return Math.min(baseIndent + currentDepth * indentStep, maxIndent)
  }

  const getAvatarSize = (currentDepth: number) => {
    // Smaller avatars for deeper levels
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    const sizes = isMobile
      ? [32, 22, 20, 18, 16] // Much smaller sizes on mobile
      : [40, 32, 28, 24, 20]
    return sizes[Math.min(currentDepth, sizes.length - 1)] || 16
  }

  const getTextSize = (currentDepth: number) => {
    // Smaller text for deeper levels
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    const sizes = isMobile
      ? [
          'text-sm text-text-primary', // Level 0
          'text-xs text-text-primary', // Level 1
          'text-[11px] text-text-primary', // Level 2
          'text-[11px] text-text-primary', // Level 3
          'text-[10px] text-text-primary', // Level 4+
        ]
      : [
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
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    const sizes = isMobile
      ? [
          'text-text-secondary text-[10px]', // Level 0
          'text-text-secondary text-[10px]', // Level 1
          'text-text-secondary text-[10px]', // Level 2+
          'text-text-secondary text-[10px]',
          'text-text-secondary text-[9px]',
        ]
      : [
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

  const getDateTextSize = (currentDepth: number) => {
    // Date text size - smaller than author name on mobile
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    const sizes = isMobile
      ? [
          'text-[10px] text-text-secondary', // Level 0
          'text-[10px] text-text-secondary', // Level 1
          'text-[9px] text-text-secondary', // Level 2
          'text-[9px] text-text-secondary', // Level 3
          'text-[8px] text-text-secondary', // Level 4+
        ]
      : [
          'text-text-secondary text-sm',
          'text-text-secondary text-xs',
          'text-text-secondary text-xs',
          'text-text-secondary text-xs',
          'text-text-secondary text-xs',
        ]
    return (
      sizes[Math.min(currentDepth, sizes.length - 1)] ||
      'text-[10px] text-text-secondary'
    )
  }

  const getActionSize = (currentDepth: number) => {
    // Smaller action buttons for deeper levels
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    const sizes = isMobile
      ? ['text-xs', 'text-xs', 'text-xs', 'text-xs', 'text-xs']
      : ['text-sm', 'text-xs', 'text-xs', 'text-xs', 'text-xs']
    return sizes[Math.min(currentDepth, sizes.length - 1)] || 'text-xs'
  }

  const getIconSize = (currentDepth: number) => {
    // Smaller icons for deeper levels
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    const sizes = isMobile
      ? ['w-3.5 h-3.5', 'w-3 h-3', 'w-2.5 h-2.5', 'w-2 h-2', 'w-1.5 h-1.5']
      : ['w-4 h-4', 'w-4 h-4', 'w-3.5 h-3.5', 'w-3 h-3', 'w-3 h-3']
    return sizes[Math.min(currentDepth, sizes.length - 1)] || 'w-2 h-2'
  }

  const renderComment = (comment: Comment, index: number) => {
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    const indent = getIndentation(depth)
    const avatarSize = getAvatarSize(depth)
    const textSize = getTextSize(depth)
    const secondaryTextSize = getSecondaryTextSize(depth)
    const dateTextSize = getDateTextSize(depth)
    const actionSize = getActionSize(depth)
    const iconSize = getIconSize(depth)

    // AI Persona detection logic
    const aiPersonaData = aiCommentService.extractAIPersonaFromComment(
      comment.content
    )
    const isAIComment = aiPersonaData.personaKey !== null
    const displayContent = isAIComment
      ? aiPersonaData.cleanContent
      : comment.content
    const displayAuthor = isAIComment
      ? AI_PERSONA_NAMES[aiPersonaData.personaKey!]
      : comment.author
      const displayAvatar = isAIComment
      ? `/ai-personas/v2/${AI_PERSONA_IMAGES[aiPersonaData.personaKey!]}.png`
      : comment.authorImage

    const hasReplies = comment.replies && comment.replies.length > 0
    const canReply = depth < maxDepth - 1 // Allow replies up to maxDepth - 1

    return (
      <motion.div
        key={comment.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
        className={`relative ${depth > 0 ? 'ml-0 md:ml-4' : ''}`}
        style={depth > 0 ? { marginLeft: `${indent}px` } : {}}
      >
        {/* Connecting line for nested comments - hidden on mobile */}
        {depth > 0 && !isMobile && (
          <div
            className={`absolute left-0 top-0 bottom-0 w-0.5 ${isDark ? 'bg-white' : 'bg-gray-400'}`}
            style={{
              left: `${Math.max(0, indent - avatarSize - 10 - (depth > 2 ? 6 : 0))}px`,
            }}
          />
        )}

        <div
          className={`p-3 rounded-lg transition-all duration-300 ${
            highlightedCommentId === comment.id
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
              {displayAvatar ? (
                <Image
                  src={displayAvatar}
                  alt={displayAuthor}
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
            <div
              className={`flex-1 min-w-0 w-full ${replyingTo === comment.id ? 'overflow-visible' : 'overflow-hidden'}`}
            >
              {/* Mobile: Author on one line, date on new line */}
              <div className="md:hidden flex flex-col mb-1">
                <span
                  className={`font-semibold ${textSize} ${isDark ? 'text-white' : ''} ${isAIComment ? 'text-accent' : ''}`}
                >
                  {isAIComment ? displayAuthor : `@${displayAuthor}`}
                </span>
                <span
                  className={`${dateTextSize} ${isDark ? 'text-white/60' : ''}`}
                >
                  {formatDate(comment.createdAt)}
                </span>
              </div>
              {/* Desktop: Author • Date • Score */}
              <div className="hidden md:flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className={`font-semibold ${textSize} ${isDark ? 'text-white' : ''} ${isAIComment ? 'text-accent' : ''}`}
                >
                  {isAIComment ? displayAuthor : `@${displayAuthor}`}
                </span>
                <span
                  className={`${secondaryTextSize} ${isDark ? 'text-white/60' : ''}`}
                >
                  •
                </span>
                <span
                  className={`${secondaryTextSize} ${isDark ? 'text-white/60' : ''}`}
                >
                  {formatDate(comment.createdAt)}
                </span>
                {comment.usefulnessScore > 0 && (
                  <>
                    <span
                      className={`${secondaryTextSize} ${isDark ? 'text-white/60' : ''}`}
                    >
                      •
                    </span>
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded-full ${
                        isDark
                          ? 'bg-accent/30 text-accent'
                          : 'bg-accent/20 text-accent'
                      }`}
                    >
                      {comment.usefulnessScore.toFixed(1)}
                    </span>
                  </>
                )}
              </div>

              <CommentReadMore
                content={aiCommentService.highlightMentions(displayContent)}
                maxLines={3}
                className={textSize}
                isDark={isDark}
              />

              {/* Actions */}
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <button
                  onClick={() => onUpvote(comment.id)}
                  disabled={isVoting === comment.id}
                  className={`flex items-center gap-1 transition-colors ${actionSize} ${
                    comment.upvoted
                      ? 'text-accent'
                      : `${isDark ? 'text-white/60 hover:text-accent' : 'text-text-secondary hover:text-accent'}`
                  } ${isVoting === comment.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                  title="Upvote"
                >
                  <ArrowUp
                    className={`${iconSize} ${comment.upvoted ? 'fill-current' : ''}`}
                  />
                  <span>{comment.upvotes || 0}</span>
                </button>

                <button
                  onClick={() => onDownvote(comment.id)}
                  disabled={isVoting === comment.id}
                  className={`flex items-center gap-1 transition-colors ${actionSize} ${
                    comment.downvoted
                      ? 'text-error'
                      : `${isDark ? 'text-white/60 hover:text-error' : 'text-text-secondary hover:text-error'}`
                  } ${isVoting === comment.id ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                    className={`flex items-center gap-1 transition-colors ${actionSize} ${
                      isDark
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
                    className={`flex items-center gap-1 transition-colors ${actionSize} ${
                      isDark
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
                  className="mt-3 pt-3 border-t border-border-color dark:border-white/10 relative z-20"
                >
                  <div className="flex gap-2 relative z-50 p-1 -m-1 w-full">
                    <div className="flex-1 relative w-full">
                      <textarea
                        ref={el => {
                          if (el) textareaRefs.current.set(comment.id, el)
                        }}
                        value={replyText.get(comment.id) || ''}
                        onChange={e => {
                          const value = e.target.value
                          const commentId = comment.id
                          const cursorPosition = e.target.selectionStart
                          const textBeforeCursor = value.substring(
                            0,
                            cursorPosition
                          )
                          const lastAtSymbol = textBeforeCursor.lastIndexOf('@')

                          // Enforce character limit
                          if (value.length <= MAX_COMMENT_LENGTH) {
                            onReplyTextChange(comment.id, value)
                          }

                          // Handle AI persona mentions
                          if (lastAtSymbol !== -1) {
                            const query = textBeforeCursor.substring(
                              lastAtSymbol + 1
                            )
                            if (query.length > 0 && !query.includes(' ')) {
                              const matches = Object.entries(AI_PERSONA_HANDLES)
                                .filter(([_, handle]) =>
                                  handle
                                    .toLowerCase()
                                    .includes(query.toLowerCase())
                                )
                                .map(([_, handle]) => handle)

                              if (matches.length > 0) {
                                setMentionSuggestions(prev =>
                                  new Map(prev).set(commentId, matches)
                                )
                                setShowMentionSuggestions(prev =>
                                  new Map(prev).set(commentId, true)
                                )
                              } else {
                                setShowMentionSuggestions(prev =>
                                  new Map(prev).set(commentId, false)
                                )
                              }
                            } else {
                              setShowMentionSuggestions(prev =>
                                new Map(prev).set(commentId, false)
                              )
                            }
                          } else {
                            setShowMentionSuggestions(prev =>
                              new Map(prev).set(commentId, false)
                            )
                          }

                          // Auto-resize
                          if (e.target) {
                            e.target.style.height = 'auto'
                            e.target.style.height = `${e.target.scrollHeight}px`
                          }
                        }}
                        placeholder="Write a reply..."
                        maxLength={MAX_COMMENT_LENGTH}
                        className="w-full px-3 py-2 rounded-lg border resize-none overflow-hidden bg-gray-50 dark:bg-white/10 border-border-color dark:border-white/20 focus:ring-accent placeholder-gray-500 dark:placeholder-white/50 focus:outline-none focus:ring-2"
                        style={{
                          color: theme === 'dark' ? '#ffffff' : '#000000',
                          minHeight: depth >= 2 ? '2rem' : '2.5rem',
                          maxHeight: depth >= 2 ? '8rem' : '10rem',
                          fontSize:
                            depth >= 2 ? '12px' : depth >= 1 ? '14px' : '16px',
                        }}
                        rows={1}
                      />
                      {showMentionSuggestions.get(comment.id) && (
                        <div className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 border border-border-color rounded-lg shadow-lg max-h-48 overflow-y-auto z-50 w-full">
                          {mentionSuggestions.get(comment.id)?.map(handle => (
                            <button
                              key={handle}
                              type="button"
                              onClick={() => {
                                const cursorPosition =
                                  textareaRefs.current.get(comment.id)
                                    ?.selectionStart || 0
                                const textBeforeCursor = (
                                  replyText.get(comment.id) || ''
                                ).substring(0, cursorPosition)
                                const lastAtSymbol =
                                  textBeforeCursor.lastIndexOf('@')
                                const textAfterCursor = (
                                  replyText.get(comment.id) || ''
                                ).substring(cursorPosition)

                                const newText =
                                  textBeforeCursor.substring(0, lastAtSymbol) +
                                  handle +
                                  ' ' +
                                  textAfterCursor

                                onReplyTextChange(comment.id, newText)
                                setShowMentionSuggestions(prev =>
                                  new Map(prev).set(comment.id, false)
                                )
                                textareaRefs.current.get(comment.id)?.focus()
                              }}
                              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                            >
                              <span className="text-accent font-medium">
                                {handle}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={
                        !replyText.get(comment.id)?.trim() || submitting
                      }
                      className={`flex-shrink-0 px-3 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${
                        isDark
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
                <div className="mt-3 space-y-2 w-full">
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
                    isVoting={isVoting}
                    isDark={isDark}
                    compactMode={compactMode}
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
