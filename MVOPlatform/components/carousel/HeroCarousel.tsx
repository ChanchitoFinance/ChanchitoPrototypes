'use client'

import { useState, useEffect, useRef } from 'react'
import { ArrowUp, Share2, Bookmark, TrendingUp } from 'lucide-react'
import { Idea } from '@/lib/types/idea'
import { ideaService } from '@/lib/services/ideaService'
import { formatDate } from '@/lib/utils/date'
import { UI_LABELS } from '@/lib/constants/ui'
import Image from 'next/image'
import Link from 'next/link'
import { useVideoPlayer } from '@/hooks/useVideoPlayer'
import { CarouselItemSkeleton } from '@/components/ui/Skeleton'

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
  idea,
  isActive,
}: {
  idea: Idea
  isActive: boolean
}) {
  const videoRef = useVideoPlayer({
    videoSrc: idea.video,
    isActive,
    startTime: 10,
  })

  if (!idea.video) return null

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        src={idea.video}
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
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas || [])
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [isUserInteracting, setIsUserInteracting] = useState(false)
  const [progress, setProgress] = useState(0)
  const autoScrollRef = useRef<NodeJS.Timeout | null>(null)
  const progressRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [initialized, setInitialized] = useState(false)

  // Load trending ideas if not provided (max 5 for carousel)
  useEffect(() => {
    if (!initialIdeas && !initialized) {
      ideaService.getTrendingIdeas(5).then(loadedIdeas => {
        setIdeas(loadedIdeas)
        setInitialized(true)
      })
    }
  }, [initialIdeas, initialized])

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
      <div className="relative w-full h-[500px] md:h-[600px] bg-black flex">
        <div className="relative flex-1 h-full overflow-hidden">
          <div className="carousel-scroll-container flex h-full overflow-x-auto scrollbar-hide snap-x snap-mandatory">
            {[1, 2, 3, 4, 5].map(i => (
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
      className="relative w-full h-[500px] md:h-[600px] bg-black flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trending Label */}
      <div className="absolute top-6 left-6 md:left-10 z-20">
        <div className="flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 bg-accent/90 backdrop-blur-sm rounded-full shadow-xl">
          <TrendingUp className="w-5 h-5 md:w-6 md:h-6 text-text-primary" />
          <span className="text-base md:text-lg font-bold text-text-primary tracking-wide uppercase">
            Trending
          </span>
        </div>
      </div>

      {/* Main Carousel */}
      <div
        ref={containerRef}
        className="relative flex-1 h-full overflow-hidden"
      >
        <div
          className="carousel-scroll-container flex h-full overflow-x-auto scrollbar-hide snap-x snap-mandatory"
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
          {ideas.map((idea, index) => (
            <div
              key={idea.id}
              className="min-w-full h-full relative flex-shrink-0 snap-start"
            >
              {/* Background Image/Video */}
              <div className="absolute inset-0">
                {idea.video ? (
                  <CarouselVideoItem
                    idea={idea}
                    isActive={index === activeIndex}
                  />
                ) : idea.image ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={idea.image}
                      alt={idea.title}
                      fill
                      className="object-cover"
                      priority={index === activeIndex}
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 via-black/40 to-transparent" />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-900 to-black" />
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
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl md:text-4xl lg:text-6xl font-bold mb-3 md:mb-4 leading-tight">
                    {idea.title}
                  </h2>

                  {/* Description - Hidden on mobile for simplicity */}
                  <p className="hidden md:block text-lg lg:text-xl text-gray-300 mb-4 md:mb-6 max-w-2xl line-clamp-3">
                    {idea.description}
                  </p>

                  {/* Meta Info - Simplified on mobile */}
                  <div className="flex flex-wrap items-center gap-2 md:gap-6 mb-4 md:mb-8 text-xs md:text-sm text-gray-400">
                    <span>{idea.author}</span>
                    <span className="hidden md:inline">•</span>
                    <span className="hidden md:inline">
                      {formatDate(idea.createdAt)}
                    </span>
                    <span className="hidden md:inline">•</span>
                    <span className="hidden md:flex items-center gap-1">
                      <ArrowUp className="w-4 h-4" />
                      {idea.votes} votes
                    </span>
                    <span className="hidden md:inline">•</span>
                    <span className="hidden md:inline text-accent font-semibold">
                      Score: {idea.score}
                    </span>
                  </div>

                  {/* Action Buttons - Simplified on mobile */}
                  <div className="flex items-center gap-2 md:gap-4">
                    <Link
                      href={`/ideas/${idea.id}`}
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
                      View Details
                    </Link>
                    <button className="hidden md:block p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors">
                      <Bookmark className="w-5 h-5" />
                    </button>
                    <button className="hidden md:block p-3 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors">
                      <Share2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar Thumbnails - All ideas visible, compact layout */}
      <div className="hidden md:block absolute right-0 top-0 bottom-0 w-64 lg:w-72 bg-black z-30 border-l border-gray-800 flex flex-col">
        <div className="flex-1 flex flex-col p-2 md:p-3 space-y-1.5 md:space-y-2 overflow-y-auto scrollbar-hide">
          {ideas.slice(0, 5).map((idea, index) => (
            <button
              key={idea.id}
              onClick={() => handleThumbnailClick(index)}
              className={`relative w-full text-left p-2 rounded-lg transition-all flex items-center gap-2 overflow-hidden ${
                index === activeIndex
                  ? 'bg-gray-900 ring-2 ring-accent'
                  : 'bg-black hover:bg-gray-900'
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
              <div className="relative w-16 h-16 flex-shrink-0 rounded overflow-hidden bg-gray-800 z-10">
                {idea.image ? (
                  <Image
                    src={idea.image}
                    alt={idea.title}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : idea.video ? (
                  <VideoThumbnail videoSrc={idea.video} title={idea.title} />
                ) : (
                  <div className="w-full h-full bg-gray-800" />
                )}
              </div>
              <div className="flex-1 min-w-0 z-10">
                <p className="text-xs md:text-sm font-medium text-white line-clamp-2">
                  {idea.title}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{idea.author}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile: Simplified carousel with navigation dots */}
      <div className="md:hidden absolute bottom-6 left-1/2 -translate-x-1/2 z-[10] flex gap-2">
        {ideas.map((_, index) => (
          <button
            key={index}
            onClick={() => handleThumbnailClick(index)}
            className={`transition-all ${
              index === activeIndex
                ? 'w-8 h-2 bg-accent rounded-full shadow-lg'
                : 'w-2 h-2 bg-[#FFFFFF]/30 rounded-full hover:bg-[#66D3FF]/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
