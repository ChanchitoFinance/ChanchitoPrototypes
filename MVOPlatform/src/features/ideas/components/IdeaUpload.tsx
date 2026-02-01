'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { useAppDispatch, useAppSelector } from '@/core/lib/hooks'
import { IdeaForm } from '@/features/ideas/components/forms/IdeaForm'
import {
  signInWithGoogle,
  acceptTermsAndConditions,
} from '@/core/lib/slices/authSlice'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { TermsAcceptanceModal } from '@/shared/components/ui/TermsAcceptanceModal'

export function IdeaUpload() {
  const t = useTranslations()
  const dispatch = useAppDispatch()
  const { isAuthenticated, loading, initialized, user, profile } =
    useAppSelector(state => state.auth)

  // Check if terms are accepted after user is authenticated
  useEffect(() => {
    if (isAuthenticated && profile) {
      if (!profile.terms_and_conditions_accepted) {
        setShowTermsModal(true)
      }
    }
  }, [isAuthenticated, profile])
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

  const handleTermsAccepted = async () => {
    if (user?.id) {
      setShowTermsModal(false)
      // Save terms acceptance to database
      await dispatch(acceptTermsAndConditions(user.id))
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
