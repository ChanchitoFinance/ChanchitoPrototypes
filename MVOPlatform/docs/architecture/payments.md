# Payment Integration

## Implementation

Payments are handled via Stripe Checkout.

## Setup

### Environment Variables

Add to `.env.local`:

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### Stripe Setup

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get API keys from Dashboard
3. Add keys to environment variables

## Usage

### Checkout Button

```tsx
import { CheckoutButton } from '@/components/payment/CheckoutButton'

<CheckoutButton planId="basic" userId={user.id} />
```

### API Route

The checkout API route (`app/api/checkout/route.ts`) creates a Stripe Checkout session:

```typescript
POST /api/checkout
Body: { planId: string, userId: string }
Response: { sessionId: string }
```

### Plan Prices

Plans are defined in the checkout route:
- `basic`: $29 (2900 cents)
- `pro`: $79 (7900 cents)
- `enterprise`: Custom pricing

## Flow

1. User clicks checkout button
2. Frontend calls `/api/checkout`
3. Backend creates Stripe Checkout session
4. User is redirected to Stripe Checkout
5. After payment:
   - Success: Redirected to `/payment/success`
   - Cancel: Redirected to `/payment/cancel`

## Webhooks (Future)

For production, set up Stripe webhooks to:
- Verify payment completion
- Update user subscription status
- Handle failed payments

Webhook endpoint: `/api/webhooks/stripe`

## Testing

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

See [Stripe Testing](https://stripe.com/docs/testing) for more test cards.

