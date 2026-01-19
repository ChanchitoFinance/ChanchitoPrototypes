'use client'

import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/core/lib/hooks'
import { loadUserCredits } from '@/core/lib/slices/creditsSlice'
import { supabase } from '@/core/lib/supabase'
import { Crown } from 'lucide-react'

export function CreditsDisplay() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(state => state.auth)
  const { plan, dailyCredits, usedCredits, loading, loaded } = useAppSelector(
    state => state.credits
  )

  useEffect(() => {
    const loadCredits = async () => {
      // Try to get user from Redux first, then from Supabase auth
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

  // Show loading state while credits are being loaded
  if (!user || loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border-color">
        <Crown className="w-4 h-4 text-accent" />
        <div className="flex-1">
          <div className="text-sm font-medium text-text-primary">
            Loading...
          </div>
          <div className="text-xs text-text-secondary">
            Checking plan status
          </div>
        </div>
      </div>
    )
  }

  const remainingCredits =
    plan === 'innovator' ? '∞' : (dailyCredits - usedCredits).toString()
  const planName = plan.charAt(0).toUpperCase() + plan.slice(1)

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b border-border-color">
      <Crown className="w-4 h-4 text-accent" />
      <div className="flex-1">
        <div className="text-sm font-medium text-text-primary">
          {planName} Plan
        </div>
        <div className="text-xs text-text-secondary">
          {remainingCredits === '∞'
            ? 'Unlimited credits'
            : `${remainingCredits} credits remaining today`}
        </div>
      </div>
    </div>
  )
}
