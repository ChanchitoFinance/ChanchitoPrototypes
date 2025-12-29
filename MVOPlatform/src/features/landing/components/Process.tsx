'use client'

import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { motion } from 'framer-motion'

const steps = [
  {
    number: '01',
    titleKey: 'process.steps.submit.title',
    descriptionKey: 'process.steps.submit.description',
  },
  {
    number: '02',
    titleKey: 'process.steps.analysis.title',
    descriptionKey: 'process.steps.analysis.description',
  },
  {
    number: '03',
    titleKey: 'process.steps.results.title',
    descriptionKey: 'process.steps.results.description',
  },
]

export function Process() {
  const t = useTranslations()
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
          <h2 className="text-heading-1 mb-4">{t('process.title')}</h2>
          <p className="text-body-large max-w-2xl mx-auto">
            {t('process.subtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-6xl font-semibold text-accent mb-4">
                {step.number}
              </div>
              <h3 className="text-xl font-medium text-text-primary mb-3">
                {t(step.titleKey)}
              </h3>
              <p className="text-base text-text-secondary leading-relaxed">
                {t(step.descriptionKey)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
