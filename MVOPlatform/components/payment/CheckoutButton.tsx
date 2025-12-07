'use client'

import { useState } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import { Button } from '@/components/ui/Button'
import { clientEnv } from '@/config/env'

const stripePromise = loadStripe(clientEnv.stripePublishableKey)

interface CheckoutButtonProps {
  planId: string
  userId?: string
}

export function CheckoutButton({ planId, userId }: CheckoutButtonProps) {
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
      {loading ? 'Processing...' : 'Checkout'}
    </Button>
  )
}

