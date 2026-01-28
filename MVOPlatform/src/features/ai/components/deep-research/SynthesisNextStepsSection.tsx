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
      <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(160, 123, 207, 0.1)', border: '1px solid var(--primary-accent)' }}>
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--primary-accent)' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {t('market_validation.synthesis.intro')}
          </p>
        </div>
      </div>

      {/* Strong Points */}
      {synthesis.strongPoints && synthesis.strongPoints.length > 0 && (
        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--gray-100)', border: '1px solid var(--border-color)' }}>
          <div className="px-4 py-3" style={{ backgroundColor: 'rgba(160, 123, 207, 0.15)', borderBottom: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--primary-accent)' }} />
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t('market_validation.synthesis.strong_points')}
              </h3>
              <span className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full" style={{ backgroundColor: 'rgba(160, 123, 207, 0.2)', color: 'var(--primary-accent)' }}>
                {synthesis.strongPoints.length}
              </span>
            </div>
          </div>
          <div className="p-4">
            <ul className="space-y-3">
              {synthesis.strongPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--primary-accent)' }} />
                  <div className="flex-1">
                    <MarkdownRenderer
                      content={point}
                      className="text-sm"
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
        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--gray-100)', border: '1px solid var(--border-color)' }}>
          <div className="px-4 py-3" style={{ backgroundColor: 'rgba(255, 148, 76, 0.15)', borderBottom: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5" style={{ color: 'var(--error)' }} />
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t('market_validation.synthesis.weak_points')}
              </h3>
              <span className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full" style={{ backgroundColor: 'rgba(255, 148, 76, 0.2)', color: 'var(--error)' }}>
                {synthesis.weakPoints.length}
              </span>
            </div>
          </div>
          <div className="p-4">
            <ul className="space-y-3">
              {synthesis.weakPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--error)' }} />
                  <div className="flex-1">
                    <MarkdownRenderer
                      content={point}
                      className="text-sm"
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
        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--gray-100)', border: '1px solid var(--border-color)' }}>
          <div className="px-4 py-3" style={{ backgroundColor: 'rgba(176, 167, 184, 0.15)', borderBottom: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5" style={{ color: 'var(--hover-accent)' }} />
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t('market_validation.synthesis.key_unknowns')}
              </h3>
              <span className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full" style={{ backgroundColor: 'rgba(176, 167, 184, 0.2)', color: 'var(--hover-accent)' }}>
                {synthesis.keyUnknowns.length}
              </span>
            </div>
          </div>
          <div className="p-4">
            <ul className="space-y-3">
              {synthesis.keyUnknowns.map((unknown, i) => (
                <li key={i} className="flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--hover-accent)' }} />
                  <div className="flex-1">
                    <MarkdownRenderer
                      content={unknown}
                      className="text-sm"
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
        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--gray-100)', border: '1px solid var(--border-color)' }}>
          <div className="px-4 py-3" style={{ backgroundColor: 'rgba(153, 43, 255, 0.15)', borderBottom: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2">
              <ArrowRight className="w-5 h-5" style={{ color: 'var(--premium-cta)' }} />
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t('market_validation.synthesis.suggested_next_steps')}
              </h3>
              <span className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full" style={{ backgroundColor: 'rgba(153, 43, 255, 0.2)', color: 'var(--premium-cta)' }}>
                {synthesis.suggestedNextSteps.length}
              </span>
            </div>
          </div>
          <div className="p-4">
            <ol className="space-y-3">
              {synthesis.suggestedNextSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0" style={{ backgroundColor: 'rgba(153, 43, 255, 0.2)', color: 'var(--premium-cta)' }}>
                    {i + 1}
                  </span>
                  <div className="flex-1 pt-0.5">
                    <MarkdownRenderer
                      content={step}
                      className="text-sm"
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
        <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--gray-100)', border: '1px solid var(--border-color)' }}>
          <div className="px-4 py-3" style={{ backgroundColor: 'rgba(160, 123, 207, 0.15)', borderBottom: '1px solid var(--border-color)' }}>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" style={{ color: 'var(--primary-accent)' }} />
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {t('market_validation.synthesis.pivot_guidance')}
              </h3>
            </div>
          </div>
          <div className="p-4">
            <ul className="space-y-3">
              {synthesis.pivotGuidance.map((guidance, i) => (
                <li key={i} className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--primary-accent)' }} />
                  <div className="flex-1">
                    <MarkdownRenderer
                      content={guidance}
                      className="text-sm"
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--gray-50)', border: '1px solid var(--border-color)' }}>
        <p className="text-xs italic text-center" style={{ color: 'var(--text-secondary)' }}>
          {t('market_validation.synthesis.disclaimer')}
        </p>
      </div>
    </div>
  )
}
