'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Search, Shield } from 'lucide-react'
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
import { useAppSelector } from '@/core/lib/hooks'

const ITEMS_PER_PAGE = 20

export function BrowseDashboard({ isAdmin = false }) {
  const t = useTranslations()
  const { locale } = useLocale()
  const router = useRouter()
  const { profile, isAuthenticated, loading, initialized } = useAppSelector(
    state => state.auth
  )
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [totalIdeas, setTotalIdeas] = useState(0)
  const [loadingIdeas, setLoadingIdeas] = useState(true)
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
  const [currentOffset, setCurrentOffset] = useState(0)
  const [convertToArticleIdea, setConvertToArticleIdea] = useState<Idea | null>(
    null
  )
  const [convertSlug, setConvertSlug] = useState('')
  const [converting, setConverting] = useState(false)

  const observerRef = useRef<HTMLDivElement>(null)
  const isInitialLoadRef = useRef(true)

  // Filter configurations
  const filterConfigs = [
    {
      id: 'score',
      label: t('filter.score'),
      field: 'score' as const,
      operators: ['>', '<', '=', '>=', '<='] as const,
      minValue: 0,
      maxValue: 100,
      step: 1,
    },
    {
      id: 'votes',
      label: t('filter.total_votes'),
      field: 'votes' as const,
      operators: ['>', '<', '=', '>=', '<='] as const,
      minValue: 0,
      step: 1,
    },
    {
      id: 'use-votes',
      label: t('filter.use_votes'),
      field: 'votesByType.use' as const,
      operators: ['>', '<', '=', '>=', '<='] as const,
      minValue: 0,
      step: 1,
    },
    {
      id: 'dislike-votes',
      label: t('filter.dislike_votes'),
      field: 'votesByType.dislike' as const,
      operators: ['>', '<', '=', '>=', '<='] as const,
      minValue: 0,
      step: 1,
    },
    {
      id: 'pay-votes',
      label: t('filter.pay_votes'),
      field: 'votesByType.pay' as const,
      operators: ['>', '<', '=', '>=', '<='] as const,
      minValue: 0,
      step: 1,
    },
    {
      id: 'comments',
      label: t('filter.comments'),
      field: 'commentCount' as const,
      operators: ['>', '<', '=', '>=', '<='] as const,
      minValue: 0,
      step: 1,
    },
  ]

  // Sort configurations
  const sortConfigs = [
    { id: 'title', label: t('filter.title'), field: 'title' as const },
    { id: 'score', label: t('filter.score'), field: 'score' as const },
    { id: 'votes', label: t('filter.total_votes'), field: 'votes' as const },
    {
      id: 'use-votes',
      label: t('filter.use_votes'),
      field: 'votesByType.use' as const,
    },
    {
      id: 'dislike-votes',
      label: t('filter.dislike_votes'),
      field: 'votesByType.dislike' as const,
    },
    {
      id: 'pay-votes',
      label: t('filter.pay_votes'),
      field: 'votesByType.pay' as const,
    },
    {
      id: 'comments',
      label: t('filter.comments'),
      field: 'commentCount' as const,
    },
    {
      id: 'createdAt',
      label: t('filter.date_created'),
      field: 'createdAt' as const,
    },
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

  // Reset offset when filters change
  useEffect(() => {
    setCurrentOffset(0)
  }, [debouncedSearchQuery, filterConditions, sortOption])

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !loadingIdeas &&
          !loadingMore
        ) {
          loadMoreIdeas()
        }
      },
      { threshold: 1.0 }
    )

    if (observerRef.current) {
      observer.observe(observerRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loadingIdeas, loadingMore])

  const loadIdeas = async (reset = false) => {
    try {
      setLoadingIdeas(true)
      const offset = reset ? 0 : currentOffset

      // Use database-level filtering and sorting
      const result = await ideaService.getIdeasWithAdvancedFilters({
        searchQuery: debouncedSearchQuery || undefined,
        filterConditions:
          filterConditions.length > 0 ? filterConditions : undefined,
        sortField: sortOption.field,
        sortDirection: sortOption.direction,
        limit: ITEMS_PER_PAGE,
        offset: offset,
      })

      if (reset) {
        setIdeas(result.ideas)
        setTotalIdeas(result.total)
        setCurrentOffset(ITEMS_PER_PAGE)
        // Show search feedback whenever ideas are loaded (search or initial load)
        setToast({
          message: `Found ${result.ideas.length} ideas`,
          isOpen: true,
        })

        // Fetch user votes for the loaded ideas if authenticated
        if (isAuthenticated && result.ideas.length > 0) {
          const ideaIds = result.ideas.map(idea => idea.id)
          try {
            const votesMap = await ideaService.getUserVotesForIdeas(ideaIds)
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
            console.error('Error fetching user votes for browse ideas:', error)
          }
        }
      } else {
        setIdeas(prev => [...prev, ...result.ideas])
        setCurrentOffset(prev => prev + result.ideas.length)

        // Fetch user votes for the additional ideas if authenticated
        if (isAuthenticated && result.ideas.length > 0) {
          const ideaIds = result.ideas.map(idea => idea.id)
          try {
            const votesMap = await ideaService.getUserVotesForIdeas(ideaIds)
            setIdeas(prev =>
              prev.map(idea =>
                ideaIds.includes(idea.id)
                  ? {
                      ...idea,
                      userVotes: votesMap[idea.id] || {
                        use: false,
                        dislike: false,
                        pay: false,
                      },
                    }
                  : idea
              )
            )
          } catch (error) {
            console.error(
              'Error fetching user votes for additional browse ideas:',
              error
            )
          }
        }
      }

      setHasMore(result.ideas.length === ITEMS_PER_PAGE)
    } catch (error) {
      console.error('Error loading ideas:', error)
      setToast({ message: t('status.loading'), isOpen: true })
    } finally {
      setLoadingIdeas(false)
      setIsSearching(false)
    }
  }

  const loadMoreIdeas = async () => {
    if (loadingMore || !hasMore) return

    try {
      setLoadingMore(true)

      // Use database-level filtering and sorting for consistency
      const result = await ideaService.getIdeasWithAdvancedFilters({
        searchQuery: debouncedSearchQuery || undefined,
        filterConditions:
          filterConditions.length > 0 ? filterConditions : undefined,
        sortField: sortOption.field,
        sortDirection: sortOption.direction,
        limit: ITEMS_PER_PAGE,
        offset: currentOffset,
      })

      // Fetch user votes for the additional ideas if authenticated
      if (isAuthenticated && result.ideas.length > 0) {
        const newIdeaIds = result.ideas.map(idea => idea.id)
        try {
          const votesMap = await ideaService.getUserVotesForIdeas(newIdeaIds)
          const newIdeasWithVotes = result.ideas.map(idea => ({
            ...idea,
            userVotes: votesMap[idea.id] || {
              use: false,
              dislike: false,
              pay: false,
            },
          }))
          setIdeas(prev => [...prev, ...newIdeasWithVotes])
        } catch (error) {
          console.error(
            'Error fetching user votes for additional browse ideas:',
            error
          )
          // Fallback: Set default userVotes for new ideas if there's an error
          const newIdeasWithVotes = result.ideas.map(idea => ({
            ...idea,
            userVotes: {
              use: false,
              dislike: false,
              pay: false,
            },
          }))
          setIdeas(prev => [...prev, ...newIdeasWithVotes])
        }
      } else {
        setIdeas(prev => [...prev, ...result.ideas])
      }

      setCurrentOffset(prev => prev + result.ideas.length)
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

      {isAdmin && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center">
            <Shield className="w-8 h-8 mr-8 text-blue-800" />
            <div>
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                {t('admin.dashboard.admin_info_title')}
              </h3>
              <p className="text-blue-700 text-sm">
                {t('admin.dashboard.admin_info_message')}
              </p>
            </div>
          </div>
          <a
            href={`/${locale}/upload?mode=article`}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            {t('admin.dashboard.create_article')}
          </a>
        </div>
      )}

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

        {loadingIdeas && ideas.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-8 gap-y-32">
            {[...Array(10)].map((_, i) => (
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-x-8 gap-y-32 pt-2 overflow-visible">
              {ideas.map(idea => (
                <div key={idea.id} className="overflow-visible">
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  variant="interactive"
                  locale={locale}
                  router={router}
                  initialUserVotes={idea.userVotes}
                  onDelete={
                    isAdmin
                      ? async () => {
                          try {
                            await ideaService.deleteIdea(idea.id)
                            setIdeas(ideas.filter(i => i.id !== idea.id))
                            setToast({
                              message: t('admin.dashboard.idea_deleted'),
                              isOpen: true,
                            })
                          } catch (error) {
                            console.error('Error deleting idea:', error)
                            setToast({
                              message: t('actions.error_deleting_idea'),
                              isOpen: true,
                            })
                          }
                        }
                      : undefined
                  }
                  onConvertToArticle={
                    isAdmin && !idea.is_article
                      ? ideaToConvert => {
                          setConvertToArticleIdea(ideaToConvert)
                          setConvertSlug(
                            ideaToConvert.title
                              .toLowerCase()
                              .replace(/\s+/g, '-')
                              .replace(/[^a-z0-9-]/g, '')
                              .slice(0, 50)
                          )
                        }
                      : undefined
                  }
                />
                </div>
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

      {/* Convert to Article Modal */}
      {convertToArticleIdea && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-md w-full p-6 border border-border">
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              {t('articles.convert_to_article')}
            </h3>
            <p className="text-text-secondary text-sm mb-4">
              {convertToArticleIdea.title}
            </p>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {t('articles.slug_label')} <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={convertSlug}
              onChange={e => {
                const v = e.target.value
                  .toLowerCase()
                  .replace(/\s+/g, '-')
                  .replace(/[^a-z0-9-]/g, '')
                setConvertSlug(v)
              }}
              placeholder={t('articles.slug_placeholder')}
              className="w-full px-4 py-3 bg-background border border-border-color rounded-lg text-text-primary mb-4"
            />
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => {
                  setConvertToArticleIdea(null)
                  setConvertSlug('')
                }}
                className="px-4 py-2 border border-border rounded-lg text-text-primary hover:bg-gray-100"
              >
                {t('actions.cancel')}
              </button>
              <button
                type="button"
                disabled={!convertSlug.trim() || converting}
                onClick={async () => {
                  const slug = convertSlug.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
                  if (!slug) return
                  setConverting(true)
                  try {
                    const updated = await ideaService.updateIdea(
                      convertToArticleIdea.id,
                      { is_article: true, slug }
                    )
                    setIdeas(prev =>
                      prev.map(i =>
                        i.id === convertToArticleIdea.id ? updated : i
                      )
                    )
                    setConvertToArticleIdea(null)
                    setConvertSlug('')
                    setToast({
                      message: t('articles.convert_to_article') + ' ✓',
                      isOpen: true,
                    })
                  } catch (err) {
                    console.error(err)
                    setToast({
                      message: t('validation.idea_creation_error'),
                      isOpen: true,
                    })
                  } finally {
                    setConverting(false)
                  }
                }}
                className="px-4 py-2 bg-accent text-text-primary rounded-lg hover:bg-accent/90 disabled:opacity-50"
              >
                {converting ? '...' : t('actions.save')}
              </button>
            </div>
          </div>
        </div>
      )}

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
