'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ArrowUp, X, User, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react'
import Image from 'next/image'
import { formatDate } from '@/lib/utils/date'
import { Comment } from '@/lib/types/comment'
import { useSession } from 'next-auth/react'
import { commentService } from '@/lib/services/commentService'

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
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [panelHeight, setPanelHeight] = useState<'half' | 'full'>('half') // 'half' = 50vh, 'full' = 100vh
  const [highlightedCommentId, setHighlightedCommentId] = useState<string | null>(null)
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState<Map<string, string>>(new Map())
  const { data: session } = useSession()
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
      setComments(loadedComments)
      onCommentCountChange?.(loadedComments.length)
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
        // Check if it's a reply
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
      onCommentCountChange?.(updatedComments.length)
      
      // Clear reply text
      setReplyText((prev) => {
        const newMap = new Map(prev)
        newMap.delete(parentId)
        return newMap
      })
      
      // Expand replies if not already expanded
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
    setNewComment('') // Clear input immediately for better UX
    
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
                <h2 className="text-lg font-semibold text-white">Comments</h2>
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
              <h2 className="text-lg font-semibold text-white">Comments</h2>
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
              className="flex-1 overflow-y-auto px-4 py-2 scrollbar-hide"
              onTouchStart={(e) => {
                // Prevent drag when scrolling in comments list
                e.stopPropagation()
              }}
              onTouchMove={(e) => {
                // Allow scroll to take priority over drag
                const element = commentsListRef.current
                if (element) {
                  const { scrollTop, scrollHeight, clientHeight } = element
                  const isAtTop = scrollTop === 0
                  const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1
                  
                  // Only prevent drag if we're scrolling within the list
                  if (!isAtTop && !isAtBottom) {
                    e.stopPropagation()
                  }
                }
              }}
            >
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-white/60">Loading comments...</div>
                </div>
              ) : comments.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-white/60">
                    <p className="text-lg mb-2">No comments yet</p>
                    <p className="text-sm">Be the first to comment!</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pb-4">
                  {comments.map((comment) => (
                    <motion.div
                      key={comment.id}
                      ref={(el) => {
                        if (el) {
                          newCommentRefs.current.set(comment.id, el)
                        }
                      }}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{
                        opacity: 1,
                        x: 0,
                      }}
                      transition={{ duration: 0.4 }}
                      className={`flex gap-3 p-2 rounded-lg -m-2 transition-all duration-300 ${
                        highlightedCommentId === comment.id
                          ? 'bg-accent/20 ring-2 ring-accent'
                          : ''
                      }`}
                    >
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        {comment.authorImage ? (
                          <Image
                            src={comment.authorImage}
                            alt={comment.author}
                            width={36}
                            height={36}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
                            <User className="w-5 h-5 text-text-primary" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="mb-1 flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-white">
                            @{comment.author}
                          </span>
                          <span className="text-xs text-white/60">
                            {formatDate(comment.createdAt)}
                          </span>
                          {comment.usefulnessScore > 0 && (
                            <>
                              <span className="text-xs text-white/60">•</span>
                              <span className="text-xs px-1.5 py-0.5 bg-accent/30 text-accent rounded-full">
                                ⭐ {comment.usefulnessScore.toFixed(1)}
                              </span>
                            </>
                          )}
                        </div>
                        <p className="text-sm text-white/90 mb-2 whitespace-pre-wrap break-words">
                          {comment.content}
                        </p>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-3 flex-wrap">
                          <button
                            onClick={() => handleUpvoteComment(comment.id)}
                            className={`flex items-center gap-1 text-xs transition-colors ${
                              comment.upvoted
                                ? 'text-accent'
                                : 'text-white/60 hover:text-accent'
                            }`}
                          >
                            <ArrowUp className={`w-3.5 h-3.5 ${comment.upvoted ? 'fill-current' : ''}`} />
                            <span>{comment.upvotes || 0}</span>
                          </button>
                          
                          <button
                            onClick={() => handleLikeComment(comment.id)}
                            className={`flex items-center gap-1 text-xs transition-colors ${
                              comment.liked
                                ? 'text-red-500'
                                : 'text-white/60 hover:text-red-500'
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${comment.liked ? 'fill-current' : ''}`} />
                            <span>{comment.likes}</span>
                          </button>

                          <button
                            onClick={() => {
                              setReplyingTo(replyingTo === comment.id ? null : comment.id)
                              if (!replyText.has(comment.id)) {
                                setReplyText((prev) => new Map(prev).set(comment.id, ''))
                              }
                            }}
                            className="flex items-center gap-1 text-xs text-white/60 hover:text-accent transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Reply</span>
                          </button>

                          {comment.replies && comment.replies.length > 0 && (
                            <button
                              onClick={() => toggleReplies(comment.id)}
                              className="flex items-center gap-1 text-xs text-white/60 hover:text-accent transition-colors"
                            >
                              {expandedReplies.has(comment.id) ? (
                                <ChevronUp className="w-3.5 h-3.5" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5" />
                              )}
                              <span>{comment.replies.length}</span>
                            </button>
                          )}
                        </div>

                        {/* Reply Form */}
                        {replyingTo === comment.id && (
                          <form
                            onSubmit={(e) => handleReplySubmit(comment.id, e)}
                            className="mt-2 pt-2 border-t border-white/10"
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
                                className="flex-1 px-3 py-1.5 bg-white/10 placeholder-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent resize-none overflow-hidden text-sm"
                                style={{ minHeight: '1.5rem', maxHeight: '8rem', color: '#000000' }}
                                rows={1}
                              />
                              <button
                                type="submit"
                                disabled={!replyText.get(comment.id)?.trim() || submitting}
                                className="px-3 py-1.5 bg-accent text-text-primary rounded-lg font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </form>
                        )}

                        {/* Replies */}
                        {expandedReplies.has(comment.id) && comment.replies && comment.replies.length > 0 && (
                          <div className="mt-3 ml-4 space-y-3 border-l-2 border-white/10 pl-3">
                            {comment.replies.map((reply) => (
                              <div key={reply.id} className="flex items-start gap-2">
                                <div className="flex-shrink-0">
                                  {reply.authorImage ? (
                                    <Image
                                      src={reply.authorImage}
                                      alt={reply.author}
                                      width={28}
                                      height={28}
                                      className="rounded-full"
                                    />
                                  ) : (
                                    <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center">
                                      <User className="w-4 h-4 text-text-primary" />
                                    </div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                                    <span className="text-xs font-semibold text-white">@{reply.author}</span>
                                    <span className="text-xs text-white/50">{formatDate(reply.createdAt)}</span>
                                    {reply.usefulnessScore > 0 && (
                                      <>
                                        <span className="text-xs text-white/50">•</span>
                                        <span className="text-xs px-1 py-0.5 bg-accent/30 text-accent rounded-full">
                                          ⭐ {reply.usefulnessScore.toFixed(1)}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                  <p className="text-xs text-white/80 mb-1.5 whitespace-pre-wrap break-words">{reply.content}</p>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => handleUpvoteComment(reply.id)}
                                      className={`flex items-center gap-1 text-xs transition-colors ${
                                        reply.upvoted
                                          ? 'text-accent'
                                          : 'text-white/50 hover:text-accent'
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
                                          : 'text-white/50 hover:text-red-500'
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
                    </motion.div>
                  ))}
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
                  onChange={(e) => {
                    setNewComment(e.target.value)
                    // Auto-resize textarea
                    if (inputRef.current) {
                      inputRef.current.style.height = 'auto'
                      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`
                    }
                  }}
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-2 bg-white/10 placeholder-white/50 rounded-full focus:outline-none focus:ring-2 focus:ring-accent resize-none overflow-hidden"
                  style={{ color: '#000000', minHeight: '2.5rem', maxHeight: '10rem' }}
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
