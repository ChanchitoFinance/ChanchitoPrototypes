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
import { useAppSelector } from '@/lib/hooks'

interface HomeFeedProps {
  showHeader?: boolean
  showFooter?: boolean
}

export function HomeFeed({
  showHeader = true,
  showFooter = true,
}: HomeFeedProps) {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [newIdeas, setNewIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [isVoting, setIsVoting] = useState(false)
  const [hoveredIdeaId, setHoveredIdeaId] = useState<string | null>(null)
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const { isAuthenticated } = useAppSelector(state => state.auth)

  const handleKeyDown = useCallback(
    async (e: KeyboardEvent) => {
      if (!initialized || !hoveredIdeaId || isVoting) return

      const hoveredIdea = [...ideas, ...newIdeas].find(
        idea => idea.id === hoveredIdeaId
      )
      if (!hoveredIdea) return

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (!isAuthenticated) {
          alert('Please sign in to vote')
          return
        }
        setIsVoting(true)
        try {
          const updatedIdea = await ideaService.toggleVote(
            hoveredIdea.id,
            'use'
          )
          setIdeas(prev =>
            prev.map(idea => (idea.id === hoveredIdea.id ? updatedIdea : idea))
          )
          setNewIdeas(prev =>
            prev.map(idea => (idea.id === hoveredIdea.id ? updatedIdea : idea))
          )
        } catch (error) {
          console.error('Error voting:', error)
        } finally {
          setIsVoting(false)
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (!isAuthenticated) {
          alert('Please sign in to vote')
          return
        }
        setIsVoting(true)
        try {
          const updatedIdea = await ideaService.toggleVote(
            hoveredIdea.id,
            'dislike'
          )
          setIdeas(prev =>
            prev.map(idea => (idea.id === hoveredIdea.id ? updatedIdea : idea))
          )
          setNewIdeas(prev =>
            prev.map(idea => (idea.id === hoveredIdea.id ? updatedIdea : idea))
          )
        } catch (error) {
          console.error('Error voting:', error)
        } finally {
          setIsVoting(false)
        }
      }
    },
    [initialized, hoveredIdeaId, isVoting, isAuthenticated, ideas, newIdeas]
  )

  // Add keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  // Load initial ideas - Load more content upfront, not lazy
  useEffect(() => {
    if (!initialized) {
      setLoading(true)
      // Load 12 items initially for better UX (not waiting for demand)
      Promise.all([ideaService.getIdeas(12), ideaService.getNewIdeas(2)]).then(
        async ([loadedIdeas, loadedNewIdeas]) => {
          setIdeas(loadedIdeas)
          setNewIdeas(loadedNewIdeas)

          // Batch fetch user votes for all loaded ideas
          if (
            isAuthenticated &&
            [...loadedIdeas, ...loadedNewIdeas].length > 0
          ) {
            const allIdeaIds = [...loadedIdeas, ...loadedNewIdeas].map(
              idea => idea.id
            )
            try {
              const votesMap =
                await ideaService.getUserVotesForIdeas(allIdeaIds)
              // Update ideas with user vote information
              setIdeas(prev =>
                prev.map(idea => ({
                  ...idea,
                  userVotes: votesMap[idea.id] || {
                    use: false,
                    dislike: false,
                    pay: false,
                  },
                }))
              )
              setNewIdeas(prev =>
                prev.map(idea => ({
                  ...idea,
                  userVotes: votesMap[idea.id] || {
                    use: false,
                    dislike: false,
                    pay: false,
                  },
                }))
              )
            } catch (error) {
              console.error('Error fetching user votes:', error)
            }
          }

          setLoading(false)
          setInitialized(true)
        }
      )
    }
  }, [initialized, isAuthenticated])

  const handleLoadMore = useCallback(async () => {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      // Load more ideas with offset
      const newIdeas = await ideaService.loadMoreIdeas(ideas.length)
      if (newIdeas.length === 0) {
        setHasMore(false)
      } else {
        // Batch fetch user votes for new ideas
        if (isAuthenticated) {
          try {
            const newIdeaIds = newIdeas.map(idea => idea.id)
            const votesMap = await ideaService.getUserVotesForIdeas(newIdeaIds)
            // Update new ideas with user vote information
            const newIdeasWithVotes = newIdeas.map(idea => ({
              ...idea,
              userVotes: votesMap[idea.id] || {
                use: false,
                dislike: false,
                pay: false,
              },
            }))
            setIdeas(prev => [...prev, ...newIdeasWithVotes])
          } catch (error) {
            console.error('Error fetching user votes for new ideas:', error)
            setIdeas(prev => [...prev, ...newIdeas])
          }
        } else {
          setIdeas(prev => [...prev, ...newIdeas])
        }
      }
    } finally {
      setLoading(false)
    }
  }, [loading, hasMore, ideas.length, isAuthenticated])

  // Auto-loading with IntersectionObserver
  useEffect(() => {
    if (!initialized || !hasMore) return

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
  }, [initialized, hasMore, loading, handleLoadMore])

  const content = (
    <main className="flex-1 w-full px-4 md:px-6 py-8 max-w-7xl mx-auto">
      {/* Show skeletons while loading initial data */}
      {!initialized && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(i => (
            <IdeaCardSkeleton key={`skeleton-${i}`} />
          ))}
        </div>
      )}

      {/* Show ideas once loaded */}
      {initialized && (
        <>
          {/* New Ideas Section */}
          {newIdeas.length > 0 && (
            <div className="mb-6 md:mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-accent/20 text-accent text-sm font-semibold rounded-full">
                  New Ideas
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
                      initialUserVotes={idea.userVotes}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Regular Ideas Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {ideas.map((idea, index) => (
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
                  initialUserVotes={idea.userVotes}
                />
              </motion.div>
            ))}
            {/* Loading skeletons for new items */}
            {loading &&
              [1, 2].map(i => <IdeaCardSkeleton key={`loading-${i}`} />)}
          </div>

          {/* Auto-loading trigger */}
          <div ref={loadMoreRef} className="mt-8 h-4" />

          {/* Loading indicator */}
          {loading && (
            <div className="mt-8 text-center">
              <div className="text-text-secondary">
                {UI_LABELS.LOADING_MORE_IDEAS}
              </div>
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
