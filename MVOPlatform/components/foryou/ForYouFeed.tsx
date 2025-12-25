'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ForYouIdeaCard } from './ForYouIdeaCard'
import { Idea } from '@/lib/types/idea'
import { ideaService } from '@/lib/services/ideaService'
import { ExploreIdeaSkeleton } from '@/components/ui/Skeleton'
import { useAppSelector } from '@/lib/hooks'
import { useTranslations, useLocale } from '@/components/providers/I18nProvider'

interface ForYouFeedProps {
  initialIdeaId?: string
}

export function ForYouFeed({ initialIdeaId }: ForYouFeedProps) {
  const t = useTranslations()
  const { locale } = useLocale()
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const [initialized, setInitialized] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const hasSetInitialScroll = useRef(false)
  const lastUrlIdeaId = useRef<string | null>(null)
  const { isAuthenticated } = useAppSelector(state => state.auth)

  const handleKeyDown = useCallback(
    async (e: KeyboardEvent) => {
      if (!initialized || ideas.length === 0 || isVoting) return

      const activeIdea = ideas[activeIndex]
      if (!activeIdea) return

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (!isAuthenticated) {
          alert(t('auth.sign_in_to_vote'))
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
          alert(t('auth.sign_in_to_vote'))
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

  // Load initial ideas for For You section (TikTok-style) - Only load first batch
  useEffect(() => {
    if (!initialized) {
      setLoading(true)
      // Load only 3 ideas initially for faster initial load
      ideaService.getExploreIdeas(3).then(async loadedIdeas => {
        setIdeas(loadedIdeas)

        // Batch fetch user votes for all loaded ideas
        if (isAuthenticated && loadedIdeas.length > 0) {
          try {
            const ideaIds = loadedIdeas.map(idea => idea.id)
            const votesMap = await ideaService.getUserVotesForIdeas(ideaIds)
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
          } catch (error) {
            console.error('Error fetching user votes:', error)
          }
        }

        setLoading(false)
        setInitialized(true)

        // Set initial active index based on URL parameter
        if (initialIdeaId && loadedIdeas.length > 0) {
          const initialIndex = loadedIdeas.findIndex(
            idea => idea.id === initialIdeaId
          )
          if (initialIndex >= 0) {
            setActiveIndex(initialIndex)
            lastUrlIdeaId.current = initialIdeaId
          }
        }
      })
    }
  }, [initialized, initialIdeaId, isAuthenticated])

  const loadMoreIdeas = useCallback(async () => {
    if (loading) return
    setLoading(true)
    try {
      // Load more explore ideas with offset - smaller batches for better performance
      const newIdeas = await ideaService.getExploreIdeas(3, ideas.length)
      if (newIdeas.length > 0) {
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
  }, [loading, ideas.length, isAuthenticated])

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
        lastUrlIdeaId.current = currentIdea.id
        router.replace(`/${locale}/for-you?id=${currentIdea.id}`, {
          scroll: false,
        })
      }
    }
  }, [activeIndex, ideas, initialized, router])

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
              className="h-screen snap-start snap-mandatory"
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
        <div className="h-screen snap-start snap-mandatory flex items-center justify-center bg-black">
          <div className="text-white text-lg">
            {t('status.loading_more_ideas')}
          </div>
        </div>
      )}
    </div>
  )
}
