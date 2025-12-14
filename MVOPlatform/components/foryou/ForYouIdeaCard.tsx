'use client'

import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowUp, MessageSquare, Share2, Heart } from 'lucide-react'
import Image from 'next/image'
import { formatDate } from '@/lib/utils/date'
import { UI_LABELS } from '@/lib/constants/ui'
import { Idea } from '@/lib/types/idea'
import { useVideoPlayer } from '@/hooks/useVideoPlayer'

interface ForYouIdeaCardProps {
  idea: Idea
  isActive: boolean
}

export function ForYouIdeaCard({ idea, isActive }: ForYouIdeaCardProps) {
  const [voted, setVoted] = useState(false)
  const [voteCount, setVoteCount] = useState(idea.votes)
  const [liked, setLiked] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Use reusable video player hook with start time at 10 seconds
  const videoRef = useVideoPlayer({
    videoSrc: idea.video,
    isActive,
    startTime: 10,
  })

  const handleVote = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!voted) {
      setVoted(true)
      setVoteCount(voteCount + 1)
    }
  }

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    setLiked(!liked)
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen snap-start snap-mandatory bg-black overflow-hidden"
    >
      {/* Background image/video area */}
      <div className="absolute inset-0">
        {idea.video ? (
          <>
            <video
              ref={videoRef}
              src={idea.video}
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
        ) : idea.image ? (
          <>
            <Image
              src={idea.image}
              alt={idea.title}
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
                  {idea.title}
                </h2>
                <p className="text-lg md:text-xl text-text-secondary leading-relaxed">
                  {idea.description}
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
          {idea.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 text-xs font-medium text-white bg-black/50 backdrop-blur-sm rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
        <div className="text-right flex-shrink-0 pointer-events-auto">
          <div className="text-4xl md:text-5xl font-bold text-accent drop-shadow-lg">
            {idea.score}
          </div>
          <div className="text-xs text-white/80 drop-shadow-md">{UI_LABELS.SCORE}</div>
        </div>
      </div>

      {/* Bottom section - Title, description, and actions - Fixed at bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none">
        {/* Mobile: Stack vertically with text at bottom */}
        <div className="md:hidden px-4 pb-4 w-full">
          <div className="flex items-end justify-between gap-3 w-full">
            {/* Left side - Text content */}
            <div className="flex-1 text-white min-w-0 pointer-events-auto pb-0">
              <h3 className="text-lg font-bold mb-1 drop-shadow-lg">
                {idea.title}
              </h3>
              <p className="text-sm text-white/90 mb-1 line-clamp-2 drop-shadow-md">
                {idea.description}
              </p>
              <div className="flex items-center gap-2 text-xs text-white/80">
                <span>@{idea.author}</span>
                <span>•</span>
                <span>{formatDate(idea.createdAt)}</span>
              </div>
            </div>

            {/* Right side - Action buttons */}
            <div className="flex flex-col items-center gap-3 flex-shrink-0 pointer-events-auto pb-0">
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
                <span className="text-xs font-semibold">{voteCount}</span>
              </motion.button>

              <motion.button
                onClick={handleLike}
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-full transition-colors ${
                  liked
                    ? 'bg-red-500 text-white'
                    : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
                }`}
              >
                <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
              </motion.button>

              <button className="flex flex-col items-center gap-1 p-2.5 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors">
                <MessageSquare className="w-5 h-5" />
                <span className="text-xs font-semibold">12</span>
              </button>

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
                {idea.title}
              </h3>
              <p className="text-base text-white/90 mb-2 line-clamp-2 drop-shadow-md">
                {idea.description}
              </p>
              <div className="flex items-center gap-3 text-sm text-white/80">
                <span>@{idea.author}</span>
                <span>•</span>
                <span>{formatDate(idea.createdAt)}</span>
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
                <span className="text-xs font-semibold">{voteCount}</span>
              </motion.button>

              <motion.button
                onClick={handleLike}
                whileTap={{ scale: 0.9 }}
                className={`flex flex-col items-center gap-1 p-3 rounded-full transition-colors ${
                  liked
                    ? 'bg-red-500 text-white'
                    : 'bg-white/10 backdrop-blur-sm text-white hover:bg-white/20'
                }`}
              >
                <Heart className={`w-6 h-6 ${liked ? 'fill-current' : ''}`} />
              </motion.button>

              <button className="flex flex-col items-center gap-1 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors">
                <MessageSquare className="w-6 h-6" />
                <span className="text-xs font-semibold">12</span>
              </button>

              <button className="flex flex-col items-center gap-1 p-3 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors">
                <Share2 className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

