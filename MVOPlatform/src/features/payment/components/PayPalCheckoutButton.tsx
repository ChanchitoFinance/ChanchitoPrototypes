'use client'

import { useEffect, useRef } from 'react'
import { clientEnv } from '@/env-validation/config/env'
import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { toast } from 'sonner'

// Extend window type for PayPal
declare global {
  interface Window {
    paypal?: any
  }
}

interface PayPalCheckoutButtonProps {
  plan: 'pro' | 'premium' | 'innovator'
  userId: string
  onSuccess?: () => void
}

const planPrices = {
  pro: 5,
  premium: 20,
  innovator: 100,
}

export function PayPalCheckoutButton({
  plan,
  userId,
  onSuccess,
}: PayPalCheckoutButtonProps) {
  const t = useTranslations()
  const containerRef = useRef<HTMLDivElement>(null)
  const containerId = useRef(`paypal-button-${Date.now()}`).current
  const hasRendered = useRef(false)

  useEffect(() => {
    const initializePayPal = async () => {
      if (!window.paypal || hasRendered.current) return

      hasRendered.current = true

      try {
        window.paypal
          .Buttons({
            style: {
              shape: 'rect',
              color: 'gold',
              layout: 'vertical',
              label: 'paypal',
            },
            createOrder: (data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    amount: {
                      value: planPrices[plan].toFixed(2),
                      currency_code: 'USD',
                    },
                    description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan Subscription`,
                  },
                ],
              })
            },
            onApprove: async (data, actions) => {
              try {
                const order = await actions.order.capture()

                // Now update the database with the successful payment
                const response = await fetch('/api/paypal/capture-order', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    orderId: data.orderID,
                    plan,
                    userId,
                    orderData: order,
                  }),
                })

                if (!response.ok) {
                  throw new Error('Failed to update database')
                }

                toast.success(t('payment.success'))
                onSuccess?.()
              } catch (error) {
                console.error('Error capturing PayPal order:', error)
                toast.error(t('payment.error_capturing'))
              }
            },
            onError: error => {
              console.error('PayPal error:', error)
              toast.error(t('payment.paypal_error'))
            },
            onCancel: data => {
              console.log('PayPal payment cancelled:', data)
            },
          })
          .render(`#${containerId}`)
      } catch (error) {
        console.error('Error initializing PayPal:', error)
        toast.error('Failed to load PayPal')
      }
    }

    // Load PayPal SDK if not already loaded
    if (!window.paypal) {
      const script = document.createElement('script')
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientEnv.paypalClientId}&currency=${clientEnv.paypalCurrency}&intent=${clientEnv.paypalIntent}&locale=${clientEnv.paypalLocale}&environment=${clientEnv.paypalEnvironment}`
      script.onload = initializePayPal
      document.head.appendChild(script)
    } else {
      initializePayPal()
    }
  }, [plan, userId, onSuccess, t])

  return (
    <div className="paypal-button-container">
      <div ref={containerRef} id={containerId}></div>
    </div>
  )
}
