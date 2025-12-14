'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUp, MessageSquare } from 'lucide-react'
import { formatDate } from '@/lib/utils/date'
import { UI_LABELS } from '@/lib/constants/ui'
import { Idea } from '@/lib/types/idea'
import { useVideoPlayer } from '@/hooks/useVideoPlayer'

interface HomeIdeaCardProps {
  idea: Idea
}

export function HomeIdeaCard({ idea }: HomeIdeaCardProps) {
  const [voted, setVoted] = useState(false)
  const [voteCount, setVoteCount] = useState(idea.votes)
  const cardRef = useRef<HTMLDivElement>(null)

  // Use reusable video player hook with start time at 10 seconds
  const videoRef = useVideoPlayer({
    videoSrc: idea.video,
    containerRef: cardRef,
    startTime: 10,
  })

  const handleVote = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!voted) {
      setVoted(true)
      setVoteCount(voteCount + 1)
    }
  }

  return (
    <div ref={cardRef} className="card-hover overflow-hidden">
      <Link href={`/ideas/${idea.id}`}>
        <motion.article
          whileHover={{ y: -2 }}
          className="p-4 flex flex-col"
        >
          {/* Media Section */}
          {(idea.image || idea.video) && (
            <div className="relative w-full aspect-video mb-3 rounded-md overflow-hidden bg-gray-100">
              {idea.video ? (
                <video
                  ref={videoRef}
                  src={idea.video}
                  className="w-full h-full object-cover"
                  loop
                  muted
                  playsInline
                  preload="none"
                />
              ) : idea.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={idea.image}
                  alt={idea.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : null}
            </div>
          )}

          {/* Content Section */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0 max-w-[calc(100%-80px)]">
              <h2 className="text-lg font-semibold text-text-primary mb-1 line-clamp-2 break-words">
                {idea.title}
              </h2>
              <p className="text-sm text-text-secondary line-clamp-2 mb-2 break-words">
                {idea.description}
              </p>
            </div>
            <div className="text-right flex-shrink-0 w-16">
              <div className="text-2xl font-semibold text-accent whitespace-nowrap">
                {idea.score}
              </div>
              <div className="text-xs text-text-secondary whitespace-nowrap">{UI_LABELS.SCORE}</div>
            </div>
          </div>

          {/* Actions and Tags */}
          <div className="flex items-center justify-between gap-2 mb-2 min-h-[32px] overflow-hidden">
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleVote}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all duration-250 text-sm whitespace-nowrap flex-shrink-0 ${
                  voted
                    ? 'bg-accent text-text-primary'
                    : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                }`}
              >
                <motion.div
                  animate={voted ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </motion.div>
                <span className="font-medium">{voteCount}</span>
              </button>
              <div className="flex items-center gap-1.5 text-text-secondary whitespace-nowrap flex-shrink-0">
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="text-sm">12</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0 overflow-hidden">
              {idea.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="badge-gray text-xs px-2 py-0.5 whitespace-nowrap flex-shrink-0 truncate max-w-[80px]"
                  title={tag}
                >
                  {tag}
                </span>
              ))}
              {idea.tags.length > 2 && (
                <span className="text-xs text-text-secondary whitespace-nowrap flex-shrink-0">+{idea.tags.length - 2}</span>
              )}
            </div>
          </div>

          {/* Author and Date */}
          <div className="flex items-center justify-between text-xs text-text-secondary pt-2 border-t border-background">
            <span>By {idea.author}</span>
            <span>{formatDate(idea.createdAt)}</span>
          </div>
        </motion.article>
      </Link>
    </div>
  )
}

