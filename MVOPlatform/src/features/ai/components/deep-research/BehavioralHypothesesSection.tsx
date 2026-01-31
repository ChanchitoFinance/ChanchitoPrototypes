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

  const getLayerColor = (layer: HypothesisLayer) => {
    const colors: Record<HypothesisLayer, { bg: string; color: string }> = {
      existence: { bg: 'rgba(255, 148, 76, 0.15)', color: 'var(--error)' },
      awareness: { bg: 'rgba(160, 123, 207, 0.15)', color: 'var(--primary-accent)' },
      consideration: { bg: 'rgba(160, 123, 207, 0.15)', color: 'var(--primary-accent)' },
      intent: { bg: 'rgba(160, 123, 207, 0.15)', color: 'var(--primary-accent)' },
      pay_intention: { bg: 'rgba(153, 43, 255, 0.15)', color: 'var(--premium-cta)' },
    }
    return colors[layer]
  }

  const getConfidenceConfig = (confidence: ConfidenceLevel) => {
    const configs: Record<ConfidenceLevel, { bg: string; color: string; borderColor: string; icon: React.ReactNode; label: string }> = {
      low: {
        bg: 'rgba(255, 148, 76, 0.15)',
        color: 'var(--error)',
        borderColor: 'var(--error)',
        icon: <HelpCircle className="w-3 h-3" />,
        label: t('market_validation.confidence.low'),
      },
      medium: {
        bg: 'rgba(176, 167, 184, 0.15)',
        color: 'var(--hover-accent)',
        borderColor: 'var(--hover-accent)',
        icon: <AlertTriangle className="w-3 h-3" />,
        label: t('market_validation.confidence.medium'),
      },
      high: {
        bg: 'rgba(160, 123, 207, 0.15)',
        color: 'var(--primary-accent)',
        borderColor: 'var(--primary-accent)',
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
      <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(160, 123, 207, 0.1)', border: '1px solid var(--primary-accent)' }}>
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--primary-accent)' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
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
              className="rounded-lg overflow-hidden"
              style={{ border: '1px solid var(--border-color)' }}
            >
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => toggleHypothesis(hypothesis.layer)}
                className="w-full flex items-center justify-between p-4 transition-all text-left"
                style={{ backgroundColor: 'var(--gray-100)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--gray-200)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--gray-100)'
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: layerColor.bg, color: layerColor.color }}>
                    {getLayerIcon(hypothesis.layer)}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-medium uppercase" style={{ color: 'var(--text-secondary)' }}>
                        {t('market_validation.hypotheses.layer')} {index + 1}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full" style={{ backgroundColor: confidenceConfig.bg, color: confidenceConfig.color, border: `1px solid ${confidenceConfig.borderColor}` }}>
                        {confidenceConfig.icon}
                        {confidenceConfig.label}
                      </span>
                    </div>
                    <h4 className="font-medium text-sm mt-0.5" style={{ color: 'var(--text-primary)' }}>
                      {getLayerTitle(hypothesis.layer)}
                    </h4>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: expandedHypothesis === hypothesis.layer ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
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
                    <div className="p-4 space-y-4" style={{ backgroundColor: 'var(--gray-50)', borderTop: '1px solid var(--border-color)' }}>
                      {/* Layer Description */}
                      <div className="text-xs italic" style={{ color: 'var(--text-secondary)' }}>
                        {getLayerDescription(hypothesis.layer)}
                      </div>

                      {/* Hypothesis Description */}
                      <div className="space-y-2">
                        <h5 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {t('market_validation.hypotheses.hypothesis')}
                        </h5>
                        <div className="pl-3" style={{ borderLeft: '2px solid var(--primary-accent)' }}>
                          <MarkdownRenderer
                            content={hypothesis.description}
                            className="text-sm"
                          />
                        </div>
                      </div>

                      {/* Evidence Summary */}
                      <div className="space-y-2">
                        <h5 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                          {t('market_validation.hypotheses.evidence_summary')}
                        </h5>
                        <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--gray-100)', border: '1px solid var(--border-color)' }}>
                          <MarkdownRenderer
                            content={hypothesis.evidenceSummary}
                            className="text-sm"
                          />
                        </div>
                      </div>

                      {/* Contradicting Signals */}
                      {hypothesis.contradictingSignals && hypothesis.contradictingSignals.length > 0 && (
                        <div className="space-y-2">
                          <h5 className="text-sm font-semibold flex items-center gap-1" style={{ color: 'var(--error)' }}>
                            <AlertTriangle className="w-4 h-4" />
                            {t('market_validation.hypotheses.contradicting_signals')}
                          </h5>
                          <ul className="list-disc list-inside space-y-1 pl-2">
                            {hypothesis.contradictingSignals.map((signal, i) => (
                              <li key={i} className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                {signal}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Sources */}
                      {hypothesis.supportingSources && hypothesis.supportingSources.length > 0 && (
                        <div className="pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                          <h5 className="text-xs font-semibold uppercase mb-2" style={{ color: 'var(--text-secondary)' }}>
                            {t('market_validation.hypotheses.sources')}
                          </h5>
                          <div className="space-y-2">
                            {hypothesis.supportingSources.slice(0, 5).map((source, i) => (
                              <div
                                key={i}
                                className="p-2 rounded"
                                style={{ backgroundColor: 'var(--gray-100)', border: '1px solid var(--border-color)' }}
                              >
                                <a
                                  href={source.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs hover:underline font-medium"
                                  style={{ color: 'var(--primary-accent)' }}
                                >
                                  <ExternalLink className="w-3 h-3" />
                                  {source.title}
                                </a>
                                {source.snippet && (
                                  <div className="mt-1 text-xs flex items-start gap-1" style={{ color: 'var(--text-secondary)' }}>
                                    <Quote className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                    <MarkdownRenderer content={source.snippet} className="text-xs !mb-0" />
                                  </div>
                                )}
                                <span
                                  className="inline-block mt-1 px-1.5 py-0.5 text-[10px] rounded"
                                  style={{
                                    backgroundColor: source.evidenceType === 'behavioral'
                                      ? 'rgba(160, 123, 207, 0.15)'
                                      : source.evidenceType === 'stated'
                                        ? 'rgba(153, 43, 255, 0.15)'
                                        : 'rgba(176, 167, 184, 0.15)',
                                    color: source.evidenceType === 'behavioral'
                                      ? 'var(--primary-accent)'
                                      : source.evidenceType === 'stated'
                                        ? 'var(--premium-cta)'
                                        : 'var(--hover-accent)',
                                  }}
                                >
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
        <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
          <p>{t('market_validation.hypotheses.no_hypotheses')}</p>
        </div>
      )}
    </div>
  )
}
