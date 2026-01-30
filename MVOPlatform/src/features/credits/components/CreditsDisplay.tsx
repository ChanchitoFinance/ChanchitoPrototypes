'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useAppSelector, useAppDispatch } from '@/core/lib/hooks'
import { loadUserCredits } from '@/core/lib/slices/creditsSlice'
import { supabase } from '@/core/lib/supabase'
import { useTranslations, useLocale } from '@/shared/components/providers/I18nProvider'
import { Crown } from 'lucide-react'

export function CreditsDisplay() {
  const dispatch = useAppDispatch()
  const t = useTranslations()
  const { locale } = useLocale()
  const { user } = useAppSelector(state => state.auth)
  const { coinsBalance, loading, loaded } = useAppSelector(
    state => state.credits
  )

  useEffect(() => {
    const loadCredits = async () => {
      let userId = user?.id
      if (!userId) {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        userId = session?.user?.id
      }
      if (userId && !loaded) {
        dispatch(loadUserCredits(userId))
      }
    }
    loadCredits()
  }, [user, dispatch, loaded])

  if (!user || loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border-color">
        <Crown className="w-4 h-4 text-accent" />
        <div className="flex-1">
          <div className="text-sm font-medium text-text-primary">
            {t('status.loading')}
          </div>
          <div className="text-xs text-text-secondary">
            {t('credits.loading')}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-border-color">
      <Crown className="w-4 h-4 text-accent" />
      <div className="flex-1">
        <div className="text-sm font-medium text-text-primary">
          {coinsBalance} {t('credits.coins_unit')}
        </div>
        <div className="text-xs text-text-secondary">
          <Link
            href={`/${locale}/premium`}
            className="text-accent hover:underline"
          >
            {t('credits.get_more_coins')}
          </Link>
        </div>
      </div>
    </div>
  )
}
