/**
 * Text Processing Service
 * Provides utilities for compacting and processing idea descriptions for AI prompts
 */

export interface IdeaContext {
  title: string
  description: string
  tags: string[]
}

/**
 * Hard cap by characters + clean formatting (fastest, simplest)
 * Remove emojis, collapse whitespace, trim long lists, then cut to a max length.
 */
export function compactIdeaText(raw: string, maxChars = 1200): string {
  if (!raw) return ''

  // 1) remove most emojis/symbols (optional but saves tokens)
  const noEmoji = raw.replace(
    /[\p{Extended_Pictographic}\u200d\uFE0F]/gu,
    ''
  )

  // 2) collapse whitespace and excessive newlines
  const normalized = noEmoji
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()

  // 3) hard cut
  if (normalized.length <= maxChars) return normalized
  return normalized.slice(0, maxChars).trimEnd() + '…'
}

/**
 * Keep the important sections, drop the noisy ones (best quality per token)
 * Extract key blocks with simple heuristics.
 */
export function extractKeySections(raw: string): string {
  if (!raw) return ''

  const text = raw.replace(/\r\n/g, '\n')

  const keepHeadings = [
    'The Core Idea',
    'Why This Works',
    'Expansion Potential',
    'One-line Pitch',
    'Descripción',
    'Idea',
  ]

  // Split on blank lines
  const blocks = text.split(/\n\s*\n/g).map(b => b.trim()).filter(Boolean)

  // Keep blocks that look like core summary, drop long bullet menus
  const kept: string[] = []
  for (const b of blocks) {
    const isHeadingBlock = keepHeadings.some(h => b.toLowerCase().includes(h.toLowerCase()))
    const isVeryListy =
      (b.match(/^\s*[-•]/gm)?.length ?? 0) >= 6 ||
      (b.match(/ – /g)?.length ?? 0) >= 6

    // Keep headings and short blocks; drop mega lists
    if (isHeadingBlock || (!isVeryListy && b.length <= 500)) {
      kept.push(b)
    }
  }

  // Fallback: if we filtered too aggressively, just take the first ~2 blocks
  const result = kept.length ? kept.join('\n\n') : blocks.slice(0, 2).join('\n\n')

  return result.trim()
}

/**
 * Extract keywords from raw text for AI prompts
 */
export function keywordize(raw: string, maxItems = 12): string[] {
  if (!raw) return []
  const cleaned = raw
    .toLowerCase()
    .replace(/[\p{Extended_Pictographic}\u200d\uFE0F]/gu, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  const stop = new Set(['the','and','for','with','you','your','this','that','are','but','not','into','from','they','their','una','para','con','que','por','como','pero'])
  const words = cleaned.split(' ').filter(w => w.length >= 4 && !stop.has(w))

  // naive frequency count
  const freq = new Map<string, number>()
  for (const w of words) freq.set(w, (freq.get(w) ?? 0) + 1)

  return [...freq.entries()]
    .sort((a,b) => b[1]-a[1])
    .slice(0, maxItems)
    .map(([w]) => w)
}

/**
 * Process idea description for AI prompts using combined approach
 */
export function processIdeaDescription(idea: IdeaContext): {
  compactDescription: string
  keywords: string
} {
  const compactDescription = compactIdeaText(extractKeySections(idea.description || ''), 1000)
  const keywords = keywordize(idea.description || '').join(', ')

  return {
    compactDescription,
    keywords
  }
}