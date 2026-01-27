'use client'

import { useState, useEffect, useRef } from 'react'
import {
  ArrowUp,
  Share2,
  TrendingUp,
  ThumbsDown,
  CheckCircle,
  DollarSign,
  MessageCircle,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Idea } from '@/core/types/idea'
import { useVideoPlayer } from '@/core/hooks/useVideoPlayer'
import {
  useLocale,
  useTranslations,
} from '@/shared/components/providers/I18nProvider'
import { ideaService } from '@/core/lib/services/ideaService'
import { CarouselItemSkeleton } from '@/shared/components/ui/Skeleton'
import { getCardMedia, isUrlValid } from '@/core/lib/utils/media'
import { formatDate } from '@/core/lib/utils/date'
import { toast } from 'sonner'

interface HeroCarouselProps {
  ideas?: Idea[]
}

const AUTO_SCROLL_INTERVAL = 5000 // 5 seconds

// Internal component for video thumbnail
function VideoThumbnail({
  videoSrc,
  title,
}: {
  videoSrc: string
  title: string
}) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Set video to show a frame at 2 seconds for thumbnail
    const handleLoadedMetadata = () => {
      if (video.readyState >= 1) {
        video.currentTime = 2
      }
    }

    const handleCanPlay = () => {
      if (video.readyState >= 2) {
        video.currentTime = 2
      }
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('canplay', handleCanPlay)
    video.load() // Force load metadata

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('canplay', handleCanPlay)
    }
  }, [videoSrc])

  return (
    <video
      ref={videoRef}
      src={videoSrc}
      className="w-full h-full object-cover"
      muted
      playsInline
      preload="metadata"
      onLoadedMetadata={e => {
        // Set video to show a frame at 2 seconds for thumbnail
        const video = e.currentTarget
        if (video.readyState >= 1) {
          video.currentTime = 2
        }
      }}
      onCanPlay={e => {
        const video = e.currentTarget
        if (video.readyState >= 2 && video.currentTime < 1) {
          video.currentTime = 2
        }
      }}
    />
  )
}

// Internal component for carousel video item
function CarouselVideoItem({
  videoSrc,
  isActive,
}: {
  videoSrc: string
  isActive: boolean
}) {
  const videoRef = useVideoPlayer({
    videoSrc,
    isActive,
    startTime: 10,
  })

  if (!videoSrc) return null

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        src={videoSrc}
        className="w-full h-full object-cover"
        loop
        muted
        playsInline
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 via-black/40 to-transparent" />
    </div>
  )
}

