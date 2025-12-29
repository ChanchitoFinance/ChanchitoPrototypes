'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion } from 'framer-motion'
import { Search, Trash2, AlertTriangle, CheckCircle, ArrowUp, ArrowDown, MessageSquare, DollarSign } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from '@/shared/components/providers/I18nProvider'
import { Idea } from '@/core/types/idea'
import { ideaService } from '@/core/lib/services/ideaService'
import { Dialog } from '@/shared/components/ui/Dialog'
import { getCardMedia } from '@/core/lib/utils/media'
import { useVideoPlayer } from '@/core/hooks/useVideoPlayer'
import { Toast } from '@/shared/components/ui/Toast'
import { formatDate } from '@/core/lib/utils/date'

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
  const [toast, setToast] = useState<{ message: string; isOpen: boolean } | null>(null)
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
      (entries) => {
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
        <h1 className="text-heading-1 mb-2">
          {t('admin.dashboard.title')}
        </h1>
        <p className="text-body">
          {t('admin.dashboard.subtitle')}
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary w-5 h-5" />
        <input
          type="text"
          placeholder={t('admin.dashboard.search_placeholder')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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
              {ideas.map((idea) => (
                <AdminIdeaCard
                  key={idea.id}
                  idea={idea}
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

interface AdminIdeaCardProps {
  idea: Idea
  onDelete: () => void
  locale: string
  router: any
}

function AdminIdeaCard({ idea, onDelete, locale, router }: AdminIdeaCardProps) {
  const t = useTranslations()
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const cardMedia = getCardMedia(idea)

  // Use reusable video player hook with start time at 10 seconds
  const videoRef = useVideoPlayer({
    videoSrc: cardMedia.video,
    containerRef: cardRef,
    startTime: 10,
    threshold: 0.5,
    onPlay: () => setIsVideoPlaying(true),
    onPause: () => setIsVideoPlaying(false),
  })

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent navigation if delete button was clicked
    if ((e.target as HTMLElement).closest('button')) {
      return
    }
    // Navigate to idea details page with proper locale
    router.push(`/${locale}/ideas/${idea.id}`)
  }

  return (
    <div
      ref={cardRef}
      className="card-hover overflow-hidden h-full relative group cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        className="absolute top-3 right-3 z-10 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
        title={t('admin.dashboard.delete_idea')}
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 flex flex-col h-full"
      >
        {/* Media Section */}
        <div className="relative w-full aspect-video mb-3 rounded-md overflow-hidden">
          {cardMedia.video ? (
            <video
              ref={videoRef}
              src={cardMedia.video}
              className="w-full h-full object-cover"
              loop
              muted
              playsInline
              preload="none"
            />
          ) : cardMedia.image ? (
            <img
              src={cardMedia.image}
              alt={idea.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center">
              <div className="text-center px-4">
                <h3 className="text-lg font-bold text-white line-clamp-2">
                  {idea.title}
                </h3>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex items-start justify-between gap-3 mb-3 flex-1">
          <div className="flex-1 min-w-0 max-w-[calc(100%-80px)]">
            <h2 className="text-lg font-semibold text-text-primary mb-1 line-clamp-2 break-words">
              {idea.title}
            </h2>
            <p className="text-sm text-text-secondary line-clamp-2 mb-2 break-words">
              {idea.description}
            </p>
          </div>
          <div className="text-right flex-shrink-0 w-16">
            <div className="text-2xl font-semibold text-accent whitespace-nowrap">
              {idea.score}
            </div>
            <div className="text-xs text-text-secondary whitespace-nowrap">
              {t('common.score')}
            </div>
          </div>
        </div>

        {/* Metrics Section */}
        <div className="flex items-center gap-3 mb-2 min-h-[32px] overflow-hidden">
          {/* Upvote Metric */}
          <div className="flex items-center gap-1.5 text-text-secondary whitespace-nowrap flex-shrink-0">
            <ArrowUp className="w-3.5 h-3.5 text-green-500" />
            <span className="text-sm font-medium">
              {idea.votesByType.use}
            </span>
          </div>

          {/* Downvote Metric */}
          <div className="flex items-center gap-1.5 text-text-secondary whitespace-nowrap flex-shrink-0">
            <ArrowDown className="w-3.5 h-3.5 text-red-500" />
            <span className="text-sm font-medium">
              {idea.votesByType.dislike}
            </span>
          </div>

          {/* Pay Vote Metric */}
          <div className="flex items-center gap-1.5 text-text-secondary whitespace-nowrap flex-shrink-0">
            <DollarSign className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-sm font-medium">
              {idea.votesByType.pay}
            </span>
          </div>

          {/* Comments Metric */}
          <div className="flex items-center gap-1.5 text-text-secondary whitespace-nowrap flex-shrink-0">
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="text-sm">{idea.commentCount}</span>
          </div>
        </div>

        {/* Tags Section */}
        <div className="flex items-center gap-1.5 flex-wrap mb-2 overflow-hidden">
          {idea.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="badge-gray text-xs px-2 py-0.5 whitespace-nowrap flex-shrink-0"
              title={tag}
            >
              {tag}
            </span>
          ))}
          {idea.tags.length > 3 && (
            <span className="text-xs text-text-secondary whitespace-nowrap flex-shrink-0">
              +{idea.tags.length - 3}
            </span>
          )}
        </div>

        {/* Author and Date */}
        <div className="flex items-center justify-between text-xs text-text-secondary pt-2 border-t border-background">
          <span>By {idea.author}</span>
          <span>{formatDate(idea.createdAt)}</span>
        </div>
      </motion.article>
    </div>
  )
}
