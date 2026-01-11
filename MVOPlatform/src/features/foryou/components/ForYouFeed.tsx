'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { ForYouIdeaCard } from './ForYouIdeaCard'
import { Idea } from '@/core/types/idea'
import { ideaService } from '@/core/lib/services/ideaService'
import { ExploreIdeaSkeleton } from '@/shared/components/ui/Skeleton'
import { useAppSelector } from '@/core/lib/hooks'
import {
  useTranslations,
  useLocale,
} from '@/shared/components/providers/I18nProvider'

interface ForYouFeedProps {
  initialIdeaId?: string
}

export function ForYouFeed({ initialIdeaId }: ForYouFeedProps) {
  const t = useTranslations()
  const { locale } = useLocale()
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [initialized, setInitialized] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const [hasCompletedInitialLoad, setHasCompletedInitialLoad] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const hasSetInitialScroll = useRef(false)
  const lastUrlIdeaId = useRef<string | null>(null)
  const uniqueIdeasCount = useRef(0)
  const { isAuthenticated } = useAppSelector(state => state.auth)

  const handleKeyDown = useCallback(
    async (e: KeyboardEvent) => {
      if (!initialized || ideas.length === 0 || isVoting) return

      const activeIdea = ideas[activeIndex]
      if (!activeIdea) return

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (!isAuthenticated) {
          toast.warning(t('auth.sign_in_to_vote'))
          return
        }
        setIsVoting(true)
        try {
          const updatedIdea = await ideaService.toggleVote(activeIdea.id, 'use')
          setIdeas(prev =>
            prev.map(idea => (idea.id === activeIdea.id ? updatedIdea : idea))
          )
        } catch (error) {
          console.error('Error voting:', error)
        } finally {
          setIsVoting(false)
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (!isAuthenticated) {
          toast.warning(t('auth.sign_in_to_vote'))
          return
        }
        setIsVoting(true)
        try {
          const updatedIdea = await ideaService.toggleVote(
            activeIdea.id,
            'dislike'
          )
          setIdeas(prev =>
            prev.map(idea => (idea.id === activeIdea.id ? updatedIdea : idea))
          )
        } catch (error) {
          console.error('Error voting:', error)
        } finally {
          setIsVoting(false)
        }
      }
    },
    [initialized, ideas, activeIndex, isVoting, isAuthenticated]
  )

  // Load initial ideas for For You section (TikTok-style)
  useEffect(() => {
    if (!initialized) {
      setLoading(true)

      // Function to load ideas and check for initialIdeaId
      const loadIdeasWithInitialId = async (
        offset = 0,
        accumulatedIdeas: Idea[] = []
      ) => {
        // Start with smaller batch size for faster initial render
        const batchSize = initialIdeaId ? 10 : 3
        const maxIdeas = initialIdeaId ? 15 : 6

        const loadedIdeas = await ideaService.getExploreIdeas(batchSize, offset)

        if (loadedIdeas.length === 0) {
          // No more ideas to load
          return accumulatedIdeas
        }

        // Filter out any duplicates that might be returned by the API
        const existingIds = new Set(accumulatedIdeas.map(idea => idea.id))
        const uniqueLoadedIdeas = loadedIdeas.filter(
          idea => !existingIds.has(idea.id)
        )

        const allIdeas = [...accumulatedIdeas, ...uniqueLoadedIdeas]

        // Check if we found the initial idea
        if (initialIdeaId) {
          const hasInitialIdea = allIdeas.some(
            idea => idea.id === initialIdeaId
          )

          // If we haven't found it yet and have less than 15 ideas, load more
          if (!hasInitialIdea && allIdeas.length < 15) {
            return loadIdeasWithInitialId(offset + batchSize, allIdeas)
          }
        }

        return allIdeas
      }

      loadIdeasWithInitialId().then(async loadedIdeas => {
        // Batch fetch user votes for all loaded ideas
        if (isAuthenticated && loadedIdeas.length > 0) {
          try {
            const ideaIds = loadedIdeas.map(idea => idea.id)
            const votesMap = await ideaService.getUserVotesForIdeas(ideaIds)
            // Update ideas with user vote information
            loadedIdeas = loadedIdeas.map(idea => ({
              ...idea,
              userVotes: votesMap[idea.id] || {
                use: false,
                dislike: false,
                pay: false,
              },
            }))
          } catch (error) {
            console.error('Error fetching user votes:', error)
          }
        }

        // Set initial active index based on URL parameter
        let initialIndex = 0
        if (initialIdeaId && loadedIdeas.length > 0) {
          const foundIndex = loadedIdeas.findIndex(
            idea => idea.id === initialIdeaId
          )
          if (foundIndex >= 0) {
            initialIndex = foundIndex
            lastUrlIdeaId.current = initialIdeaId
          } else {
            // If initial idea not found, default to first idea
            lastUrlIdeaId.current = loadedIdeas[0].id
          }
        } else if (loadedIdeas.length > 0) {
          // No initial idea specified, default to first idea
          lastUrlIdeaId.current = loadedIdeas[0].id
        }

        // Ensure no duplicates in the final ideas array
        const uniqueIdeas = loadedIdeas.filter(
          (idea, index, self) => index === self.findIndex(i => i.id === idea.id)
        )

        // Update the unique count
        uniqueIdeasCount.current = uniqueIdeas.length

        // Set state all at once to avoid intermediate renders
        setIdeas(uniqueIdeas)
        setActiveIndex(initialIndex)
        setLoading(false)
        setInitialized(true)
        setHasCompletedInitialLoad(true)
      })
    }
  }, [initialized, initialIdeaId, isAuthenticated])

  const loadMoreIdeas = useCallback(async () => {
    if (loading) return
    setLoading(true)
    try {
      // Load more explore ideas with offset - use ref for correct offset
      const newIdeas = await ideaService.getExploreIdeas(
        3,
        uniqueIdeasCount.current
      )
      if (newIdeas.length > 0) {
        // Filter out any duplicate ideas that might already exist in the current list
        const existingIdeaIds = new Set(ideas.map(idea => idea.id))
        const uniqueNewIdeas = newIdeas.filter(
          idea => !existingIdeaIds.has(idea.id)
        )

        if (uniqueNewIdeas.length > 0) {
          // Batch fetch user votes for new ideas
          if (isAuthenticated) {
            try {
              const newIdeaIds = uniqueNewIdeas.map(idea => idea.id)
              const votesMap =
                await ideaService.getUserVotesForIdeas(newIdeaIds)
              // Update new ideas with user vote information
              const newIdeasWithVotes = uniqueNewIdeas.map(idea => ({
                ...idea,
                userVotes: votesMap[idea.id] || {
                  use: false,
                  dislike: false,
                  pay: false,
                },
              }))
              setIdeas(prev => {
                const combined = [...prev, ...newIdeasWithVotes]
                const deduplicated = combined.filter(
                  (idea, index, self) =>
                    index === self.findIndex(i => i.id === idea.id)
                )
                uniqueIdeasCount.current = deduplicated.length
                return deduplicated
              })
            } catch (error) {
              console.error('Error fetching user votes for new ideas:', error)
              setIdeas(prev => {
                const combined = [...prev, ...uniqueNewIdeas]
                const deduplicated = combined.filter(
                  (idea, index, self) =>
                    index === self.findIndex(i => i.id === idea.id)
                )
                uniqueIdeasCount.current = deduplicated.length
                return deduplicated
              })
            }
          } else {
            setIdeas(prev => {
              const combined = [...prev, ...uniqueNewIdeas]
              const deduplicated = combined.filter(
                (idea, index, self) =>
                  index === self.findIndex(i => i.id === idea.id)
              )
              uniqueIdeasCount.current = deduplicated.length
              return deduplicated
            })
          }
        }
      }
    } finally {
      setLoading(false)
    }
  }, [loading, isAuthenticated])

  // Add keyboard event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  // Update URL when active idea changes
  useEffect(() => {
    if (
      initialized &&
      ideas.length > 0 &&
      activeIndex >= 0 &&
      activeIndex < ideas.length
    ) {
      const currentIdea = ideas[activeIndex]
      if (currentIdea && currentIdea.id !== lastUrlIdeaId.current) {
        // Only skip URL update if we haven't completed initial load yet
        // AND we're on the initial idea from URL
        const shouldSkipUpdate =
          !hasCompletedInitialLoad &&
          initialIdeaId &&
          currentIdea.id === initialIdeaId

        if (!shouldSkipUpdate) {
          lastUrlIdeaId.current = currentIdea.id
          router.replace(`/${locale}/for-you?id=${currentIdea.id}`, {
            scroll: false,
          })
        }
      }
    }
  }, [
    activeIndex,
    ideas,
    initialized,
    router,
    initialIdeaId,
    hasCompletedInitialLoad,
  ])

  // Scroll to initial position when component is ready
  useEffect(() => {
    if (
      initialized &&
      initialIdeaId &&
      !hasSetInitialScroll.current &&
      containerRef.current
    ) {
      const initialIndex = ideas.findIndex(idea => idea.id === initialIdeaId)
      if (initialIndex >= 0) {
        const scrollPosition = initialIndex * window.innerHeight
        containerRef.current.scrollTo({
          top: scrollPosition,
          behavior: 'instant',
        })
        hasSetInitialScroll.current = true
      }
    }
  }, [initialized, initialIdeaId, ideas])

  useEffect(() => {
    // Set up intersection observer for infinite scroll
    const options = {
      root: null,
      rootMargin: '200px', // Load earlier for smoother experience
      threshold: 0.1,
    }

    observerRef.current = new IntersectionObserver(entries => {
      entries.forEach(entry => {
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
    elements?.forEach(el => observerRef.current?.observe(el))

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
      className="h-screen w-full overflow-y-scroll snap-y snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      style={{
        scrollSnapType: 'y mandatory',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Show skeletons while initializing */}
      {!initialized && (
        <>
          {[1, 2, 3, 4, 5].map(i => (
            <div
              key={`skeleton-${i}`}
              className="h-screen snap-start snap-mandatory bg-[var(--background)]"
            >
              <ExploreIdeaSkeleton />
            </div>
          ))}
        </>
      )}

      {/* Show ideas once loaded */}
      {initialized &&
        ideas.map((idea, index) => (
          <div key={idea.id} data-index={index}>
            <ForYouIdeaCard
              idea={idea}
              isActive={index === activeIndex}
              initialUserVotes={idea.userVotes}
            />
          </div>
        ))}

      {/* Loading indicator at the end */}
      {loading && initialized && (
        <div className="h-screen snap-start snap-mandatory flex items-center justify-center bg-[var(--background)]">
          <div className="text-[var(--text-primary)] text-lg">
            {t('status.loading_more_ideas')}
          </div>
        </div>
      )}
    </div>
  )
}
