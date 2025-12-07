'use client'

import { motion } from 'framer-motion'
import { Download, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ReportDashboardProps {
  ideaId: string
}

const mockReport = {
  idea: {
    title: 'AI-Powered Meal Planning App',
    description:
      'An app that uses AI to create personalized meal plans based on dietary restrictions, budget, and preferences.',
    author: 'Sarah Chen',
    submittedAt: '2024-01-15',
  },
  overallScore: 78,
  categories: [
    {
      name: 'Market Demand',
      score: 85,
      description:
        'Strong market demand indicated by search trends and competitor analysis.',
    },
    {
      name: 'Competition',
      score: 72,
      description:
        'Moderate competition with opportunities for differentiation.',
    },
    {
      name: 'Feasibility',
      score: 80,
      description:
        'Technically feasible with existing technology stack.',
    },
    {
      name: 'Monetization',
      score: 75,
      description:
        'Clear revenue model with multiple monetization streams.',
    },
  ],
  recommendations: [
    'Focus on niche dietary restrictions to differentiate from competitors',
    'Consider freemium model to increase user acquisition',
    'Partner with nutritionists to add credibility',
  ],
}

export function ReportDashboard({ ideaId }: ReportDashboardProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-semibold text-text-primary mb-2">
            {mockReport.idea.title}
          </h1>
          <p className="text-base text-text-secondary">
            Validation Report • Submitted {new Date(mockReport.idea.submittedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="md">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="primary" size="md">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="bg-white border-2 border-gray-100 rounded-md p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="text-6xl font-semibold text-accent mb-2">
            {mockReport.overallScore}
          </div>
          <div className="text-xl font-medium text-text-primary mb-1">
            Overall Validation Score
          </div>
          <div className="text-base text-text-secondary">
            Based on comprehensive market analysis
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {mockReport.categories.map((category, index) => (
            <motion.div
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="border-2 border-gray-100 rounded-md p-6"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-text-primary">
                  {category.name}
                </h3>
                <div className="text-2xl font-semibold text-accent">
                  {category.score}
                </div>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${category.score}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className="h-full bg-accent"
                />
              </div>
              <p className="text-sm text-text-secondary leading-relaxed">
                {category.description}
              </p>
            </motion.div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-8">
          <h3 className="text-xl font-medium text-text-primary mb-4">
            Recommendations
          </h3>
          <ul className="space-y-3">
            {mockReport.recommendations.map((rec, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-accent mt-2 flex-shrink-0" />
                <p className="text-base text-text-secondary leading-relaxed">
                  {rec}
                </p>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

