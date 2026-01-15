import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/core/lib/supabase'

const planPrices = {
  pro: 5,
  premium: 20,
  innovator: 100,
}

export async function POST(request: NextRequest) {
  try {
    const { orderId, plan, userId, orderData } = await request.json()

    if (!orderId || !plan || !userId || !orderData) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!planPrices[plan as keyof typeof planPrices]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Validate that the order was completed
    if (orderData.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }

    const amount = planPrices[plan as keyof typeof planPrices]

    // Update user plan and reset credits
    const { error: userError } = await supabase
      .from('users')
      .update({
        plan,
        daily_credits_used: 0,
        last_credits_reset: new Date().toISOString().split('T')[0],
      })
      .eq('id', userId)

    if (userError) {
      console.error('Error updating user plan:', userError)
      return NextResponse.json(
        { error: 'Failed to update user plan' },
        { status: 500 }
      )
    }

    // Record the payment
    const { error: paymentError } = await supabase.from('payments').insert({
      user_id: userId,
      plan_type: plan,
      amount,
      currency: 'USD',
      payment_method: 'paypal',
      transaction_id: orderId,
      status: 'completed',
    })

    if (paymentError) {
      console.error('Error recording payment:', paymentError)
      // Don't fail the request if payment recording fails, but log it
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error processing PayPal payment:', error)
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    )
  }
}
