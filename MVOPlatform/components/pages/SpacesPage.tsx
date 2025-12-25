'use client'

import { useState, useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Footer } from '@/components/layout/Footer'
import { SpaceCard } from '@/components/spaces/SpaceCard'
import { Button } from '@/components/ui/Button'
import { teamService, SpaceWithTeam } from '@/lib/services/teamService'
import { useAppSelector } from '@/lib/hooks'
import { useTranslations } from '@/components/providers/I18nProvider'
import { Plus } from 'lucide-react'
import { SpaceForm } from '@/components/spaces/SpaceForm'
import { SpaceCardSkeleton } from '@/components/spaces/SpaceCardSkeleton'

export function SpacesPage() {
  const t = useTranslations()
  const { user, isAuthenticated } = useAppSelector(state => state.auth)
  const [spaces, setSpaces] = useState<SpaceWithTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)

  useEffect(() => {
    const loadSpaces = async () => {
      try {
        setLoading(true)
        const visibleSpaces = await teamService.getVisibleSpaces(
          user?.id || undefined
        )
        setSpaces(visibleSpaces)
      } catch (error) {
        console.error('Error loading spaces:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSpaces()
  }, [user?.id])

  const handleSpaceCreated = async () => {
  }

  if (showCreateForm) {
    return (
      <div className="h-screen w-full overflow-hidden bg-background flex">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <main className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <SpaceForm onSuccess={handleSpaceCreated} onCancel={() => setShowCreateForm(false)} />
            <Footer />
          </main>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto flex flex-col [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <div className="flex-1">
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-text-primary mb-2">
                    {t('spaces.title')}
                  </h1>
                  <p className="text-text-secondary">
                    {t('spaces.no_spaces_description')}
                  </p>
                </div>
                {isAuthenticated && (
                  <Button
                    onClick={() => setShowCreateForm(true)}
                    variant="primary"
                  >
                    <Plus className="w-4 h-4" />
                    {t('spaces.create_space')}
                  </Button>
                )}
              </div>

              {/* Spaces Grid - Masonry Layout */}
              {loading ? (
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 pb-8">
                  {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={`skeleton-${i}`} className="break-inside-avoid mb-6">
                      <SpaceCardSkeleton />
                    </div>
                  ))}
                </div>
              ) : spaces.length > 0 ? (
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 pb-8">
                  {spaces.map(space => (
                    <div key={space.id} className="break-inside-avoid mb-6">
                      <SpaceCard space={space} />
                    </div>
                  ))}
                </div>
              ) : null}

              {/* Empty State */}
              {!loading && spaces.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-text-secondary text-lg mb-4">
                    {t('spaces.no_spaces')}
                  </p>
                  <p className="text-text-secondary mb-6">
                    {t('spaces.no_spaces_description')}
                  </p>
                  {isAuthenticated && (
                    <Button
                      onClick={() => setShowCreateForm(true)}
                      variant="primary"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t('spaces.create_space')}
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
          <Footer />
        </main>
      </div>
    </div>
  )
}

