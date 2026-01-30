'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/core/lib/hooks'
import { clearError, signInWithGoogle } from '@/core/lib/slices/authSlice'
import { Button } from '@/shared/components/ui/Button'
import {
  useLocale,
  useTranslations,
} from '@/shared/components/providers/I18nProvider'
import { TermsAcceptanceModal } from '@/shared/components/ui/TermsAcceptanceModal'

function isSafeReturnUrl(value: string | null) {
  if (!value) return false
  return (
    value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\')
  )
}

export default function AuthPage() {
  const t = useTranslations()
  const router = useRouter()
  const { locale } = useLocale()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const { loading, error, isAuthenticated, profile, initialized } =
    useAppSelector(state => state.auth)
  const [showTermsModal, setShowTermsModal] = useState(false)

  const returnUrl = searchParams?.get('returnUrl') || null

  useEffect(() => {
    if (initialized && isAuthenticated && profile) {
      router.replace(
        isSafeReturnUrl(returnUrl)
          ? decodeURIComponent(returnUrl)
          : `/${locale}`
      )
    }
  }, [initialized, isAuthenticated, profile, router, locale, returnUrl])

  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const handleSignInClick = () => {
    // Show terms modal first
    setShowTermsModal(true)
  }

  const handleTermsAccepted = () => {
    // Close modal and proceed with sign-in
    setShowTermsModal(false)
    dispatch(signInWithGoogle())
  }

  const handleTermsClose = () => {
    setShowTermsModal(false)
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-md w-full bg-background border border-border-color rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-text-primary mb-2">
              {t('auth.welcome_title')}
            </h1>
            <p className="text-text-secondary">{t('auth.welcome_subtitle')}</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <Button
            onClick={handleSignInClick}
            disabled={loading}
            variant="primary"
            className="w-full"
          >
            {loading ? t('auth.signing_in') : t('auth.continue_with_google')}
          </Button>
        </div>
      </div>

      <TermsAcceptanceModal
        isOpen={showTermsModal}
        onClose={handleTermsClose}
        onAccept={handleTermsAccepted}
      />
    </>
  )
}
