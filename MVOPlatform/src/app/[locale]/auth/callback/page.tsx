'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/core/lib/supabase'
import { useLocale, useTranslations } from '@/shared/components/providers/I18nProvider'

function isSafeReturnUrl(value: string | null) {
  if (!value) return false
  return value.startsWith('/') && !value.startsWith('//') && !value.startsWith('/\\')
}

export default function AuthCallbackPage() {
  const t = useTranslations()
  const router = useRouter()
  const { locale } = useLocale()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) throw error

        if (data.session) {
          const stored = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('authReturnUrl') : null
          if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem('authReturnUrl')
          const target = isSafeReturnUrl(stored) ? stored : `/${locale}`
          router.replace(target)
        } else {
          router.replace(`/${locale}/auth`)
        }
      } catch (error) {
        console.error('Error handling auth callback:', error)
        router.replace(`/${locale}/auth`)
      }
    }

    handleCallback()
  }, [router, locale])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-text-secondary">{t('auth.completing_sign_in')}</p>
      </div>
    </div>
  )
}
