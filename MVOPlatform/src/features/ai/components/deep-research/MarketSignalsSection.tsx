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
  Package,
  Share2,
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
      existing_workarounds: <Package className="w-5 h-5" />,
      competitors: <Users className="w-5 h-5" />,
      social_trend: <TrendingUp className="w-5 h-5" />,
      cost_per_attention: <DollarSign className="w-5 h-5" />,
      channel_fit: <Radio className="w-5 h-5" />,
      share_triggers: <Share2 className="w-5 h-5" />,
      market_sophistication: <BarChart3 className="w-5 h-5" />,
      objection_density: <AlertCircle className="w-5 h-5" />,
    }
    return icons[type]
  }

  const getSignalColor = (type: MarketSignalType) => {
    // All signals use primary-accent color but with different opacity levels for variety
    const colors: Record<MarketSignalType, { bg: string; iconColor: string }> = {
      demand_intensity: { bg: 'var(--primary-accent)', iconColor: 'var(--white)' },
      problem_salience: { bg: 'var(--error)', iconColor: 'var(--white)' },
      existing_spend: { bg: 'var(--premium-cta)', iconColor: 'var(--white)' },
      competitive_landscape: { bg: 'var(--primary-accent)', iconColor: 'var(--white)' },
      switching_friction: { bg: 'var(--hover-accent)', iconColor: 'var(--white)' },
      distribution: { bg: 'var(--primary-accent)', iconColor: 'var(--white)' },
      geographic_fit: { bg: 'var(--premium-cta)', iconColor: 'var(--white)' },
      timing: { bg: 'var(--primary-accent)', iconColor: 'var(--white)' },
      economic_plausibility: { bg: 'var(--hover-accent)', iconColor: 'var(--white)' },
      existing_workarounds: { bg: 'var(--primary-accent)', iconColor: 'var(--white)' },
      competitors: { bg: 'var(--primary-accent)', iconColor: 'var(--white)' },
      social_trend: { bg: 'var(--premium-cta)', iconColor: 'var(--white)' },
      cost_per_attention: { bg: 'var(--error)', iconColor: 'var(--white)' },
      channel_fit: { bg: 'var(--primary-accent)', iconColor: 'var(--white)' },
      share_triggers: { bg: 'var(--hover-accent)', iconColor: 'var(--white)' },
      market_sophistication: { bg: 'var(--premium-cta)', iconColor: 'var(--white)' },
      objection_density: { bg: 'var(--error)', iconColor: 'var(--white)' },
    }
    return colors[type]
  }

  const getStrengthBadge = (strength: ConfidenceLevel) => {
    const configs: Record<ConfidenceLevel, { bg: string; color: string; borderColor: string; icon: React.ReactNode; label: string }> = {
      low: {
        bg: 'rgba(255, 255, 255, 0.3)',
        color: 'var(--white)',
        borderColor: 'rgba(255, 255, 255, 0.5)',
        icon: <HelpCircle className="w-3 h-3" />,
        label: t('market_validation.strength.low'),
      },
      medium: {
        bg: 'rgba(255, 255, 255, 0.3)',
        color: 'var(--white)',
        borderColor: 'rgba(255, 255, 255, 0.5)',
        icon: <AlertTriangle className="w-3 h-3" />,
        label: t('market_validation.strength.medium'),
      },
      high: {
        bg: 'rgba(255, 255, 255, 0.3)',
        color: 'var(--white)',
        borderColor: 'rgba(255, 255, 255, 0.5)',
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
      existing_workarounds: t('market_validation.signals.existing_workarounds.title'),
      competitors: t('market_validation.signals.competitors.title'),
      social_trend: t('market_validation.signals.social_trend.title'),
      cost_per_attention: t('market_validation.signals.cost_per_attention.title'),
      channel_fit: t('market_validation.signals.channel_fit.title'),
      share_triggers: t('market_validation.signals.share_triggers.title'),
      market_sophistication: t('market_validation.signals.market_sophistication.title'),
      objection_density: t('market_validation.signals.objection_density.title'),
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
      existing_workarounds: t('market_validation.signals.existing_workarounds.description'),
      competitors: t('market_validation.signals.competitors.description'),
      social_trend: t('market_validation.signals.social_trend.description'),
      cost_per_attention: t('market_validation.signals.cost_per_attention.description'),
      channel_fit: t('market_validation.signals.channel_fit.description'),
      share_triggers: t('market_validation.signals.share_triggers.description'),
      market_sophistication: t('market_validation.signals.market_sophistication.description'),
      objection_density: t('market_validation.signals.objection_density.description'),
    }
    return descriptions[type]
  }

  const DEFAULT_SIGNAL_COLOR: { bg: string; iconColor: string } = {
    bg: 'var(--primary-accent)',
    iconColor: 'var(--white)',
  }
  
  const VALID_SIGNAL_TYPES: MarketSignalType[] = [
    'demand_intensity',
    'problem_salience',
    'existing_spend',
    'competitive_landscape',
    'switching_friction',
    'distribution',
    'geographic_fit',
    'timing',
    'economic_plausibility',
    'existing_workarounds',
    'competitors',
    'social_trend',
    'cost_per_attention',
    'channel_fit',
    'share_triggers',
    'market_sophistication',
    'objection_density',
  ]
  
  function safeSignalType(type: string): MarketSignalType {
    return VALID_SIGNAL_TYPES.includes(type as MarketSignalType)
      ? (type as MarketSignalType)
      : 'demand_intensity'
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
    'existing_workarounds',
    'competitors',
    'social_trend',
    'cost_per_attention',
    'channel_fit',
    'share_triggers',
    'market_sophistication',
    'objection_density',
  ]
  const sortedSignals = [...signals].sort(
    (a, b) => signalTypeOrder.indexOf(a.type) - signalTypeOrder.indexOf(b.type)
  )

  return (
    <div className="space-y-4">
      {/* Intro */}
      <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(160, 123, 207, 0.1)', border: '1px solid var(--primary-accent)' }}>
        <div className="flex items-start gap-3">
          <BarChart3 className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--primary-accent)' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {t('market_validation.signals.intro')}
          </p>
        </div>
      </div>

      {/* Signal Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sortedSignals.map((signal) => {
          const strengthBadge = getStrengthBadge(signal.strength)
          const signalColor = getSignalColor(safeSignalType(signal.type)) ?? DEFAULT_SIGNAL_COLOR
          return (
            <div
              key={`${signal.type}-${signal.title ?? ''}`}
              className="rounded-lg overflow-hidden"
              style={{ backgroundColor: 'var(--gray-100)', border: '1px solid var(--border-color)' }}
            >
              {/* Card Header */}
              <div className="p-3" style={{ backgroundColor: signalColor.bg, color: signalColor.iconColor }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getSignalIcon(safeSignalType(signal.type)) ?? <BarChart3 className="w-5 h-5" />}
                    <h3 className="font-semibold text-sm">
                      {getSignalTitle(safeSignalType(signal.type)) ?? signal.title ?? 'Signal'}
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full" style={{ backgroundColor: strengthBadge.bg, border: `1px solid ${strengthBadge.borderColor}`, color: strengthBadge.color }}>
                    {strengthBadge.icon}
                    {strengthBadge.label}
                  </span>
                </div>
                <p className="text-xs mt-1" style={{ opacity: 0.9 }}>
                  {getSignalDescription(safeSignalType(signal.type)) ?? ''}
                </p>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3">
                {/* Classification Badge */}
                {signal.classification && (
                  <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: 'rgba(160, 123, 207, 0.15)', color: 'var(--primary-accent)' }}>
                    {signal.classification}
                  </div>
                )}

                {/* Summary */}
                <div className="text-sm">
                  <MarkdownRenderer content={signal.summary} />
                </div>

                {/* Evidence Snippets */}
                {signal.evidenceSnippets && signal.evidenceSnippets.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-semibold uppercase" style={{ color: 'var(--text-secondary)' }}>
                      {t('market_validation.signals.evidence')}
                    </h4>
                    <ul className="space-y-1.5">
                      {signal.evidenceSnippets.slice(0, 3).map((snippet, i) => (
                        <li
                          key={i}
                          className="text-xs pl-3"
                          style={{ color: 'var(--text-secondary)', borderLeft: '2px solid var(--primary-accent)' }}
                        >
                          {snippet}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Sources */}
                {signal.sources && signal.sources.length > 0 && (
                  <div className="pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <h4 className="text-xs font-semibold uppercase mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                      {t('market_validation.signals.sources')}
                    </h4>
                    <div className="space-y-1">
                      {signal.sources.slice(0, 3).map((source, i) => (
                        <a
                          key={i}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-xs hover:underline"
                          style={{ color: 'var(--primary-accent)' }}
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
        <div className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
          <p>{t('market_validation.signals.no_signals')}</p>
        </div>
      )}
    </div>
  )
}
