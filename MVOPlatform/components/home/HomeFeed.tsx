'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Footer } from '@/components/layout/Footer'
import { HomeIdeaCard } from '@/components/home/HomeIdeaCard'
import { motion } from 'framer-motion'
import { IdeaCardSkeleton } from '@/components/ui/Skeleton'
import { useAppSelector } from '@/lib/hooks'
import { useTranslations } from '@/components/providers/I18nProvider'
import {
  useGetIdeasInfiniteQuery,
  useGetNewIdeasQuery,
  useGetUserVotesForIdeasQuery,
  useToggleVoteMutation,
} from '@/lib/api/ideasApi'

interface HomeFeedProps {
  showHeader?: boolean
  showFooter?: boolean
}

export function HomeFeed({
  showHeader = true,
  showFooter = true,
}: HomeFeedProps) {
  const t = useTranslations()
  const [hoveredIdeaId, setHoveredIdeaId] = useState<string | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const { isAuthenticated } = useAppSelector(state => state.auth)

  // RTK Query hooks for data fetching
  const {
    data: ideasData,
    isLoading: isLoadingIdeas,
    isFetching: isFetchingMore,
    hasNextPage,
    fetchNextPage,
  } = useGetIdeasInfiniteQuery({ limit: 12 })

  const { data: newIdeasData, isLoading: isLoadingNewIdeas } =
    useGetNewIdeasQuery(2)

  // Flatten paginated ideas into a single array
  const ideas = useMemo(() => {
    if (!ideasData?.pages) return []
    return ideasData.pages.flatMap(page => page.ideas)
  }, [ideasData])

  // Filter out new ideas from main list to avoid duplicates
  const newIdeas = newIdeasData || []
  const newIdeaIds = useMemo(
    () => new Set(newIdeas.map(idea => idea.id)),
    [newIdeas]
  )
  const filteredIdeas = useMemo(
    () => ideas.filter(idea => !newIdeaIds.has(idea.id)),
    [ideas, newIdeaIds]
  )

  // Collect all idea IDs for batch user votes query
  const allIdeaIds = useMemo(
    () => [...filteredIdeas, ...newIdeas].map(idea => idea.id),
    [filteredIdeas, newIdeas]
  )

  // Fetch user votes for all visible ideas (only when authenticated)
  const { data: userVotesMap } = useGetUserVotesForIdeasQuery(allIdeaIds, {
    skip: !isAuthenticated || allIdeaIds.length === 0,
  })

  // Vote mutation
  const [toggleVote, { isLoading: isVoting }] = useToggleVoteMutation()

  // Keyboard voting handler
  const handleKeyDown = useCallback(
    async (e: KeyboardEvent) => {
      if (!hoveredIdeaId || isVoting) return

      const allIdeas = [...filteredIdeas, ...newIdeas]
      const hoveredIdea = allIdeas.find(idea => idea.id === hoveredIdeaId)
      if (!hoveredIdea) return

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (!isAuthenticated) {
          alert(t('auth.sign_in_to_vote'))
          return
        }
        toggleVote({ ideaId: hoveredIdea.id, voteType: 'use' })
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (!isAuthenticated) {
          alert(t('auth.sign_in_to_vote'))
          return
        }
        toggleVote({ ideaId: hoveredIdea.id, voteType: 'dislike' })
      }
    },
    [hoveredIdeaId, isVoting, isAuthenticated, filteredIdeas, newIdeas, toggleVote]
  )

  // Keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  // Auto-loading with IntersectionObserver
  useEffect(() => {
    if (isLoadingIdeas || !hasNextPage) return

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
  }, [isLoadingIdeas, hasNextPage, isFetchingMore, fetchNextPage])

  const isInitialLoading = isLoadingIdeas || isLoadingNewIdeas

  const content = (
    <main className="flex-1 w-full px-4 md:px-6 py-8 max-w-7xl mx-auto">
      {/* Show skeletons while loading initial data */}
      {isInitialLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
            <IdeaCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      )}

      {/* Show ideas once loaded */}
      {!isInitialLoading && (
        <>
          {/* New Ideas Section */}
          {newIdeas.length > 0 && (
            <div className="mb-6 md:mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-accent/20 text-accent text-sm font-semibold rounded-full">
                  {t('ideas.new_ideas')}
                </span>
                <div className="flex-1 h-px bg-border"></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {newIdeas.map((idea, index) => (
                  <motion.div
                    key={idea.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.03 }}
                  >
                    <HomeIdeaCard
                      idea={idea}
                      onMouseEnter={() => setHoveredIdeaId(idea.id)}
                      onMouseLeave={() => setHoveredIdeaId(null)}
                      initialUserVotes={userVotesMap?.[idea.id]}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Regular Ideas Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {filteredIdeas.map((idea, index) => (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.03 }}
              >
                <HomeIdeaCard
                  idea={idea}
                  onMouseEnter={() => setHoveredIdeaId(idea.id)}
                  onMouseLeave={() => setHoveredIdeaId(null)}
                  initialUserVotes={userVotesMap?.[idea.id]}
                />
              </motion.div>
            ))}
            {/* Loading skeletons for new items */}
            {isFetchingMore &&
              [1, 2].map(i => <IdeaCardSkeleton key={`loading-${i}`} />)}
          </div>

          {/* Auto-loading trigger */}
          <div ref={loadMoreRef} className="mt-8 h-4" />

          {/* Loading indicator */}
          {isFetchingMore && (
            <div className="mt-8 text-center">
              <div className="text-text-secondary">
                {t('status.loading_more_ideas')}
              </div>
            </div>
          )}

          {/* No more items indicator */}
          {!hasNextPage && filteredIdeas.length > 0 && (
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
