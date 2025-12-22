'use client'

import { useEffect, useRef, useMemo } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Footer } from '@/components/layout/Footer'
import { IdeaCard } from '@/components/ideas/IdeaCard'
import { motion } from 'framer-motion'
import { IdeaCardSkeleton } from '@/components/ui/Skeleton'
import { useTranslations } from '@/components/providers/I18nProvider'
import { useGetIdeasInfiniteQuery } from '@/lib/api/ideasApi'

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
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  // RTK Query hook with appropriate filter based on mode
  const {
    data: ideasData,
    isLoading,
    isFetching: isFetchingMore,
    hasNextPage,
    fetchNextPage,
  } = useGetIdeasInfiniteQuery({
    limit: 6,
    statusFilter: isForYou ? 'forYou' : undefined,
  })

  // Flatten paginated ideas into a single array
  const ideas = useMemo(() => {
    if (!ideasData?.pages) return []
    return ideasData.pages.flatMap(page => page.ideas)
  }, [ideasData])

  // Handle manual load more (for non-ForYou sections)
  const handleLoadMore = () => {
    if (!isFetchingMore && hasNextPage) {
      fetchNextPage()
    }
  }

  // Auto-loading with IntersectionObserver for For You section
  useEffect(() => {
    if (!isForYou || isLoading || !hasNextPage) return

    const options = {
      root: null,
      rootMargin: '200px',
      threshold: 0.1,
    }

    observerRef.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingMore) {
        fetchNextPage()
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
  }, [isForYou, isLoading, hasNextPage, isFetchingMore, fetchNextPage])

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
      {isLoading && (
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
      {!isLoading && (
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
              {isFetchingMore &&
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
              {isFetchingMore &&
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
                disabled={isFetchingMore || !hasNextPage}
                className="button-secondary"
              >
                {isFetchingMore
                  ? t('status.loading')
                  : hasNextPage
                    ? t('actions.load_more')
                    : t('status.no_more_ideas')}
              </button>
            </div>
          )}

          {/* Loading indicator for For You */}
          {isForYou && isFetchingMore && (
            <div className="mt-8 text-center">
              <div className="text-text-secondary">
                {t('status.loading_more_ideas')}
              </div>
            </div>
          )}

          {/* No more items indicator */}
          {isForYou && !hasNextPage && ideas.length > 0 && (
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
