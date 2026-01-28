'use client'

import { ConflictsAndGaps } from '@/core/types/ai'
import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { AlertTriangle, HelpCircle, Flag, GitMerge } from 'lucide-react'

interface ConflictsGapsSectionProps {
  conflictsAndGaps: ConflictsAndGaps
}

export function ConflictsGapsSection({ conflictsAndGaps }: ConflictsGapsSectionProps) {
  const t = useTranslations()

  const hasContent =
    (conflictsAndGaps.contradictions?.length || 0) > 0 ||
    (conflictsAndGaps.missingSignals?.length || 0) > 0 ||
    (conflictsAndGaps.riskFlags?.length || 0) > 0

  return (
    <div className="space-y-4">
      {/* Intro */}
      <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(255, 148, 76, 0.1)', border: '1px solid var(--error)' }}>
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--error)' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {t('market_validation.conflicts_gaps.intro')}
          </p>
        </div>
      </div>

      {/* Contradictions */}
      {conflictsAndGaps.contradictions && conflictsAndGaps.contradictions.length > 0 && (
        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--gray-100)', border: '1px solid var(--border-color)' }}>
          <div className="px-4 py-3" style={{ backgroundColor: 'rgba(255, 148, 76, 0.15)', borderBottom: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2">
              <GitMerge className="w-5 h-5" style={{ color: 'var(--error)' }} />
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t('market_validation.conflicts_gaps.contradictions')}
              </h3>
              <span className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full" style={{ backgroundColor: 'rgba(255, 148, 76, 0.2)', color: 'var(--error)' }}>
                {conflictsAndGaps.contradictions.length}
              </span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {conflictsAndGaps.contradictions.map((item, i) => (
              <div
                key={i}
                className="p-3 rounded-lg"
                style={{ backgroundColor: 'rgba(255, 148, 76, 0.1)', border: '1px solid var(--error)' }}
              >
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  {item.description}
                </p>
                {item.relatedSignals && item.relatedSignals.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.relatedSignals.map((signal, j) => (
                      <span
                        key={j}
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ backgroundColor: 'rgba(255, 148, 76, 0.2)', color: 'var(--error)' }}
                      >
                        {signal}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Missing Signals */}
      {conflictsAndGaps.missingSignals && conflictsAndGaps.missingSignals.length > 0 && (
        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--gray-100)', border: '1px solid var(--border-color)' }}>
          <div className="px-4 py-3" style={{ backgroundColor: 'rgba(176, 167, 184, 0.15)', borderBottom: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" style={{ color: 'var(--hover-accent)' }} />
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t('market_validation.conflicts_gaps.missing_signals')}
              </h3>
              <span className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full" style={{ backgroundColor: 'rgba(176, 167, 184, 0.2)', color: 'var(--hover-accent)' }}>
                {conflictsAndGaps.missingSignals.length}
              </span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {conflictsAndGaps.missingSignals.map((item, i) => (
              <div
                key={i}
                className="p-3 rounded-lg"
                style={{ backgroundColor: 'rgba(176, 167, 184, 0.1)', border: '1px solid var(--hover-accent)' }}
              >
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  {item.description}
                </p>
                {item.relatedSignals && item.relatedSignals.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.relatedSignals.map((signal, j) => (
                      <span
                        key={j}
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ backgroundColor: 'rgba(176, 167, 184, 0.2)', color: 'var(--hover-accent)' }}
                      >
                        {signal}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Risk Flags */}
      {conflictsAndGaps.riskFlags && conflictsAndGaps.riskFlags.length > 0 && (
        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--gray-100)', border: '1px solid var(--border-color)' }}>
          <div className="px-4 py-3" style={{ backgroundColor: 'rgba(255, 148, 76, 0.15)', borderBottom: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2">
              <Flag className="w-5 h-5" style={{ color: 'var(--error)' }} />
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t('market_validation.conflicts_gaps.risk_flags')}
              </h3>
              <span className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full" style={{ backgroundColor: 'rgba(255, 148, 76, 0.2)', color: 'var(--error)' }}>
                {conflictsAndGaps.riskFlags.length}
              </span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {conflictsAndGaps.riskFlags.map((item, i) => (
              <div
                key={i}
                className="p-3 rounded-lg"
                style={{ backgroundColor: 'rgba(255, 148, 76, 0.1)', border: '1px solid var(--error)' }}
              >
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  {item.description}
                </p>
                {item.relatedSignals && item.relatedSignals.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.relatedSignals.map((signal, j) => (
                      <span
                        key={j}
                        className="text-xs px-2 py-0.5 rounded"
                        style={{ backgroundColor: 'rgba(255, 148, 76, 0.2)', color: 'var(--error)' }}
                      >
                        {signal}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Issues Found */}
      {!hasContent && (
        <div className="text-center py-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ backgroundColor: 'rgba(160, 123, 207, 0.2)' }}>
            <AlertTriangle className="w-8 h-8" style={{ color: 'var(--primary-accent)' }} />
          </div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
            {t('market_validation.conflicts_gaps.no_major_issues')}
          </h3>
          <p className="text-sm max-w-md mx-auto" style={{ color: 'var(--text-secondary)' }}>
            {t('market_validation.conflicts_gaps.no_major_issues_description')}
          </p>
        </div>
      )}
    </div>
  )
}
