'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { useAppSelector, useAppDispatch } from '@/core/lib/hooks'
import { loadUserCredits } from '@/core/lib/slices/creditsSlice'
import { supabase } from '@/core/lib/supabase'
import { Crown, Check, Zap, Star, Users } from 'lucide-react'

const plans = [
  {
    id: 'free' as const,
    name: 'Free',
    price: 0,
    credits: 3,
    features: ['Basic AI features', 'Community support'],
    icon: Check,
  },
  {
    id: 'pro' as const,
    name: 'Pro',
    price: 5,
    credits: 50,
    features: ['Advanced AI features', 'Priority support', '50 daily credits'],
    icon: Zap,
  },
  {
    id: 'premium' as const,
    name: 'Premium',
    price: 20,
    credits: 250,
    features: ['All Pro features', '250 daily credits', 'Advanced analytics'],
    icon: Star,
  },
  {
    id: 'innovator' as const,
    name: 'Innovator',
    price: 100,
    credits: -1, // Infinite
    features: [
      'All Premium features',
      'Unlimited credits',
      'Team collaboration',
    ],
    icon: Users,
  },
]

const planHierarchy = {
  free: 0,
  pro: 1,
  premium: 2,
  innovator: 3,
}

export function PremiumPage() {
  const t = useTranslations()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector(state => state.auth)
  const { plan: userPlan, loading: creditsLoading } = useAppSelector(
    state => state.credits
  )

  // Load user credits when component mounts
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

      if (userId) {
        dispatch(loadUserCredits(userId))
      }
    }

    loadCredits()
  }, [user, dispatch])

  return (
    <div className="bg-background min-h-screen">
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Crown className="w-16 h-16 text-accent" />
          </div>
          <h1 className="text-4xl font-bold text-text-primary mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-text-secondary">
            Unlock more AI features with our credit-based system
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {plans.map(plan => {
            const Icon = plan.icon
            // Default to free plan if credits are still loading
            const currentUserPlan = creditsLoading ? 'free' : userPlan
            const userPlanLevel =
              planHierarchy[currentUserPlan as keyof typeof planHierarchy] || 0
            const planLevel =
              planHierarchy[plan.id as keyof typeof planHierarchy]
            const canSelect = planLevel > userPlanLevel
            const isCurrentPlan = plan.id === currentUserPlan

            return (
              <div
                key={plan.id}
                className={`p-6 border rounded-lg transition-all ${
                  isCurrentPlan
                    ? 'border-accent bg-accent/10'
                    : plan.id === 'free'
                      ? 'border-border-color'
                      : canSelect
                        ? 'border-accent/30 bg-accent/5 hover:bg-accent/10'
                        : 'border-gray-300 bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Icon className="w-6 h-6 text-accent" />
                  <h3 className="text-xl font-semibold text-text-primary">
                    {plan.name}
                  </h3>
                  {isCurrentPlan && (
                    <span className="text-xs bg-accent text-white px-2 py-1 rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <div className="mb-4">
                  <div className="text-3xl font-bold text-accent mb-1">
                    ${plan.price}
                    {plan.price > 0 && (
                      <span className="text-lg text-text-secondary">/mo</span>
                    )}
                  </div>
                  <div className="text-sm text-text-secondary">
                    {plan.credits === -1
                      ? 'Unlimited'
                      : `${plan.credits} daily credits`}
                  </div>
                </div>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-text-secondary">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                {isCurrentPlan ? (
                  <div className="text-sm text-accent font-medium">
                    ✓ Current plan
                  </div>
                ) : !canSelect ? (
                  <div className="text-sm text-text-secondary">
                    Already have access
                  </div>
                ) : user ? (
                  <button
                    onClick={() => {
                      router.push(`/en/checkout?plan=${plan.id}`)
                    }}
                    className="w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!canSelect}
                  >
                    Select {plan.name}
                  </button>
                ) : (
                  <div className="text-sm text-text-secondary">
                    Sign in to subscribe
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="text-center text-sm text-text-secondary">
          <p>Plans renew monthly on the same day of payment. Cancel anytime.</p>
        </div>
      </main>
    </div>
  )
}
