'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Footer } from '@/components/layout/Footer'
import { HomeIdeaCard } from '@/components/home/HomeIdeaCard'
import { motion } from 'framer-motion'
import { UI_LABELS } from '@/lib/constants/ui'
import { Idea } from '@/lib/types/idea'
import { ideaService } from '@/lib/services/ideaService'
import { IdeaCardSkeleton } from '@/components/ui/Skeleton'

interface HomeFeedProps {
  showHeader?: boolean
  showFooter?: boolean
}

export function HomeFeed({ showHeader = true, showFooter = true }: HomeFeedProps) {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // Load initial ideas - Only load first batch for lazy loading
  useEffect(() => {
    if (!initialized) {
      setLoading(true)
      // Load only 6 items initially for faster initial load
      ideaService.getForYouIdeas(6).then((loadedIdeas) => {
        setIdeas(loadedIdeas)
        setLoading(false)
        setInitialized(true)
      })
    }
  }, [initialized])

  const handleLoadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      // Smaller batches for better performance
      const newIdeas = await ideaService.getForYouIdeas(6, ideas.length)
      if (newIdeas.length === 0) {
        setHasMore(false)
      } else {
        setIdeas((prev) => [...prev, ...newIdeas])
      }
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, ideas.length])

  // Auto-loading with IntersectionObserver
  useEffect(() => {
    if (!initialized || !hasMore) return

    const options = {
      root: null,
      rootMargin: '200px', // Load earlier for smoother experience
      threshold: 0.1,
    }

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        handleLoadMore()
      }
    }, options)

    const currentRef = loadMoreRef.current
    if (currentRef) {
      observerRef.current.observe(currentRef)
    }

    return () => {
      if (observerRef.current && currentRef) {
        observerRef.current.unobserve(currentRef)
      }
    }
  }, [initialized, hasMore, loading, handleLoadMore])

  const content = (
    <main className="flex-1 w-full px-4 md:px-6 py-8 max-w-7xl mx-auto">
      {/* Show skeletons while loading initial data */}
      {!initialized && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <IdeaCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      )}

      {/* Show ideas once loaded */}
      {initialized && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {ideas.map((idea, index) => (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.03 }}
              >
                <HomeIdeaCard idea={idea} />
              </motion.div>
            ))}
            {/* Loading skeletons for new items */}
            {loading && [1, 2].map((i) => (
              <IdeaCardSkeleton key={`loading-${i}`} />
            ))}
          </div>

          {/* Auto-loading trigger */}
          <div ref={loadMoreRef} className="mt-8 h-4" />

          {/* Loading indicator */}
          {loading && (
            <div className="mt-8 text-center">
              <div className="text-text-secondary">{UI_LABELS.LOADING_MORE_IDEAS}</div>
            </div>
          )}

          {/* No more items indicator */}
          {!hasMore && ideas.length > 0 && (
            <div className="mt-8 text-center">
              <div className="text-text-secondary">No hay más ideas</div>
            </div>
          )}
        </>
      )}
    </main>
  )

  if (!showHeader && !showFooter) {
    return content
  }

  return (
    <div className="min-h-screen flex bg-background">
      {showHeader && <Sidebar />}
      <div className="flex-1 flex flex-col transition-all duration-300 overflow-x-hidden">
        {content}
        {showFooter && <Footer />}
      </div>
    </div>
  )
}

