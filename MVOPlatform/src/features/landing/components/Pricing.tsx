'use client'

import Link from 'next/link'
import { Button } from '@/shared/components/ui/Button'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: 'Get started with basic AI features',
    features: ['3 daily credits', 'Basic AI features', 'Community support'],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    price: '$5',
    description: 'Advanced features for growing businesses',
    features: ['50 daily credits', 'Advanced AI features', 'Priority support'],
    cta: 'Subscribe',
    popular: true,
  },
  {
    name: 'Premium',
    price: '$20',
    description: 'Maximum productivity with premium features',
    features: ['250 daily credits', 'All Pro features', 'Advanced analytics'],
    cta: 'Subscribe',
    popular: false,
  },
  {
    name: 'Innovator',
    price: '$100',
    description: 'Unlimited access for innovation teams',
    features: [
      'Unlimited credits',
      'All Premium features',
      'Team collaboration',
    ],
    cta: 'Subscribe',
    popular: false,
  },
]

export function Pricing() {
  return (
    <section className="bg-background py-24">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-heading-1 mb-4">Pricing</h2>
          <p className="text-body-large max-w-2xl mx-auto">
            Choose the plan that fits your needs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`card-white padding-card-large flex flex-col h-full ${
                plan.popular ? 'border-accent shadow-lg' : ''
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold text-text-primary">
                  {plan.name}
                </h3>
                {plan.popular && (
                  <div className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
              </div>
              <div className="text-4xl font-semibold text-text-primary mb-2">
                {plan.price}
                {plan.price !== '$0' && (
                  <span className="text-lg text-text-secondary">/mo</span>
                )}
              </div>
              <p className="text-sm text-text-secondary mb-6">
                {plan.description}
              </p>
              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-text-secondary">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto">
                <Link href="/en/premium" className="block">
                  <Button
                    variant={plan.popular ? 'primary' : 'outline'}
                    className="w-full"
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
