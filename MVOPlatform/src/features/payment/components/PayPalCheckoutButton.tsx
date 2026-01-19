'use client'

import { useEffect, useRef, useState } from 'react'
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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const initializePayPal = async () => {
      if (!window.paypal || hasRendered.current || !isMounted) return

      hasRendered.current = true
      setIsLoading(true)
      setError(null)

      try {
        // Check if PayPal buttons already exist in this container
        const container = document.getElementById(containerId)
        if (container && container.innerHTML.trim() !== '') {
          console.log('PayPal buttons already rendered, skipping')
          setIsLoading(false)
          return
        }

        const buttons = window.paypal.Buttons({
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
            if (isMounted) {
              setError('PayPal payment error')
              toast.error(t('payment.paypal_error'))
            }
          },
          onCancel: data => {
            console.log('PayPal payment cancelled:', data)
          },
        })

        // Check if component is still mounted before rendering
        if (isMounted) {
          await buttons.render(`#${containerId}`)
          if (isMounted) {
            setIsLoading(false)
          }
        }
      } catch (error) {
        console.error('Error initializing PayPal:', error)
        if (isMounted) {
          setError('Failed to load PayPal')
          setIsLoading(false)
          toast.error('Failed to load PayPal')
        }
      }
    }

    // Load PayPal SDK if not already loaded
    if (!window.paypal) {
      setIsLoading(true)
      const script = document.createElement('script')
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientEnv.paypalClientId}&currency=${clientEnv.paypalCurrency}&intent=${clientEnv.paypalIntent}&locale=${clientEnv.paypalLocale}`
      script.onload = () => {
        if (isMounted) {
          initializePayPal()
        }
      }
      script.onerror = () => {
        if (isMounted) {
          setError('Failed to load PayPal SDK')
          setIsLoading(false)
        }
      }
      document.head.appendChild(script)
    } else {
      initializePayPal()
    }

    // Cleanup function
    return () => {
      isMounted = false
      // Clear the container when component unmounts
      const container = document.getElementById(containerId)
      if (container) {
        container.innerHTML = ''
      }
    }
  }, [plan, userId, onSuccess, t])

  // Reset render flag when plan changes
  useEffect(() => {
    hasRendered.current = false
  }, [plan])

  return (
    <div className="paypal-button-container">
      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-accent"></div>
          <span className="ml-2 text-sm text-text-secondary">
            Loading PayPal...
          </span>
        </div>
      )}
      {error && (
        <div className="text-center py-4">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 text-sm text-accent hover:underline"
          >
            Retry
          </button>
        </div>
      )}
      <div
        ref={containerRef}
        id={containerId}
        className={isLoading || error ? 'hidden' : ''}
      ></div>
    </div>
  )
}
