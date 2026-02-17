'use client'

import { useEffect, useRef } from 'react'
import { Idea } from '@/core/types/idea'
import { IdeaCard } from './IdeaCard'
import { useFeedImpressionTracking } from '@/core/hooks/useAnalytics'
import type { FeedType } from '@/core/types/analytics'

interface FeedIdeaCardProps {
  idea: Idea
  feedType: FeedType
  [key: string]: unknown
}

/**
 * Wraps IdeaCard and tracks feed impression + dwell when card enters/leaves viewport.
 */
export function FeedIdeaCard({ idea, feedType, ...cardProps }: FeedIdeaCardProps) {
  const { ref, onEnterViewport, onLeaveViewport } = useFeedImpressionTracking(idea.id, feedType)
  const visibleSinceRef = useRef<number | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || !idea.id) return

    const observer = new IntersectionObserver(
      entries => {
        const entry = entries[0]
        if (!entry) return
        if (entry.isIntersecting) {
          visibleSinceRef.current = Date.now()
          onEnterViewport()
        } else {
          const dwell = visibleSinceRef.current != null ? Date.now() - visibleSinceRef.current : 0
          visibleSinceRef.current = null
          onLeaveViewport(dwell)
        }
      },
      { threshold: 0.2, rootMargin: '0px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [idea.id, onEnterViewport, onLeaveViewport, ref])

  return (
    <div ref={ref} className="w-full">
      <IdeaCard idea={idea} {...(cardProps as any)} />
    </div>
  )
}
