'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/core/lib/hooks'
import { updateUserPlan } from '@/core/lib/slices/creditsSlice'
import { PayPalCheckoutButton } from '@/features/payment/components/PayPalCheckoutButton'
import { Crown, ArrowLeft } from 'lucide-react'
import { useTranslations } from '@/shared/components/providers/I18nProvider'

const planDetails = {
  pro: {
    name: 'Pro',
    price: 5,
    credits: 50,
    features: ['Advanced AI features', 'Priority support', '50 daily credits'],
  },
  premium: {
    name: 'Premium',
    price: 20,
    credits: 250,
    features: ['All Pro features', '250 daily credits', 'Advanced analytics'],
  },
  innovator: {
    name: 'Innovator',
    price: 100,
    credits: -1, // Infinite
    features: [
      'All Premium features',
      'Unlimited credits',
      'Team collaboration',
    ],
  },
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const t = useTranslations()
  const { user } = useAppSelector(state => state.auth)

  const plan = searchParams.get('plan') as 'pro' | 'premium' | 'innovator'
  const planDetail = plan ? planDetails[plan] : null

  const handlePaymentSuccess = async () => {
    if (user && plan) {
      // Update Redux state with new plan
      await dispatch(updateUserPlan({ userId: user.id, plan }))
    }
    // Redirect to premium page with success message
    router.push('/en/premium?success=true')
  }

  if (!plan || !planDetail || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            Invalid Checkout
          </h1>
          <p className="text-text-secondary mb-4">
            Please select a valid plan to continue.
          </p>
          <button
            onClick={() => router.push('/en/premium')}
            className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90"
          >
            Back to Plans
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <Crown className="w-8 h-8 text-accent" />
            <h1 className="text-3xl font-bold text-text-primary">Checkout</h1>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Plan Summary */}
          <div className="card-base">
            <h2 className="text-xl font-semibold text-text-primary mb-6">
              Order Summary
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-text-primary font-medium">
                  {planDetail.name} Plan
                </span>
                <span className="text-2xl font-bold text-accent">
                  ${planDetail.price}
                </span>
              </div>

              <div className="text-sm text-text-secondary">
                {planDetail.credits === -1
                  ? 'Unlimited daily credits'
                  : `${planDetail.credits} daily credits`}
              </div>

              <div className="border-t border-border-color pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-text-primary font-medium">Total</span>
                  <span className="text-2xl font-bold text-accent">
                    ${planDetail.price}
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-1">
                  Monthly subscription • Manual renewal required
                </p>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="card-base">
            <h2 className="text-xl font-semibold text-text-primary mb-6">
              Payment Method
            </h2>

            <div className="space-y-6">
              <div className="text-center">
                <p className="text-text-secondary mb-4">
                  Complete your purchase securely with PayPal
                </p>
                <PayPalCheckoutButton
                  plan={plan}
                  userId={user.id}
                  onSuccess={handlePaymentSuccess}
                />
              </div>

              <div className="text-xs text-text-secondary text-center space-y-2">
                <p>🔒 Secure payment processing</p>
                <p>✨ Instant plan activation</p>
                <p>🔄 Cancel anytime</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  )
}
