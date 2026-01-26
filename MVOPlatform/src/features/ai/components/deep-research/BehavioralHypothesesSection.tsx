'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  Lightbulb,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Eye,
  Search,
  Target,
  CreditCard,
  Quote,
} from 'lucide-react'
import { BehavioralHypothesis, ConfidenceLevel, HypothesisLayer } from '@/core/types/ai'
import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { MarkdownRenderer } from '@/shared/components/ui/MarkdownRenderer'

interface BehavioralHypothesesSectionProps {
  hypotheses: BehavioralHypothesis[]
}

export function BehavioralHypothesesSection({
  hypotheses,
}: BehavioralHypothesesSectionProps) {
  const t = useTranslations()
  const [expandedHypothesis, setExpandedHypothesis] = useState<HypothesisLayer | null>(
    hypotheses[0]?.layer || null
  )

  const toggleHypothesis = (layer: HypothesisLayer) => {
    setExpandedHypothesis(expandedHypothesis === layer ? null : layer)
  }

  const getLayerIcon = (layer: HypothesisLayer) => {
    const icons: Record<HypothesisLayer, React.ReactNode> = {
      existence: <AlertTriangle className="w-4 h-4" />,
      awareness: <Eye className="w-4 h-4" />,
      consideration: <Search className="w-4 h-4" />,
      intent: <Target className="w-4 h-4" />,
      pay_intention: <CreditCard className="w-4 h-4" />,
    }
    return icons[layer]
  }

  const getLayerColor = (layer: HypothesisLayer): string => {
    const colors: Record<HypothesisLayer, string> = {
      existence: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400',
      awareness: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400',
      consideration: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400',
      intent: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
      pay_intention: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
    }
    return colors[layer]
  }

  const getConfidenceConfig = (confidence: ConfidenceLevel) => {
    const configs: Record<ConfidenceLevel, { color: string; icon: React.ReactNode; label: string }> = {
      low: {
        color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
        icon: <HelpCircle className="w-3 h-3" />,
        label: t('market_validation.confidence.low'),
      },
      medium: {
        color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
        icon: <AlertTriangle className="w-3 h-3" />,
        label: t('market_validation.confidence.medium'),
      },
      high: {
        color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
        icon: <CheckCircle2 className="w-3 h-3" />,
        label: t('market_validation.confidence.high'),
      },
    }
    return configs[confidence]
  }

  const getLayerTitle = (layer: HypothesisLayer): string => {
    const titles: Record<HypothesisLayer, string> = {
      existence: t('market_validation.hypotheses.existence.title'),
      awareness: t('market_validation.hypotheses.awareness.title'),
      consideration: t('market_validation.hypotheses.consideration.title'),
      intent: t('market_validation.hypotheses.intent.title'),
      pay_intention: t('market_validation.hypotheses.pay_intention.title'),
    }
    return titles[layer]
  }

  const getLayerDescription = (layer: HypothesisLayer): string => {
    const descriptions: Record<HypothesisLayer, string> = {
      existence: t('market_validation.hypotheses.existence.description'),
      awareness: t('market_validation.hypotheses.awareness.description'),
      consideration: t('market_validation.hypotheses.consideration.description'),
      intent: t('market_validation.hypotheses.intent.description'),
      pay_intention: t('market_validation.hypotheses.pay_intention.description'),
    }
    return descriptions[layer]
  }

  // Sort hypotheses by layer order
  const layerOrder: HypothesisLayer[] = ['existence', 'awareness', 'consideration', 'intent', 'pay_intention']
  const sortedHypotheses = [...hypotheses].sort(
    (a, b) => layerOrder.indexOf(a.layer) - layerOrder.indexOf(b.layer)
  )

  return (
    <div className="space-y-4">
      {/* Intro Text */}
      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t('market_validation.hypotheses.intro')}
          </p>
        </div>
      </div>

      {/* Hypotheses Accordion */}
      <div className="space-y-3">
        {sortedHypotheses.map((hypothesis, index) => {
          const confidenceConfig = getConfidenceConfig(hypothesis.confidence)
          const layerColor = getLayerColor(hypothesis.layer)

          return (
            <div
              key={hypothesis.layer}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => toggleHypothesis(hypothesis.layer)}
                className="w-full flex items-center justify-between p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <span className={`flex items-center justify-center w-8 h-8 rounded-full ${layerColor}`}>
                    {getLayerIcon(hypothesis.layer)}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase">
                        {t('market_validation.hypotheses.layer')} {index + 1}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border ${confidenceConfig.color}`}>
                        {confidenceConfig.icon}
                        {confidenceConfig.label}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white text-sm mt-0.5">
                      {getLayerTitle(hypothesis.layer)}
                    </h4>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: expandedHypothesis === hypothesis.layer ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                </motion.div>
              </button>

              {/* Accordion Content */}
              <AnimatePresence>
                {expandedHypothesis === hypothesis.layer && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 space-y-4">
                      {/* Layer Description */}
                      <div className="text-xs text-gray-500 dark:text-gray-400 italic">
                        {getLayerDescription(hypothesis.layer)}
                      </div>

                      {/* Hypothesis Description */}
                      <div className="space-y-2">
                        <h5 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {t('market_validation.hypotheses.hypothesis')}
                        </h5>
                        <div className="pl-3 border-l-2 border-purple-300 dark:border-purple-700">
                          <MarkdownRenderer
                            content={hypothesis.description}
                            className="text-sm text-gray-700 dark:text-gray-300"
                          />
                        </div>
                      </div>

                      {/* Evidence Summary */}
                      <div className="space-y-2">
                        <h5 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {t('market_validation.hypotheses.evidence_summary')}
                        </h5>
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                          <MarkdownRenderer
                            content={hypothesis.evidenceSummary}
                            className="text-sm text-gray-700 dark:text-gray-300"
                          />
                        </div>
                      </div>

                      {/* Contradicting Signals */}
                      {hypothesis.contradictingSignals && hypothesis.contradictingSignals.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-sm font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4" />
                            {t('market_validation.hypotheses.contradicting_signals')}
                          </h5>
                          <ul className="list-disc list-inside space-y-1 pl-2">
                            {hypothesis.contradictingSignals.map((signal, i) => (
                              <li key={i} className="text-sm text-gray-600 dark:text-gray-400">
                                {signal}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Sources */}
                      {hypothesis.supportingSources && hypothesis.supportingSources.length > 0 && (
                        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                          <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-2">
                            {t('market_validation.hypotheses.sources')}
                          </h5>
                          <div className="space-y-2">
                            {hypothesis.supportingSources.slice(0, 5).map((source, i) => (
                              <div
                                key={i}
                                className="p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700"
                              >
                                <a
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  {source.title}
                                </a>
                                {source.snippet && (
                                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-start gap-1">
                                    <Quote className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    {source.snippet}
                                  </p>
                                )}
                                <span className={`inline-block mt-1 px-1.5 py-0.5 text-[10px] rounded ${
                                  source.evidenceType === 'behavioral'
                                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                    : source.evidenceType === 'stated'
                                      ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
                                      : 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                                }`}>
                                  {t(`market_validation.evidence_type.${source.evidenceType}`)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {hypotheses.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>{t('market_validation.hypotheses.no_hypotheses')}</p>
        </div>
      )}
    </div>
  )
}
