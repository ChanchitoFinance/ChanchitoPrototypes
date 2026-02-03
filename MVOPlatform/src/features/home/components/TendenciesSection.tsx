'use client'

import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Idea } from '@/core/types/idea'
import { IdeaCard } from '@/features/ideas/components/IdeaCard'
import { IdeaCardSkeleton } from '@/shared/components/ui/Skeleton'
import { useTranslations } from '@/shared/components/providers/I18nProvider'

interface TendenciesSectionProps {
  title: string
  ideasByStatus: {
    new: Idea[]
    active_discussion: Idea[]
    trending: Idea[]
    validated: Idea[]
  }
  loading?: boolean
  onIdeaHover?: (ideaId: string | null) => void
  hoveredIdeaId?: string | null
}

interface VerticalListProps {
  title: string
  ideas: Idea[]
  loading?: boolean
  onIdeaHover?: (ideaId: string | null) => void
  listWidth: string
}

function VerticalList({
  title,
  ideas,
  loading = false,
  onIdeaHover,
  listWidth,
}: VerticalListProps) {
  return (
    <div
      className="flex-shrink-0"
      style={{ width: listWidth, minWidth: '240px', maxWidth: '300px' }}
    >
      <h3 className="text-lg font-semibold text-text-primary mb-2 px-1">
        {title}
      </h3>
      <div className="h-[750px] xl:h-[800px] overflow-y-auto pr-2 space-y-32 scroll-smooth [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={`skeleton-${i}`}>
                <IdeaCardSkeleton />
              </div>
            ))
          : ideas.map((idea, index) => (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
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
    </div>
  )
}

export function TendenciesSection({
  title,
  ideasByStatus,
  loading = false,
  onIdeaHover,
}: TendenciesSectionProps) {
  const t = useTranslations()
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [visibleLists, setVisibleLists] = useState(2)

  // Update visible lists based on screen width
  useEffect(() => {
    const updateVisibleLists = () => {
      const width = window.innerWidth
      if (width >= 1536) {
        // 2xl - show all 4 lists
        setVisibleLists(4)
      } else if (width >= 1280) {
        // xl - show 3 lists + partial
        setVisibleLists(3)
      } else if (width >= 1024) {
        // lg - show 2.5 lists
        setVisibleLists(2.5)
      } else if (width >= 768) {
        // md - show 2 lists + partial
        setVisibleLists(2)
      } else {
        // sm - show 1 list + partial
        setVisibleLists(1)
      }
    }

    updateVisibleLists()
    window.addEventListener('resize', updateVisibleLists)
    return () => window.removeEventListener('resize', updateVisibleLists)
  }, [])

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
  }, [ideasByStatus, visibleLists])

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current
    if (container) {
      const scrollAmount = container.clientWidth * 0.6
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  const statusTitles = {
    new: t('home.status_new'),
    active_discussion: t('home.status_active_discussion'),
    trending: t('home.status_trending'),
    validated: t('home.status_validated'),
  }

  // Calculate list width based on visible lists (showing partial to indicate scroll)
  const listWidthPercentage = `${100 / (visibleLists + 0.5)}%`

  return (
    <section className="mb-2 md:mb-6">
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
        className="flex overflow-x-auto gap-1 md:gap-3 pb-3 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        <VerticalList
          title={statusTitles.new}
          ideas={ideasByStatus.new}
          loading={loading}
          onIdeaHover={onIdeaHover}
          listWidth={listWidthPercentage}
        />
        <VerticalList
          title={statusTitles.active_discussion}
          ideas={ideasByStatus.active_discussion}
          loading={loading}
          onIdeaHover={onIdeaHover}
          listWidth={listWidthPercentage}
        />
        <VerticalList
          title={statusTitles.trending}
          ideas={ideasByStatus.trending}
          loading={loading}
          onIdeaHover={onIdeaHover}
          listWidth={listWidthPercentage}
        />
        <VerticalList
          title={statusTitles.validated}
          ideas={ideasByStatus.validated}
          loading={loading}
          onIdeaHover={onIdeaHover}
          listWidth={listWidthPercentage}
        />
      </div>
    </section>
  )
}
