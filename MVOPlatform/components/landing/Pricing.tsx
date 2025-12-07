'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { CheckoutButton } from '@/components/payment/CheckoutButton'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Basic',
    price: '$29',
    description: 'Perfect for testing a single idea',
    features: [
      'Single idea validation',
      'Basic scorecard',
      '48-hour turnaround',
      'Email support',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$79',
    description: 'For serious entrepreneurs',
    features: [
      'Up to 5 ideas',
      'Detailed scorecard',
      '24-hour turnaround',
      'Priority support',
      'Market analysis',
    ],
    cta: 'Get Started',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For teams and agencies',
    features: [
      'Unlimited ideas',
      'Custom scorecards',
      '12-hour turnaround',
      'Dedicated support',
      'API access',
      'Custom integrations',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
]

export function Pricing() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-semibold text-text-primary mb-4">
            Pricing
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            Choose the plan that fits your needs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`bg-white rounded-md border-2 p-8 ${
                plan.popular
                  ? 'border-accent shadow-lg'
                  : 'border-gray-100 shadow-sm'
              }`}
            >
              {plan.popular && (
                <div className="text-xs font-medium text-accent mb-2">
                  MOST POPULAR
                </div>
              )}
              <h3 className="text-2xl font-semibold text-text-primary mb-2">
                {plan.name}
              </h3>
              <div className="text-4xl font-semibold text-text-primary mb-2">
                {plan.price}
              </div>
              <p className="text-sm text-text-secondary mb-6">
                {plan.description}
              </p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-text-secondary">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              {plan.price === 'Custom' ? (
                <Button
                  variant={plan.popular ? 'primary' : 'outline'}
                  className="w-full"
                >
                  {plan.cta}
                </Button>
              ) : (
                <div className="w-full">
                  <CheckoutButton planId={plan.name.toLowerCase()} />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

