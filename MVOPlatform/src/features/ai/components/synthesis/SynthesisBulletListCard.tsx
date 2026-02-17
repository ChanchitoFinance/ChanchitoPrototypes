'use client'

import type { ReactNode } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { MarkdownRenderer } from '@/shared/components/ui/MarkdownRenderer'
import { parseBulletLines } from './parseSynthesisContent'

interface SynthesisBulletListCardProps {
  title?: string
  icon?: ReactNode
  /** Raw text; bullets (lines starting with - or •) are parsed and shown as list */
  content: string
  headerBg?: string
}

const DEFAULT_HEADER_BG = 'rgba(160, 123, 207, 0.15)'

export function SynthesisBulletListCard({
  title,
  icon,
  content,
  headerBg = DEFAULT_HEADER_BG,
}: SynthesisBulletListCardProps) {
  const lines = parseBulletLines(content)
  const hasLines = lines.length > 0
  const hasRaw = content?.trim()
  if (!hasLines && !hasRaw) return null

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
            <h3 className="font-semibold flex-1" style={{ color: 'var(--text-primary)' }}>
              {title}
            </h3>
          )}
          {hasLines && (
            <span
              className="px-2 py-0.5 text-xs font-medium rounded-full"
              style={{ backgroundColor: 'rgba(160, 123, 207, 0.2)', color: 'var(--primary-accent)' }}
            >
              {lines.length}
            </span>
          )}
        </div>
      )}
      <div className="p-4">
        {hasLines ? (
          <ul className="space-y-3">
            {lines.map((line, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  style={{ color: 'var(--primary-accent)' }}
                />
                <div className="flex-1 text-sm" style={{ color: 'var(--text-primary)' }}>
                  <MarkdownRenderer content={line} className="!mb-0 prose prose-sm max-w-none" />
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm" style={{ color: 'var(--text-primary)' }}>
            <MarkdownRenderer content={content} className="prose prose-sm max-w-none" />
          </div>
        )}
      </div>
    </div>
  )
}
