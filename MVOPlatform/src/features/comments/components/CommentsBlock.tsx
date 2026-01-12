'use client'

import { useState, useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { ArrowUp } from 'lucide-react'
import { Comment } from '@/core/types/comment'
import { useAppSelector } from '@/core/lib/hooks'
import { commentService } from '@/core/lib/services/commentService'
import {
  useTranslations,
  useLocale,
} from '@/shared/components/providers/I18nProvider'
import { CommentTree } from './CommentTree'
import {
  aiCommentService,
  AI_PERSONA_HANDLES,
} from '@/core/lib/services/aiCommentService'
import { ideaService } from '@/core/lib/services/ideaService'

interface CommentsBlockProps {
  ideaId: string
}

const MAX_COMMENT_LENGTH = 3000

export function CommentsBlock({ ideaId }: CommentsBlockProps) {
  const t = useTranslations()
  const { locale } = useLocale()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [votingCommentId, setVotingCommentId] = useState<string | null>(null)
  const [highlightedCommentId, setHighlightedCommentId] = useState<
    string | null
  >(null)
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState<Map<string, string>>(new Map())
  const { user, profile } = useAppSelector(state => state.auth)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const newCommentRefs = useRef<Map<string, HTMLDivElement>>(new Map())
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionSuggestions, setMentionSuggestions] = useState<string[]>([])

  useEffect(() => {
    loadComments()
  }, [ideaId])

  // Apply user votes when comments are loaded or user becomes available
  useEffect(() => {
    if (comments.length > 0) {
      applyUserVotesToComments(comments).then(commentsWithVotes => {
        setComments(commentsWithVotes)
      })
    }
  }, [comments.length, user])

  const applyUserVotesToComments = async (commentsToUpdate: Comment[]) => {
    if (!user || commentsToUpdate.length === 0) return commentsToUpdate

    const allCommentIds: string[] = []
    const collectCommentIds = (comments: Comment[]) => {
      comments.forEach(comment => {
        allCommentIds.push(comment.id)
        if (comment.replies) {
          collectCommentIds(comment.replies)
        }
      })
    }
    collectCommentIds(commentsToUpdate)

    try {
      const userVotes = await commentService.getUserCommentVotes(allCommentIds)

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

      return applyUserVotes(commentsToUpdate)
    } catch (error) {
      console.error('Error fetching user comment votes:', error)
      return commentsToUpdate
    }
  }

  const loadComments = async () => {
    setLoading(true)
    try {
      const loadedComments = await commentService.getComments(ideaId)
      setComments(loadedComments)
    } catch (error) {
      console.error('Error loading comments:', error)
    } finally {
      setLoading(false)
    }
  }

  // Apply user votes when comments are loaded or user becomes available
  useEffect(() => {
    if (comments.length > 0) {
      applyUserVotesToComments(comments).then(commentsWithVotes => {
        setComments(commentsWithVotes)
      })
    }
  }, [comments.length, user])

  const handleUpvoteComment = async (commentId: string) => {
    if (!user) {
      toast.warning(t('auth.sign_in_to_vote'))
      return
    }
    if (votingCommentId) return // Prevent multiple simultaneous votes

    setVotingCommentId(commentId)

    // Optimistically update the UI
    setComments(prev =>
      updateCommentVoteOptimistically(prev, commentId, 'upvote')
    )

    try {
      const updatedComment = await commentService.toggleUpvoteComment(
        commentId,
        ideaId
      )
      updateCommentInState(commentId, updatedComment)
    } catch (error) {
      console.error('Error upvoting comment:', error)
      // Revert optimistic update on error
      setComments(prev =>
        updateCommentVoteOptimistically(prev, commentId, 'upvote')
      )
    } finally {
      setVotingCommentId(null)
    }
  }

  const handleDownvoteComment = async (commentId: string) => {
    if (!user) {
      toast.warning(t('auth.sign_in_to_vote'))
      return
    }
    if (votingCommentId) return // Prevent multiple simultaneous votes

    setVotingCommentId(commentId)

    // Optimistically update the UI
    setComments(prev =>
      updateCommentVoteOptimistically(prev, commentId, 'downvote')
    )

    try {
      const updatedComment = await commentService.toggleDownvoteComment(
        commentId,
        ideaId
      )
      updateCommentInState(commentId, updatedComment)
    } catch (error) {
      console.error('Error downvoting comment:', error)
      // Revert optimistic update on error
      setComments(prev =>
        updateCommentVoteOptimistically(prev, commentId, 'downvote')
      )
    } finally {
      setVotingCommentId(null)
    }
  }

  const updateCommentVoteOptimistically = (
    comments: Comment[],
    commentId: string,
    voteType: 'upvote' | 'downvote'
  ): Comment[] => {
    const updateCommentRecursive = (comments: Comment[]): Comment[] => {
      return comments.map(comment => {
        if (comment.id === commentId) {
          const wasUpvoted = comment.upvoted || false
          const wasDownvoted = comment.downvoted || false

          let newUpvoted = wasUpvoted
          let newDownvoted = wasDownvoted

          if (voteType === 'upvote') {
            if (wasUpvoted) {
              // Remove upvote
              newUpvoted = false
            } else {
              // Add upvote, remove downvote if present
              newUpvoted = true
              newDownvoted = false
            }
          } else if (voteType === 'downvote') {
            if (wasDownvoted) {
              // Remove downvote
              newDownvoted = false
            } else {
              // Add downvote, remove upvote if present
              newDownvoted = true
              newUpvoted = false
            }
          }

          return {
            ...comment,
            upvoted: newUpvoted,
            downvoted: newDownvoted,
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

    return updateCommentRecursive(comments)
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

    if (commentText.length > MAX_COMMENT_LENGTH) {
      toast.error(
        t('comments.character_limit').replace(
          '{limit}',
          MAX_COMMENT_LENGTH.toString()
        )
      )
      return
    }

    setSubmitting(true)
    setNewComment('')

    try {
      const authorName =
        profile?.full_name ||
        user?.user_metadata?.full_name ||
        user?.email ||
        'Anonymous'
      const authorImage = user?.user_metadata?.avatar_url || undefined

      const mentionedPersonas =
        aiCommentService.extractMentionedPersonas(commentText)

      const newCommentData = await commentService.addComment(
        ideaId,
        commentText,
        authorName,
        authorImage,
        replyingTo || undefined
      )

      // Try to handle AI mentions after comment is posted
      if (mentionedPersonas.length > 0) {
        try {
          const idea = await ideaService.getIdeaById(ideaId)
          if (idea) {
            await aiCommentService.handleMentionedPersonas(
              idea,
              comments,
              newCommentData,
              mentionedPersonas,
              user.id,
              locale as 'en' | 'es'
            )
          }
        } catch (aiError) {
          console.error('AI service error:', aiError)

          // Handle specific AI errors
          if (
            aiError instanceof Error &&
            aiError.message === 'AI_DAILY_LIMIT_EXCEEDED'
          ) {
            toast.error(
              t('ai.daily_limit_exceeded') ||
                'AI model has reached daily usage peak. Please try again later.'
            )
          } else {
            toast.error(
              t('ai.service_unavailable') ||
                'AI service is currently unavailable. Please try again later.'
            )
          }

          // Note: Comment is already posted, but user is notified of AI failure
        }
      }

      if (replyingTo) {
        setReplyingTo(null)
        setReplyText(new Map())
      }

      const updatedComments = await commentService.getComments(ideaId)

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

      const newCommentElement = updatedComments[0]
      if (newCommentElement) {
        setHighlightedCommentId(newCommentElement.id)
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            const commentElement = newCommentRefs.current.get(
              newCommentElement.id
            )
            if (commentElement) {
              const elementTop =
                commentElement.getBoundingClientRect().top + window.pageYOffset
              window.scrollTo({
                top: elementTop - 100,
                behavior: 'smooth',
              })
              setTimeout(() => {
                setHighlightedCommentId(null)
              }, 2000)
            }
          })
        })
      }
    } catch (error) {
      console.error('Error submitting comment:', error)
      // Restore the comment text if submission failed
      setNewComment(commentText)
      toast.error(
        t('comments.submit_error') ||
          'Failed to submit comment. Please try again.'
      )
    } finally {
      setSubmitting(false)
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
        <div className="flex flex-col gap-2">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={newComment}
                onChange={e => {
                  const value = e.target.value
                  if (value.length <= MAX_COMMENT_LENGTH) {
                    setNewComment(value)

                    const cursorPosition = e.target.selectionStart
                    const textBeforeCursor = value.substring(0, cursorPosition)
                    const lastAtSymbol = textBeforeCursor.lastIndexOf('@')

                    if (lastAtSymbol !== -1) {
                      const query = textBeforeCursor.substring(lastAtSymbol + 1)
                      if (query.length > 0 && !query.includes(' ')) {
                        const matches = Object.entries(AI_PERSONA_HANDLES)
                          .filter(([_, handle]) =>
                            handle
                              .toLowerCase()
                              .includes(`@${query.toLowerCase()}`)
                          )
                          .map(([_, handle]) => handle)

                        if (matches.length > 0) {
                          setMentionQuery(query)
                          setMentionSuggestions(matches)
                          setShowMentionSuggestions(true)
                        } else {
                          setShowMentionSuggestions(false)
                        }
                      } else {
                        setShowMentionSuggestions(false)
                      }
                    } else {
                      setShowMentionSuggestions(false)
                    }
                  }

                  if (textareaRef.current) {
                    textareaRef.current.style.height = 'auto'
                    textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
                  }
                }}
                style={{ color: '#000000' }}
                placeholder={t('comments.write_comment')}
                maxLength={MAX_COMMENT_LENGTH}
                className="w-full px-4 py-3 bg-gray-100 rounded-lg border border-border-color focus:outline-none focus:ring-2 focus:ring-accent resize-none overflow-hidden"
                rows={1}
              />
              {showMentionSuggestions && (
                <div className="absolute bottom-full mb-2 bg-white dark:bg-gray-800 border border-border-color rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
                  {mentionSuggestions.map(handle => (
                    <button
                      key={handle}
                      type="button"
                      onClick={() => {
                        const cursorPosition =
                          textareaRef.current?.selectionStart || 0
                        const textBeforeCursor = newComment.substring(
                          0,
                          cursorPosition
                        )
                        const lastAtSymbol = textBeforeCursor.lastIndexOf('@')
                        const textAfterCursor =
                          newComment.substring(cursorPosition)

                        const newText =
                          textBeforeCursor.substring(0, lastAtSymbol) +
                          handle +
                          ' ' +
                          textAfterCursor

                        setNewComment(newText)
                        setShowMentionSuggestions(false)
                        textareaRef.current?.focus()
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
                    >
                      <span className="text-accent font-medium">{handle}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={!newComment.trim() || submitting}
              className="px-6 py-3 bg-accent text-text-primary rounded-lg font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 self-start"
            >
              <ArrowUp className="w-4 h-4" />
              <span className="hidden md:inline">
                {submitting ? t('comments.posting') : t('comments.post')}
              </span>
            </button>
          </div>
          {/* Character count */}
          <div className="flex justify-end">
            <span
              className={`text-xs ${
                newComment.length > MAX_COMMENT_LENGTH * 0.9
                  ? 'text-red-500'
                  : 'text-text-secondary'
              }`}
            >
              {t('comments.characters_remaining').replace(
                '{count}',
                (MAX_COMMENT_LENGTH - newComment.length).toString()
              )}
            </span>
          </div>
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
            isVoting={votingCommentId}
            isDark={false}
          />
        </div>
      )}
    </div>
  )
}
