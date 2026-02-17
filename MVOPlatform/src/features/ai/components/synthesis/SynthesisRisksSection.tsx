'use client'

import { AlertTriangle, Flag } from 'lucide-react'
import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { MarkdownRenderer } from '@/shared/components/ui/MarkdownRenderer'
import { parseRisksBlocks } from './parseSynthesisContent'

interface SynthesisRisksSectionProps {
  content: string
}

const HEADER_BG = 'rgba(255, 148, 76, 0.15)'

export function SynthesisRisksSection({ content }: SynthesisRisksSectionProps) {
  const t = useTranslations()
  const riskBlocks = parseRisksBlocks(content)
  if (!content?.trim()) return null
  if (riskBlocks.length === 0) {
    return (
      <div className="space-y-4">
        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: 'rgba(255, 148, 76, 0.1)', border: '1px solid var(--error)' }}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--error)' }} />
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {t('idea_signals_synthesis.key_risks_intro')}
            </p>
          </div>
        </div>
        <div
          className="rounded-lg overflow-hidden p-4"
          style={{ backgroundColor: 'var(--gray-100)', border: '1px solid var(--border-color)' }}
        >
          <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
            <MarkdownRenderer content={content} className="prose prose-sm max-w-none" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Intro (like Conflicts & Gaps) */}
      <div
        className="p-4 rounded-lg"
        style={{ backgroundColor: 'rgba(255, 148, 76, 0.1)', border: '1px solid var(--error)' }}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--error)' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {t('idea_signals_synthesis.key_risks_intro')}
          </p>
        </div>
      </div>

      {riskBlocks.map((blocks, i) => (
        <div
          key={i}
          className="rounded-lg overflow-hidden"
          style={{ backgroundColor: 'var(--gray-100)', border: '1px solid var(--border-color)' }}
        >
          <div
            className="px-4 py-3 flex items-center gap-2"
            style={{ backgroundColor: HEADER_BG, borderBottom: '1px solid var(--border-color)' }}
          >
            <Flag className="w-5 h-5" style={{ color: 'var(--error)' }} />
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              Risk {i + 1}
            </h3>
            <span
              className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full"
              style={{ backgroundColor: 'rgba(255, 148, 76, 0.2)', color: 'var(--error)' }}
            >
              {i + 1}
            </span>
          </div>
          <div className="p-4 space-y-3">
            {blocks.map((b, j) => (
              <div
                key={j}
                className="p-3 rounded-lg space-y-1"
                style={{
                  backgroundColor: j === 0 ? 'rgba(255, 148, 76, 0.1)' : 'transparent',
                  border: j === 0 ? '1px solid var(--error)' : 'none',
                }}
              >
                {b.label && b.label !== 'Content' && (
                  <div
                    className="text-xs font-medium uppercase"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {b.label}
                  </div>
                )}
                <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  <MarkdownRenderer content={b.content} className="!mb-0 prose prose-sm max-w-none" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
