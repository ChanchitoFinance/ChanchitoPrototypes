'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { useTranslations } from '@/components/providers/I18nProvider'

export function Hero() {
  const t = useTranslations()

  return (
    <section className="max-w-7xl mx-auto px-6 py-24 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-4xl mx-auto"
      >
        <h1 className="text-5xl md:text-6xl font-semibold text-text-primary mb-6 leading-tight">
          {t('hero.title')}{' '}
          <span className="text-accent">{t('hero.title_highlight')}</span>
        </h1>
        <p className="text-xl text-text-secondary mb-12 leading-relaxed">
          {t('hero.description')}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/upload">
            <Button size="lg" variant="primary">
              {t('actions.submit_idea')}
            </Button>
          </Link>
          <Link href="/ideas">
            <Button size="lg" variant="outline">
              {t('actions.browse_ideas')}
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  )
}
