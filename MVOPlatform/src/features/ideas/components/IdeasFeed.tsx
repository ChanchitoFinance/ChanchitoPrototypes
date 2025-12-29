'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Idea } from '@/core/types/idea'
import { ideaService } from '@/core/lib/services/ideaService'
import { IdeaCardSkeleton } from '@/shared/components/ui/Skeleton'
import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { IdeaCard } from '@/features/ideas/components/IdeaCard'

interface IdeasFeedProps {
  showHeader?: boolean
  showFooter?: boolean
  isForYou?: boolean
}

export function IdeasFeed({
  showHeader = true,
  showFooter = true,
  isForYou = false,
}: IdeasFeedProps) {
  const t = useTranslations()
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
      // Use getForYouIdeas for "For You" section, otherwise use getIdeas
      // Load only 6 items initially for faster initial load
      const loadPromise = isForYou
        ? ideaService.getForYouIdeas(6)
        : ideaService.getIdeas(6)

      loadPromise.then(loadedIdeas => {
        setIdeas(loadedIdeas)
        setLoading(false)
        setInitialized(true)
      })
    }
  }, [initialized, isForYou])

  const handleLoadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      // For "For You" section, load more from getForYouIdeas with offset
      // Smaller batches for better performance
      if (isForYou) {
        const newIdeas = await ideaService.getForYouIdeas(6, ideas.length)
        if (newIdeas.length === 0) {
          setHasMore(false)
        } else {
          setIdeas(prev => [...prev, ...newIdeas])
        }
      } else {
        const newIdeas = await ideaService.loadMoreIdeas(ideas.length)
        if (newIdeas.length === 0) {
          setHasMore(false)
        } else {
          setIdeas(prev => [...prev, ...newIdeas])
        }
      }
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, isForYou, ideas.length])

  // Auto-loading with IntersectionObserver for For You section
  useEffect(() => {
    if (!isForYou || !initialized || !hasMore) return

    const options = {
      root: null,
      rootMargin: '200px', // Load earlier for smoother experience
      threshold: 0.1,
    }

    observerRef.current = new IntersectionObserver(entries => {
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
  }, [isForYou, initialized, hasMore, loading, handleLoadMore])

  const content = (
    <main
      className={`flex-1 w-full px-4 md:px-6 py-8 ${isForYou ? 'max-w-7xl mx-auto' : 'max-w-2xl mx-auto'}`}
    >
      {!isForYou && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8 md:mb-12"
        >
          <h1 className="text-heading-1 mb-4">{t('ideas.browse_ideas')}</h1>
          <p className="text-body-large">{t('ideas.discover_ideas')}</p>
        </motion.div>
      )}

      {/* Show skeletons while loading initial data */}
      {!initialized && (
        <>
          {isForYou ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <IdeaCardSkeleton key={`skeleton-${i}`} />
              ))}
            </div>
          ) : (
            <div className="space-y-4 max-w-2xl mx-auto">
              {[1, 2, 3, 4, 5].map(i => (
                <IdeaCardSkeleton key={`skeleton-${i}`} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Show ideas once loaded */}
      {initialized && (
        <>
          {isForYou ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {ideas.map((idea, index) => (
                <motion.div
                  key={idea.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.03 }}
                >
                  <IdeaCard idea={idea} />
                </motion.div>
              ))}
              {/* Loading skeletons for new items */}
              {loading &&
                [1, 2].map(i => <IdeaCardSkeleton key={`loading-${i}`} />)}
            </div>
          ) : (
            <div className="space-y-4 max-w-2xl mx-auto">
              {ideas.map((idea, index) => (
                <motion.div
                  key={idea.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <IdeaCard idea={idea} />
                </motion.div>
              ))}
              {/* Loading skeletons for new items */}
              {loading &&
                [1, 2].map(i => <IdeaCardSkeleton key={`loading-${i}`} />)}
            </div>
          )}

          {/* Auto-loading trigger for For You section */}
          {isForYou && <div ref={loadMoreRef} className="mt-8 h-4" />}

          {/* Manual load more button for non-ForYou sections */}
          {!isForYou && (
            <div className="mt-12 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loading || !hasMore}
                className="button-secondary"
              >
                {loading
                  ? t('status.loading')
                  : hasMore
                    ? t('actions.load_more')
                    : t('status.no_more_ideas')}
              </button>
            </div>
          )}

          {/* Loading indicator for For You */}
          {isForYou && loading && (
            <div className="mt-8 text-center">
              <div className="text-text-secondary">
                {t('status.loading_more_ideas')}
              </div>
            </div>
          )}

          {/* No more items indicator */}
          {isForYou && !hasMore && ideas.length > 0 && (
            <div className="mt-8 text-center">
              <div className="text-text-secondary">
                {t('status.no_more_ideas')}
              </div>
            </div>
          )}
        </>
      )}
    </main>
  )

  return content
}
