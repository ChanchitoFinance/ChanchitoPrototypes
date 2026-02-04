'use client'

import { useMemo } from 'react'

interface MarkdownRendererProps {
  content: string
  className?: string
  useIconBullets?: boolean | 'check' | 'x' // Use CheckCircle2/XCircle icons instead of bullets. 'check' = all CheckCircle2, 'x' = all XCircle, true = smart detection
}

export function MarkdownRenderer({
  content,
  className = '',
  useIconBullets = false,
}: MarkdownRendererProps) {
  const parsedContent = useMemo(() => {
    let html = content

    // SVG icons for bullets
    const checkCircleIcon = `<svg class="w-5 h-5 flex-shrink-0 mt-0.5" style="color: var(--primary-accent)" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
    const xCircleIcon = `<svg class="w-5 h-5 flex-shrink-0 mt-0.5" style="color: var(--error)" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`

    // First, normalize line breaks
    html = html.replace(/\r\n/g, '\n')

    // Convert bold+italic first (most specific)
    html = html.replace(
      /\*\*\*(.*?)\*\*\*/g,
      '<strong class="font-bold"><em>$1</em></strong>'
    )

    // Convert bold
    html = html.replace(
      /\*\*(.*?)\*\*/g,
      '<strong class="font-bold text-text-primary">$1</strong>'
    )
    html = html.replace(
      /__(.*?)__/g,
      '<strong class="font-bold text-text-primary">$1</strong>'
    )

    // Convert italic
    html = html.replace(/\*([^*\n]+)\*/g, '<em class="italic">$1</em>')
    html = html.replace(/_([^_\n]+)_/g, '<em class="italic">$1</em>')

    // Convert inline code
    html = html.replace(
      /`([^`]+)`/g,
      '<code class="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-sm font-mono text-accent">$1</code>'
    )

    // Convert links
    html = html.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-accent hover:text-accent/80 underline">$1</a>'
    )

    // Split into lines for processing
    const lines = html.split('\n')
    const processed: string[] = []
    let inList = false
    let listItems: string[] = []
    let listType: 'ul' | 'ol' | null = null

    const flushList = () => {
      if (listItems.length > 0 && listType) {
        const listClass = 'my-3 space-y-2 text-text-secondary'
        const itemsHtml = listItems.join('')
        if (listType === 'ul') {
          processed.push(`<ul class="${listClass}">${itemsHtml}</ul>`)
        } else {
          processed.push(`<ol class="${listClass}">${itemsHtml}</ol>`)
        }
        listItems = []
        listType = null
        inList = false
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const trimmed = line.trim()

      // Headers
      if (trimmed.startsWith('### ')) {
        flushList()
        processed.push(
          `<h3 class="text-lg font-semibold text-text-primary mt-4 mb-2">${trimmed.substring(4)}</h3>`
        )
      } else if (trimmed.startsWith('## ')) {
        flushList()
        processed.push(
          `<h2 class="text-xl font-semibold text-text-primary mt-5 mb-3">${trimmed.substring(3)}</h2>`
        )
      } else if (trimmed.startsWith('# ')) {
        flushList()
        processed.push(
          `<h1 class="text-2xl font-bold text-text-primary mt-6 mb-4">${trimmed.substring(2)}</h1>`
        )
      }
      // Horizontal rules
      else if (trimmed === '---' || trimmed === '***') {
        flushList()
        processed.push('<hr class="my-4 border-t border-border-color" />')
      }
      // Unordered lists (bullets with - or *)
      else if (/^[\-\*]\s+/.test(trimmed)) {
        if (!inList || listType !== 'ul') {
          flushList()
          inList = true
          listType = 'ul'
        }
        const content = trimmed.replace(/^[\-\*]\s+/, '')

        // Determine which icon to use
        let bulletIcon = '•'
        if (useIconBullets === 'x') {
          // Always use XCircle
          bulletIcon = xCircleIcon
        } else if (useIconBullets === 'check') {
          // Always use CheckCircle2
          bulletIcon = checkCircleIcon
        } else if (useIconBullets === true) {
          // Smart detection based on content keywords
          const lowerContent = content.toLowerCase()
          // Negative/risk keywords
          const negativeKeywords = ['risk', 'concern', 'challenge', 'problem', 'issue', 'weakness', 'threat', 'difficult', 'lack', 'missing', 'without', 'no ', 'not ', 'unable', 'fail', 'poor', 'low', 'negative', 'avoid', 'warning', 'caution', 'beware', 'danger']
          // Positive keywords
          const positiveKeywords = ['strength', 'opportunity', 'advantage', 'benefit', 'strong', 'good', 'great', 'excellent', 'positive', 'success', 'growth', 'potential', 'innovation', 'unique', 'competitive', 'market', 'demand', 'value']

          const hasNegative = negativeKeywords.some(keyword => lowerContent.includes(keyword))
          const hasPositive = positiveKeywords.some(keyword => lowerContent.includes(keyword))

          if (hasNegative && !hasPositive) {
            bulletIcon = xCircleIcon
          } else {
            bulletIcon = checkCircleIcon
          }
        }

        listItems.push(
          `<li class="flex items-start gap-3">${bulletIcon}<span class="flex-1">${content}</span></li>`
        )
      }
      // Ordered lists (numbered)
      else if (/^\d+\.\s+/.test(trimmed)) {
        if (!inList || listType !== 'ol') {
          flushList()
          inList = true
          listType = 'ol'
        }
        const content = trimmed.replace(/^\d+\.\s+/, '')
        const itemNumber = listItems.length + 1
        listItems.push(
          `<li class="ml-4 pl-2 flex"><span class="mr-2 flex-shrink-0 font-semibold">${itemNumber}.</span><span class="flex-1">${content}</span></li>`
        )
      }
      // Empty lines
      else if (trimmed === '') {
        flushList()
        // Only add spacing if not between list items
        if (
          processed.length > 0 &&
          !processed[processed.length - 1].includes('</ul>') &&
          !processed[processed.length - 1].includes('</ol>')
        ) {
          processed.push('<div class="h-2"></div>')
        }
      }
      // Regular paragraphs
      else {
        flushList()
        processed.push(
          `<p class="mb-3 text-text-secondary leading-relaxed">${trimmed}</p>`
        )
      }
    }

    // Flush any remaining list
    flushList()

    return processed.join('')
  }, [content])

  return (
    <div
      className={`prose prose-sm dark:prose-invert max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: parsedContent }}
    />
  )
}
