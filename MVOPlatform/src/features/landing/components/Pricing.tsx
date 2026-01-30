'use client'

import Link from 'next/link'
import { Button } from '@/shared/components/ui/Button'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useLocale } from '@/shared/components/providers/I18nProvider'

const plans = [
  {
    name: 'Free',
    price: '$0',
    description: '100 free coins on signup. Run analysis. Decide before you build.',
    features: [
      '100 coins on signup',
      'Run analysis',
      'Spend coins to go deeper',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Starter',
    price: '$19',
    description: 'First serious test. One additional full idea or deeper iteration.',
    features: ['100 coins', 'Run analysis', 'Spend coins to go deeper'],
    cta: 'Get Starter',
    popular: true,
  },
  {
    name: 'Builder',
    price: '$49',
    description: 'Active exploration. 2–4 ideas or deep iteration on 1–2.',
    features: ['250 coins', 'Run analysis', 'Spend coins to go deeper'],
    cta: 'Get Builder',
    popular: false,
  },
  {
    name: 'Operator',
    price: '$89',
    description: 'Portfolio thinking, comparisons, advisory work.',
    features: ['500 coins', 'Run analysis', 'Spend coins to go deeper'],
    cta: 'Get Operator',
    popular: false,
  },
]

export function Pricing() {
  const { locale } = useLocale()
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
            Run analysis. Spend coins to go deeper. Decide before you build.
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
                plan.popular ? 'border-premium-cta shadow-lg' : ''
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold text-text-primary">
                  {plan.name}
                </h3>
                {plan.popular && (
                  <div className="text-xs font-medium text-premium-cta bg-premium-cta/10 px-2 py-1 rounded-full">
                    MOST POPULAR
                  </div>
                )}
              </div>
              <div className="text-4xl font-semibold text-text-primary mb-2">
                {plan.price}
              </div>
              <p className="text-sm text-text-secondary mb-6">
                {plan.description}
              </p>
              <ul className="space-y-3 mb-8 flex-grow">
                {plan.features.map(feature => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="w-5 h-5 text-primary-accent flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-text-secondary">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-auto">
                <Link href={`/${locale}/premium`} className="block">
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
