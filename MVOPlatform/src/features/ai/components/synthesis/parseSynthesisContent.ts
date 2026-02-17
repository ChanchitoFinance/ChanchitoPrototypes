/**
 * Parse synthesis AI output into labeled blocks for consistent card-style rendering
 * (same visual pattern as Market Snapshot, Behavioral Hypotheses, etc.)
 */

export interface LabeledBlock {
  label: string
  content: string
}

/**
 * Strip orphan markdown bold/italic from start and end of content so "** text" displays as "text".
 * AI often outputs "**Risk:** ** Low awareness." and we capture " ** Low awareness." — clean it.
 */
function cleanBlockContent(content: string): string {
  if (!content?.trim()) return content ?? ''
  let s = content.trim()
  // Leading: optional space + orphan ** or * (no matching close)
  s = s.replace(/^\s*\*\*?\s*/, '')
  // Trailing: orphan ** or * + optional space
  s = s.replace(/\s*\*\*?\s*$/, '')
  return s.trim()
}

/**
 * Split content into blocks by **Label:** or "Label:" at line start.
 * Trims content and strips orphan ** so risks/hypotheses render without literal asterisks.
 */
export function parseLabeledBlocks(text: string): LabeledBlock[] {
  if (!text?.trim()) return []
  const normalized = text.replace(/\r\n/g, '\n').trim()
  const blocks: LabeledBlock[] = []
  // Match line that starts with **Label:** or Label: (at start of string or after newline)
  const re = /(?:^|\n)\s*(\*\*[^*]+?\*\*:?|[A-Za-z][^:\n]{0,80}:)\s*\n?([\s\S]*?)(?=(?:\n\s*(?:\*\*[^*]+?\*\*:?|[A-Za-z][^:\n]{0,80}:)\s*)|$)/gim
  let m: RegExpExecArray | null
  while ((m = re.exec(normalized)) !== null) {
    const rawLabel = (m[1] ?? '').replace(/\*\*/g, '').replace(/:+\s*$/, '').trim()
    const label = rawLabel || ''
    const rawContent = (m[2] ?? '').trim()
    const content = cleanBlockContent(rawContent)
    if (content) blocks.push({ label: label || '', content })
  }
  if (blocks.length === 0 && normalized) {
    blocks.push({ label: '', content: cleanBlockContent(normalized) })
  }
  return blocks
}

/**
 * Split content by a top-level marker so each section can be rendered as its own card.
 * Matches both **Marker:** and "Marker: " (so AI output with or without bold parses).
 */
export function splitByTopLevelMarker(
  text: string,
  marker: string
): string[] {
  if (!text?.trim()) return []
  const normalized = text.replace(/\r\n/g, '\n').trim()
  const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(
    `(?:^|\\n)\\s*(?:\\*\\*${escaped}\\*\\*:?|${escaped}:)\\s*`,
    'gim'
  )
  const parts = normalized.split(regex).map(s => s.trim()).filter(Boolean)
  return parts
}

/** Layer names used in hypotheses status (must match AI prompt). */
const LAYER_NAMES = 'existence|awareness|consideration|intent|pay_intention'

/**
 * Split by **Layer:** or "Layer: existence" etc. so we get one block per layer (up to 5).
 * Uses lookahead first; if only one part, fallback to splitting on literal "**Layer:**" so
 * concatenated blocks (no newline between them) still yield multiple blocks.
 */
function splitLayerBlocks(text: string): string[] {
  if (!text?.trim()) return []
  const normalized = text.replace(/\r\n/g, '\n').trim()
  const lookahead = new RegExp(
    `(?=\\*\\*Layer\\*\\*:?\\s*|Layer:\\s*(?:${LAYER_NAMES})\\b\\.?)`,
    'gim'
  )
  let parts = normalized.split(lookahead).map(s => s.trim()).filter(Boolean)
  if (parts.length <= 1 && (normalized.match(/\*\*Layer\*\*:?/gi)?.length ?? 0) > 1) {
    parts = normalized.split(/\s*\*\*Layer\*\*:?\s*/i).map(s => s.trim()).filter(Boolean)
    parts = parts.map(p => /^\s*\*\*Layer\*\*:?/i.test(p) ? p : `**Layer:** ${p}`)
  }
  return parts
}

