'use client'

import { useState } from 'react'
import { useAppSelector } from '@/lib/hooks'
import { signInWithGoogle } from '@/lib/slices/authSlice'
import { useAppDispatch } from '@/lib/hooks'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { Footer } from '@/components/layout/Footer'
import { IdeaForm } from '@/components/forms/IdeaForm'
import { Button } from '@/components/ui/Button'
import { motion } from 'framer-motion'
import { useTranslations } from '@/components/providers/I18nProvider'

export function IdeaUpload() {
  const t = useTranslations()
  const dispatch = useAppDispatch()
  const { isAuthenticated, loading } = useAppSelector(state => state.auth)
  const router = useRouter()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-secondary">{t('status.loading')}</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-16 md:ml-0">
          <main className="flex-1 flex items-center justify-center px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-md"
            >
              <h1 className="text-3xl font-semibold text-text-primary mb-4">
                {t('auth.sign_in_required')}
              </h1>
              <p className="text-base text-text-secondary mb-8">
                {t('auth.sign_in_to_upload')}
              </p>
              <Button onClick={() => dispatch(signInWithGoogle())}>
                {t('auth.sign_in_with_google')}
              </Button>
            </motion.div>
          </main>
          <Footer />
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <IdeaForm />
          <Footer />
        </main>
      </div>
    </div>
  )
}
