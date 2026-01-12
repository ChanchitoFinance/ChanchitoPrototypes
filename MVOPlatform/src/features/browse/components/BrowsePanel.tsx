'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  useLocale,
  useTranslations,
} from '@/shared/components/providers/I18nProvider'
import { BrowseDashboard } from '@/features/browse/components/BrowseDashboard'
import { useAppSelector } from '@/core/lib/hooks'

export function BrowsePanel() {
  const t = useTranslations()
  const { locale } = useLocale()
  const { profile, isAuthenticated, loading } = useAppSelector(
    state => state.auth
  )
  const router = useRouter()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-secondary">{t('status.loading')}</div>
      </div>
    )
  }

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <BrowseDashboard />
      </motion.div>
    </main>
  )
}