/** Strip risk-style content that was mistakenly included in layer text (so layers stay pure). */
function stripRiskContentFromLayerBlock(block: string): string {
  // If block starts with **Risk:**, take only from the first **Layer:** onward
  const layerStart = new RegExp(
    `\\*\\*Layer\\*\\*:?|Layer:\\s*(?:${LAYER_NAMES})\\b`,
    'i'
  )
  if (/^\s*\*\*Risk\*\*:?|^\s*Risk:\s*/i.test(block)) {
    const m = block.match(layerStart)
    if (m?.index != null) return block.slice(m.index).trim()
    return ''
  }
  const riskStart = /\n\s*\*\*Risk\*\*:?|\n\s*Risk:\s*/i
  const idx = block.search(riskStart)
  if (idx === -1) return block
  return block.slice(0, idx).trim()
}

/** Strip layer-style content that was mistakenly included in risk text (so risks stay pure). */
function stripLayerContentFromRiskBlock(block: string): string {
  // If block starts with **Layer:**, take only from the first **Risk:** onward
  if (new RegExp(`^\\s*\\*\\*Layer\\*\\*:?|^\\s*Layer:\\s*(?:${LAYER_NAMES})`, 'i').test(block)) {
    const riskStart = /\*\*Risk\*\*:?|Risk:\s*/i
    const m = block.match(riskStart)
    if (m?.index != null) return block.slice(m.index).trim()
    return ''
  }
  const layerStart = new RegExp(
    `\\n\\s*\\*\\*Layer\\*\\*:?|\\n\\s*Layer:\\s*(?:${LAYER_NAMES})`,
    'i'
  )
  const idx = block.search(layerStart)
  if (idx === -1) return block
  return block.slice(0, idx).trim()
}

/** True if content looks like a real risk block (has at least one risk sub-label). */
function looksLikeRiskBlock(segment: string): boolean {
  const lower = segment.toLowerCase()
  return (
    lower.includes('why it matters') ||
    lower.includes('evidence for') ||
    lower.includes('evidence against') ||
    lower.includes('how to reduce')
  )
}

/** True if content looks like a real layer block (has Evidence/Next test or starts with Layer:). */
function looksLikeLayerBlock(segment: string): boolean {
  const lower = segment.toLowerCase()
  if (lower.includes('evidence') || lower.includes('next test')) return true
  if (/^\s*\*\*layer\*\*:?|^\s*layer:\s*(existence|awareness|consideration|intent|pay_intention)\b/.test(lower)) return true
  return false
}

/** True if block has no real content (placeholder or empty). */
function isPlaceholderContent(blocks: LabeledBlock[]): boolean {
  const hasContent = blocks.some(b => b.content && b.content.replace(/\s+/g, '').replace(/\*+/g, '') !== '')
  return !hasContent
}

/**
 * For "Key risks" content: split by **Risk:** or "Risk:" then parse each block into LabeledBlock[].
 * Keeps risks and layers separate: strips any **Layer:** content that appears inside risk text.
 * Skips intro-only segments and placeholder blocks.
 */
export function parseRisksBlocks(text: string): LabeledBlock[][] {
  let riskSections = splitByTopLevelMarker(text, 'Risk')
  if (riskSections.length <= 1 && text?.trim()) {
    const lookahead = /(?=\*\*Risk\*\*:?|Risk:\s*)/gim
    riskSections = text.trim().split(lookahead).map(s => s.trim()).filter(Boolean)
  }
  const result: LabeledBlock[][] = []
  for (const block of riskSections) {
    const cleaned = stripLayerContentFromRiskBlock(block)
    if (!cleaned) continue
    if (!looksLikeRiskBlock(cleaned)) continue
    const withRisk = /^\s*(\*\*Risk\*\*:?|Risk:)/i.test(cleaned) ? cleaned : '**Risk:** ' + cleaned
    const parsed = parseLabeledBlocks(withRisk)
    if (parsed.length > 0 && !isPlaceholderContent(parsed)) result.push(parsed)
  }
  return result
}

