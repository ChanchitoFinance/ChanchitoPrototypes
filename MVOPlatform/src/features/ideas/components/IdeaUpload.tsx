'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { useAppDispatch, useAppSelector } from '@/core/lib/hooks'
import { IdeaForm } from '@/features/ideas/components/forms/IdeaForm'
import { signInWithGoogle } from '@/core/lib/slices/authSlice'
import { useEffect } from 'react'
import { toast } from 'sonner'

export function IdeaUpload() {
  const t = useTranslations()
  const dispatch = useAppDispatch()
  const { isAuthenticated, loading, initialized } = useAppSelector(state => state.auth)
  const router = useRouter()

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
      // Redirect to sign in
      dispatch(signInWithGoogle())
    }
  }

  return <IdeaForm onCustomSubmit={handleSubmit} />
}
