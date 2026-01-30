'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/core/lib/hooks'
import { clearError, signInWithGoogle } from '@/core/lib/slices/authSlice'
import { Button } from '@/shared/components/ui/Button'
import { useLocale, useTranslations } from '@/shared/components/providers/I18nProvider'

function isSafeReturnUrl(value: string | null) {
  if (!value) return false
  return value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\')
}

export default function AuthPage() {
  const t = useTranslations()
  const router = useRouter()
  const { locale } = useLocale()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const { loading, error, isAuthenticated, profile, initialized } =
    useAppSelector(state => state.auth)

  const returnUrl = searchParams?.get('returnUrl') || null

  useEffect(() => {
    if (initialized && isAuthenticated && profile) {
      router.replace(isSafeReturnUrl(returnUrl) ? decodeURIComponent(returnUrl) : `/${locale}`)
    }
  }, [initialized, isAuthenticated, profile, router, locale, returnUrl])

  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const handleSignIn = () => {
    if (returnUrl) {
      sessionStorage.setItem('authReturnUrl', returnUrl)
    }
    dispatch(signInWithGoogle())
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-text-primary mb-2">
            {t('auth.welcome_title')}
          </h1>
          <p className="text-text-secondary">{t('auth.subtitle')}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <Button
          onClick={handleSignIn}
          disabled={loading}
          variant="primary"
          className="w-full"
        >
          {loading ? t('auth.signing_in') : t('auth.continue_google')}
        </Button>
      </div>
    </div>
  )
}
