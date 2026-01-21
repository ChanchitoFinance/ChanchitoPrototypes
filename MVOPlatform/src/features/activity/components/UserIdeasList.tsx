'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  useTranslations,
  useLocale,
} from '@/shared/components/providers/I18nProvider'
import { ideaService } from '@/core/lib/services/ideaService'
import { Idea } from '@/core/types/idea'
import { IdeaCard } from '@/features/ideas/components/IdeaCard'
import { Button } from '@/shared/components/ui/Button'
import { Plus, SortAsc, Filter, RefreshCw } from 'lucide-react'
import { useAppSelector } from '@/core/lib/hooks'

type SortOption = 'recent' | 'popular' | 'most_votes' | 'highest_score'

export function UserIdeasList() {
  const t = useTranslations()
  const router = useRouter()
  const { locale } = useLocale()
  const { isAuthenticated } = useAppSelector(state => state.auth)
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadUserIdeas()
  }, [sortBy])

  // Add a refresh function that can be called externally
  const refreshIdeas = () => {
    loadUserIdeas()
  }

  const loadUserIdeas = async () => {
    try {
      setLoading(true)
      setError(null)

      const userIdeas = await ideaService.getUserIdeas()

      // Fetch user votes for the ideas if authenticated
      if (isAuthenticated && userIdeas.length > 0) {
        const ideaIds = userIdeas.map(idea => idea.id)
        try {
          const votesMap = await ideaService.getUserVotesForIdeas(ideaIds)
          const ideasWithVotes = userIdeas.map(idea => ({
            ...idea,
            userVotes: votesMap[idea.id] || {
              use: false,
              dislike: false,
              pay: false,
            },
          }))
          setIdeas(ideasWithVotes)
        } catch (error) {
          console.error('Error fetching user votes for activity ideas:', error)
          setIdeas(userIdeas)
        }
      } else {
        setIdeas(userIdeas)
      }
    } catch (err) {
      console.error('Error loading user ideas:', err)
      setError('Failed to load ideas')
      setIdeas([])
    } finally {
      setLoading(false)
    }
  }

  const sortedIdeas = [...ideas].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'popular':
        return b.votes + b.commentCount - (a.votes + a.commentCount)
      case 'most_votes':
        return b.votes - a.votes
      case 'highest_score':
        return b.score - a.score
      default:
        return 0
    }
  })

  const isInitialLoading = loading && ideas.length === 0
  const hasLoadedOnce = ideas.length > 0 || error !== null

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={loadUserIdeas} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  if (hasLoadedOnce && ideas.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-2">
            {t('activity.no_ideas')}
          </h3>
          <p className="text-text-secondary mb-6">
            {t('activity.no_ideas_description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={() => router.push('/upload')}
              variant="primary"
              className="inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('actions.submit_idea')}
            </Button>
            <Button
              onClick={refreshIdeas}
              variant="outline"
              className="inline-flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              {t('common.refresh')}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4 md:space-y-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">
              {t('activity.ideas_list.title')}
            </h2>
            <p className="text-text-secondary">
              {isInitialLoading
                ? t('activity.ideas_list.subtitle')
                : `${t('activity.ideas_list.subtitle')} (${ideas.length})`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <SortAsc className="w-4 h-4 text-text-secondary" />
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as SortOption)}
                className="border border-gray-200 rounded-md px-2 md:px-3 py-1 text-sm bg-gray-100 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                disabled={loading}
              >
                <option value="recent">
                  {t('activity.ideas_list.sort_options.recent')}
                </option>
                <option value="popular">
                  {t('activity.ideas_list.sort_options.popular')}
                </option>
                <option value="most_votes">
                  {t('activity.ideas_list.sort_options.most_votes')}
                </option>
                <option value="highest_score">
                  {t('activity.ideas_list.sort_options.highest_score')}
                </option>
              </select>
            </div>
            <Button
              onClick={refreshIdeas}
              variant="outline"
              className="inline-flex items-center gap-2"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className="w-4 h-4" />
              <span className="hidden sm:inline">{t('common.refresh')}</span>
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-gray-100 rounded-lg p-6 shadow-sm border animate-pulse"
            >
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedIdeas.map(idea => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              variant="interactive"
              initialUserVotes={idea.userVotes}
            />
          ))}
        </div>
      )}
    </div>
  )
}
