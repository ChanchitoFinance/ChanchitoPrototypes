'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { useAppDispatch, useAppSelector } from '@/core/lib/hooks'
import { IdeaForm } from '@/features/ideas/components/forms/IdeaForm'
import { signInWithGoogle } from '@/core/lib/slices/authSlice'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { TermsAcceptanceModal } from '@/shared/components/ui/TermsAcceptanceModal'

export function IdeaUpload() {
  const t = useTranslations()
  const dispatch = useAppDispatch()
  const { isAuthenticated, loading, initialized, user } = useAppSelector(
    state => state.auth
  )

  // Check if terms are accepted after user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      const hasAcceptedTerms =
        localStorage.getItem(`${user.email}_termsAccepted`) === 'true'
      if (!hasAcceptedTerms) {
        setShowTermsModal(true)
      }
    }
  }, [isAuthenticated, user])
  const router = useRouter()
  const [showTermsModal, setShowTermsModal] = useState(false)

  if (loading && !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-secondary">{t('status.loading')}</div>
      </div>
    )
  }

  const handleSubmit = (formData: any) => {
    if (!isAuthenticated) {
      // Save draft to local storage
      localStorage.setItem('ideaDraft', JSON.stringify(formData))
      // Show alert instead of intrusive view
      toast.warning(t('auth.sign_in_required_alert'))
      // Directly sign in without checking terms first
      dispatch(signInWithGoogle())
    }
  }

  const handleTermsAccepted = () => {
    setShowTermsModal(false)
    // Store terms acceptance in localStorage for the current user
    if (user?.email) {
      const key = `${user.email}_termsAccepted`
      localStorage.setItem(key, 'true')
    }
  }

  return (
    <>
      <IdeaForm onCustomSubmit={handleSubmit} />
      <TermsAcceptanceModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={handleTermsAccepted}
        userEmail={user?.email}
      />
    </>
  )
}
