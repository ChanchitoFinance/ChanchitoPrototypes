'use client'

import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Idea } from '@/core/types/idea'
import { IdeaCard } from '@/features/ideas/components/IdeaCard'
import { IdeaCardSkeleton } from '@/shared/components/ui/Skeleton'

interface HorizontalScrollSectionProps {
  title: string
  ideas: Idea[]
  loading?: boolean
  visibleCards?: number
  onIdeaHover?: (ideaId: string | null) => void
  hoveredIdeaId?: string | null
}

export function HorizontalScrollSection({
  title,
  ideas,
  loading = false,
  visibleCards = 3,
  onIdeaHover,
}: HorizontalScrollSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [currentVisibleCards, setCurrentVisibleCards] = useState(visibleCards)

  // Update visible cards based on screen width
  useEffect(() => {
    const updateVisibleCards = () => {
      const width = window.innerWidth
      if (width >= 1536) {
        // 2xl
        setCurrentVisibleCards(visibleCards + 2)
      } else if (width >= 1280) {
        // xl
        setCurrentVisibleCards(visibleCards + 1)
      } else if (width >= 1024) {
        // lg
        setCurrentVisibleCards(visibleCards)
      } else if (width >= 768) {
        // md
        setCurrentVisibleCards(Math.max(2, visibleCards - 1))
      } else {
        // sm
        setCurrentVisibleCards(1)
      }
    }

    updateVisibleCards()
    window.addEventListener('resize', updateVisibleCards)
    return () => window.removeEventListener('resize', updateVisibleCards)
  }, [visibleCards])

  const checkScrollability = () => {
    const container = scrollContainerRef.current
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0)
      setCanScrollRight(
        container.scrollLeft < container.scrollWidth - container.clientWidth - 1
      )
    }
  }

  useEffect(() => {
    checkScrollability()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScrollability)
      window.addEventListener('resize', checkScrollability)
      return () => {
        container.removeEventListener('scroll', checkScrollability)
        window.removeEventListener('resize', checkScrollability)
      }
    }
  }, [ideas, currentVisibleCards])

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current
    if (container) {
      const cardWidth = container.clientWidth / currentVisibleCards
      const scrollAmount = cardWidth * (currentVisibleCards - 0.5)
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  // Calculate card width based on visible cards (showing partial card to indicate scroll)
  const cardWidthPercentage = 100 / (currentVisibleCards + 0.5)

  return (
    <section className="mb-4 md:mb-16">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-text-primary">
          {title}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            disabled={!canScrollLeft}
            className={`p-2 rounded-full border border-border transition-colors ${
              canScrollLeft
                ? 'bg-background hover:bg-gray-200 text-text-primary cursor-pointer'
                : 'bg-background/50 text-text-secondary/50 cursor-not-allowed'
            }`}
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll('right')}
            disabled={!canScrollRight}
            className={`p-2 rounded-full border border-border transition-colors ${
              canScrollRight
                ? 'bg-background hover:bg-gray-200 text-text-primary cursor-pointer'
                : 'bg-background/50 text-text-secondary/50 cursor-not-allowed'
            }`}
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto gap-0 md:gap-4 pb-4 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] min-h-[480px]"
      >
        {loading
          ? Array.from({ length: currentVisibleCards + 1 }).map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="flex-shrink-0"
                style={{ width: `${cardWidthPercentage}%`, minWidth: '280px' }}
              >
                <IdeaCardSkeleton />
              </div>
            ))
          : ideas.map((idea, index) => (
              <motion.div
                key={idea.id}
                className="flex-shrink-0"
                style={{ width: `${cardWidthPercentage}%`, minWidth: '280px' }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <IdeaCard
                  idea={idea}
                  variant="interactive"
                  onMouseEnter={() => onIdeaHover?.(idea.id)}
                  onMouseLeave={() => onIdeaHover?.(null)}
                  initialUserVotes={idea.userVotes}
                />
              </motion.div>
            ))}
      </div>
    </section>
  )
}
