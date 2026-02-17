'use client'

import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { MarkdownRenderer } from '@/shared/components/ui/MarkdownRenderer'
import { parseLabeledBlocks } from './parseSynthesisContent'

interface SynthesisSuggestedStepsCardProps {
  title: string
  content: string
  icon?: ReactNode
}

const HEADER_BG = 'rgba(153, 43, 255, 0.15)'

export function SynthesisSuggestedStepsCard({
  title,
  content,
  icon,
}: SynthesisSuggestedStepsCardProps) {
  const blocks = parseLabeledBlocks(content)
  const hasBlocks = blocks.length > 0
  const hasRaw = content?.trim()
  if (!hasBlocks && !hasRaw) return null

  const steps = hasBlocks ? blocks : [{ label: 'Content', content }]

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ backgroundColor: 'var(--gray-100)', border: '1px solid var(--border-color)' }}
    >
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ backgroundColor: HEADER_BG, borderBottom: '1px solid var(--border-color)' }}
      >
        {icon ?? <ArrowRight className="w-5 h-5" style={{ color: 'var(--premium-cta)' }} />}
        <h3 className="font-semibold flex-1" style={{ color: 'var(--text-primary)' }}>
          {title}
        </h3>
        <span
          className="px-2 py-0.5 text-xs font-medium rounded-full"
          style={{ backgroundColor: 'rgba(153, 43, 255, 0.2)', color: 'var(--premium-cta)' }}
        >
          {steps.length}
        </span>
      </div>
      <div className="p-4">
        <ol className="space-y-3">
          {steps.map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span
                className="flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold flex-shrink-0"
                style={{ backgroundColor: 'rgba(153, 43, 255, 0.2)', color: 'var(--premium-cta)' }}
              >
                {i + 1}
              </span>
              <div className="flex-1 pt-0.5 space-y-0.5">
                {step.label && step.label !== 'Content' && (
                  <div
                    className="text-xs font-medium uppercase"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {step.label}
                  </div>
                )}
                <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                  <MarkdownRenderer content={step.content} className="!mb-0 prose prose-sm max-w-none" />
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
