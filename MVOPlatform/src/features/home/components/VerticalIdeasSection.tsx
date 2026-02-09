'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Idea } from '@/core/types/idea'
import { IdeaCard } from '@/features/ideas/components/IdeaCard'
import { IdeaCardSkeleton } from '@/shared/components/ui/Skeleton'

interface VerticalIdeasSectionProps {
  title: string
  ideas: Idea[]
  loading?: boolean
  onIdeaHover?: (ideaId: string | null) => void
  hoveredIdeaId?: string | null
  /** When true, render a sentinel at the bottom and call setSentinelRef(sectionKey, el) for load-more-on-scroll */
  showSentinel?: boolean
  sectionKey?: string
  setSentinelRef?: (key: string, el: HTMLDivElement | null) => void
}

export function VerticalIdeasSection({
  title,
  ideas,
  loading = false,
  onIdeaHover,
  hoveredIdeaId,
  showSentinel = false,
  sectionKey,
  setSentinelRef,
}: VerticalIdeasSectionProps) {
  const [minMaxWidth, setMinMaxWidth] = useState({
    minWidth: '240px',
    maxWidth: '300px',
  })

  useEffect(() => {
    const calculateWidth = () => {
      if (typeof window !== 'undefined') {
        // Keep same proportions on phones: use same width range as desktop (240–300px)
        setMinMaxWidth({
          minWidth: '240px',
          maxWidth: '300px',
        })
      }
    }
    calculateWidth()
    window.addEventListener('resize', calculateWidth)
    return () => window.removeEventListener('resize', calculateWidth)
  }, [])

  return (
    <div
      className="flex-shrink-0 w-full mx-auto"
      style={{
        minWidth: minMaxWidth.minWidth,
        maxWidth: minMaxWidth.maxWidth,
      }}
    >
      <h3 className="text-lg font-semibold text-text-primary mb-2 px-1">
        {title}
      </h3>
      <div className="h-[750px] xl:h-[800px] overflow-y-auto pr-2 space-y-20 scroll-smooth [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border [&::-webkit-scrollbar-thumb]:rounded-full">
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
        {showSentinel && sectionKey && setSentinelRef && (
          <div ref={el => setSentinelRef(sectionKey, el)} className="h-2 w-full" />
        )}
      </div>
    </div>
  )
}
