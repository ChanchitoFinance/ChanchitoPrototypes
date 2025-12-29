'use client'

import { useState, useEffect } from 'react'
import { Footer } from '@/shared/components/layout/Footer'
import { IdeaCard } from '@/features/ideas/components/IdeaCard'
import { Button } from '@/shared/components/ui/Button'
import { teamService } from '@/core/lib/services/teamService'
import { ideaService } from '@/core/lib/services/ideaService'
import { Idea } from '@/core/types/idea'
import { useAppSelector } from '@/core/lib/hooks'
import { useTranslations, useLocale } from '@/shared/components/providers/I18nProvider'
import { Plus, Loader2, Users, Lock, Globe, ArrowLeft, Share2, Edit, Trash2, UserPlus, Crown } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { IdeaForm } from '@/features/ideas/components/forms/IdeaForm'
import { IdeaCardSkeleton } from '@/shared/components/ui/Skeleton'
import { usePremiumRedirect } from '@/core/hooks/usePremiumRedirect'
import { Dialog } from '@/shared/components/ui/Dialog'
import { Toast } from '@/shared/components/ui/Toast'
import { SpaceWithTeam } from '@/core/types/space'

interface SpaceDetailPageProps {
  spaceId: string
}

export function SpaceDetailPage({ spaceId }: SpaceDetailPageProps) {
  const t = useTranslations()
  const { locale } = useLocale()
  const router = useRouter()
  const { user } = useAppSelector(state => state.auth)
  const [space, setSpace] = useState<SpaceWithTeam | null>(null)
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingIdeas, setLoadingIdeas] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingIdeaId, setEditingIdeaId] = useState<string | null>(null)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean
    type: 'alert' | 'confirm'
    messageKey?: string
    titleKey?: string
    message?: string
    title?: string
    onConfirm?: () => void
  }>({
    isOpen: false,
    type: 'alert',
  })
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const { redirectToPremium } = usePremiumRedirect()

  useEffect(() => {
    const loadSpace = async () => {
      try {
        setLoading(true)
        const spaceData = await teamService.getSpaceById(spaceId)
        if (!spaceData) {
          router.push(`/${locale}/spaces`)
          return
        }
        setSpace(spaceData)

        // Check if user is admin
        if (user?.id) {
          const admin = await teamService.isSpaceAdmin(spaceId, user.id)
          setIsAdmin(admin)
        }

        // Load ideas
        setLoadingIdeas(true)
        const spaceIdeas = await ideaService.getIdeasBySpace(spaceId)
        setIdeas(spaceIdeas)
        setLoadingIdeas(false)
      } catch (error) {
        console.error('Error loading space:', error)
        router.push(`/${locale}/spaces`)
      } finally {
        setLoading(false)
      }
    }

    loadSpace()
  }, [spaceId, user?.id, locale, router])

  const handleIdeaCreated = async () => {
    setShowCreateForm(false)
    setEditingIdeaId(null)
    // Reload ideas
    setLoadingIdeas(true)
    const spaceIdeas = await ideaService.getIdeasBySpace(spaceId)
    setIdeas(spaceIdeas)
    setLoadingIdeas(false)
  }

  const handleDeleteIdea = (ideaId: string) => {
    setDialogState({
      isOpen: true,
      type: 'confirm',
      messageKey: 'spaces.confirm_delete_idea',
      titleKey: 'spaces.delete_idea',
      onConfirm: async () => {
        try {
          const success = await ideaService.deleteIdea(ideaId)
          if (success) {
            // Close dialog
            setDialogState({ isOpen: false, type: 'alert' })
            // Reload ideas
            setLoadingIdeas(true)
            const spaceIdeas = await ideaService.getIdeasBySpace(spaceId)
            setIdeas(spaceIdeas)
            setLoadingIdeas(false)
          }
        } catch (error) {
          console.error('Error deleting idea:', error)
          setDialogState({
            isOpen: true,
            type: 'alert',
            messageKey: 'spaces.error_deleting_idea',
            titleKey: 'spaces.error',
          })
        }
      },
    })
  }

  const handleEditIdea = (ideaId: string) => {
    setEditingIdeaId(ideaId)
    setShowCreateForm(true)
  }

  const handleShareSpace = () => {
    const spaceUrl = `${window.location.origin}/${locale}/spaces/${spaceId}`
    navigator.clipboard.writeText(spaceUrl).then(() => {
      setToastMessage(t('spaces.link_copied'))
    }).catch(() => {
      // Fallback: show the URL in toast
      setToastMessage(`${t('spaces.copy_link')}: ${spaceUrl}`)
    })
  }

  const handleInviteMembers = () => {
    redirectToPremium()
  }

  const handleBack = () => {
    // Get the previous path from sessionStorage (set when navigating to space)
    const previousPath = sessionStorage.getItem('previousPath') || `/${locale}/spaces`
    const scrollPosition = sessionStorage.getItem('previousScrollPosition')

    // Save scroll position to localStorage before navigating
    if (scrollPosition && previousPath) {
      localStorage.setItem(`scrollPosition_${previousPath}`, scrollPosition)
      // Set a flag to indicate we need to restore scroll
      sessionStorage.setItem('shouldRestoreScroll', 'true')
      sessionStorage.setItem('restoreScrollPath', previousPath)
      sessionStorage.setItem('restoreScrollPosition', scrollPosition)
    }

    // Navigate back using router.back() if possible, otherwise push
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back()
    } else {
      router.push(previousPath)
    }
  }

  if (loading) {
    return (
      <div className="h-screen w-full overflow-hidden bg-background flex">
        <div className="flex-1 flex items-center justify-center ml-16 md:ml-64">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </div>
    )
  }

  if (!space) {
    return null
  }

  const visibilityIcons = {
    public: Globe,
    private: Lock,
  }

  const VisibilityIcon = visibilityIcons[space.visibility] || Globe

  const visibilityLabels = {
    public: t('spaces.public'),
    private: t('spaces.private'),
  }

  if (showCreateForm) {
    return (
      <div className="h-screen w-full overflow-hidden bg-background flex">
        <div className="flex-1 flex flex-col overflow-hidden ml-16 md:ml-64">
          <main className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="max-w-4xl mx-auto px-4 md:px-6 py-8">
              <Button
                onClick={() => setShowCreateForm(false)}
                variant="outline"
                className="mb-4"
              >
                ← {t('actions.cancel')}
              </Button>
              <IdeaForm
                defaultSpaceId={spaceId}
                ideaId={editingIdeaId || undefined}
                onSuccess={handleIdeaCreated}
                onCancel={() => {
                  setShowCreateForm(false)
                  setEditingIdeaId(null)
                }}
              />
            </div>
            <Footer />
          </main>
        </div>
      </div>
    )
  }

  // Get space media from settings (vertical image/video)
  const spaceMedia = space.settings?.space_image || space.settings?.space_video

  return (
    <div className="h-screen w-full overflow-hidden bg-background flex relative">
      <div className="fixed top-4 left-20 md:left-[272px] z-50 transition-all duration-300">
        <Button
          onClick={handleBack}
          variant="outline"
          className="flex items-center gap-2 bg-background/90 backdrop-blur-sm shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('actions.back')}
        </Button>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden ml-16 md:ml-64">
        <main className="flex-1 overflow-hidden">
          {/* Grid Layout: 2 columns for ideas (scrollable) + 1 column for space media (static) */}
          <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-6 px-4 md:px-6 py-8">
            {/* Left and Center Columns - Ideas Content (Scrollable) */}
            <div className="lg:col-span-2 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex flex-col">
              <div className="flex-1">

                {/* Space Info Header */}
                <div className="mb-8 mt-12">
                  {/* Small screens: Space media next to title */}
                  {spaceMedia && (
                    <div className="lg:hidden flex items-center gap-4 mb-4">
                      {/* Space Media - Small screens (moved to left, doubled size) */}
                      <div className="flex-shrink-0 w-48 h-64 rounded-lg overflow-hidden bg-gradient-to-br from-accent/20 via-background to-accent/10 flex items-center justify-center">
                        {space.settings?.space_video ? (
                          <video
                            src={space.settings.space_video}
                            className="w-full h-full object-contain"
                            style={{
                              objectPosition: space.settings?.header_crop
                                ? `${space.settings.header_crop.x}% ${space.settings.header_crop.y}%`
                                : 'center',
                              transform: space.settings?.header_crop
                                ? `scale(${space.settings.header_crop.scale || 1})`
                                : 'scale(1)',
                              transformOrigin: space.settings?.header_crop
                                ? `${space.settings.header_crop.x}% ${space.settings.header_crop.y}%`
                                : 'center',
                            }}
                            loop
                            muted
                            playsInline
                            autoPlay
                          />
                        ) : space.settings?.space_image ? (
                          <div className="relative w-full h-full">
                            <Image
                              src={space.settings.space_image}
                              alt={space.name}
                              fill
                              className="object-contain"
                              style={{
                                objectPosition: space.settings?.header_crop
                                  ? `${space.settings.header_crop.x}% ${space.settings.header_crop.y}%`
                                  : 'center',
                                transform: space.settings?.header_crop
                                  ? `scale(${space.settings.header_crop.scale || 1})`
                                  : 'scale(1)',
                                transformOrigin: space.settings?.header_crop
                                  ? `${space.settings.header_crop.x}% ${space.settings.header_crop.y}%`
                                  : 'center',
                              }}
                            />
                          </div>
                        ) : null}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <VisibilityIcon
                            className={`w-5 h-5 ${
                              space.visibility === 'public'
                                ? 'text-green-400'
                                : space.visibility === 'private'
                                  ? 'text-gray-400'
                                  : 'text-blue-400'
                            }`}
                          />
                          <span className="text-text-secondary text-sm">
                            {visibilityLabels[space.visibility]}
                          </span>
                        </div>
                        <h1 className="text-2xl font-bold text-text-primary mb-2">
                          {space.name}
                        </h1>
                        {space.team && (
                          <p className="text-text-secondary text-base mb-2">
                            {space.team.name}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-text-secondary text-xs">
                          <div className="flex items-center gap-2">
                            <Users className="w-3.5 h-3.5" />
                            <span>
                              {space.member_count || 0} {t('spaces.members')}
                            </span>
                          </div>
                          <span>•</span>
                          <span>
                            {space.idea_count || 0} {t('spaces.ideas')}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Large screens: Full header without media */}
                  <div className="hidden lg:block">
                    <div className="flex items-center gap-2 mb-2">
                      <VisibilityIcon
                        className={`w-5 h-5 ${
                          space.visibility === 'public'
                            ? 'text-green-400'
                            : space.visibility === 'private'
                              ? 'text-gray-400'
                              : 'text-blue-400'
                        }`}
                      />
                      <span className="text-text-secondary text-sm">
                        {visibilityLabels[space.visibility]}
                      </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-2">
                      {space.name}
                    </h1>
                    {space.team && (
                      <p className="text-text-secondary text-lg mb-4">
                        {space.team.name}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-text-secondary text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>
                          {space.member_count || 0} {t('spaces.members')}
                        </span>
                      </div>
                      <span>•</span>
                      <span>
                        {space.idea_count || 0} {t('spaces.ideas')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mb-8 flex flex-wrap items-center gap-4">
                  {/* Share button - available to all users */}
                  <Button
                    onClick={handleShareSpace}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    {t('spaces.share_space')}
                  </Button>

                  {/* Admin actions */}
                  {isAdmin && (
                    <>
                      <Button
                        onClick={() => setShowCreateForm(true)}
                        variant="primary"
                      >
                        <Plus className="w-4 h-4" />
                        {t('form.create_idea')}
                      </Button>
                      <Button
                        onClick={handleInviteMembers}
                        variant="outline"
                        className="flex items-center gap-2 border-accent-alt/30 text-accent-alt hover:border-accent-alt/50 hover:bg-accent-alt/10"
                      >
                        <Crown className="w-4 h-4 text-accent-alt" />
                        {t('spaces.invite_members')}
                      </Button>
                    </>
                  )}
                </div>

                {/* Ideas Grid */}
                {loadingIdeas ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
                    {[1, 2, 3, 4].map(i => (
                      <IdeaCardSkeleton key={`skeleton-${i}`} />
                    ))}
                  </div>
                ) : ideas.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
                    {ideas.map(idea => (
                      <div key={idea.id} className="relative group">
                        <IdeaCard idea={idea} variant="interactive" />
                        {isAdmin && (
                          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <Button
                              onClick={() => handleEditIdea(idea.id)}
                              variant="outline"
                              size="sm"
                              className="bg-background/90 backdrop-blur-sm"
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              onClick={() => handleDeleteIdea(idea.id)}
                              variant="outline"
                              size="sm"
                              className="bg-background/90 backdrop-blur-sm text-red-400 border-red-400 hover:bg-red-400/10 hover:text-red-300"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-text-secondary text-lg mb-4">
                      {t('messages.no_ideas')}
                    </p>
                  </div>
                )}
              </div>
              <Footer />
            </div>

            {/* Right Column - Space Media (Static, Vertical, Centered) */}
            {spaceMedia && (
              <div className="hidden lg:flex lg:col-span-1 flex-shrink-0 items-center justify-center sticky top-0 h-screen py-8">
                <div className="relative w-full max-w-sm aspect-[3/4] rounded-lg overflow-hidden bg-gradient-to-br from-accent/20 via-background to-accent/10 flex items-center justify-center">
                  {space.settings?.space_video ? (
                    <video
                      src={space.settings.space_video}
                      className="w-full h-full object-contain"
                      style={{
                        objectPosition: space.settings?.space_crop
                          ? `${space.settings.space_crop.x}% ${space.settings.space_crop.y}%`
                          : 'center',
                        transform: space.settings?.space_crop
                          ? `scale(${space.settings.space_crop.scale || 1})`
                          : 'scale(1)',
                        transformOrigin: space.settings?.space_crop
                          ? `${space.settings.space_crop.x}% ${space.settings.space_crop.y}%`
                          : 'center',
                      }}
                      loop
                      muted
                      playsInline
                      autoPlay
                    />
                  ) : space.settings?.space_image ? (
                    <Image
                      src={space.settings.space_image}
                      alt={space.name}
                      fill
                      className="object-contain"
                      style={{
                        objectPosition: space.settings?.space_crop
                          ? `${space.settings.space_crop.x}% ${space.settings.space_crop.y}%`
                          : 'center',
                        transform: space.settings?.space_crop
                          ? `scale(${space.settings.space_crop.scale || 1})`
                          : 'scale(1)',
                        transformOrigin: space.settings?.space_crop
                          ? `${space.settings.space_crop.x}% ${space.settings.space_crop.y}%`
                          : 'center',
                      }}
                    />
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Dialog for alerts and confirmations */}
      <Dialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState({ isOpen: false, type: 'alert' })}
        type={dialogState.type}
        message={dialogState.messageKey ? t(dialogState.messageKey) : dialogState.message || ''}
        title={dialogState.titleKey ? t(dialogState.titleKey) : dialogState.title}
        onConfirm={dialogState.onConfirm}
        confirmText={dialogState.type === 'confirm' ? t('actions.delete') : t('actions.ok')}
        cancelText={t('actions.cancel')}
        confirmVariant="primary"
      />

      {/* Toast for non-blocking messages */}
      <Toast
        isOpen={toastMessage !== null}
        message={toastMessage || ''}
        onClose={() => setToastMessage(null)}
      />
    </div>
  )
}

