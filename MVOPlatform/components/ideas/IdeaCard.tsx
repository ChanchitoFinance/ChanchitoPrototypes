'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUp, MessageSquare } from 'lucide-react'
import { formatDate } from '@/lib/utils/date'
import { Idea } from '@/lib/types/idea'
import { useVideoPlayer } from '@/hooks/useVideoPlayer'
import { useAppSelector } from '@/lib/hooks'
import { ideaService } from '@/lib/services/ideaService'
import { useTranslations, useLocale } from '@/components/providers/I18nProvider'
import { getCardMedia } from '@/lib/utils/media'

interface IdeaCardProps {
  idea: Idea
}

export function IdeaCard({ idea }: IdeaCardProps) {
  const t = useTranslations()
  const { locale } = useLocale()
  const [currentIdea, setCurrentIdea] = useState(idea)
  const [isVoting, setIsVoting] = useState(false)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const { isAuthenticated } = useAppSelector(state => state.auth)

  const cardMedia = getCardMedia(currentIdea)

  // Use reusable video player hook with start time at 10 seconds
  const videoRef = useVideoPlayer({
    videoSrc: cardMedia.video,
    containerRef: cardRef,
    startTime: 10,
    threshold: 0.5,
    onPlay: () => setIsVideoPlaying(true),
    onPause: () => setIsVideoPlaying(false),
  })

  const handleVote = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      alert(t('auth.sign_in_to_vote'))
      return
    }
    if (isVoting) return

    setIsVoting(true)
    try {
      const updatedIdea = await ideaService.toggleVote(currentIdea.id, 'use')
      setCurrentIdea(updatedIdea)
    } catch (error) {
      console.error('Error voting:', error)
    } finally {
      setIsVoting(false)
    }
  }

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

  const voted = currentIdea.votesByType.use > 0
  const voteCount = currentIdea.votes

  return (
    <div ref={cardRef} className="card-hover overflow-hidden">
      <Link href={`/${locale}/ideas/${currentIdea.id}`} onClick={handleClick}>
        <motion.article whileHover={{ y: -2 }} className="p-4 flex flex-col">
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
                alt={currentIdea.title}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
                <div className="text-center px-4">
                  <h3 className="text-lg font-bold text-text-primary line-clamp-2">
                    {currentIdea.title}
                  </h3>
                </div>
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0 max-w-[calc(100%-80px)]">
              <h2 className="text-lg font-semibold text-text-primary mb-1 line-clamp-2 break-words">
                {currentIdea.title}
              </h2>
              <p className="text-sm text-text-secondary line-clamp-2 mb-2 break-words">
                {currentIdea.description}
              </p>
            </div>
            <div className="text-right flex-shrink-0 w-16">
              <div className="text-2xl font-semibold text-accent whitespace-nowrap">
                {currentIdea.score}
              </div>
              <div className="text-xs text-text-secondary whitespace-nowrap">
                {t('common.score')}
              </div>
            </div>
          </div>

          {/* Actions and Tags */}
          <div className="flex items-center justify-between gap-2 mb-2 min-h-[32px] overflow-hidden">
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleVote}
                disabled={isVoting}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all duration-250 text-sm whitespace-nowrap flex-shrink-0 ${
                  voted
                    ? 'bg-accent text-text-primary'
                    : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                <span className="text-sm">{currentIdea.commentCount}</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0 overflow-hidden">
              {currentIdea.tags.slice(0, 2).map(tag => (
                <span
                  key={tag}
                  className="badge-gray text-xs px-2 py-0.5 whitespace-nowrap flex-shrink-0 truncate max-w-[80px]"
                  title={tag}
                >
                  {tag}
                </span>
              ))}
              {currentIdea.tags.length > 2 && (
                <span className="text-xs text-text-secondary whitespace-nowrap flex-shrink-0">
                  +{currentIdea.tags.length - 2}
                </span>
              )}
            </div>
          </div>

          {/* Author and Date */}
          <div className="flex items-center justify-between text-xs text-text-secondary pt-2 border-t border-background">
            <span>By {currentIdea.author}</span>
            <span>{formatDate(currentIdea.createdAt)}</span>
          </div>
        </motion.article>
      </Link>
    </div>
  )
}
