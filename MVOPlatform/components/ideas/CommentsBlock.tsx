'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Heart, ArrowUp, User, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react'
import Image from 'next/image'
import { formatDate } from '@/lib/utils/date'
import { Comment } from '@/lib/types/comment'
import { useSession } from 'next-auth/react'
import { commentService } from '@/lib/services/commentService'

interface CommentsBlockProps {
  ideaId: string
}

export function CommentsBlock({ ideaId }: CommentsBlockProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null)
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState<Map<string, string>>(new Map())
  const { data: session } = useSession()
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const newCommentRefs = useRef<Map<string, HTMLDivElement>>(new Map())

  useEffect(() => {
    loadComments()
  }, [ideaId])

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

  const handleLikeComment = async (commentId: string) => {
    try {
      const updatedComment = await commentService.toggleLikeComment(commentId, ideaId)
      updateCommentInState(commentId, updatedComment)
    } catch (error) {
      console.error('Error liking comment:', error)
    }
  }

  const handleUpvoteComment = async (commentId: string) => {
    try {
      const updatedComment = await commentService.toggleUpvoteComment(commentId, ideaId)
      updateCommentInState(commentId, updatedComment)
    } catch (error) {
      console.error('Error upvoting comment:', error)
    }
  }

  const updateCommentInState = (commentId: string, updatedComment: Comment) => {
    setComments((prev) =>
      prev.map((comment) => {
        if (comment.id === commentId) {
          return updatedComment
        }
        if (comment.replies) {
          const updatedReplies = comment.replies.map((reply) =>
            reply.id === commentId ? updatedComment : reply
          )
          return { ...comment, replies: updatedReplies }
        }
        return comment
      })
    )
  }

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((prev) => {
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

    setSubmitting(true)
    try {
      const authorName = session?.user?.name || session?.user?.email || 'Anonymous'
      const authorImage = session?.user?.image || undefined

      await commentService.addComment(ideaId, replyContent, authorName, authorImage, parentId)
      
      const updatedComments = await commentService.getComments(ideaId)
      setComments(updatedComments)
      
      setReplyText((prev) => {
        const newMap = new Map(prev)
        newMap.delete(parentId)
        return newMap
      })
      
      if (!expandedReplies.has(parentId)) {
        setExpandedReplies((prev) => new Set(prev).add(parentId))
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

    const commentText = newComment.trim()
    setSubmitting(true)
    setNewComment('') // Clear textarea immediately for better UX
    
    try {
      // Use session data if available, otherwise use anonymous
      const authorName = session?.user?.name || session?.user?.email || 'Anonymous'
      const authorImage = session?.user?.image || undefined

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
      setComments(updatedComments)
      
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
              const elementTop = commentElement.getBoundingClientRect().top + window.pageYOffset
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
      <h2 className="text-heading-2 mb-6">Comments</h2>

      {/* Comment Form */}
      <form onSubmit={handleSubmitComment} className="mb-8">
        <div className="flex gap-4">
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={newComment}
              onChange={(e) => {
                setNewComment(e.target.value)
                // Auto-resize textarea
                if (textareaRef.current) {
                  textareaRef.current.style.height = 'auto'
                  textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
                }
              }}
              placeholder="Write a comment..."
              className="w-full px-4 py-3 bg-gray-100 rounded-lg border border-border-color focus:outline-none focus:ring-2 focus:ring-accent resize-none overflow-hidden"
              style={{ minHeight: '3rem', maxHeight: '20rem', color: '#ffffff' }}
              rows={1}
            />
          </div>
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="px-6 py-3 bg-accent text-text-primary rounded-lg font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArrowUp className="w-4 h-4" />
            <span className="hidden md:inline">{submitting ? 'Posting...' : 'Post'}</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="text-text-secondary">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-text-secondary text-center py-8">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment, index) => (
            <motion.div
              key={comment.id}
              ref={(el) => {
                if (el) {
                  newCommentRefs.current.set(comment.id, el)
                }
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`p-4 rounded-lg transition-colors duration-300 ${
                highlightedCommentId === comment.id ? 'bg-accent/20 ring-2 ring-accent' : 'bg-gray-100'
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {comment.authorImage ? (
                    <Image
                      src={comment.authorImage}
                      alt={comment.author}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-text-primary font-semibold">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-semibold text-text-primary">@{comment.author}</span>
                    <span className="text-text-secondary text-sm">•</span>
                    <span className="text-text-secondary text-sm">{formatDate(comment.createdAt)}</span>
                    {comment.usefulnessScore > 0 && (
                      <>
                        <span className="text-text-secondary text-sm">•</span>
                        <span className="text-xs px-2 py-0.5 bg-accent/20 text-accent rounded-full">
                          ⭐ {comment.usefulnessScore.toFixed(1)}
                        </span>
                      </>
                    )}
                  </div>
                  <p className="text-text-secondary mb-3 whitespace-pre-wrap break-words">{comment.content}</p>
                  
                  {/* Actions */}
                  <div className="flex items-center gap-4 flex-wrap">
                    <button
                      onClick={() => handleUpvoteComment(comment.id)}
                      className={`flex items-center gap-1.5 text-sm transition-colors ${
                        comment.upvoted
                          ? 'text-accent'
                          : 'text-text-secondary hover:text-accent'
                      }`}
                    >
                      <ArrowUp className={`w-4 h-4 ${comment.upvoted ? 'fill-current' : ''}`} />
                      <span>{comment.upvotes || 0}</span>
                    </button>
                    
                    <button
                      onClick={() => handleLikeComment(comment.id)}
                      className={`flex items-center gap-1.5 text-sm transition-colors ${
                        comment.liked
                          ? 'text-red-500'
                          : 'text-text-secondary hover:text-red-500'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${comment.liked ? 'fill-current' : ''}`} />
                      <span>{comment.likes}</span>
                    </button>

                    <button
                      onClick={() => {
                        setReplyingTo(replyingTo === comment.id ? null : comment.id)
                        if (!replyText.has(comment.id)) {
                          setReplyText((prev) => new Map(prev).set(comment.id, ''))
                        }
                      }}
                      className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Reply</span>
                    </button>

                    {comment.replies && comment.replies.length > 0 && (
                      <button
                        onClick={() => toggleReplies(comment.id)}
                        className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-accent transition-colors"
                      >
                        {expandedReplies.has(comment.id) ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                        <span>{comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}</span>
                      </button>
                    )}
                  </div>

                  {/* Reply Form */}
                  {replyingTo === comment.id && (
                    <form
                      onSubmit={(e) => handleReplySubmit(comment.id, e)}
                      className="mt-3 pt-3 border-t border-border-color"
                    >
                      <div className="flex gap-2">
                        <textarea
                          value={replyText.get(comment.id) || ''}
                          onChange={(e) => {
                            setReplyText((prev) => new Map(prev).set(comment.id, e.target.value))
                            // Auto-resize
                            if (e.target) {
                              e.target.style.height = 'auto'
                              e.target.style.height = `${e.target.scrollHeight}px`
                            }
                          }}
                          placeholder="Write a reply..."
                          className="flex-1 px-3 py-2 bg-gray-50 rounded-lg border border-border-color focus:outline-none focus:ring-2 focus:ring-accent resize-none overflow-hidden text-sm"
                          style={{ minHeight: '2rem', maxHeight: '10rem', color: '#ffffff' }}
                          rows={1}
                        />
                        <button
                          type="submit"
                          disabled={!replyText.get(comment.id)?.trim() || submitting}
                          className="px-4 py-2 bg-accent text-text-primary rounded-lg font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Replies */}
                  {expandedReplies.has(comment.id) && comment.replies && comment.replies.length > 0 && (
                    <div className="mt-4 ml-6 space-y-4 border-l-2 border-border-color pl-4">
                      {comment.replies.map((reply) => (
                        <div key={reply.id} className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            {reply.authorImage ? (
                              <Image
                                src={reply.authorImage}
                                alt={reply.author}
                                width={32}
                                height={32}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-text-primary font-semibold">
                                <User className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-semibold text-sm text-text-primary">@{reply.author}</span>
                              <span className="text-text-secondary text-xs">•</span>
                              <span className="text-text-secondary text-xs">{formatDate(reply.createdAt)}</span>
                              {reply.usefulnessScore > 0 && (
                                <>
                                  <span className="text-text-secondary text-xs">•</span>
                                  <span className="text-xs px-1.5 py-0.5 bg-accent/20 text-accent rounded-full">
                                    ⭐ {reply.usefulnessScore.toFixed(1)}
                                  </span>
                                </>
                              )}
                            </div>
                            <p className="text-text-secondary text-sm mb-2 whitespace-pre-wrap break-words">{reply.content}</p>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleUpvoteComment(reply.id)}
                                className={`flex items-center gap-1 text-xs transition-colors ${
                                  reply.upvoted
                                    ? 'text-accent'
                                    : 'text-text-secondary hover:text-accent'
                                }`}
                              >
                                <ArrowUp className={`w-3 h-3 ${reply.upvoted ? 'fill-current' : ''}`} />
                                <span>{reply.upvotes || 0}</span>
                              </button>
                              <button
                                onClick={() => handleLikeComment(reply.id)}
                                className={`flex items-center gap-1 text-xs transition-colors ${
                                  reply.liked
                                    ? 'text-red-500'
                                    : 'text-text-secondary hover:text-red-500'
                                }`}
                              >
                                <Heart className={`w-3 h-3 ${reply.liked ? 'fill-current' : ''}`} />
                                <span>{reply.likes}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

