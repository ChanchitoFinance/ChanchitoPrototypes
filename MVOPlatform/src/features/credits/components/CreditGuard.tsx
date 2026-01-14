'use client'

import { useEffect, useState } from 'react'
import { useAppSelector, useAppDispatch } from '@/core/lib/hooks'
import { loadUserCredits, deductCredits } from '@/core/lib/slices/creditsSlice'
import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { Button } from '@/shared/components/ui/Button'
import { Crown, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

interface CreditGuardProps {
  children: React.ReactNode
  cost: number
  feature: string
  onAction?: () => void
  showInsufficientCreditsModal?: boolean
}

export function CreditGuard({
  children,
  cost,
  feature,
  onAction,
  showInsufficientCreditsModal = true,
}: CreditGuardProps) {
  const t = useTranslations()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(state => state.auth)
  const { plan, dailyCredits, usedCredits, loading } = useAppSelector(
    state => state.credits
  )
  const [showModal, setShowModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    if (user && !loading) {
      dispatch(loadUserCredits(user.id))
    }
  }, [user, dispatch, loading])

  const hasEnoughCredits = () => {
    if (plan === 'innovator') return true
    return dailyCredits - usedCredits >= cost
  }

  const handleAction = async () => {
    if (!user) return

    if (!hasEnoughCredits()) {
      if (showInsufficientCreditsModal) {
        setShowModal(true)
      }
      return
    }

    setIsProcessing(true)
    try {
      await dispatch(deductCredits({ userId: user.id, amount: cost })).unwrap()
      onAction?.()
    } catch (error) {
      console.error('Error deducting credits:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (loading) {
    return <div className="animate-pulse">{children}</div>
  }

  const remainingCredits =
    plan === 'innovator' ? '∞' : (dailyCredits - usedCredits).toString()

  return (
    <>
      <div
        onClick={handleAction}
        className="cursor-pointer"
        title={`${t('credits.remaining')}: ${remainingCredits}`}
      >
        {children}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background border border-border-color rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              <h3 className="text-lg font-semibold text-text-primary">
                {t('credits.insufficient_title')}
              </h3>
            </div>
            <p className="text-text-secondary mb-6">
              You need {cost} credits to use {feature}, but you only have{' '}
              {remainingCredits} remaining today.
            </p>
            <div className="flex gap-3">
              <Link href="/premium">
                <Button variant="primary" className="flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  {t('credits.upgrade_plan')}
                </Button>
              </Link>
              <Button variant="outline" onClick={() => setShowModal(false)}>
                {t('actions.cancel')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
