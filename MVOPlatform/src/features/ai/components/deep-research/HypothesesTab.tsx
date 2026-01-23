'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  TrendingUp,
  MessageSquare,
  ExternalLink,
  Lightbulb,
} from 'lucide-react'
import { HypothesisData } from '@/core/types/ai'
import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { MarkdownRenderer } from '@/shared/components/ui/MarkdownRenderer'

interface HypothesesTabProps {
  hypotheses: HypothesisData[]
}

export function HypothesesTab({ hypotheses }: HypothesesTabProps) {
  const t = useTranslations()
  const [expandedHypothesis, setExpandedHypothesis] = useState<string | null>(
    hypotheses[0]?.id || null
  )

  const toggleHypothesis = (id: string) => {
    setExpandedHypothesis(expandedHypothesis === id ? null : id)
  }

  const getHypothesisTitle = (id: string): string => {
    const titles: Record<string, string> = {
      HY1: t('deep_research.hypotheses.hy1.title'),
      HY2: t('deep_research.hypotheses.hy2.title'),
      'HY2.1': t('deep_research.hypotheses.hy2_1.title'),
      HY3: t('deep_research.hypotheses.hy3.title'),
      HY4: t('deep_research.hypotheses.hy4.title'),
    }
    return titles[id] || id
  }

  return (
    <div className="space-y-4">
      {/* Intro Text */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t('deep_research.hypotheses.intro')}
          </p>
        </div>
      </div>

      {/* Hypotheses Accordion */}
      <div className="space-y-3">
        {hypotheses.map((hypothesis, index) => (
          <div
            key={hypothesis.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
          >
            {/* Accordion Header */}
            <button
              type="button"
              onClick={() => toggleHypothesis(hypothesis.id)}
              className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold">
                  {index + 1}
                </span>
                <div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {hypothesis.id}
                  </span>
                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                    {getHypothesisTitle(hypothesis.id)}
                  </h4>
                </div>
              </div>
              <motion.div
                animate={{ rotate: expandedHypothesis === hypothesis.id ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </motion.div>
            </button>

            {/* Accordion Content */}
            <AnimatePresence>
              {expandedHypothesis === hypothesis.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 space-y-4">
                    {/* Quantitative Segment */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <h5 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {t('deep_research.hypotheses.quantitative')}
                        </h5>
                      </div>
                      <div className="pl-6">
                        {hypothesis.quantitativeSegment ? (
                          <MarkdownRenderer
                            content={hypothesis.quantitativeSegment}
                            className="text-sm text-gray-700 dark:text-gray-300"
                          />
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                            {t('deep_research.hypotheses.no_data')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Qualitative Segment */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-purple-500" />
                        <h5 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {t('deep_research.hypotheses.qualitative')}
                        </h5>
                      </div>
                      <div className="pl-6">
                        {hypothesis.qualitativeSegment ? (
                          <MarkdownRenderer
                            content={hypothesis.qualitativeSegment}
                            className="text-sm text-gray-700 dark:text-gray-300"
                          />
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                            {t('deep_research.hypotheses.no_data')}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Sources */}
                    {(hypothesis.sources.serp.length > 0 ||
                      hypothesis.sources.twitter.length > 0 ||
                      hypothesis.sources.reddit.length > 0) && (
                      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                        <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                          {t('deep_research.hypotheses.sources')}
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {hypothesis.sources.serp.slice(0, 3).map((url, i) => (
                            <a
                              key={`serp-${i}`}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              {t('deep_research.hypotheses.source_web')}
                            </a>
                          ))}
                          {hypothesis.sources.twitter.slice(0, 2).map((url, i) => (
                            <a
                              key={`twitter-${i}`}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              X/Twitter
                            </a>
                          ))}
                          {hypothesis.sources.reddit.slice(0, 2).map((url, i) => (
                            <a
                              key={`reddit-${i}`}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Reddit
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {hypotheses.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>{t('deep_research.hypotheses.no_hypotheses')}</p>
        </div>
      )}
    </div>
  )
}