export function HeroCarousel({ ideas: initialIdeas }: HeroCarouselProps) {
  const t = useTranslations()
  const { locale } = useLocale()
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas || [])
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isUserInteracting, setIsUserInteracting] = useState(false)
  const [progress, setProgress] = useState(0)
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null)
  const progressRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [initialized, setInitialized] = useState(false)
  const [validMediaMap, setValidMediaMap] = useState<
    Record<string, { video?: string; image?: string }>
  >({})

  // Load trending ideas if not provided (max 7 for carousel)
  useEffect(() => {
    if (!initialIdeas && !initialized) {
      ideaService.getTrendingIdeas(7).then(loadedIdeas => {
        setIdeas(loadedIdeas)
        setInitialized(true)
      })
    }
  }, [initialIdeas, initialized])

  // Check and filter invalid media URLs for all ideas
  useEffect(() => {
    if (ideas.length === 0) return

    const checkAllMediaValidity = async () => {
      const newValidMediaMap: Record<
        string,
        { video?: string; image?: string }
      > = {}

      await Promise.all(
        ideas.map(async idea => {
          const media = getCardMedia(idea)
          const validMedia: { video?: string; image?: string } = {}

          if (media.video) {
            const isValid = await isUrlValid(media.video)
            if (isValid) validMedia.video = media.video
          }

          if (media.image) {
            const isValid = await isUrlValid(media.image)
            if (isValid) validMedia.image = media.image
          }

          newValidMediaMap[idea.id] = validMedia
        })
      )

      setValidMediaMap(newValidMediaMap)
    }

    checkAllMediaValidity()
  }, [ideas])

  // Auto-scroll functionality
  useEffect(() => {
    if (ideas.length === 0 || isPaused || isUserInteracting) return

    autoScrollRef.current = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % ideas.length)
    }, AUTO_SCROLL_INTERVAL)

    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current)
      }
    }
  }, [ideas.length, isPaused, isUserInteracting])

  // Scroll to active index
  useEffect(() => {
    if (!containerRef.current || isUserInteracting) return

    const scrollContainer = containerRef.current.querySelector(
      '.carousel-scroll-container'
    ) as HTMLElement
    if (scrollContainer) {
      const itemWidth = scrollContainer.clientWidth
      scrollContainer.scrollTo({
        left: activeIndex * itemWidth,
        behavior: 'smooth',
      })
    }
  }, [activeIndex, isUserInteracting])

  const handleThumbnailClick = (index: number) => {
    setIsUserInteracting(true)
    setActiveIndex(index)

    // Scroll to the selected item
    const scrollContainer = containerRef.current?.querySelector(
      '.carousel-scroll-container'
    ) as HTMLElement
    if (scrollContainer) {
      const itemWidth = scrollContainer.clientWidth
      scrollContainer.scrollTo({
        left: index * itemWidth,
        behavior: 'smooth',
      })
    }

    setTimeout(() => setIsUserInteracting(false), AUTO_SCROLL_INTERVAL + 1000)
  }

  const handleMouseEnter = () => {
    setIsPaused(true)
  }

  const handleMouseLeave = () => {
    setIsPaused(false)
  }

  // Show skeleton while loading
  if (!initialized || ideas.length === 0) {
    return (
      <div className="relative w-full h-[500px] md:h-[622px] bg-[var(--background)] flex">
        <div className="relative flex-1 h-full overflow-hidden">
          <div className="carousel-scroll-container flex h-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory">
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
              <CarouselItemSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  const activeIdea = ideas[activeIndex]

  return (
    <div
      id="ideas-carousel"
      className="relative w-full h-[500px] md:h-[622px] bg-black flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trending Label */}
      <div className="absolute top-6 left-6 md:left-10 z-20">
        <div className="flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 bg-accent/90 backdrop-blur-sm rounded-full shadow-xl">
          <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-white" />
          <span className="text-base md:text-lg font-bold text-white tracking-wide uppercase">
            {t('carousel.trending')}
          </span>
        </div>
      </div>

      {/* Main Carousel */}
      <div
        ref={containerRef}
        className="relative flex-1 h-full overflow-hidden"
      >
        <div
          className="carousel-scroll-container flex h-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] snap-x snap-mandatory"
          style={{ scrollBehavior: 'smooth' }}
          onScroll={e => {
            const container = e.currentTarget
            const scrollLeft = container.scrollLeft
            const itemWidth = container.clientWidth
            const newIndex = Math.round(scrollLeft / itemWidth)
            if (
              newIndex !== activeIndex &&
              newIndex >= 0 &&
              newIndex < ideas.length
            ) {
              setIsUserInteracting(true)
              setActiveIndex(newIndex)
              setTimeout(
                () => setIsUserInteracting(false),
                AUTO_SCROLL_INTERVAL + 1000
              )
            }
          }}
        >
          {ideas.map((idea, index) => {
            const validCardMedia = validMediaMap[idea.id] || {}
            return (
              <div
                key={idea.id}
                className="min-w-full h-full relative flex-shrink-0 snap-start"
              >
                {/* Background Image/Video */}
                <div className="absolute inset-0">
                  {validCardMedia.video ? (
                    <CarouselVideoItem
                      videoSrc={validCardMedia.video}
                      isActive={index === activeIndex}
                    />
                  ) : validCardMedia.image ? (
                    <div className="relative w-full h-full">
                      <Image
                        src={validCardMedia.image}
                        alt={idea.title}
                        fill
                        className="object-cover"
                        priority={index === activeIndex}
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 via-black/40 to-transparent" />
                    </div>
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900" />
                  )}
                </div>

                {/* Content Overlay */}
                <div className="relative z-10 h-full flex items-center px-4 md:px-8 lg:px-16">
                  <div className="max-w-4xl w-full text-white">
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
                      {idea.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="px-2 md:px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs md:text-sm font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Title */}
                    <h2 className="text-xl md:text-4xl lg:text-6xl font-bold mb-3 md:mb-4 leading-tight line-clamp-3">
                      {idea.title}
                    </h2>

                    {/* Description - Hidden on mobile for simplicity */}
                    <p className="hidden md:block text-lg lg:text-xl text-gray-300 mb-4 md:mb-6 max-w-2xl line-clamp-3">
                      {idea.description}
                    </p>

                    {/* Meta Info - Simplified on mobile */}
                    <div className="flex flex-wrap items-center gap-2 md:gap-6 mb-4 md:mb-8 text-xs md:text-sm text-gray-400">
                      <span>
                        {idea.anonymous ? t('common.anonymous') : idea.author}
                      </span>
                      <span className="hidden md:inline">•</span>
                      <span className="hidden md:inline">
                        {formatDate(idea.createdAt)}
                      </span>
                      <span className="hidden md:inline">•</span>
                      <div className="hidden md:flex items-center gap-3">
                        <span className="flex items-center gap-1 text-red-400">
                          <ThumbsDown className="w-3 h-3" />
                          {idea.votesByType.dislike}
                        </span>
                        <span className="flex items-center gap-1 text-green-400">
                          <CheckCircle className="w-3 h-3" />
                          {idea.votesByType.use}
                        </span>
                        <span className="flex items-center gap-1 text-yellow-400">
                          <DollarSign className="w-3 h-3" />
                          {idea.votesByType.pay}
                        </span>
                        <span className="flex items-center gap-1 text-blue-400">
                          <MessageCircle className="w-3 h-3" />
                          {idea.commentCount}
                        </span>
                      </div>
                      <span className="hidden md:inline">•</span>
                      <span className="hidden md:inline text-accent font-semibold">
                        {t('carousel.score')}: {idea.score}
                      </span>
                    </div>

                    {/* Mobile: Show key stats */}
                    <div className="md:hidden flex flex-wrap items-center gap-2 mb-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1 text-red-400">
                        <ThumbsDown className="w-3 h-3" />
                        {idea.votesByType.dislike}
                      </span>
                      <span className="flex items-center gap-1 text-green-400">
                        <CheckCircle className="w-3 h-3" />
                        {idea.votesByType.use}
                      </span>
                      <span className="flex items-center gap-1 text-yellow-400">
                        <DollarSign className="w-3 h-3" />
                        {idea.votesByType.pay}
                      </span>
                      <span className="flex items-center gap-1 text-blue-400">
                        <MessageCircle className="w-3 h-3" />
                        {idea.commentCount}
                      </span>
                      <span className="text-accent font-semibold">
                        {t('carousel.score')}: {idea.score}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 md:gap-4">
                      <Link
                        href={`/${locale}/ideas/${idea.id}`}
                        onClick={() => {
                          // Save current path and scroll position before navigating
                          if (typeof window !== 'undefined') {
                            // Find the scrollable container (div inside main with overflow-y-auto)
                            const scrollContainer = document.querySelector(
                              'main > div.overflow-y-auto'
                            ) as HTMLElement
                            const scrollY = scrollContainer
                              ? scrollContainer.scrollTop
                              : window.scrollY

                            sessionStorage.setItem(
                              'previousPath',
                              window.location.pathname
                            )
                            sessionStorage.setItem(
                              'previousScrollPosition',
                              scrollY.toString()
                            )
                          }
                        }}
                        className="px-4 md:px-8 py-2 md:py-3 bg-white text-black text-sm md:text-base font-semibold rounded-md hover:bg-gray-200 transition-colors"
                      >
                        {t('carousel.view_details')}
                      </Link>
                      <button
                        onClick={e => {
                          e.preventDefault()
                          e.stopPropagation()
                          const ideaUrl = `${window.location.origin}/${locale}/ideas/${activeIdea.id}`

                          if (navigator.share) {
                            navigator
                              .share({
                                title: activeIdea.title,
                                text: activeIdea.description,
                                url: ideaUrl,
                              })
                              .then(() => {
                                // Show success feedback
                                toast.success(t('actions.share_success'))
                              })
                              .catch(error => {
                                if (error.name !== 'AbortError') {
                                  console.error('Error sharing:', error)
                                  // Fallback to clipboard
                                  navigator.clipboard.writeText(ideaUrl)
                                  toast.success(t('actions.link_copied'))
                                }
                                // If user canceled, don't show any message
                              })
                          } else {
                            // Fallback to clipboard
                            navigator.clipboard.writeText(ideaUrl)
                            toast.success(t('actions.link_copied'))
                          }
                        }}
                        className="p-2 md:p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
                      >
                        <Share2 className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="hidden md:block absolute right-0 top-0 bottom-0 w-64 lg:w-72 bg-[var(--background)] z-30 border-l border-gray-800 flex-col">
        <div className="flex-1 flex flex-col p-2 md:p-3 space-y-1.5 md:space-y-2 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {ideas.slice(0, 7).map((idea, index) => {
            const validCardMedia = validMediaMap[idea.id] || {}
            return (
              <button
                key={idea.id}
                onClick={() => handleThumbnailClick(index)}
                className={`relative w-full text-left p-2 rounded-lg transition-all flex items-center gap-2 overflow-hidden ${
                  index === activeIndex
                    ? '[var(--background)] ring-2 ring-accent'
                    : '[var(--background)] hover:bg-gray-300'
                }`}
              >
                {/* Progress bar overlay - only visible on active item */}
                {index === activeIndex && !isPaused && !isUserInteracting && (
                  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
                    {/* Background progress bar */}
                    <div
                      className="absolute inset-0 bg-white/10"
                      style={{
                        width: `${progress}%`,
                        transition: 'width 0.1s linear',
                      }}
                    />
                    {/* Animated light bar */}
                    <div
                      className="absolute top-0 bottom-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                      style={{
                        left: `${progress}%`,
                        transform: 'translateX(-50%)',
                        transition: 'left 0.1s linear',
                      }}
                    />
                  </div>
                )}
                <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-[var(--gray-200)] z-10">
                  {validCardMedia.video ? (
                    <VideoThumbnail
                      videoSrc={validCardMedia.video}
                      title={idea.title}
                    />
                  ) : validCardMedia.image ? (
                    <Image
                      src={validCardMedia.image}
                      alt={idea.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900" />
                  )}
                </div>
                <div className="flex-1 min-w-0 z-10">
                  <p className="text-xs md:text-sm font-medium text-primary line-clamp-2">
                    {idea.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {idea.anonymous ? t('common.anonymous') : idea.author}
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Mobile: Simplified carousel with navigation dots */}
      <div className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-[200] flex gap-2">
        {ideas.map((_, index) => (
          <button
            key={index}
            onClick={() => handleThumbnailClick(index)}
            className={`transition-all ${
              index === activeIndex
                ? 'w-8 h-2 bg-accent rounded-full shadow-lg'
                : 'w-2 h-2 bg-[var(--text-primary)]/30 rounded-full hover:bg-[#66D3FF]/50 border border-gray-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
