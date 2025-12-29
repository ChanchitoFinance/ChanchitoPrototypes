'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { clientEnv } from '../../../../env-validation/config/env'
import { Button } from '@/shared/components/ui/Button'

const stripePromise = loadStripe(clientEnv.stripePublishableKey)

interface CheckoutButtonProps {
  planId: string
  userId?: string
}

export function CheckoutButton({ planId, userId }: CheckoutButtonProps) {
  const t = useTranslations()
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planId, userId }),
      })

      const { sessionId } = await response.json()
      const stripe = await stripePromise

      if (stripe && sessionId) {
        const { error } = await stripe.redirectToCheckout({ sessionId })
        if (error) {
          console.error('Stripe checkout error:', error)
          setLoading(false)
        }
      }
    } catch (error) {
      console.error('Checkout error:', error)
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleCheckout} disabled={loading} variant="primary">
      {loading ? t('actions.processing') : t('actions.checkout')}
    </Button>
  )
}
