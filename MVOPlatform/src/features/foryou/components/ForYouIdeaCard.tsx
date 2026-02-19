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
import { formatDate } from '@/core/lib/utils/date'
import { Idea } from '@/core/types/idea'
import { useVideoPlayer } from '@/core/hooks/useVideoPlayer'
import { useMediaValidation } from '@/core/hooks/useMediaValidation'
import { TikTokComments } from './TikTokComments'
import { commentService } from '@/core/lib/services/commentService'
import { VoteDistributionBar } from '@/shared/components/ui/VoteDistributionBar'
import { useAppSelector } from '@/core/lib/hooks'
import { ideaService } from '@/core/lib/services/ideaService'
import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner'
import { toast } from 'sonner'

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
  const t = useTranslations()
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
  const containerRef = useRef<HTMLDivElement>(null)
  const previousIdeaIdRef = useRef<string>(idea.id)
  const { isAuthenticated } = useAppSelector(state => state.auth)

  // Update user votes when initialUserVotes prop changes
  useEffect(() => {
    if (initialUserVotes) {
      setUserVote(initialUserVotes)
    }
  }, [initialUserVotes])

  // Use media validation hook
  const validCardMedia = useMediaValidation(currentIdea)

  // Use reusable video player hook
  const videoRef = useVideoPlayer({
    videoSrc: validCardMedia.video,
    isActive,
    startTime: 45,
  })

  // Load comment count
  useEffect(() => {
    commentService.getCommentCount(currentIdea.id).then(setCommentCount)
  }, [currentIdea.id])

  // Close comments panel when idea changes
  useEffect(() => {
    if (previousIdeaIdRef.current !== currentIdea.id) {
      setCommentsOpen(false)
      previousIdeaIdRef.current = currentIdea.id
    }
  }, [currentIdea.id])

  // Derived values
  const voted = userVote.use
  const downvoted = userVote.dislike
  const wouldPay = userVote.pay

  const handleVote = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      toast.warning(t('auth.sign_in_to_vote'))
      return
    }
    if (isVoting) return

    // Optimistic update
    const previousIdea = currentIdea
    const previousUserVote = userVote
    const isRemovingVote = userVote.use

    setIsVoting(true)
    setCurrentIdea(prev => ({
      ...prev,
      votes: isRemovingVote ? prev.votes - 1 : prev.votes + 1,
      votesByType: {
        ...prev.votesByType,
        use: isRemovingVote
          ? prev.votesByType.use - 1
          : prev.votesByType.use + 1,
      },
    }))
    setUserVote(prev => ({
      ...prev,
      use: !prev.use,
      dislike: false,
    }))

    try {
      const updatedIdea = await ideaService.toggleVote(currentIdea.id, 'use')
      setCurrentIdea(updatedIdea)
    } catch (error) {
      // Rollback on error
      setCurrentIdea(previousIdea)
      setUserVote(previousUserVote)
      console.error('Error voting:', error)
      toast.error(t('actions.error_voting'))
    } finally {
      setIsVoting(false)
    }
  }

  const handleWouldPay = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      toast.warning(t('auth.sign_in_to_vote'))
      return
    }
    if (isVoting) return

    const previousIdea = currentIdea
    const previousUserVote = userVote
    const isRemovingVote = userVote.pay

    setIsVoting(true)
    setCurrentIdea(prev => ({
      ...prev,
      votes: isRemovingVote ? prev.votes - 1 : prev.votes + 1,
      votesByType: {
        ...prev.votesByType,
        pay: isRemovingVote
          ? prev.votesByType.pay - 1
          : prev.votesByType.pay + 1,
      },
    }))
    setUserVote(prev => ({
      ...prev,
      pay: !prev.pay,
    }))

    try {
      const updatedIdea = await ideaService.toggleVote(currentIdea.id, 'pay')
      setCurrentIdea(updatedIdea)
    } catch (error) {
      setCurrentIdea(previousIdea)
      setUserVote(previousUserVote)
      console.error('Error voting:', error)
      toast.error(t('actions.error_voting'))
    } finally {
      setIsVoting(false)
    }
  }

  const handleDownVote = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!isAuthenticated) {
      toast.warning(t('auth.sign_in_to_vote'))
      return
    }
    if (isVoting) return

    const previousIdea = currentIdea
    const previousUserVote = userVote
    const isRemovingVote = userVote.dislike

    setIsVoting(true)
    setCurrentIdea(prev => ({
      ...prev,
      votes: isRemovingVote ? prev.votes - 1 : prev.votes + 1,
      votesByType: {
        ...prev.votesByType,
        dislike: isRemovingVote
          ? prev.votesByType.dislike - 1
          : prev.votesByType.dislike + 1,
      },
    }))
    setUserVote(prev => ({
      ...prev,
      use: false,
      dislike: !prev.dislike,
    }))

    try {
      const updatedIdea = await ideaService.toggleVote(
        currentIdea.id,
        'dislike'
      )
      setCurrentIdea(updatedIdea)
    } catch (error) {
      setCurrentIdea(previousIdea)
      setUserVote(previousUserVote)
      console.error('Error voting:', error)
      toast.error(t('actions.error_voting'))
    } finally {
      setIsVoting(false)
    }
  }

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCommentsOpen(prev => !prev)
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen snap-start snap-mandatory bg-[var(--background)] overflow-hidden"
    >
      {/* Background image/video area */}
      <div className="absolute inset-0">
        {validCardMedia.video ? (
          <>
            <video
              ref={videoRef}
              src={validCardMedia.video}
              className="absolute inset-0 w-full h-full object-cover"
              loop
              muted
              playsInline
              autoPlay={isActive}
              preload={isActive ? 'auto' : 'none'}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
          </>
        ) : validCardMedia.image ? (
          <>
            <Image
              src={validCardMedia.image}
              alt={currentIdea.title}
              fill
              className="object-cover"
              priority={isActive}
              loading={isActive ? 'eager' : 'lazy'}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent pointer-events-none" />
          </>
        ) : (
          <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-accent/20 via-background to-accent/10">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center px-6 max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-bold text-text-primary mb-4">
                  {currentIdea.title.length > 10
                    ? `${currentIdea.title.substring(0, 10)}...`
                    : currentIdea.title}
                </h2>
                <p className="text-lg md:text-xl text-text-secondary leading-relaxed">
                  {currentIdea.description.length > 50
                    ? `${currentIdea.description.substring(0, 50)}...`
                    : currentIdea.description}
                </p>
              </div>
            </div>
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
              className="px-3 py-1 text-xs font-medium text-gray-600 bg-slate-100 backdrop-blur-sm rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
        <div className="text-right flex-shrink-0 pointer-events-auto relative">
          <div className="text-4xl md:text-5xl font-bold text-accent drop-shadow-lg">
            {currentIdea.score}
          </div>
          <div className="text-sm text-white drop-shadow-md mr-2">
            {t('common.score')}
          </div>
        </div>
      </div>

      {/* Bottom section */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
        {/* Mobile */}
        <div className="md:hidden px-4 pb-9 w-full">
          <div className="flex items-end justify-between gap-3 w-full">
            <div className="flex-1 text-white min-w-0 pointer-events-auto pb-0">
              <h3 className="text-lg font-bold mb-1 drop-shadow-lg">
                {currentIdea.title.length > 10
                  ? `${currentIdea.title.substring(0, 10)}...`
                  : currentIdea.title}
              </h3>
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
                {currentIdea.description.length > 50
                  ? `${currentIdea.description.substring(0, 50)}...`
                  : currentIdea.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-white/80">
                <span>
                  @
                  {currentIdea.anonymous
                    ? t('common.anonymous')
                    : currentIdea.author}
                </span>
                <span>•</span>
                <span>{formatDate(currentIdea.createdAt)}</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3 flex-shrink-0 pointer-events-auto pb-4">
              <motion.button
                onClick={handleVote}
                whileTap={{ scale: 0.9 }}
                disabled={isVoting}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-full transition-colors ${
                  voted
                    ? 'bg-accent text-text-primary'
                    : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
                } ${isVoting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isVoting ? (
                  <LoadingSpinner size={16} color="white" />
                ) : (
                  <ArrowUp className="w-5 h-5" />
                )}
                <span className="text-xs font-semibold">
                  {currentIdea.votesByType.use}
                </span>
              </motion.button>

              <motion.button
                onClick={handleDownVote}
                whileTap={{ scale: 0.9 }}
                disabled={isVoting}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-full transition-colors ${
                  downvoted
                    ? 'bg-error text-white'
                    : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
                } ${isVoting ? 'opacity-70 cursor-not-allowed' : ''}`}
                title="Downvote"
              >
                {isVoting ? (
                  <LoadingSpinner size={16} color="white" />
                ) : (
                  <ArrowDown className="w-5 h-5" />
                )}
                <span className="text-xs font-semibold">
                  {currentIdea.votesByType.dislike}
                </span>
              </motion.button>

              <motion.button
                onClick={handleWouldPay}
                whileTap={{ scale: 0.9 }}
                disabled={isVoting}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-full transition-colors ${
                  wouldPay
                    ? 'bg-accent-alt text-white'
                    : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
                } ${isVoting ? 'opacity-70 cursor-not-allowed' : ''}`}
                title="I'd pay for it"
              >
                {isVoting ? (
                  <LoadingSpinner size={16} color="white" />
                ) : (
                  <DollarSign
                    className={`w-5 h-5 ${wouldPay ? 'fill-current' : ''}`}
                  />
                )}
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
              >
                <MessageSquare className="w-5 h-5" />
                <span className="text-xs font-semibold">{commentCount}</span>
              </motion.button>

              <button className="flex flex-col items-center gap-1 p-2.5 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Desktop */}
        <div className="hidden md:block px-6 pb-6 w-full">
          <div className="flex flex-row items-end justify-between gap-4 w-full">
            <div className="flex-1 text-white min-w-0 pointer-events-auto">
              <h3 className="text-2xl font-bold mb-2 drop-shadow-lg">
                {currentIdea.title.length > 10
                  ? `${currentIdea.title.substring(0, 10)}...`
                  : currentIdea.title}
              </h3>
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
                {currentIdea.description.length > 50
                  ? `${currentIdea.description.substring(0, 50)}...`
                  : currentIdea.description}
              </p>
              <div className="flex items-center gap-3 text-sm text-white/80">
                <span>
                  @
                  {currentIdea.anonymous
                    ? t('common.anonymous')
                    : currentIdea.author}
                </span>
                <span>•</span>
                <span>{formatDate(currentIdea.createdAt)}</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 flex-shrink-0 pointer-events-auto">
              <motion.button
                onClick={handleVote}
                whileTap={{ scale: 0.9 }}
                disabled={isVoting}
                className={`flex flex-col items-center gap-1 p-3 rounded-full transition-colors ${
                  voted
                    ? 'bg-accent text-text-primary'
                    : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
                } ${isVoting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isVoting ? (
                  <LoadingSpinner size={18} color="white" />
                ) : (
                  <ArrowUp className="w-6 h-6" />
                )}
                <span className="text-xs font-semibold">
                  {currentIdea.votesByType.use}
                </span>
              </motion.button>

              <motion.button
                onClick={handleDownVote}
                whileTap={{ scale: 0.9 }}
                disabled={isVoting}
                className={`flex flex-col items-center gap-1 p-3 rounded-full transition-colors ${
                  downvoted
                    ? 'bg-error text-white'
                    : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
                } ${isVoting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isVoting ? (
                  <LoadingSpinner size={18} color="white" />
                ) : (
                  <ArrowDown className="w-6 h-6" />
                )}
                <span className="text-xs font-semibold">
                  {currentIdea.votesByType.dislike}
                </span>
              </motion.button>

              <motion.button
                onClick={handleWouldPay}
                whileTap={{ scale: 0.9 }}
                disabled={isVoting}
                className={`flex flex-col items-center gap-1 p-3 rounded-full transition-colors ${
                  wouldPay
                    ? 'bg-accent-alt text-white'
                    : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
                } ${isVoting ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {isVoting ? (
                  <LoadingSpinner size={18} color="white" />
                ) : (
                  <DollarSign
                    className={`w-6 h-6 ${wouldPay ? 'fill-current' : ''}`}
                  />
                )}
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
                    : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
                }`}
              >
                <MessageSquare className="w-6 h-6" />
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
