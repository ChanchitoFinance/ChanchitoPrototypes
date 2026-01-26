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
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t('market_validation.conflicts_gaps.intro')}
          </p>
        </div>
      </div>

      {/* Contradictions */}
      {conflictsAndGaps.contradictions && conflictsAndGaps.contradictions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <GitMerge className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t('market_validation.conflicts_gaps.contradictions')}
              </h3>
              <span className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                {conflictsAndGaps.contradictions.length}
              </span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {conflictsAndGaps.contradictions.map((item, i) => (
              <div
                key={i}
                className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-200 dark:border-red-800"
              >
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {item.description}
                </p>
                {item.relatedSignals && item.relatedSignals.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.relatedSignals.map((signal, j) => (
                      <span
                        key={j}
                        className="text-xs px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
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
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t('market_validation.conflicts_gaps.missing_signals')}
              </h3>
              <span className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                {conflictsAndGaps.missingSignals.length}
              </span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {conflictsAndGaps.missingSignals.map((item, i) => (
              <div
                key={i}
                className="p-3 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg border border-yellow-200 dark:border-yellow-800"
              >
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {item.description}
                </p>
                {item.relatedSignals && item.relatedSignals.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.relatedSignals.map((signal, j) => (
                      <span
                        key={j}
                        className="text-xs px-2 py-0.5 rounded bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
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
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <Flag className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t('market_validation.conflicts_gaps.risk_flags')}
              </h3>
              <span className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
                {conflictsAndGaps.riskFlags.length}
              </span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {conflictsAndGaps.riskFlags.map((item, i) => (
              <div
                key={i}
                className="p-3 bg-orange-50 dark:bg-orange-900/10 rounded-lg border border-orange-200 dark:border-orange-800"
              >
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {item.description}
                </p>
                {item.relatedSignals && item.relatedSignals.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {item.relatedSignals.map((signal, j) => (
                      <span
                        key={j}
                        className="text-xs px-2 py-0.5 rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400"
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
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mb-4">
            <AlertTriangle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('market_validation.conflicts_gaps.no_major_issues')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {t('market_validation.conflicts_gaps.no_major_issues_description')}
          </p>
        </div>
      )}
    </div>
  )
}
