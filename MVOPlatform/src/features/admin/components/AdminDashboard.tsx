'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Search, Trash2, AlertTriangle, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  useLocale,
  useTranslations,
} from '@/shared/components/providers/I18nProvider'
import { Idea } from '@/core/types/idea'
import { ideaService } from '@/core/lib/services/ideaService'
import { Dialog } from '@/shared/components/ui/Dialog'
import { Toast } from '@/shared/components/ui/Toast'
import { formatDate } from '@/core/lib/utils/date'
import { IdeaCard } from '@/features/ideas/components/IdeaCard'

const ITEMS_PER_PAGE = 20

export function AdminDashboard() {
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [ideaToDelete, setIdeaToDelete] = useState<Idea | null>(null)
  const [toast, setToast] = useState<{
    message: string
    isOpen: boolean
  } | null>(null)
  const [isSearching, setIsSearching] = useState(false)

  const observerRef = useRef<HTMLDivElement>(null)
  const isInitialLoadRef = useRef(true)

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 800)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Load ideas when search changes
  useEffect(() => {
    if (!isInitialLoadRef.current) {
      setIsSearching(true)
      setToast({ message: 'Searching...', isOpen: true })
    }
    loadIdeas(true)
    isInitialLoadRef.current = false
  }, [debouncedSearchQuery])

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
      const result = await ideaService.getAllIdeasForAdmin(
        debouncedSearchQuery || undefined,
        ITEMS_PER_PAGE,
        offset
      )

      if (reset) {
        setIdeas(result.ideas)
        setTotalIdeas(result.total)
        // Show search feedback whenever ideas are loaded (search or initial load)
        setToast({ message: `Found ${result.total} ideas`, isOpen: true })
      } else {
        setIdeas(prev => [...prev, ...result.ideas])
      }

      setHasMore(result.ideas.length === ITEMS_PER_PAGE)
    } catch (error) {
      console.error('Error loading ideas:', error)
      setToast({ message: t('admin.dashboard.loading'), isOpen: true })
    } finally {
      setLoading(false)
      setIsSearching(false)
    }
  }

  const loadMoreIdeas = async () => {
    if (loadingMore || !hasMore) return

    try {
      setLoadingMore(true)
      const result = await ideaService.getAllIdeasForAdmin(
        debouncedSearchQuery || undefined,
        ITEMS_PER_PAGE,
        ideas.length
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

  const handleDeleteIdea = async () => {
    if (!ideaToDelete) return

    try {
      await ideaService.deleteIdea(ideaToDelete.id)
      setIdeas(prev => prev.filter(idea => idea.id !== ideaToDelete.id))
      setTotalIdeas(prev => prev - 1)
      setToast({ message: t('admin.dashboard.delete_success'), isOpen: true })
    } catch (error) {
      console.error('Error deleting idea:', error)
      setToast({ message: t('admin.dashboard.delete_error'), isOpen: true })
    } finally {
      setDeleteDialogOpen(false)
      setIdeaToDelete(null)
    }
  }

  const openDeleteDialog = (idea: Idea) => {
    setIdeaToDelete(idea)
    setDeleteDialogOpen(true)
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-heading-1 mb-2">{t('admin.dashboard.title')}</h1>
        <p className="text-body">{t('admin.dashboard.subtitle')}</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5" />
        <input
          type="text"
          placeholder={t('admin.dashboard.search_placeholder')}
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent bg-white text-black"
        />
      </div>

      {/* Ideas Grid */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-text-primary">
          {t('admin.dashboard.all_ideas')} ({totalIdeas})
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
              {t('admin.dashboard.no_ideas')}
            </h3>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ideas.map(idea => (
                <IdeaCard
                  key={idea.id}
                  idea={idea}
                  variant="admin"
                  onDelete={() => openDeleteDialog(idea)}
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

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title={t('admin.dashboard.delete_idea')}
        message={`${t('admin.dashboard.delete_confirm')}${ideaToDelete ? `\n\n${ideaToDelete.title}` : ''}`}
        type="confirm"
        onConfirm={handleDeleteIdea}
        confirmText={t('actions.delete')}
        cancelText={t('actions.cancel')}
        confirmVariant="primary"
      />

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
