'use client'

import { MarketSignal, MarketSignalType, ConfidenceLevel } from '@/core/types/ai'
import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { MarkdownRenderer } from '@/shared/components/ui/MarkdownRenderer'
import {
  TrendingUp,
  AlertCircle,
  DollarSign,
  Users,
  Lock,
  Radio,
  Globe,
  Clock,
  Calculator,
  ExternalLink,
  BarChart3,
  CheckCircle2,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react'

interface MarketSignalsSectionProps {
  signals: MarketSignal[]
}

export function MarketSignalsSection({ signals }: MarketSignalsSectionProps) {
  const t = useTranslations()

  const getSignalIcon = (type: MarketSignalType) => {
    const icons: Record<MarketSignalType, React.ReactNode> = {
      demand_intensity: <TrendingUp className="w-5 h-5" />,
      problem_salience: <AlertCircle className="w-5 h-5" />,
      existing_spend: <DollarSign className="w-5 h-5" />,
      competitive_landscape: <Users className="w-5 h-5" />,
      switching_friction: <Lock className="w-5 h-5" />,
      distribution: <Radio className="w-5 h-5" />,
      geographic_fit: <Globe className="w-5 h-5" />,
      timing: <Clock className="w-5 h-5" />,
      economic_plausibility: <Calculator className="w-5 h-5" />,
    }
    return icons[type]
  }

  const getSignalColor = (type: MarketSignalType): string => {
    const colors: Record<MarketSignalType, string> = {
      demand_intensity: 'from-blue-500 to-blue-600',
      problem_salience: 'from-red-500 to-red-600',
      existing_spend: 'from-green-500 to-green-600',
      competitive_landscape: 'from-purple-500 to-purple-600',
      switching_friction: 'from-orange-500 to-orange-600',
      distribution: 'from-pink-500 to-pink-600',
      geographic_fit: 'from-teal-500 to-teal-600',
      timing: 'from-indigo-500 to-indigo-600',
      economic_plausibility: 'from-amber-500 to-amber-600',
    }
    return colors[type]
  }

  const getStrengthBadge = (strength: ConfidenceLevel) => {
    const configs: Record<ConfidenceLevel, { color: string; icon: React.ReactNode; label: string }> = {
      low: {
        color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800',
        icon: <HelpCircle className="w-3 h-3" />,
        label: t('market_validation.strength.low'),
      },
      medium: {
        color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
        icon: <AlertTriangle className="w-3 h-3" />,
        label: t('market_validation.strength.medium'),
      },
      high: {
        color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
        icon: <CheckCircle2 className="w-3 h-3" />,
        label: t('market_validation.strength.high'),
      },
    }
    return configs[strength]
  }

  const getSignalTitle = (type: MarketSignalType): string => {
    const titles: Record<MarketSignalType, string> = {
      demand_intensity: t('market_validation.signals.demand_intensity.title'),
      problem_salience: t('market_validation.signals.problem_salience.title'),
      existing_spend: t('market_validation.signals.existing_spend.title'),
      competitive_landscape: t('market_validation.signals.competitive_landscape.title'),
      switching_friction: t('market_validation.signals.switching_friction.title'),
      distribution: t('market_validation.signals.distribution.title'),
      geographic_fit: t('market_validation.signals.geographic_fit.title'),
      timing: t('market_validation.signals.timing.title'),
      economic_plausibility: t('market_validation.signals.economic_plausibility.title'),
    }
    return titles[type]
  }

  const getSignalDescription = (type: MarketSignalType): string => {
    const descriptions: Record<MarketSignalType, string> = {
      demand_intensity: t('market_validation.signals.demand_intensity.description'),
      problem_salience: t('market_validation.signals.problem_salience.description'),
      existing_spend: t('market_validation.signals.existing_spend.description'),
      competitive_landscape: t('market_validation.signals.competitive_landscape.description'),
      switching_friction: t('market_validation.signals.switching_friction.description'),
      distribution: t('market_validation.signals.distribution.description'),
      geographic_fit: t('market_validation.signals.geographic_fit.description'),
      timing: t('market_validation.signals.timing.description'),
      economic_plausibility: t('market_validation.signals.economic_plausibility.description'),
    }
    return descriptions[type]
  }

  // Sort signals by type
  const signalTypeOrder: MarketSignalType[] = [
    'demand_intensity',
    'problem_salience',
    'existing_spend',
    'competitive_landscape',
    'switching_friction',
    'distribution',
    'geographic_fit',
    'timing',
    'economic_plausibility',
  ]
  const sortedSignals = [...signals].sort(
    (a, b) => signalTypeOrder.indexOf(a.type) - signalTypeOrder.indexOf(b.type)
  )

  return (
    <div className="space-y-4">
      {/* Intro */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <BarChart3 className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t('market_validation.signals.intro')}
          </p>
        </div>
      </div>

      {/* Signal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedSignals.map((signal) => {
          const strengthBadge = getStrengthBadge(signal.strength)
          const gradientColor = getSignalColor(signal.type)

          return (
            <div
              key={signal.type}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              {/* Card Header */}
              <div className={`p-3 bg-gradient-to-r ${gradientColor} text-white`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getSignalIcon(signal.type)}
                    <h3 className="font-semibold text-sm">
                      {getSignalTitle(signal.type)}
                    </h3>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full border bg-white/20 border-white/30 text-white`}>
                    {strengthBadge.icon}
                    {strengthBadge.label}
                  </span>
                </div>
                <p className="text-xs mt-1 text-white/80">
                  {getSignalDescription(signal.type)}
                </p>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                {/* Classification Badge */}
                {signal.classification && (
                  <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium">
                    {signal.classification}
                  </div>
                )}

                {/* Summary */}
                <div className="text-sm text-gray-700 dark:text-gray-300">
                  <MarkdownRenderer content={signal.summary} />
                </div>

                {/* Evidence Snippets */}
                {signal.evidenceSnippets && signal.evidenceSnippets.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                      {t('market_validation.signals.evidence')}
                    </h4>
                    <ul className="space-y-1.5">
                      {signal.evidenceSnippets.slice(0, 3).map((snippet, i) => (
                        <li
                          key={i}
                          className="text-xs text-gray-600 dark:text-gray-400 pl-3 border-l-2 border-gray-300 dark:border-gray-600"
                        >
                          {snippet}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Sources */}
                {signal.sources && signal.sources.length > 0 && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-1.5">
                      {t('market_validation.signals.sources')}
                    </h4>
                    <div className="space-y-1">
                      {signal.sources.slice(0, 3).map((source, i) => (
                        <a
                          key={i}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{source.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {signals.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>{t('market_validation.signals.no_signals')}</p>
        </div>
      )}
    </div>
  )
}
