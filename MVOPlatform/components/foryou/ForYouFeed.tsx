'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { ForYouIdeaCard } from './ForYouIdeaCard'
import { UI_LABELS } from '@/lib/constants/ui'
import { Idea } from '@/lib/types/idea'
import { ideaService } from '@/lib/services/ideaService'
import { ExploreIdeaSkeleton } from '@/components/ui/Skeleton'

export function ForYouFeed() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [initialized, setInitialized] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Load initial ideas for For You section (TikTok-style) - Only load first batch
  useEffect(() => {
    if (!initialized) {
      setLoading(true)
      // Load only 3 ideas initially for faster initial load
      ideaService.getExploreIdeas(3).then((loadedIdeas) => {
        setIdeas(loadedIdeas)
        setLoading(false)
        setInitialized(true)
      })
    }
  }, [initialized])

  const loadMoreIdeas = useCallback(async () => {
    if (loading) return
    setLoading(true)
    try {
      // Load more explore ideas with offset - smaller batches for better performance
      const newIdeas = await ideaService.getExploreIdeas(3, ideas.length)
      if (newIdeas.length > 0) {
        setIdeas((prev) => [...prev, ...newIdeas])
      }
    } finally {
      setLoading(false)
    }
  }, [loading, ideas.length])

  useEffect(() => {
    // Set up intersection observer for infinite scroll
    const options = {
      root: null,
      rootMargin: '200px', // Load earlier for smoother experience
      threshold: 0.1,
    }

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = parseInt(entry.target.getAttribute('data-index') || '0')
          setActiveIndex(index)

          // Auto-load more when near the end (2 items before end)
          if (index >= ideas.length - 2 && !loading) {
            loadMoreIdeas()
          }
        }
      })
    }, options)

    const elements = containerRef.current?.querySelectorAll('[data-index]')
    elements?.forEach((el) => observerRef.current?.observe(el))

    return () => {
      observerRef.current?.disconnect()
    }
  }, [ideas.length, loadMoreIdeas, loading])

  // Handle scroll snap
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return

      const scrollTop = containerRef.current.scrollTop
      const windowHeight = window.innerHeight
      const currentIndex = Math.round(scrollTop / windowHeight)
      setActiveIndex(currentIndex)
    }

    const container = containerRef.current
    container?.addEventListener('scroll', handleScroll)

    return () => {
      container?.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      style={{
        scrollSnapType: 'y mandatory',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Show skeletons while initializing */}
      {!initialized && (
        <>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={`skeleton-${i}`} className="h-screen snap-start snap-mandatory">
              <ExploreIdeaSkeleton />
            </div>
          ))}
        </>
      )}

      {/* Show ideas once loaded */}
      {initialized && ideas.map((idea, index) => (
        <div key={idea.id} data-index={index}>
          <ForYouIdeaCard idea={idea} isActive={index === activeIndex} />
        </div>
      ))}

      {/* Loading indicator at the end */}
      {loading && initialized && (
        <div className="h-screen snap-start snap-mandatory flex items-center justify-center bg-black">
          <div className="text-white text-lg">{UI_LABELS.LOADING_MORE_IDEAS}</div>
        </div>
      )}
    </div>
  )
}

