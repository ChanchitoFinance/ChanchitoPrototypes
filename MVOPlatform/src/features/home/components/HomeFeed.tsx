'use client'

import { useState, useEffect, useCallback } from 'react'
import { Idea } from '@/core/types/idea'
import { ideaService } from '@/core/lib/services/ideaService'
import { useAppSelector } from '@/core/lib/hooks'
import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { toast } from 'sonner'
import { HorizontalScrollSection } from './HorizontalScrollSection'
import { TendenciesSection } from './TendenciesSection'

export function HomeFeed() {
  const t = useTranslations()
  const [loading, setLoading] = useState(true)
  const [isVoting, setIsVoting] = useState(false)
  const [hoveredIdeaId, setHoveredIdeaId] = useState<string | null>(null)
  const { isAuthenticated } = useAppSelector(state => state.auth)

  // Section data states
  const [recentIdeas, setRecentIdeas] = useState<Idea[]>([])
  const [featuredIdeas, setFeaturedIdeas] = useState<Idea[]>([])
  const [communitiesFavorite, setCommunitiesFavorite] = useState<Idea[]>([])
  const [mostCommented, setMostCommented] = useState<Idea[]>([])
  const [ideasByStatus, setIdeasByStatus] = useState<{
    new: Idea[]
    active_discussion: Idea[]
    trending: Idea[]
    validated: Idea[]
  }>({
    new: [],
    active_discussion: [],
    trending: [],
    validated: [],
  })

  const updateIdeaInAllSections = useCallback((updatedIdea: Idea) => {
    const updateIdeas = (ideas: Idea[]) =>
      ideas.map(idea => (idea.id === updatedIdea.id ? updatedIdea : idea))

    setRecentIdeas(prev => updateIdeas(prev))
    setFeaturedIdeas(prev => updateIdeas(prev))
    setCommunitiesFavorite(prev => updateIdeas(prev))
    setMostCommented(prev => updateIdeas(prev))
    setIdeasByStatus(prev => ({
      new: updateIdeas(prev.new),
      active_discussion: updateIdeas(prev.active_discussion),
      trending: updateIdeas(prev.trending),
      validated: updateIdeas(prev.validated),
    }))
  }, [])

  const handleKeyDown = useCallback(
    async (e: KeyboardEvent) => {
      if (!hoveredIdeaId || isVoting) return

      const allIdeas = [
        ...recentIdeas,
        ...featuredIdeas,
        ...communitiesFavorite,
        ...mostCommented,
        ...ideasByStatus.new,
        ...ideasByStatus.active_discussion,
        ...ideasByStatus.trending,
        ...ideasByStatus.validated,
      ]

      const hoveredIdea = allIdeas.find(idea => idea.id === hoveredIdeaId)
      if (!hoveredIdea) return

      if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (!isAuthenticated) {
          toast.warning(t('auth.sign_in_to_vote'))
          return
        }
        setIsVoting(true)
        try {
          const updatedIdea = await ideaService.toggleVote(
            hoveredIdea.id,
            'use'
          )
          updateIdeaInAllSections(updatedIdea)
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
            hoveredIdea.id,
            'dislike'
          )
          updateIdeaInAllSections(updatedIdea)
        } catch (error) {
          console.error('Error voting:', error)
        } finally {
          setIsVoting(false)
        }
      }
    },
    [
      hoveredIdeaId,
      isVoting,
      isAuthenticated,
      recentIdeas,
      featuredIdeas,
      communitiesFavorite,
      mostCommented,
      ideasByStatus,
      t,
      updateIdeaInAllSections,
    ]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  useEffect(() => {
    const loadAllSections = async () => {
      setLoading(true)
      try {
        const [
          recent,
          featured,
          favorite,
          commented,
          statusNew,
          statusActive,
          statusTrending,
          statusValidated,
        ] = await Promise.all([
          ideaService.getRecentIdeas(30),
          ideaService.getFeaturedByScore(30),
          ideaService.getCommunitiesFavorite(30),
          ideaService.getMostCommented(30),
          ideaService.getIdeasByStatusFlag('new', 30),
          ideaService.getIdeasByStatusFlag('active_discussion', 30),
          ideaService.getIdeasByStatusFlag('trending', 30),
          ideaService.getIdeasByStatusFlag('validated', 30),
        ])

        setRecentIdeas(recent)
        setFeaturedIdeas(featured)
        setCommunitiesFavorite(favorite)
        setMostCommented(commented)
        setIdeasByStatus({
          new: statusNew,
          active_discussion: statusActive,
          trending: statusTrending,
          validated: statusValidated,
        })

        // Fetch user votes if authenticated
        if (isAuthenticated) {
          const allIdeaIds = [
            ...recent,
            ...featured,
            ...favorite,
            ...commented,
            ...statusNew,
            ...statusActive,
            ...statusTrending,
            ...statusValidated,
          ].map(idea => idea.id)

          // Remove duplicates
          const uniqueIdeaIds = [...new Set(allIdeaIds)]

          try {
            const votesMap =
              await ideaService.getUserVotesForIdeas(uniqueIdeaIds)

            const addVotesToIdeas = (ideas: Idea[]) =>
              ideas.map(idea => ({
                ...idea,
                userVotes: votesMap[idea.id] || {
                  use: false,
                  dislike: false,
                  pay: false,
                },
              }))

            setRecentIdeas(prev => addVotesToIdeas(prev))
            setFeaturedIdeas(prev => addVotesToIdeas(prev))
            setCommunitiesFavorite(prev => addVotesToIdeas(prev))
            setMostCommented(prev => addVotesToIdeas(prev))
            setIdeasByStatus(prev => ({
              new: addVotesToIdeas(prev.new),
              active_discussion: addVotesToIdeas(prev.active_discussion),
              trending: addVotesToIdeas(prev.trending),
              validated: addVotesToIdeas(prev.validated),
            }))
          } catch (error) {
            console.error('Error fetching user votes:', error)
          }
        }
      } catch (error) {
        console.error('Error loading home feed:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAllSections()
  }, [isAuthenticated])

  return (
    <main className="flex-1 w-full px-4 md:px-6 xl:px-8 py-24 max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] mx-auto">
      {/* Descubre algo nuevo - Recent ideas */}
      <HorizontalScrollSection
        title={t('home.discover_new')}
        ideas={recentIdeas}
        loading={loading}
        visibleCards={3}
        onIdeaHover={setHoveredIdeaId}
        hoveredIdeaId={hoveredIdeaId}
      />

      {/* Destacados - Featured by score */}
      <HorizontalScrollSection
        title={t('home.featured')}
        ideas={featuredIdeas}
        loading={loading}
        visibleCards={3}
        onIdeaHover={setHoveredIdeaId}
        hoveredIdeaId={hoveredIdeaId}
      />

      {/* Tendencias - Vertical lists by status */}
      <TendenciesSection
        title={t('home.trends')}
        ideasByStatus={ideasByStatus}
        loading={loading}
        onIdeaHover={setHoveredIdeaId}
        hoveredIdeaId={hoveredIdeaId}
      />

      {/* Communities' Favorite */}
      <HorizontalScrollSection
        title={t('home.communities_favorite')}
        ideas={communitiesFavorite}
        loading={loading}
        visibleCards={2}
        onIdeaHover={setHoveredIdeaId}
        hoveredIdeaId={hoveredIdeaId}
      />

      {/* Most Commented */}
      <HorizontalScrollSection
        title={t('home.most_commented')}
        ideas={mostCommented}
        loading={loading}
        visibleCards={3}
        onIdeaHover={setHoveredIdeaId}
        hoveredIdeaId={hoveredIdeaId}
      />
    </main>
  )
}
