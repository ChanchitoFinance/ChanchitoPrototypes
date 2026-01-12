'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  useLocale,
  useTranslations,
} from '@/shared/components/providers/I18nProvider'
import { Idea } from '@/core/types/idea'
import { ideaService } from '@/core/lib/services/ideaService'
import { supabase } from '@/core/lib/supabase'
import { Toast } from '@/shared/components/ui/Toast'
import { IdeaCard } from '@/features/ideas/components/IdeaCard'
import { IdeaFilterPanel } from '@/features/ideas/components/IdeaFilterPanel'
import {
  FilterCondition,
  SortOption,
  IdeaFilters,
} from '@/features/ideas/types/filter.types'
import { IdeaFilterService } from '@/features/ideas/services/ideaFilterService'

const ITEMS_PER_PAGE = 20

export function BrowseDashboard() {
  const t = useTranslations()
  const { locale } = useLocale()
  const router = useRouter()
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [totalIdeas, setTotalIdeas] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [hasMore, setHasMore] = useState(true)
  const [toast, setToast] = useState<{
    message: string
    isOpen: boolean
  } | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [filterConditions, setFilterConditions] = useState<FilterCondition[]>(
    []
  )
  const [sortOption, setSortOption] = useState<SortOption>({
    field: 'createdAt',
    direction: 'desc',
  })

  const observerRef = useRef<HTMLDivElement>(null)
  const isInitialLoadRef = useRef(true)

  // Filter configurations
  const filterConfigs = [
    {
      id: 'score',
      label: 'Score',
      field: 'score',
      operators: ['>', '<', '=', '>=', '<='],
      minValue: 0,
      maxValue: 100,
      step: 1,
    },
    {
      id: 'votes',
      label: 'Total Votes',
      field: 'votes',
      operators: ['>', '<', '=', '>=', '<='],
      minValue: 0,
      step: 1,
    },
    {
      id: 'use-votes',
      label: 'Use Votes',
      field: 'votesByType.use',
      operators: ['>', '<', '=', '>=', '<='],
      minValue: 0,
      step: 1,
    },
    {
      id: 'dislike-votes',
      label: 'Dislike Votes',
      field: 'votesByType.dislike',
      operators: ['>', '<', '=', '>=', '<='],
      minValue: 0,
      step: 1,
    },
    {
      id: 'pay-votes',
      label: 'Pay Votes',
      field: 'votesByType.pay',
      operators: ['>', '<', '=', '>=', '<='],
      minValue: 0,
      step: 1,
    },
    {
      id: 'comments',
      label: 'Comments',
      field: 'commentCount',
      operators: ['>', '<', '=', '>=', '<='],
      minValue: 0,
      step: 1,
    },
  ]

  // Sort configurations
  const sortConfigs = [
    { id: 'title', label: 'Title', field: 'title' },
    { id: 'score', label: 'Score', field: 'score' },
    { id: 'votes', label: 'Total Votes', field: 'votes' },
    { id: 'use-votes', label: 'Use Votes', field: 'votesByType.use' },
    {
      id: 'dislike-votes',
      label: 'Dislike Votes',
      field: 'votesByType.dislike',
    },
    { id: 'pay-votes', label: 'Pay Votes', field: 'votesByType.pay' },
    { id: 'comments', label: 'Comments', field: 'commentCount' },
    { id: 'createdAt', label: 'Date Created', field: 'createdAt' },
  ]

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 800)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Load ideas when search, filters, or sorting changes
  useEffect(() => {
    if (!isInitialLoadRef.current) {
      setIsSearching(true)
      setToast({ message: 'Applying filters...', isOpen: true })
    }
    loadIdeas(true)
    isInitialLoadRef.current = false
  }, [debouncedSearchQuery, filterConditions, sortOption])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMoreIdeas()
        }
      },
      { threshold: 1.0 }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loading, loadingMore])

  const loadIdeas = async (reset = false) => {
    try {
      setLoading(true)
      const offset = reset ? 0 : ideas.length

      // Use the new filtering service for comprehensive filtering
      const filters: IdeaFilters = {
        searchQuery: debouncedSearchQuery || undefined,
        filterConditions:
          filterConditions.length > 0 ? filterConditions : undefined,
        sortOption: sortOption,
        limit: ITEMS_PER_PAGE,
        offset: offset,
      }

      // Use the filter service to get filtered and sorted ideas
      const result = await IdeaFilterService.getFilteredIdeasFromService(
        ideaService,
        filters
      )

      if (reset) {
        setIdeas(result.ideas)
        setTotalIdeas(result.total)
        // Show search feedback whenever ideas are loaded (search or initial load)
        setToast({
          message: `Found ${result.ideas.length} ideas`,
          isOpen: true,
        })
      } else {
        setIdeas(prev => [...prev, ...result.ideas])
      }

      setHasMore(result.ideas.length === ITEMS_PER_PAGE)
    } catch (error) {
      console.error('Error loading ideas:', error)
      setToast({ message: t('status.loading'), isOpen: true })
    } finally {
      setLoading(false)
      setIsSearching(false)
    }
  }

  const loadMoreIdeas = async () => {
    if (loadingMore || !hasMore) return

    try {
      setLoadingMore(true)

      // Use the same filtering approach for consistency
      const filters: IdeaFilters = {
        searchQuery: debouncedSearchQuery || undefined,
        filterConditions:
          filterConditions.length > 0 ? filterConditions : undefined,
        sortOption: sortOption,
        limit: ITEMS_PER_PAGE,
        offset: ideas.length,
      }

      const result = await IdeaFilterService.getFilteredIdeasFromService(
        ideaService,
        filters
      )

      setIdeas(prev => [...prev, ...result.ideas])
      setHasMore(result.ideas.length === ITEMS_PER_PAGE)
    } catch (error) {
      console.error('Error loading more ideas:', error)
      setToast({ message: t('status.loading_more_ideas'), isOpen: true })
    } finally {
      setLoadingMore(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-heading-1 mb-2">{t('browse.dashboard.title')}</h1>
        <p className="text-body">{t('browse.dashboard.subtitle')}</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5" />
        <input
          type="text"
          placeholder={t('browse.dashboard.search_placeholder')}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-white text-black"
        />
      </div>

      {/* Advanced Filter Panel */}
      <IdeaFilterPanel
        filterConfigs={filterConfigs}
        sortConfigs={sortConfigs}
        onFilterChange={setFilterConditions}
        onSortChange={setSortOption}
        initialFilters={filterConditions}
        initialSort={sortOption}
      />

      {/* Ideas Grid */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-text-primary">
          {t('browse.dashboard.all_ideas')} ({totalIdeas})
        </h2>

        {loading && ideas.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card-hover overflow-hidden">
                <div className="p-4 space-y-4">
                  <div className="aspect-video bg-gray-200 rounded-md animate-pulse"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : ideas.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-text-primary mb-2">
              {t('browse.dashboard.no_ideas')}
            </h3>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ideas.map(idea => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  variant="interactive"
                  locale={locale}
                  router={router}
                />
              ))}
            </div>

            {/* Load More Trigger */}
            {ideas.length >= ITEMS_PER_PAGE && (
              <div ref={observerRef} className="flex justify-center py-8">
                {loadingMore && (
                  <div className="flex items-center gap-2 text-text-secondary">
                    <div className="w-4 h-4 border-2 border-gray-300 border-t-accent rounded-full animate-spin"></div>
                    {t('status.loading_more_ideas')}
                  </div>
                )}
                {!hasMore && ideas.length > 0 && (
                  <p className="text-text-secondary">
                    {t('status.no_more_ideas')}
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Toast Notifications */}
      {toast && (
        <Toast
          isOpen={toast.isOpen}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
