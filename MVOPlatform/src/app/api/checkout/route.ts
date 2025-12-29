import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { serverEnv } from '../../../../env-validation/config/env'

const stripe = new Stripe(serverEnv.stripeSecretKey, {
  apiVersion: '2023-10-16',
})

export async function POST(request: NextRequest) {
  try {
    const { planId, userId } = await request.json()

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `MVO - ${planId}`,
              description: 'Business idea validation service',
            },
            unit_amount: getPlanPrice(planId),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${request.headers.get('origin')}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${request.headers.get('origin')}/payment/cancel`,
      metadata: {
        userId,
        planId,
      },
    })

    return NextResponse.json({ sessionId: session.id })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

function getPlanPrice(planId: string): number {
  const prices: Record<string, number> = {
    basic: 2900,
    pro: 7900,
    enterprise: 0,
  }
  return prices[planId] || 0
}

