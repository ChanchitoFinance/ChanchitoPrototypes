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
}

export function IdeasFeed({
  showHeader = true,
  showFooter = true,
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
      // Load only 6 items initially for faster initial load
      ideaService.getIdeas(6).then(loadedIdeas => {
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
      const newIdeas = await ideaService.loadMoreIdeas(ideas.length)
      if (newIdeas.length === 0) {
        setHasMore(false)
      } else {
        setIdeas(prev => [...prev, ...newIdeas])
      }
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, ideas.length])


  const content = (
    <main className="flex-1 w-full px-4 md:px-6 py-8 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 md:mb-12"
      >
        <h1 className="text-heading-1 mb-4">{t('ideas.browse_ideas')}</h1>
        <p className="text-body-large">{t('ideas.discover_ideas')}</p>
      </motion.div>

      {/* Show skeletons while loading initial data */}
      {!initialized && (
        <div className="space-y-4 max-w-2xl mx-auto">
          {[1, 2, 3, 4, 5].map(i => (
            <IdeaCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      )}

      {/* Show ideas once loaded */}
      {initialized && (
        <>
          <div className="space-y-4 max-w-2xl mx-auto">
            {ideas.map((idea, index) => (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <IdeaCard idea={idea} variant="interactive" />
              </motion.div>
            ))}
            {/* Loading skeletons for new items */}
            {loading &&
              [1, 2].map(i => <IdeaCardSkeleton key={`loading-${i}`} />)}
          </div>

          {/* Manual load more button */}
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
        </>
      )}
    </main>
  )

  return content
}
