'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowUp,
  ArrowDown,
  MessageSquare,
  Share2,
  DollarSign,
} from 'lucide-react'
import Image from 'next/image'
import { formatDate } from '@/lib/utils/date'
import { UI_LABELS } from '@/lib/constants/ui'
import { Idea } from '@/lib/types/idea'
import { useVideoPlayer } from '@/hooks/useVideoPlayer'
import { TikTokComments } from './TikTokComments'
import { commentService } from '@/lib/services/commentService'
import { VoteDistributionBar } from '@/components/ui/VoteDistributionBar'
import { useAppSelector } from '@/lib/hooks'
import { ideaService } from '@/lib/services/ideaService'

interface ForYouIdeaCardProps {
  idea: Idea
  isActive: boolean
  initialUserVotes?: {
    use: boolean
    dislike: boolean
    pay: boolean
  }
}

export function ForYouIdeaCard({
  idea,
  isActive,
  initialUserVotes,
}: ForYouIdeaCardProps) {
  const [currentIdea, setCurrentIdea] = useState(idea)
  const [isVoting, setIsVoting] = useState(false)
  const [userVote, setUserVote] = useState<{
    use: boolean
    dislike: boolean
    pay: boolean
  }>(
    initialUserVotes || {
      use: false,
      dislike: false,
      pay: false,
    }
  )
  const [commentCount, setCommentCount] = useState(0)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const previousIdeaIdRef = useRef<string>(idea.id)
  const { isAuthenticated } = useAppSelector(state => state.auth)

  // Update user votes when initialUserVotes prop changes
  useEffect(() => {
    if (initialUserVotes) {
      setUserVote(initialUserVotes)
    }
  }, [initialUserVotes])

  // Use reusable video player hook with start time at 10 seconds
  const videoRef = useVideoPlayer({
    videoSrc: currentIdea.video,
    isActive,
    startTime: 45,
  })

  // Load comment count
  useEffect(() => {
    commentService.getCommentCount(currentIdea.id).then(setCommentCount)
  }, [currentIdea.id])

  // Close comments panel when idea changes (user scrolled to different idea)
  useEffect(() => {
    if (previousIdeaIdRef.current !== currentIdea.id) {
      setCommentsOpen(false)
      previousIdeaIdRef.current = currentIdea.id
    }
  }, [currentIdea.id])

  const handleVote = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      alert('Please sign in to vote')
      return
    }
    if (isVoting) return

    setIsVoting(true)
    try {
      const updatedIdea = await ideaService.toggleVote(currentIdea.id, 'use')
      setCurrentIdea(updatedIdea)
      // For use/dislike, toggle the specific vote and ensure the other is false
      setUserVote(prev => ({
        ...prev,
        use: !prev.use,
        dislike: false, // ensure dislike is false when voting up
        pay: prev.pay, // pay remains unchanged
      }))
    } catch (error) {
      console.error('Error voting:', error)
    } finally {
      setIsVoting(false)
    }
  }

  const handleWouldPay = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      alert('Please sign in to vote')
      return
    }
    if (isVoting) return

    setIsVoting(true)
    try {
      const updatedIdea = await ideaService.toggleVote(currentIdea.id, 'pay')
      setCurrentIdea(updatedIdea)
      // For pay, just toggle it
      setUserVote(prev => ({
        ...prev,
        pay: !prev.pay,
      }))
    } catch (error) {
      console.error('Error voting:', error)
    } finally {
      setIsVoting(false)
    }
  }

  const handleDownVote = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      alert('Please sign in to vote')
      return
    }
    if (isVoting) return

    setIsVoting(true)
    try {
      const updatedIdea = await ideaService.toggleVote(
        currentIdea.id,
        'dislike'
      )
      setCurrentIdea(updatedIdea)
      // For use/dislike, toggle the specific vote and ensure the other is false
      setUserVote(prev => ({
        ...prev,
        use: false, // ensure use is false when voting down
        dislike: !prev.dislike,
        pay: prev.pay, // pay remains unchanged
      }))
    } catch (error) {
      console.error('Error voting:', error)
    } finally {
      setIsVoting(false)
    }
  }

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCommentsOpen(prev => !prev)
  }

  const voted = userVote.use
  const votedDown = userVote.dislike
  const wouldPay = userVote.pay
  const voteCount = currentIdea.votes

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen snap-start snap-mandatory bg-black overflow-hidden"
    >
      {/* Background image/video area */}
      <div className="absolute inset-0">
        {currentIdea.video ? (
          <>
            <video
              ref={videoRef}
              src={currentIdea.video}
              className="absolute inset-0 w-full h-full object-cover"
              loop
              muted
              playsInline
              autoPlay={isActive}
              preload={isActive ? 'auto' : 'none'}
            />
            {/* Black fade from bottom to top for text visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
          </>
        ) : currentIdea.image ? (
          <>
            <Image
              src={currentIdea.image}
              alt={currentIdea.title}
              fill
              className="object-cover"
              priority={isActive}
              loading={isActive ? 'eager' : 'lazy'}
            />
            {/* Black fade from bottom to top for text visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
          </>
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-accent/20 via-background to-accent/10">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-6 max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                  {currentIdea.title}
                </h2>
                <p className="text-lg md:text-xl text-text-secondary leading-relaxed">
                  {currentIdea.description}
                </p>
              </div>
            </div>
            {/* Black fade from bottom to top for text visibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
          </div>
        )}
      </div>

      {/* Top section - Score and tags */}
      <div className="absolute top-0 left-0 right-0 z-10 flex items-start justify-between p-4 md:p-6 pointer-events-none">
        <div className="flex flex-wrap gap-2 pointer-events-auto">
          {currentIdea.tags.map(tag => (
            <span
              key={tag}
              className="px-3 py-1 text-xs font-medium text-white bg-black/50 backdrop-blur-sm rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
        <div className="text-right flex-shrink-0 pointer-events-auto relative">
          <div className="text-4xl md:text-5xl font-bold text-accent drop-shadow-lg">
            {currentIdea.score}
          </div>
          <div className="text-xs text-white/80 drop-shadow-md">
            {UI_LABELS.SCORE}
          </div>
        </div>
      </div>

      {/* Bottom section - Title, description, and actions - Fixed at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
        {/* Mobile: Stack vertically with text at bottom */}
        <div className="md:hidden px-4 pb-9 w-full">
          <div className="flex items-end justify-between gap-3 w-full">
            {/* Left side - Text content */}
            <div className="flex-1 text-white min-w-0 pointer-events-auto pb-0">
              <h3 className="text-lg font-bold mb-1 drop-shadow-lg">
                {currentIdea.title}
              </h3>
              {/* Vote Distribution Bar - Between title and description */}
              <div className="mb-1 flex justify-start pointer-events-auto">
                <div className="w-[80%]">
                  <VoteDistributionBar
                    votes={currentIdea.votesByType}
                    orientation="horizontal"
                    thickness="extra-thin"
                  />
                </div>
              </div>
              <p className="text-sm text-white/90 mb-1 line-clamp-2 drop-shadow-md">
                {currentIdea.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-white/80">
                <span>@{currentIdea.author}</span>
                <span>•</span>
                <span>{formatDate(currentIdea.createdAt)}</span>
              </div>
            </div>

            {/* Right side - Action buttons */}
            <div className="flex flex-col items-center gap-3 flex-shrink-0 pointer-events-auto pb-4">
              <motion.button
                onClick={handleVote}
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-full transition-colors ${
                  voted
                    ? 'bg-accent text-text-primary'
                    : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
                }`}
              >
                <ArrowUp className="w-5 h-5" />
                <span className="text-xs font-semibold">
                  {currentIdea.votesByType.use}
                </span>
              </motion.button>

              <motion.button
                onClick={handleDownVote}
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-full transition-colors ${
                  votedDown
                    ? 'bg-red-500 text-white'
                    : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
                }`}
                title="Downvote"
              >
                <ArrowDown className="w-5 h-5" />
                <span className="text-xs font-semibold">
                  {currentIdea.votesByType.dislike}
                </span>
              </motion.button>

              <motion.button
                onClick={handleWouldPay}
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-full transition-colors ${
                  wouldPay
                    ? 'bg-accent-alt text-white'
                    : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
                }`}
                title="I'd pay for it"
              >
                <DollarSign
                  className={`w-5 h-5 ${wouldPay ? 'fill-current' : ''}`}
                />
                <span className="text-xs font-semibold">
                  {currentIdea.votesByType.pay}
                </span>
              </motion.button>

              <motion.button
                onClick={handleCommentClick}
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-full transition-colors ${
                  commentsOpen
                    ? 'bg-accent text-text-primary'
                    : currentIdea.status_flag === 'active_discussion'
                      ? 'bg-accent/20 text-accent hover:bg-accent/30'
                      : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
                }`}
                animate={
                  currentIdea.status_flag === 'active_discussion' &&
                  !commentsOpen
                    ? {
                        opacity: [0.7, 1, 0.7],
                      }
                    : {}
                }
                transition={{
                  duration: 3,
                  repeat:
                    currentIdea.status_flag === 'active_discussion' &&
                    !commentsOpen
                      ? Infinity
                      : 0,
                  ease: 'easeInOut',
                }}
              >
                <MessageSquare
                  className={
                    currentIdea.status_flag === 'active_discussion'
                      ? 'w-[21px] h-[21px]'
                      : 'w-5 h-5'
                  }
                />
                <span className="text-xs font-semibold">{commentCount}</span>
              </motion.button>

              <button className="flex flex-col items-center gap-1 p-2.5 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop: Horizontal layout */}
        <div className="hidden md:block px-6 pb-6 w-full">
          <div className="flex flex-row items-end justify-between gap-4 w-full">
            {/* Left side - Text content */}
            <div className="flex-1 text-white min-w-0 pointer-events-auto">
              <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">
                {currentIdea.title}
              </h3>
              {/* Vote Distribution Bar - Between title and description */}
              <div className="mb-2 flex justify-start pointer-events-auto">
                <div className="w-[80%]">
                  <VoteDistributionBar
                    votes={currentIdea.votesByType}
                    orientation="horizontal"
                    thickness="extra-thin"
                  />
                </div>
              </div>
              <p className="text-base text-white/90 mb-2 line-clamp-2 drop-shadow-md">
                {currentIdea.description}
              </p>
              <div className="flex items-center gap-3 text-sm text-white/80">
                <span>@{currentIdea.author}</span>
                <span>•</span>
                <span>{formatDate(currentIdea.createdAt)}</span>
              </div>
            </div>

            {/* Right side - Action buttons */}
            <div className="flex flex-col items-center gap-4 flex-shrink-0 pointer-events-auto">
              <motion.button
                onClick={handleVote}
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center gap-1 p-3 rounded-full transition-colors ${
                  voted
                    ? 'bg-accent text-text-primary'
                    : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
                }`}
              >
                <ArrowUp className="w-6 h-6" />
                <span className="text-xs font-semibold">
                  {currentIdea.votesByType.use}
                </span>
              </motion.button>

              <motion.button
                onClick={handleDownVote}
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center gap-1 p-3 rounded-full transition-colors ${
                  votedDown
                    ? 'bg-red-500 text-white'
                    : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
                }`}
                title="Downvote"
              >
                <ArrowDown className="w-6 h-6" />
                <span className="text-xs font-semibold">
                  {currentIdea.votesByType.dislike}
                </span>
              </motion.button>

              <motion.button
                onClick={handleWouldPay}
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center gap-1 p-3 rounded-full transition-colors ${
                  wouldPay
                    ? 'bg-accent-alt text-white'
                    : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
                }`}
                title="I'd pay for it"
              >
                <DollarSign
                  className={`w-6 h-6 ${wouldPay ? 'fill-current' : ''}`}
                />
                <span className="text-xs font-semibold">
                  {currentIdea.votesByType.pay}
                </span>
              </motion.button>

              <motion.button
                onClick={handleCommentClick}
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center gap-1 p-3 rounded-full transition-colors ${
                  commentsOpen
                    ? 'bg-accent text-text-primary'
                    : currentIdea.status_flag === 'active_discussion'
                      ? 'bg-accent/20 text-accent hover:bg-accent/30'
                      : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
                }`}
                animate={
                  currentIdea.status_flag === 'active_discussion' &&
                  !commentsOpen
                    ? {
                        opacity: [0.7, 1, 0.7],
                      }
                    : {}
                }
                transition={{
                  duration: 3,
                  repeat:
                    currentIdea.status_flag === 'active_discussion' &&
                    !commentsOpen
                      ? Infinity
                      : 0,
                  ease: 'easeInOut',
                }}
              >
                <MessageSquare
                  className={
                    currentIdea.status_flag === 'active_discussion'
                      ? 'w-[25px] h-[25px]'
                      : 'w-6 h-6'
                  }
                />
                <span className="text-xs font-semibold">{commentCount}</span>
              </motion.button>

              <button className="flex flex-col items-center gap-1 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors">
                <Share2 className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Panel */}
      <TikTokComments
        ideaId={currentIdea.id}
        isOpen={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        onCommentCountChange={setCommentCount}
      />
    </div>
  )
}
