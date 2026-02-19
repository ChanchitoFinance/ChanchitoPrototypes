'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import { useAppSelector, useAppDispatch } from '@/core/lib/hooks'
import { loadUserCredits } from '@/core/lib/slices/creditsSlice'
import { PayPalSubscriptionButton } from '@/features/payment/components/PayPalSubscriptionButton'
import { Crown, ArrowLeft } from 'lucide-react'
import {
  useTranslations,
  useLocale,
} from '@/shared/components/providers/I18nProvider'

const planDetails = {
  starter: {
    name: 'Starter',
    price: 19,
    coins: 100,
    features: ['100 coins', 'Run analysis', 'Spend coins to go deeper'],
  },
  builder: {
    name: 'Builder',
    price: 49,
    coins: 250,
    features: ['250 coins', 'Run analysis', 'Spend coins to go deeper'],
  },
  operator: {
    name: 'Operator',
    price: 89,
    coins: 500,
    features: ['500 coins', 'Run analysis', 'Spend coins to go deeper'],
  },
}

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const dispatch = useAppDispatch()
  const t = useTranslations()
  const { locale } = useLocale()
  const { user } = useAppSelector(state => state.auth)

  const plan = searchParams.get('plan') as
    | 'starter'
    | 'builder'
    | 'operator'
  const planDetail = plan ? planDetails[plan] : null

  const handlePaymentSuccess = async () => {
    if (user) {
      await dispatch(loadUserCredits(user.id))
    }
    router.push(`/${locale}/premium?success=true`)
  }

  if (!plan || !planDetail || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            {t('checkout.invalid_title')}
          </h1>
          <p className="text-text-secondary mb-6">
            {t('checkout.invalid_message')}
          </p>
          <button
            onClick={() => router.push(`/${locale}/premium`)}
            className="px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 font-medium"
          >
            {t('checkout.get_more_coins')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
        <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all"
            style={{
              backgroundColor: 'var(--primary-accent)',
              color: 'var(--white)',
              border: '2px solid transparent',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'var(--hover-accent)'
              e.currentTarget.style.color = 'var(--white)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'var(--primary-accent)'
              e.currentTarget.style.color = 'var(--white)'
            }}
          >
            <ArrowLeft className="w-5 h-5" />
            {t('checkout.back')}
          </button>
          <div className="flex items-center gap-2">
            <Crown className="w-8 h-8 text-accent" />
            <h1 className="text-3xl font-bold text-text-primary">
              {t('checkout.title')}
            </h1>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="card-base">
            <h2 className="text-xl font-semibold text-text-primary mb-6">
              {t('checkout.order_summary')}
            </h2>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-text-primary font-medium">
                  {planDetail.name} – {planDetail.coins} coins
                </span>
                <span className="text-2xl font-bold text-accent">
                  ${planDetail.price}
                </span>
              </div>

              <div className="border-t border-border-color pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-text-primary font-medium">
                    {t('checkout.total')}
                  </span>
                  <span className="text-2xl font-bold text-accent">
                    ${planDetail.price}
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-2">
                  {t('checkout.coins_no_expire_note')}
                </p>
              </div>
            </div>
          </div>

          <div className="card-base">
            <h2 className="text-xl font-semibold text-text-primary mb-6">
              {t('checkout.payment_method')}
            </h2>

            <div className="space-y-6">
              <p className="text-text-secondary">
                {t('checkout.pay_with_paypal')}
              </p>
              <PayPalSubscriptionButton
                plan={plan}
                userId={user.id}
                onSuccess={handlePaymentSuccess}
              />

              <div className="text-sm text-text-secondary space-y-1 pt-2 border-t border-border-color">
                <p>{t('checkout.secure_processing')}</p>
                <p>{t('checkout.coins_instant')}</p>
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
