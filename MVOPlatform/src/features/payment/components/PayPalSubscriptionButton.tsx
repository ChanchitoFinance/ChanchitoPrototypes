'use client'

import { useEffect, useRef, useState } from 'react'
import { clientEnv } from '@/env-validation/config/env'
import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { toast } from 'sonner'
import { supabase } from '@/core/lib/supabase'

declare global {
  interface Window {
    paypal?: any
  }
}

const SUBSCRIPTION_PLAN_IDS: Record<'starter' | 'builder' | 'operator', string> = {
  starter: 'P-6MR938737P245712BNGLFJQQ',
  builder: 'P-5WP65855RR580562SNGLFK5Y',
  operator: 'P-0XJ13672DG2780817NGLFLFY',
}

interface PayPalSubscriptionButtonProps {
  plan: 'starter' | 'builder' | 'operator'
  userId: string
  onSuccess?: () => void
}

export function PayPalSubscriptionButton({
  plan,
  userId,
  onSuccess,
}: PayPalSubscriptionButtonProps) {
  const t = useTranslations()
  const containerRef = useRef<HTMLDivElement>(null)
  const containerId = useRef(`paypal-subscription-${plan}-${Date.now()}`).current
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
        const container = document.getElementById(containerId)
        if (container && container.innerHTML.trim() !== '') {
          setIsLoading(false)
          return
        }

        const planId = SUBSCRIPTION_PLAN_IDS[plan]

        const buttons = window.paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'paypal',
          },
          createSubscription: (data: unknown, actions: { subscription: { create: (opts: { plan_id: string }) => Promise<{ id: string }> } }) => {
            return actions.subscription.create({
              plan_id: planId,
            })
          },
          onApprove: async (data: { subscriptionID?: string }) => {
            try {
              const {
                data: { session },
              } = await supabase.auth.getSession()
              if (!session) {
                throw new Error('No authentication session')
              }

              const response = await fetch('/api/paypal/capture-order', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                  subscriptionID: data.subscriptionID,
                  plan,
                  userId,
                }),
              })

              if (!response.ok) {
                throw new Error('Failed to update database')
              }

              toast.success(t('payment.success'))
              onSuccess?.()
            } catch (err) {
              console.error('Error after subscription approval:', err)
              toast.error(t('payment.error_capturing'))
            }
          },
          onError: (err: unknown) => {
            console.error('PayPal subscription error:', err)
            if (isMounted) {
              setError('PayPal payment error')
              toast.error(t('payment.paypal_error'))
            }
          },
          onCancel: () => {
            // User cancelled
          },
        })

        if (isMounted) {
          await buttons.render(`#${containerId}`)
          if (isMounted) {
            setIsLoading(false)
          }
        }
      } catch (err) {
        console.error('Error initializing PayPal subscription:', err)
        if (isMounted) {
          setError('Failed to load PayPal')
          setIsLoading(false)
          toast.error('Failed to load PayPal')
        }
      }
    }

    const scriptUrl = `https://www.paypal.com/sdk/js?client-id=${clientEnv.paypalClientId}&vault=true&intent=subscription&currency=${clientEnv.paypalCurrency || 'USD'}&locale=${clientEnv.paypalLocale || 'en_US'}`

    if (!window.paypal) {
      setIsLoading(true)
      const script = document.createElement('script')
      script.src = scriptUrl
      script.setAttribute('data-sdk-integration-source', 'button-factory')
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

    return () => {
      isMounted = false
      const container = document.getElementById(containerId)
      if (container) {
        container.innerHTML = ''
      }
    }
  }, [plan, userId, onSuccess, t, containerId])

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
          <p className="text-sm text-error">{error}</p>
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
      />
    </div>
  )
}
