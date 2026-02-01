'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/core/lib/hooks'
import {
  clearError,
  signInWithGoogle,
  acceptTermsAndConditions,
  saveOnboardingQuestions,
} from '@/core/lib/slices/authSlice'
import { Button } from '@/shared/components/ui/Button'
import {
  useLocale,
  useTranslations,
} from '@/shared/components/providers/I18nProvider'
import { TermsAcceptanceModal } from '@/shared/components/ui/TermsAcceptanceModal'
import {
  OnboardingQuestionsModal,
  OnboardingData,
} from '@/shared/components/ui/OnboardingQuestionsModal'
import { toast } from 'sonner'

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
  const { loading, error, isAuthenticated, profile, initialized, user } =
    useAppSelector(state => state.auth)
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [showOnboardingModal, setShowOnboardingModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const returnUrl = searchParams?.get('returnUrl') || null

  useEffect(() => {
    if (
      initialized &&
      isAuthenticated &&
      profile &&
      user?.email &&
      !isProcessing
    ) {
      // Check database field instead of localStorage
      const hasAcceptedTerms = profile.terms_and_conditions_accepted
      const hasCompletedOnboarding =
        profile.onboarding_questions !== null &&
        profile.onboarding_questions !== undefined

      console.log('🔍 Auth Flow Debug:', {
        hasAcceptedTerms,
        hasCompletedOnboarding,
        onboarding_questions: profile.onboarding_questions,
        isProcessing,
        showTermsModal,
        showOnboardingModal,
      })

      if (!hasAcceptedTerms) {
        console.log('→ Showing terms modal')
        setShowTermsModal(true)
        setShowOnboardingModal(false)
      } else if (!hasCompletedOnboarding) {
        // User has accepted terms but hasn't completed onboarding
        console.log('→ Showing onboarding modal')
        setShowOnboardingModal(true)
      } else {
        // User has accepted terms and completed onboarding, redirect to home or return URL
        console.log('→ Redirecting to app')
        setShowTermsModal(false)
        setShowOnboardingModal(false)
        router.replace(
          isSafeReturnUrl(returnUrl)
            ? decodeURIComponent(returnUrl)
            : `/${locale}`
        )
      }
    }
  }, [
    initialized,
    isAuthenticated,
    profile,
    user,
    router,
    locale,
    returnUrl,
    isProcessing,
  ])

  useEffect(() => {
    return () => {
      dispatch(clearError())
    }
  }, [dispatch])

  const handleSignInClick = () => {
    dispatch(signInWithGoogle())
  }

  const handleTermsAccepted = async () => {
    if (!user?.id) return

    console.log('📝 Accepting terms...')
    setIsProcessing(true)
    try {
      // Save terms acceptance to database using Redux thunk
      const result = await dispatch(acceptTermsAndConditions(user.id))

      console.log('✅ Terms acceptance result:', result)
      if (acceptTermsAndConditions.fulfilled.match(result)) {
        setShowTermsModal(false)
        // The useEffect will handle showing the onboarding modal after profile updates
        console.log(
          '→ Terms modal closed, waiting for useEffect to show onboarding modal'
        )
      } else {
        console.error('❌ Failed to accept terms:', result)
        toast.error('Failed to save terms acceptance')
      }
    } catch (error) {
      console.error('Error accepting terms:', error)
      toast.error('An error occurred')
    } finally {
      setIsProcessing(false)
      console.log('✅ Processing complete, isProcessing = false')
    }
  }

  const handleOnboardingComplete = async (answers: OnboardingData) => {
    if (!user?.id) return

    setIsProcessing(true)
    try {
      // Save onboarding answers to database using Redux thunk
      const result = await dispatch(
        saveOnboardingQuestions({
          userId: user.id,
          answers: answers as Record<string, any>,
        })
      )

      if (saveOnboardingQuestions.fulfilled.match(result)) {
        setShowOnboardingModal(false)
        // Redirect to home or return URL
        router.replace(
          isSafeReturnUrl(returnUrl)
            ? decodeURIComponent(returnUrl)
            : `/${locale}`
        )
      } else {
        toast.error('Failed to save onboarding answers')
      }
    } catch (error) {
      console.error('Error saving onboarding:', error)
      toast.error('An error occurred')
    } finally {
      setIsProcessing(false)
    }
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
        isOpen={showTermsModal && !isProcessing}
        onAccept={handleTermsAccepted}
        userEmail={user?.email}
      />

      <OnboardingQuestionsModal
        isOpen={showOnboardingModal && !isProcessing}
        onComplete={handleOnboardingComplete}
      />
    </>
  )
}
