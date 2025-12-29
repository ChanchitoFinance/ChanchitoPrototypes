'use client'

import { motion } from 'framer-motion'

const scorecardData = {
  overallScore: 78,
  categories: [
    { name: 'Market Demand', score: 85, color: 'accent' },
    { name: 'Competition', score: 72, color: 'accent-alt' },
    { name: 'Feasibility', score: 80, color: 'accent' },
    { name: 'Monetization', score: 75, color: 'accent-alt' },
  ],
}

export function ScorecardMockup() {
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
          <h2 className="text-heading-1 mb-4">
            Example Scorecard
          </h2>
          <p className="text-body-large max-w-2xl mx-auto">
            See what kind of insights you&apos;ll receive
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-2xl mx-auto card-base padding-card-large"
        >
          <div className="text-center mb-8">
            <div className="text-5xl font-semibold text-text-primary mb-2">
              {scorecardData.overallScore}
            </div>
            <div className="text-base text-text-secondary">Overall Score</div>
          </div>

          <div className="space-y-6">
            {scorecardData.categories.map((category, index) => (
              <div key={category.name}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-text-primary">
                    {category.name}
                  </span>
                  <span className="text-sm font-medium text-text-primary">
                    {category.score}
                  </span>
                </div>
                <div className="h-2 bg-border-color rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${category.score}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className={`h-full ${
                      category.color === 'accent' ? 'bg-accent' : 'bg-accent-alt'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

