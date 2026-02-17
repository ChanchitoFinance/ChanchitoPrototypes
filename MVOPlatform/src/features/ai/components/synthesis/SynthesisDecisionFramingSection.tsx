'use client'

import type { ReactNode } from 'react'
import { Sparkles, FileText, AlertTriangle, Gauge } from 'lucide-react'
import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { MarkdownRenderer } from '@/shared/components/ui/MarkdownRenderer'
import { parseLabeledBlocks } from './parseSynthesisContent'

const HEADER_BG = 'rgba(160, 123, 207, 0.15)'

function getSectionIcon(label: string): ReactNode {
  const n = label.toLowerCase()
  if (n.includes('decision')) return <FileText className="w-5 h-5" style={{ color: 'var(--primary-accent)' }} />
  if (n.includes('costly') || n.includes('reverse')) return <AlertTriangle className="w-5 h-5" style={{ color: 'var(--error)' }} />
  if (n.includes('confidence')) return <Gauge className="w-5 h-5" style={{ color: 'var(--primary-accent)' }} />
  return <FileText className="w-5 h-5" style={{ color: 'var(--primary-accent)' }} />
}

function getSectionTitle(label: string): string {
  const n = label.toLowerCase()
  if (n.includes('decision')) return 'Decision'
  if (n.includes('costly') || n.includes('reverse')) return 'What makes this costly to reverse'
  if (n.includes('confidence')) return 'Current confidence'
  return label
}

interface SynthesisDecisionFramingSectionProps {
  content: string
}

export function SynthesisDecisionFramingSection({ content }: SynthesisDecisionFramingSectionProps) {
  const t = useTranslations()
  const blocks = parseLabeledBlocks(content)
  const hasBlocks = blocks.length > 0
  const hasRaw = content?.trim()
  if (!hasBlocks && !hasRaw) return null

  return (
    <div className="space-y-6">
      {/* Intro (like Market Snapshot) */}
      <div
        className="p-4 rounded-lg"
        style={{ backgroundColor: 'rgba(160, 123, 207, 0.1)', border: '1px solid var(--primary-accent)' }}
      >
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--primary-accent)' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {t('idea_signals_synthesis.decision_framing_intro')}
          </p>
        </div>
      </div>

      {hasBlocks ? (
        blocks.map((b, i) => (
          <div
            key={i}
            className="rounded-lg overflow-hidden"
            style={{ backgroundColor: 'var(--gray-100)', border: '1px solid var(--border-color)' }}
          >
            <div
              className="px-4 py-3 flex items-center gap-2"
              style={{ backgroundColor: HEADER_BG, borderBottom: '1px solid var(--border-color)' }}
            >
              {getSectionIcon(b.label)}
              <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                {getSectionTitle(b.label)}
              </h3>
            </div>
            <div className="p-4">
              <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                <MarkdownRenderer content={b.content} className="!mb-0 prose prose-sm max-w-none" />
              </div>
            </div>
          </div>
        ))
      ) : (
        <div
          className="rounded-lg overflow-hidden p-4"
          style={{ backgroundColor: 'var(--gray-100)', border: '1px solid var(--border-color)' }}
        >
          <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
            <MarkdownRenderer content={content!} className="prose prose-sm max-w-none" />
          </div>
        </div>
      )}
    </div>
  )
}
