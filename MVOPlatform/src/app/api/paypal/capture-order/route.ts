import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { clientEnv } from '@/env-validation/config/env'

const planPrices = {
  starter: 19,
  builder: 49,
  operator: 89,
}

const planCoins = {
  starter: 100,
  builder: 250,
  operator: 500,
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

    // Get the access token from headers
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const token = authHeader.substring(7)

    // Create supabase client with auth
    const supabaseWithAuth = createClient(
      clientEnv.supabaseUrl,
      clientEnv.supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    )

    // Verify the user is authenticated and matches the userId
    const {
      data: { user },
      error: authError,
    } = await supabaseWithAuth.auth.getUser()
    if (authError || !user || user.id !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!planPrices[plan as keyof typeof planPrices]) {
      return NextResponse.json({ error: 'Invalid product' }, { status: 400 })
    }

    // Validate that the order was completed
    if (orderData.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }

    const amount = planPrices[plan as keyof typeof planPrices]
    const coinsToAdd = planCoins[plan as keyof typeof planCoins] ?? 0

    // Get current coins_balance and add purchased coins
    const { data: userRow } = await supabaseWithAuth
      .from('users')
      .select('coins_balance')
      .eq('id', userId)
      .single()

    const currentCoins = Math.max(0, Number(userRow?.coins_balance) ?? 0)
    const newCoinsBalance = currentCoins + coinsToAdd

    // Update only coins_balance (no plan on user)
    const { error: userError } = await supabaseWithAuth
      .from('users')
      .update({ coins_balance: newCoinsBalance })
      .eq('id', userId)

    if (userError) {
      console.error('Error updating coins:', userError)
      return NextResponse.json(
        { error: 'Failed to update coins' },
        { status: 500 }
      )
    }

    // Record the payment
    const { error: paymentError } = await supabaseWithAuth
      .from('payments')
      .insert({
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
