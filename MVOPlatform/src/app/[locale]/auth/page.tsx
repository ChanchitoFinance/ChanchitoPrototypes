'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/core/lib/hooks'
import { clearError, signInWithGoogle } from '@/core/lib/slices/authSlice'
import { Button } from '@/shared/components/ui/Button'
import { useLocale } from '@/shared/components/providers/I18nProvider'

export default function AuthPage() {
  const router = useRouter()
  const { locale } = useLocale()
  const dispatch = useAppDispatch()
  const { loading, error, isAuthenticated, profile, initialized } =
    useAppSelector(state => state.auth)

  useEffect(() => {
    if (initialized && isAuthenticated && profile) {
      router.replace(`/${locale}`)
    }
  }, [initialized, isAuthenticated, profile, router, locale])

  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const handleSignIn = () => {
    dispatch(signInWithGoogle())
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-6">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-text-primary mb-2">
            Welcome to MVO
          </h1>
          <p className="text-text-secondary">Sign in with Google to continue</p>
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
          {loading ? 'Signing in...' : 'Continue with Google'}
        </Button>
      </div>
    </div>
  )
}
