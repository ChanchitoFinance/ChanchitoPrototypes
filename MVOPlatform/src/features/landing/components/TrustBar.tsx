'use client'

import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { motion } from 'framer-motion'
import { Activity, Clock, TrendingUp, Users } from 'lucide-react'

const stats = [
  {
    icon: Users,
    value: '1,000+',
    label: 'Founders',
  },
  {
    icon: Activity,
    value: '15k+',
    label: 'Validations',
  },
  {
    icon: Clock,
    value: '48h',
    label: 'Turnaround',
  },
  {
    icon: TrendingUp,
    value: '$10M+',
    label: 'Value Identified',
  },
]

export function TrustBar() {
  const t = useTranslations()

  return (
    <section className="border-y border-border/50 bg-background/50 backdrop-blur-sm py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex flex-col items-center text-center space-y-2"
            >
              <div className="flex items-center gap-2 text-text-secondary mb-1">
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-text-primary">
                {stat.value}
              </div>
              <div className="text-sm text-text-secondary font-medium uppercase tracking-wider">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
