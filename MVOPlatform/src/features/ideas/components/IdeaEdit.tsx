'use client'

import { useRouter } from 'next/navigation'
import {
  useTranslations,
  useLocale,
} from '@/shared/components/providers/I18nProvider'
import { useAppSelector } from '@/core/lib/hooks'
import { IdeaForm } from '@/features/ideas/components/forms/IdeaForm'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { ideaService } from '@/core/lib/services/ideaService'
import { Idea } from '@/core/types/idea'

interface IdeaEditProps {
  ideaId: string
}

export function IdeaEdit({ ideaId }: IdeaEditProps) {
  const t = useTranslations()
  const { locale } = useLocale()
  const { isAuthenticated, loading, initialized, user } = useAppSelector(
    state => state.auth
  )
  const router = useRouter()
  const [idea, setIdea] = useState<Idea | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthorized, setIsAuthorized] = useState(false)

  // Load idea and check ownership
  useEffect(() => {
    const checkAuthorizationAndLoadIdea = async () => {
      if (!initialized) return

      // If not authenticated, redirect to sign in
      if (!isAuthenticated) {
        toast.warning(t('auth.sign_in_to_upload'))
        router.push(`/${locale}`)
        return
      }

      try {
        const loadedIdea = await ideaService.getIdeaById(ideaId)

        if (!loadedIdea) {
          toast.error(t('messages.idea_not_found'))
          router.push(`/${locale}`)
          return
        }

        // Check if user is the owner
        if (user?.email !== loadedIdea.creatorEmail) {
          toast.error(t('auth.sign_in_required'))
          router.push(`/${locale}/ideas/${ideaId}`)
          return
        }

        setIdea(loadedIdea)
        setIsAuthorized(true)
      } catch (error) {
        console.error('Error loading idea:', error)
        toast.error(t('messages.generic_error'))
        router.push(`/${locale}`)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuthorizationAndLoadIdea()
  }, [ideaId, isAuthenticated, initialized, user, router, locale, t])

  // Show loading state while checking auth and loading idea
  if (loading || !initialized || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-text-secondary">{t('status.loading')}</div>
      </div>
    )
  }

  // If not authorized (shouldn't reach here due to redirects, but just in case)
  if (!isAuthorized || !idea) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-text-secondary">{t('status.loading')}</div>
      </div>
    )
  }

  return <IdeaForm ideaId={ideaId} />
}
