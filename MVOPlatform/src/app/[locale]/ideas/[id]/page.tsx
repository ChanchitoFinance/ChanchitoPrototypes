'use client'

import React from 'react'
import { IdeaDetail } from '@/features/ideas/components/IdeaDetail'
import { useAppSelector, useAppDispatch } from '@/core/lib/hooks'
import { signInWithGoogle } from '@/core/lib/slices/authSlice'
import { useLocale, useTranslations } from '@/shared/components/providers/I18nProvider'
import { Button } from '@/shared/components/ui/Button'
import { Lock } from 'lucide-react'

export default function IdeaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = React.use(params)
  const { locale } = useLocale()
  const t = useTranslations()
  const dispatch = useAppDispatch()
  const { isAuthenticated, initialized } = useAppSelector(state => state.auth)

  const handleSignIn = () => {
    const returnUrl = `/${locale}/ideas/${resolvedParams.id}`
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('authReturnUrl', returnUrl)
    }
    dispatch(signInWithGoogle())
  }

  if (!initialized) {
    return (
      <div className="bg-background flex flex-1 items-center justify-center min-h-[40vh]">
        <div className="animate-pulse text-text-secondary">{t('status.loading')}</div>
      </div>
    )
  }

  return (
    <div className="bg-background flex">
      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
        <IdeaDetail ideaId={resolvedParams.id} />
      </div>

      {/* When not signed in: blur overlay + sign-in modal on top of idea detail */}
      {!isAuthenticated && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            aria-hidden
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto bg-background border border-border-color rounded-lg shadow-xl w-full max-w-md p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="rounded-full p-4 flex items-center justify-center bg-gray-200">
                  <Lock className="w-8 h-8 text-primary-accent" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-text-primary mb-2">
                {t('auth.sign_in_to_view_idea')}
              </h2>
              <p className="text-text-secondary text-sm mb-6">
                {t('auth.sign_in_to_view_idea_description')}
              </p>
              <Button
                variant="primary"
                onClick={handleSignIn}
                className="w-full"
              >
                {t('auth.continue_with_google')}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
