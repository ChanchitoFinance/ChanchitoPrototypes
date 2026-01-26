'use client'

import { SynthesisAndNextSteps } from '@/core/types/ai'
import { useTranslations } from '@/shared/components/providers/I18nProvider'
import {
  Lightbulb,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react'
import { MarkdownRenderer } from '@/shared/components/ui/MarkdownRenderer'

interface SynthesisNextStepsSectionProps {
  synthesis: SynthesisAndNextSteps
}

export function SynthesisNextStepsSection({ synthesis }: SynthesisNextStepsSectionProps) {
  const t = useTranslations()

  return (
    <div className="space-y-4">
      {/* Intro */}
      <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t('market_validation.synthesis.intro')}
          </p>
        </div>
      </div>

      {/* Strong Points */}
      {synthesis.strongPoints && synthesis.strongPoints.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t('market_validation.synthesis.strong_points')}
              </h3>
              <span className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                {synthesis.strongPoints.length}
              </span>
            </div>
          </div>
          <div className="p-4">
            <ul className="space-y-3">
              {synthesis.strongPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <MarkdownRenderer
                      content={point}
                      className="text-sm text-gray-700 dark:text-gray-300"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Weak Points */}
      {synthesis.weakPoints && synthesis.weakPoints.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t('market_validation.synthesis.weak_points')}
              </h3>
              <span className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">
                {synthesis.weakPoints.length}
              </span>
            </div>
          </div>
          <div className="p-4">
            <ul className="space-y-3">
              {synthesis.weakPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <MarkdownRenderer
                      content={point}
                      className="text-sm text-gray-700 dark:text-gray-300"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Key Unknowns */}
      {synthesis.keyUnknowns && synthesis.keyUnknowns.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t('market_validation.synthesis.key_unknowns')}
              </h3>
              <span className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                {synthesis.keyUnknowns.length}
              </span>
            </div>
          </div>
          <div className="p-4">
            <ul className="space-y-3">
              {synthesis.keyUnknowns.map((unknown, i) => (
                <li key={i} className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <MarkdownRenderer
                      content={unknown}
                      className="text-sm text-gray-700 dark:text-gray-300"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Suggested Next Steps */}
      {synthesis.suggestedNextSteps && synthesis.suggestedNextSteps.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <ArrowRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t('market_validation.synthesis.suggested_next_steps')}
              </h3>
              <span className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                {synthesis.suggestedNextSteps.length}
              </span>
            </div>
          </div>
          <div className="p-4">
            <ol className="space-y-3">
              {synthesis.suggestedNextSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 pt-0.5">
                    <MarkdownRenderer
                      content={step}
                      className="text-sm text-gray-700 dark:text-gray-300"
                    />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}

      {/* Pivot Guidance (Optional) */}
      {synthesis.pivotGuidance && synthesis.pivotGuidance.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {t('market_validation.synthesis.pivot_guidance')}
              </h3>
            </div>
          </div>
          <div className="p-4">
            <ul className="space-y-3">
              {synthesis.pivotGuidance.map((guidance, i) => (
                <li key={i} className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <MarkdownRenderer
                      content={guidance}
                      className="text-sm text-gray-700 dark:text-gray-300"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-600 dark:text-gray-400 italic text-center">
          {t('market_validation.synthesis.disclaimer')}
        </p>
      </div>
    </div>
  )
}