/**
 * For "Hypotheses status" content: split by **Layer:** or "Layer: X." then parse each block.
 * Keeps layers and risks separate: strips any **Risk:** content that appears inside layer text.
 * Skips segments that don't look like a layer block (no Evidence/Next test).
 */
export function parseLayersBlocks(text: string): LabeledBlock[][] {
  const layerSections = splitLayerBlocks(text)
  const layerNamesRe = new RegExp(
    `^(?:\\*\\*Layer\\*\\*:?|Layer:\\s*(?:${LAYER_NAMES})\\b\\.?)\\s*`,
    'i'
  )
  const result: LabeledBlock[][] = []
  for (const block of layerSections) {
    const cleaned = stripRiskContentFromLayerBlock(block)
    if (!cleaned) continue
    if (!looksLikeLayerBlock(cleaned)) continue
    const withLayer = layerNamesRe.test(cleaned) ? cleaned : '**Layer:** ' + cleaned
    const parsed = parseLabeledBlocks(withLayer)
    if (parsed.length > 0 && !isPlaceholderContent(parsed)) result.push(parsed)
  }
  return result
}

/**
 * Structured layer item for synthesis, matching market validation BehavioralHypothesis layout.
 * Used so synthesis "Hypotheses status" renders exactly like market validation layers.
 */
export interface SynthesisLayerItem {
  layer: 'existence' | 'awareness' | 'consideration' | 'intent' | 'pay_intention'
  description: string
  evidenceSummary: string
  nextTest: string
}

const LAYER_ORDER: SynthesisLayerItem['layer'][] = [
  'existence',
  'awareness',
  'consideration',
  'intent',
  'pay_intention',
]

/** Normalize AI layer name to HypothesisLayer. */
function normalizeLayerName(name: string): SynthesisLayerItem['layer'] {
  const lower = (name || '').trim().toLowerCase().replace(/[.\s]+$/, '')
  if (LAYER_ORDER.includes(lower as SynthesisLayerItem['layer'])) return lower as SynthesisLayerItem['layer']
  if (lower.includes('existence')) return 'existence'
  if (lower.includes('awareness')) return 'awareness'
  if (lower.includes('consideration')) return 'consideration'
  if (lower.includes('intent')) return 'intent'
  if (lower.includes('pay')) return 'pay_intention'
  return 'existence'
}

/**
 * Parse hypothesesStatus string into structured layer items (same shape as market validation).
 * Returns items in LAYER_ORDER (existence → pay_intention); uses Evidence → evidenceSummary, Next test → nextTest.
 */
export function parseSynthesisLayersToStructured(text: string): SynthesisLayerItem[] {
  const layerBlocks = parseLayersBlocks(text)
  const result: SynthesisLayerItem[] = []
  for (let i = 0; i < layerBlocks.length; i++) {
    const blocks = layerBlocks[i]
    let description = ''
    let evidenceSummary = ''
    let nextTest = ''
    for (const b of blocks) {
      const label = (b.label || '').toLowerCase()
      const content = b.content || ''
      if (label === 'layer') description = content
      else if (label.includes('evidence')) evidenceSummary = content
      else if (label.includes('next test')) nextTest = content
    }
    const layerFromContent = blocks.find(b => (b.label || '').toLowerCase() === 'layer')
    const resolvedLayer = layerFromContent
      ? normalizeLayerName(layerFromContent.content)
      : (LAYER_ORDER[i] ?? 'existence')
    result.push({
      layer: resolvedLayer,
      description,
      evidenceSummary,
      nextTest,
    })
  }
  return result.sort(
    (a, b) => LAYER_ORDER.indexOf(a.layer) - LAYER_ORDER.indexOf(b.layer)
  )
}

/**
 * Extract bullet lines from content (lines starting with - or •).
 */
export function parseBulletLines(text: string): string[] {
  if (!text?.trim()) return []
  return text
    .split(/\n/)
    .map(line => line.replace(/^[\s•\-*]+\s*/, '').trim())
    .filter(Boolean)
}
