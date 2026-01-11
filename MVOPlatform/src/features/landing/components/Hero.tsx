'use client'

import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { Button } from '@/shared/components/ui/Button'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { AppShowcase } from './AppShowcase'
import { CheckCircle } from 'lucide-react'

export function Hero() {
  const t = useTranslations()
  const pathname = usePathname()
  const currentLocale = pathname.startsWith('/es') ? 'es' : 'en'

  return (
    <section className="max-w-7xl mx-auto px-6 py-12 md:py-24 lg:py-32 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        {/* Left Column: Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center lg:text-left"
        >
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            {t('hero.trusted_by') || 'Trusted by 1,000+ founders'}
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-text-primary mb-6 leading-tight">
            {t('hero.title')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-purple-600">
              {t('hero.title_highlight')}
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-text-secondary mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
            {t('hero.description')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
            <Link href={`/${currentLocale}/upload`}>
              <Button size="lg" variant="primary" className="w-full sm:w-auto px-8 py-6 text-lg">
                {t('actions.submit_idea')}
              </Button>
            </Link>
            <Link href={`/${currentLocale}/home`}>
              <Button size="lg" variant="outline" className="w-full sm:w-auto px-8 py-6 text-lg">
                {t('actions.browse_ideas')}
              </Button>
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 sm:gap-8 text-sm text-text-secondary">
             <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>No credit card required</span>
             </div>
             <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>48-hour delivery</span>
             </div>
          </div>
        </motion.div>

        {/* Right Column: Visuals */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative lg:h-auto"
        >
           <AppShowcase />
        </motion.div>
      </div>
    </section>
  )
}
