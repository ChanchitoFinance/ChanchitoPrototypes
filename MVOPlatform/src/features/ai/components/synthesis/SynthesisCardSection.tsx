'use client'

import type { ReactNode } from 'react'
import { MarkdownRenderer } from '@/shared/components/ui/MarkdownRenderer'
import type { LabeledBlock } from './parseSynthesisContent'

interface SynthesisCardSectionProps {
  /** Optional section title (card header) */
  title?: string
  /** Icon shown next to title */
  icon?: ReactNode
  /** Parsed labeled blocks: each shown as label + content row (market validation style) */
  blocks?: LabeledBlock[]
  /** If no blocks, render raw content as markdown */
  rawContent?: string
  /** Header bar background tint (default: primary-accent) */
  headerBg?: string
}

const DEFAULT_HEADER_BG = 'rgba(160, 123, 207, 0.15)'

export function SynthesisCardSection({
  title,
  icon,
  blocks,
  rawContent,
  headerBg = DEFAULT_HEADER_BG,
}: SynthesisCardSectionProps) {
  const hasBlocks = blocks && blocks.length > 0
  const hasRaw = rawContent?.trim()
  if (!hasBlocks && !hasRaw) return null
  const showBlocks = hasBlocks && (blocks!.length > 0)

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{ backgroundColor: 'var(--gray-100)', border: '1px solid var(--border-color)' }}
    >
      {(title || icon) && (
        <div
          className="px-4 py-3 flex items-center gap-2"
          style={{ backgroundColor: headerBg, borderBottom: '1px solid var(--border-color)' }}
        >
          {icon}
          {title && (
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {title}
            </h3>
          )}
        </div>
      )}
      <div className="p-4 space-y-4">
        {showBlocks
          ? blocks!.map((b, i) => (
              <div key={i} className="space-y-1">
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
            ))
          : (hasRaw && (
              <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
                <MarkdownRenderer content={rawContent!} className="prose prose-sm max-w-none" />
              </div>
            )) || null}
      </div>
    </div>
  )
}
