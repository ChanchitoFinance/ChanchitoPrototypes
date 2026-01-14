'use client'

import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/core/lib/hooks'
import { loadUserCredits } from '@/core/lib/slices/creditsSlice'
import { Crown } from 'lucide-react'

export function CreditsDisplay() {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(state => state.auth)
  const { plan, dailyCredits, usedCredits, loading } = useAppSelector(
    state => state.credits
  )

  useEffect(() => {
    if (user && !loading) {
      dispatch(loadUserCredits(user.id))
    }
  }, [user, dispatch, loading])

  if (!user || loading) return null

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
