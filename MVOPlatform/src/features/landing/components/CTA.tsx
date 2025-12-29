'use client'

import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { Button } from '@/shared/components/ui/Button'
import { motion } from 'framer-motion'
import Link from 'next/link'

export function CTA() {
  const t = useTranslations()
  return (
    <section className="bg-background py-24">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-heading-1 mb-4">{t('cta.title')}</h2>
          <p className="text-body-large mb-8 max-w-2xl mx-auto">
            {t('cta.description')}
          </p>
          <Link href="/upload">
            <Button size="lg" variant="primary">
              {t('actions.submit_your_idea_now')}
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
