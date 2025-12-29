'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowUp, MessageSquare, X } from 'lucide-react'
import { Comment } from '@/core/types/comment'
import { useAppSelector } from '@/core/lib/hooks'
import { commentService } from '@/core/lib/services/commentService'
import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { CommentTree } from '@/features/comments/components/CommentTree'

interface TikTokCommentsProps {
  ideaId: string
  isOpen: boolean
  onClose: () => void
  onCommentCountChange?: (count: number) => void
}

export function TikTokComments({
  ideaId,
  isOpen,
  onClose,
  onCommentCountChange,
}: TikTokCommentsProps) {
  const t = useTranslations()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [panelHeight, setPanelHeight] = useState<'half' | 'full'>('half') // 'half' = 50vh, 'full' = 100vh
  const [highlightedCommentId, setHighlightedCommentId] = useState<
    string | null
  >(null)
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState<Map<string, string>>(new Map())
  const { user, profile } = useAppSelector(state => state.auth)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const commentsEndRef = useRef<HTMLDivElement>(null)
  const commentsListRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const dragStartYRef = useRef<number>(0)
  const newCommentRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  useEffect(() => {
    if (isOpen) {
      loadComments()
      setPanelHeight('half') // Reset to half when opened
      setHighlightedCommentId(null) // Clear any previous highlight
      // Reset scroll position when opening or changing idea
      if (commentsListRef.current) {
        commentsListRef.current.scrollTop = 0
      }
      // Focus input when opened
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      // Clear comments when panel is closed to avoid stale data
      setComments([])
    }
  }, [isOpen, ideaId])

  const loadComments = async () => {
    setLoading(true)
    try {
      const loadedComments = await commentService.getComments(ideaId)

      // Fetch user votes for all comments and replies
      if (user) {
        const allCommentIds: string[] = []
        const collectCommentIds = (comments: Comment[]) => {
          comments.forEach(comment => {
            allCommentIds.push(comment.id)
            if (comment.replies) {
              collectCommentIds(comment.replies)
            }
          })
        }
        collectCommentIds(loadedComments)

        try {
          const userVotes =
            await commentService.getUserCommentVotes(allCommentIds)

          // Apply user vote information to comments
          const applyUserVotes = (comments: Comment[]): Comment[] => {
            return comments.map(comment => ({
              ...comment,
              upvoted: userVotes[comment.id]?.upvoted || false,
              downvoted: userVotes[comment.id]?.downvoted || false,
              replies: comment.replies
                ? applyUserVotes(comment.replies)
                : undefined,
            }))
          }

          const commentsWithVotes = applyUserVotes(loadedComments)
          setComments(commentsWithVotes)
        } catch (error) {
          console.error('Error fetching user comment votes:', error)
          setComments(loadedComments)
        }
      } else {
        setComments(loadedComments)
      }

      onCommentCountChange?.(loadedComments.length)
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpvoteComment = async (commentId: string) => {
    if (!user) {
      alert(t('auth.sign_in_to_vote'))
      return
    }
    try {
      const updatedComment = await commentService.toggleUpvoteComment(
        commentId,
        ideaId
      )
      updateCommentInState(commentId, updatedComment)
    } catch (error) {
      console.error('Error upvoting comment:', error)
    }
  }

  const handleDownvoteComment = async (commentId: string) => {
    if (!user) {
      alert(t('auth.sign_in_to_vote'))
      return
    }
    try {
      const updatedComment = await commentService.toggleDownvoteComment(
        commentId,
        ideaId
      )
      updateCommentInState(commentId, updatedComment)
    } catch (error) {
      console.error('Error downvoting comment:', error)
    }
  }

  const updateCommentInState = (commentId: string, updatedComment: Comment) => {
    const updateCommentRecursive = (comments: Comment[]): Comment[] => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          // Preserve the existing replies when updating the comment
          return {
            ...updatedComment,
            replies: comment.replies, // Keep the existing replies structure
          }
        }
        if (comment.replies) {
          return {
            ...comment,
            replies: updateCommentRecursive(comment.replies),
          }
        }
        return comment
      })
    }

    setComments(prev => updateCommentRecursive(prev))
  }

  const toggleReplies = (commentId: string) => {
    setExpandedReplies(prev => {
      const newSet = new Set(prev)
      if (newSet.has(commentId)) {
        newSet.delete(commentId)
      } else {
        newSet.add(commentId)
      }
      return newSet
    })
  }

  const handleReplySubmit = async (parentId: string, e: React.FormEvent) => {
    e.preventDefault()
    const replyContent = replyText.get(parentId)?.trim()
    if (!replyContent || submitting) return

    if (!user) {
      alert(t('auth.sign_in_to_comment'))
      return
    }

    setSubmitting(true)
    try {
      const authorName =
        profile?.full_name ||
        user?.user_metadata?.full_name ||
        user?.email ||
        'Anonymous'
      const authorImage = user?.user_metadata?.avatar_url || undefined

      await commentService.addComment(
        ideaId,
        replyContent,
        authorName,
        authorImage,
        parentId
      )

      const updatedComments = await commentService.getComments(ideaId)

      // Re-apply user vote information
      if (user) {
        const allCommentIds: string[] = []
        const collectCommentIds = (comments: Comment[]) => {
          comments.forEach(comment => {
            allCommentIds.push(comment.id)
            if (comment.replies) {
              collectCommentIds(comment.replies)
            }
          })
        }
        collectCommentIds(updatedComments)

        try {
          const userVotes =
            await commentService.getUserCommentVotes(allCommentIds)

          const applyUserVotes = (comments: Comment[]): Comment[] => {
            return comments.map(comment => ({
              ...comment,
              upvoted: userVotes[comment.id]?.upvoted || false,
              downvoted: userVotes[comment.id]?.downvoted || false,
              replies: comment.replies
                ? applyUserVotes(comment.replies)
                : undefined,
            }))
          }

          const commentsWithVotes = applyUserVotes(updatedComments)
          setComments(commentsWithVotes)
        } catch (error) {
          console.error('Error re-applying user comment votes:', error)
          setComments(updatedComments)
        }
      } else {
        setComments(updatedComments)
      }

      onCommentCountChange?.(updatedComments.length)

      // Clear reply text
      setReplyText(prev => {
        const newMap = new Map(prev)
        newMap.delete(parentId)
        return newMap
      })

      // Clear the replying state to hide the reply form
      setReplyingTo(null)

      // Expand replies if not already expanded
      if (!expandedReplies.has(parentId)) {
        setExpandedReplies(prev => new Set(prev).add(parentId))
      }
    } catch (error) {
      console.error('Error submitting reply:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || submitting) return

    if (!user) {
      alert(t('auth.sign_in_to_comment'))
      return
    }

    const commentText = newComment.trim()
    setSubmitting(true)
    setNewComment('') // Clear input immediately for better UX

    try {
      // Use session data if available, otherwise use anonymous
      const authorName =
        profile?.full_name ||
        user?.user_metadata?.full_name ||
        user?.email ||
        'Anonymous'
      const authorImage = user?.user_metadata?.avatar_url || undefined

      await commentService.addComment(
        ideaId,
        commentText,
        authorName,
        authorImage,
        replyingTo || undefined
      )

      if (replyingTo) {
        setReplyingTo(null)
        setReplyText(new Map())
      }

      // Reload comments to avoid duplicates and get the latest state
      const updatedComments = await commentService.getComments(ideaId)

      // Re-apply user vote information
      if (user) {
        const allCommentIds: string[] = []
        const collectCommentIds = (comments: Comment[]) => {
          comments.forEach(comment => {
            allCommentIds.push(comment.id)
            if (comment.replies) {
              collectCommentIds(comment.replies)
            }
          })
        }
        collectCommentIds(updatedComments)

        try {
          const userVotes =
            await commentService.getUserCommentVotes(allCommentIds)

          const applyUserVotes = (comments: Comment[]): Comment[] => {
            return comments.map(comment => ({
              ...comment,
              upvoted: userVotes[comment.id]?.upvoted || false,
              downvoted: userVotes[comment.id]?.downvoted || false,
              replies: comment.replies
                ? applyUserVotes(comment.replies)
                : undefined,
            }))
          }

          const commentsWithVotes = applyUserVotes(updatedComments)
          setComments(commentsWithVotes)
        } catch (error) {
          console.error('Error re-applying user comment votes:', error)
          setComments(updatedComments)
        }
      } else {
        setComments(updatedComments)
      }

      onCommentCountChange?.(updatedComments.length)

      // Find the newly added comment (should be the first one)
      const newComment = updatedComments[0]
      if (newComment && commentsListRef.current) {
        // Highlight the new comment
        setHighlightedCommentId(newComment.id)
        // Scroll directly to top without any intermediate movements
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // Scroll directly to top - no intermediate scrolls
            commentsListRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
            // Remove highlight after animation
            setTimeout(() => {
              setHighlightedCommentId(null)
            }, 2000)
          })
        })
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
      // Restore comment text if there was an error
      setNewComment(commentText)
    } finally {
      setSubmitting(false)
      // Keep focus on input after submitting - use requestAnimationFrame for better reliability
      requestAnimationFrame(() => {
        setTimeout(() => {
          inputRef.current?.focus()
        }, 10)
      })
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />

          {/* Comments Panel */}
          <motion.div
            ref={panelRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed right-0 bottom-0 w-full md:h-auto md:max-h-none md:w-[400px] md:top-0 bg-black z-50 flex flex-col md:!translate-y-0 md:!translate-x-0 rounded-t-2xl md:rounded-none transition-all duration-300 ease-out ${
              panelHeight === 'full' ? 'h-screen' : 'h-[50vh] max-h-[50vh]'
            }`}
          >
            {/* Drag Handle Area - Mobile only */}
            <motion.div
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0}
              dragMomentum={false}
              dragPropagation={false}
              onDragStart={(event, info) => {
                // Store initial drag position
                dragStartYRef.current = info.point.y
                // Change cursor when dragging starts
                if (panelRef.current) {
                  panelRef.current.style.cursor = 'grabbing'
                }
              }}
              onDrag={(event, info) => {
                // Only change height when dragging, don't move the panel
                const deltaY = info.point.y - dragStartYRef.current

                if (panelHeight === 'half') {
                  // If dragging up from half, extend to full
                  if (deltaY < -30) {
                    setPanelHeight('full')
                  }
                }
                // Reset transform to keep panel in place - only height changes
                if (event && event.currentTarget) {
                  const element = event.currentTarget as HTMLElement
                  element.style.transform = 'translateY(0)'
                }
              }}
              onDragEnd={(event, info) => {
                // Reset cursor when dragging ends
                if (panelRef.current) {
                  panelRef.current.style.cursor = 'grab'
                }

                const deltaY = info.point.y - dragStartYRef.current
                const threshold = 80

                if (panelHeight === 'full') {
                  // If dragging down from full height
                  if (deltaY > threshold) {
                    // Always go to half first when dragging down from full
                    setPanelHeight('half')
                  }
                  // If dragged up or small movement down, stay full
                } else {
                  // If dragging from half height
                  if (deltaY < -threshold) {
                    // Dragged up significantly, extend to full
                    setPanelHeight('full')
                  } else if (deltaY > threshold || info.velocity.y > 500) {
                    // Dragged down significantly past original position from half -> close
                    onClose()
                  }
                  // Otherwise stay at half
                }
              }}
              whileDrag={{ y: 0 }}
              className="md:hidden cursor-grab active:cursor-grabbing select-none"
              style={{
                touchAction: 'pan-y',
              }}
            >
              {/* Grabber Handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-white rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 pb-4 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white">
                  {t('comments.title')}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full hover:bg-white/10 transition-colors pointer-events-auto"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </motion.div>

            {/* Header - Desktop only */}
            <div className="hidden md:flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-lg font-semibold text-white">
                {t('comments.title')}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            {/* Comments List */}
            <div
              ref={commentsListRef}
              className="flex-1 overflow-y-auto px-4 py-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              onTouchStart={e => {
                // Prevent drag when scrolling in comments list
                e.stopPropagation()
              }}
              onTouchMove={e => {
                // Allow scroll to take priority over drag
                const element = commentsListRef.current
                if (element) {
                  const { scrollTop, scrollHeight, clientHeight } = element
                  const isAtTop = scrollTop === 0
                  const isAtBottom =
                    scrollTop + clientHeight >= scrollHeight - 1

                  // Only prevent drag if we're scrolling within the list
                  if (!isAtTop && !isAtBottom) {
                    e.stopPropagation()
                  }
                }
              }}
            >
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-white/60">{t('comments.loading')}</div>
                </div>
              ) : comments.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-white/60">
                    <p className="text-lg mb-2">
                      {t('comments.no_comments_title')}
                    </p>
                    <p className="text-sm">{t('comments.no_comments')}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pb-4">
                  <CommentTree
                    comments={comments}
                    depth={0}
                    maxDepth={4}
                    expandedReplies={expandedReplies}
                    replyingTo={replyingTo}
                    replyText={replyText}
                    highlightedCommentId={highlightedCommentId}
                    onToggleReplies={toggleReplies}
                    onUpvote={handleUpvoteComment}
                    onDownvote={handleDownvoteComment}
                    onReply={commentId => {
                      setReplyingTo(replyingTo === commentId ? null : commentId)
                      if (!replyText.has(commentId)) {
                        setReplyText(prev => new Map(prev).set(commentId, ''))
                      }
                    }}
                    onReplyTextChange={(commentId, text) => {
                      setReplyText(prev => new Map(prev).set(commentId, text))
                    }}
                    onReplySubmit={handleReplySubmit}
                    submitting={submitting}
                    isDark={true}
                  />
                  <div ref={commentsEndRef} />
                </div>
              )}
            </div>

            {/* Comment Input */}
            <form
              onSubmit={handleSubmitComment}
              className="p-4 border-t border-white/10 bg-black"
            >
              <div className="flex gap-2">
                <textarea
                  ref={inputRef}
                  value={newComment}
                  onChange={e => {
                    setNewComment(e.target.value)
                    // Auto-resize textarea
                    if (inputRef.current) {
                      inputRef.current.style.height = 'auto'
                      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`
                    }
                  }}
                  placeholder={t('comments.add_comment')}
                  className="flex-1 px-4 py-2 bg-white/10 placeholder-white/50 rounded-full focus:outline-none focus:ring-2 focus:ring-accent resize-none overflow-hidden"
                  style={{
                    color: '#000000',
                    minHeight: '2.5rem',
                    maxHeight: '10rem',
                  }}
                  rows={1}
                  disabled={submitting}
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="px-4 py-2 bg-accent text-text-primary rounded-full font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
