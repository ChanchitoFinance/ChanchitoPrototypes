'use client'

import { useState } from 'react'
import { useTranslations } from '@/shared/components/providers/I18nProvider'

interface CommentReadMoreProps {
  content: string
  maxLines?: number
  className?: string
  isDark?: boolean
}

/**
 * CommentReadMore component that truncates long text and shows a "Read more" button
 * @param content - The full text content
 * @param maxLines - Maximum number of lines to show before truncating (default: 3)
 * @param className - Additional CSS classes
 * @param isDark - Whether to use dark theme styles
 */
export function CommentReadMore({
  content,
  maxLines = 3,
  className = '',
  isDark = false,
}: CommentReadMoreProps) {
  const t = useTranslations()
  const [isExpanded, setIsExpanded] = useState(false)

  // Estimate if content needs truncation (rough estimate: ~50 chars per line)
  const estimatedLines = Math.ceil(content.length / 50)
  const needsTruncation = estimatedLines > maxLines

  if (!needsTruncation) {
    return (
      <p
        className={`whitespace-pre-wrap break-words ${
          isDark ? 'text-white/90' : 'text-text-secondary'
        } ${className}`}
      >
        {content}
      </p>
    )
  }

  return (
    <div>
      <p
        className={`whitespace-pre-wrap break-words ${
          isDark ? 'text-white/90' : 'text-text-secondary'
        } ${className} ${!isExpanded ? `line-clamp-${maxLines}` : ''}`}
        style={!isExpanded ? { display: '-webkit-box', WebkitLineClamp: maxLines, WebkitBoxOrient: 'vertical', overflow: 'hidden' } : {}}
      >
        {content}
      </p>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`mt-1 text-sm font-medium transition-colors ${
          isDark
            ? 'text-accent hover:text-accent/80'
            : 'text-accent hover:text-accent/80'
        }`}
      >
        {isExpanded ? t('comments.read_less') : t('comments.read_more')}
      </button>
    </div>
  )
}
