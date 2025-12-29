'use client'

import { useState, useRef } from 'react'
import { ArrowUp, ArrowDown, MessageSquare, DollarSign } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useVideoPlayer } from '@/core/hooks/useVideoPlayer'
import { Idea } from '@/core/types/idea'
import { getCardMedia } from '@/core/lib/utils/media'
import { useLocale, useTranslations } from '@/shared/components/providers/I18nProvider'
import { formatDate } from '@/core/lib/utils/date'

interface MyIdeaCardProps {
  idea: Idea
}

export function MyIdeaCard({ idea }: MyIdeaCardProps) {
  const t = useTranslations()
  const { locale } = useLocale()
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const cardMedia = getCardMedia(idea)

  // Use reusable video player hook with start time at 10 seconds
  const videoRef = useVideoPlayer({
    videoSrc: cardMedia.video,
    containerRef: cardRef,
    startTime: 10,
    threshold: 0.5,
    onPlay: () => setIsVideoPlaying(true),
    onPause: () => setIsVideoPlaying(false),
  })

  const handleClick = () => {
    // Save current path and scroll position before navigating
    if (typeof window !== 'undefined') {
      // Find the scrollable container (div inside main with overflow-y-auto)
      const scrollContainer = document.querySelector(
        'main > div.overflow-y-auto'
      ) as HTMLElement
      const scrollY = scrollContainer
        ? scrollContainer.scrollTop
        : window.scrollY

      sessionStorage.setItem('previousPath', window.location.pathname)
      sessionStorage.setItem('previousScrollPosition', scrollY.toString())
    }
  }

  return (
    <div ref={cardRef} className="card-hover overflow-hidden h-full">
      <Link
        href={`/${locale}/ideas/${idea.id}`}
        onClick={handleClick}
        className="h-full"
      >
        <motion.article
          whileHover={{ y: -2 }}
          className="p-4 flex flex-col h-full"
        >
          {/* Media Section */}
          <div className="relative w-full aspect-video mb-3 rounded-md overflow-hidden">
            {cardMedia.video ? (
              <video
                ref={videoRef}
                src={cardMedia.video}
                className="w-full h-full object-cover"
                loop
                muted
                playsInline
                preload="none"
              />
            ) : cardMedia.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cardMedia.image}
                alt={idea.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
                <div className="text-center px-4">
                  <h3 className="text-lg font-bold text-text-primary line-clamp-2">
                    {idea.title}
                  </h3>
                </div>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="flex items-start justify-between gap-3 mb-3 flex-1">
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
              <div className="text-xs text-text-secondary whitespace-nowrap">
                {t('common.score')}
              </div>
            </div>
          </div>

          {/* Metrics Section */}
          <div className="flex items-center gap-3 mb-2 min-h-[32px] overflow-hidden">
            {/* Upvote Metric */}
            <div className="flex items-center gap-1.5 text-text-secondary whitespace-nowrap flex-shrink-0">
              <ArrowUp className="w-3.5 h-3.5 text-green-500" />
              <span className="text-sm font-medium">
                {idea.votesByType.use}
              </span>
            </div>

            {/* Downvote Metric */}
            <div className="flex items-center gap-1.5 text-text-secondary whitespace-nowrap flex-shrink-0">
              <ArrowDown className="w-3.5 h-3.5 text-red-500" />
              <span className="text-sm font-medium">
                {idea.votesByType.dislike}
              </span>
            </div>

            {/* Pay Vote Metric */}
            <div className="flex items-center gap-1.5 text-text-secondary whitespace-nowrap flex-shrink-0">
              <DollarSign className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-sm font-medium">
                {idea.votesByType.pay}
              </span>
            </div>

            {/* Comments Metric */}
            <div className="flex items-center gap-1.5 text-text-secondary whitespace-nowrap flex-shrink-0">
              <MessageSquare className="w-3.5 h-3.5" />
              <span className="text-sm">{idea.commentCount}</span>
            </div>
          </div>

          {/* Tags Section - Moved below metrics */}
          <div className="flex items-center gap-1.5 flex-wrap mb-2 overflow-hidden">
            {idea.tags.slice(0, 3).map(tag => (
              <span
                key={tag}
                className="badge-gray text-xs px-2 py-0.5 whitespace-nowrap flex-shrink-0"
                title={tag}
              >
                {tag}
              </span>
            ))}
            {idea.tags.length > 3 && (
              <span className="text-xs text-text-secondary whitespace-nowrap flex-shrink-0">
                +{idea.tags.length - 3}
              </span>
            )}
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
