'use client'

import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts'
import { Target, TrendingUp, Users } from 'lucide-react'
import { useTranslations } from '@/shared/components/providers/I18nProvider'

const data = [
  { name: 'Use', value: 65, color: '#22c55e' }, // green-500
  { name: 'Pay', value: 25, color: '#3b82f6' }, // blue-500
  { name: 'Pass', value: 10, color: '#ef4444' }, // red-500
]

export function AnalyticsPreview() {
  const t = useTranslations()

  return (
    <section className="bg-background py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t('analytics_preview.title') || 'Data That Drives Decisions'}
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            {t('analytics_preview.subtitle') || "Don't guess. Know exactly how the market reacts to your idea with detailed analytics."}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Chart Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-card border border-border rounded-xl p-6 shadow-lg"
          >
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Vote Distribution</h3>
              <p className="text-sm text-text-secondary">Real-time feedback from the community</p>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: '#6b7280', fontSize: 14 }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Metrics Section */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-start gap-4 p-4 rounded-lg bg-accent/5 border border-accent/10"
            >
              <div className="p-3 bg-accent/10 rounded-full text-accent">
                <Target className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-text-primary mb-1">Feasibility Score</h4>
                <p className="text-text-secondary text-sm">
                   A calculated score based on "Use" vs "Pass" ratios, helping you understand if your idea is practical to build.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex items-start gap-4 p-4 rounded-lg bg-blue-500/5 border border-blue-500/10"
            >
              <div className="p-3 bg-blue-500/10 rounded-full text-blue-500">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-text-primary mb-1">Impact Score</h4>
                <p className="text-text-secondary text-sm">
                  Determined by "I'd Pay" votes and engagement depth, measuring the potential market value of your concept.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex items-start gap-4 p-4 rounded-lg bg-purple-500/5 border border-purple-500/10"
            >
              <div className="p-3 bg-purple-500/10 rounded-full text-purple-500">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-text-primary mb-1">AI Personas Feedback</h4>
                <p className="text-text-secondary text-sm">
                  Get simulated feedback from different user personas (e.g., "The Skeptic", "The Early Adopter") to identify blind spots.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
