'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { ArrowUp } from 'lucide-react'
import { Comment } from '@/core/types/comment'
import { useAppSelector } from '@/core/lib/hooks'
import { commentService } from '@/core/lib/services/commentService'
import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { CommentTree } from './CommentTree'

interface CommentsBlockProps {
  ideaId: string
}

export function CommentsBlock({ ideaId }: CommentsBlockProps) {
  const t = useTranslations()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [highlightedCommentId, setHighlightedCommentId] = useState<
    string | null
  >(null)
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState<Map<string, string>>(new Map())
  const { user, profile } = useAppSelector(state => state.auth)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const newCommentRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  useEffect(() => {
    loadComments()
  }, [ideaId])

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
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpvoteComment = async (commentId: string) => {
    if (!user) {
      toast.warning(t('auth.sign_in_to_vote'))
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
      toast.warning(t('auth.sign_in_to_vote'))
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
      toast.warning(t('auth.sign_in_to_comment'))
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

      setReplyText(prev => {
        const newMap = new Map(prev)
        newMap.delete(parentId)
        return newMap
      })

      // Clear the replying state to hide the reply form
      setReplyingTo(null)

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
      toast.warning(t('auth.sign_in_to_comment'))
      return
    }

    const commentText = newComment.trim()
    setSubmitting(true)
    setNewComment('') // Clear textarea immediately for better UX

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

      // Find the newly added comment (should be the first one)
      const newComment = updatedComments[0]
      if (newComment) {
        // Highlight the new comment
        setHighlightedCommentId(newComment.id)
        // Scroll directly to the new comment without intermediate movements
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const commentElement = newCommentRefs.current.get(newComment.id)
            if (commentElement) {
              // Get the position before any scroll happens
              const elementTop =
                commentElement.getBoundingClientRect().top + window.pageYOffset
              // Scroll directly to the comment position
              window.scrollTo({
                top: elementTop - 100,
                behavior: 'smooth',
              })
              // Remove highlight after animation
              setTimeout(() => {
                setHighlightedCommentId(null)
              }, 2000)
            }
          })
        })
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
      // Restore comment text if there was an error
      setNewComment(commentText)
    } finally {
      setSubmitting(false)
      // Keep focus on textarea after submitting - use requestAnimationFrame for better reliability
      requestAnimationFrame(() => {
        setTimeout(() => {
          textareaRef.current?.focus()
        }, 10)
      })
    }
  }

  return (
    <div className="mt-12">
      <h2 className="text-heading-2 mb-6">{t('comments.title')}</h2>

      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-8">
        <div className="flex gap-4">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={newComment}
              onChange={e => {
                setNewComment(e.target.value)
                // Auto-resize textarea
                if (textareaRef.current) {
                  textareaRef.current.style.height = 'auto'
                  textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
                }
              }}
              placeholder={t('comments.write_comment')}
              className="w-full px-4 py-3 bg-gray-100 rounded-lg border border-border-color focus:outline-none focus:ring-2 focus:ring-accent resize-none overflow-hidden"
              style={{
                minHeight: '3rem',
                maxHeight: '20rem',
                color: '#ffffff',
              }}
              rows={1}
            />
          </div>
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="px-6 py-3 bg-accent text-text-primary rounded-lg font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArrowUp className="w-4 h-4" />
            <span className="hidden md:inline">
              {submitting ? t('comments.posting') : t('comments.post')}
            </span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="text-text-secondary">{t('comments.loading')}</div>
      ) : comments.length === 0 ? (
        <div className="text-text-secondary text-center py-8">
          {t('comments.no_comments')}
        </div>
      ) : (
        <div className="space-y-4">
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
            isDark={false}
          />
        </div>
      )}
    </div>
  )
}
