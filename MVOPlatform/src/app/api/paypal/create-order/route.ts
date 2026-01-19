import { NextRequest, NextResponse } from 'next/server'

const planPrices = {
  pro: 5,
  premium: 20,
  innovator: 100,
}

export async function POST(request: NextRequest) {
  try {
    const { plan, userId, amount } = await request.json()

    if (!plan || !userId || !amount) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!planPrices[plan as keyof typeof planPrices]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // For client-side PayPal integration, we just validate and return success
    // The actual order creation happens in the browser using PayPal SDK
    return NextResponse.json({
      success: true,
      plan,
      amount,
      userId,
    })
  } catch (error) {
    console.error('Error validating PayPal order:', error)
    return NextResponse.json(
      { error: 'Failed to validate order' },
      { status: 500 }
    )
  }
}
