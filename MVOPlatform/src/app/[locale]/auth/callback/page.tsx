'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/core/lib/supabase'
import { useLocale } from '@/shared/components/providers/I18nProvider'

export default function AuthCallbackPage() {
  const router = useRouter()
  const { locale } = useLocale()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) throw error

        if (data.session) {
          router.push(`/${locale}`)
        } else {
          router.push(`/${locale}/auth`)
        }
      } catch (error) {
        console.error('Error handling auth callback:', error)
        router.push(`/${locale}/auth`)
      }
    }

    handleCallback()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-text-secondary">Completing sign in...</p>
      </div>
    </div>
  )
}
