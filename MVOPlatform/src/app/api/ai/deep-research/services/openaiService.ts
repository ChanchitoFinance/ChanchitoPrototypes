import { serverEnv } from '@/env-validation/config/env'
import {
  ChunkedContent,
  MarketValidationResult,
  MarketSnapshot,
  BehavioralHypothesis,
  MarketSignal,
  ConflictsAndGaps,
  SynthesisAndNextSteps,
  GoogleTrendsData,
  IdeaContext,
} from '@/core/types/ai'

const OPENAI_API_KEY = serverEnv.openaiApiKey

// Use Responses API (recommended for newer models + tools)
const OPENAI_API_URL = 'https://api.openai.com/v1/responses'

// Models
const SYNTH_MODEL = 'gpt-4o'

// -------------------------------
// Helpers
// -------------------------------

function getLanguageInstruction(language: 'en' | 'es'): string {
  return language === 'es'
    ? 'IMPORTANT: You MUST respond in Spanish (Espanol). All analysis, titles, descriptions, and content must be in Spanish.'
    : 'IMPORTANT: You MUST respond in English. All analysis, titles, descriptions, and content must be in English.'
}

async function callOpenAIResponses(
  model: string,
  input: Array<{ role: 'system' | 'user'; content: string }>,
  maxOutputTokens: number = 6000,
  temperature: number = 0.4
): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      input,
      max_output_tokens: maxOutputTokens,
      temperature,
      // Keep JSON stability
      text: { format: { type: 'json_object' } }
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    if (response.status === 429) {
      throw new Error('OPENAI_RATE_LIMIT')
    }
    throw new Error(
      `OpenAI API error: ${response.status} - ${
        errorData.error?.message || response.statusText
      }`
    )
  }

  const data = await response.json()

  // Prefer parsed if available, else fall back to output_text
  if (data.output_parsed) {
    return JSON.stringify(data.output_parsed)
  }
  if (typeof data.output_text === 'string' && data.output_text.trim()) {
    return data.output_text
  }

  // Fallback: attempt to locate text from output array
  const fallback =
    data.output?.[0]?.content?.find?.((c: any) => c.type === 'output_text')?.text ||
    ''
  return fallback
}

function formatEvidenceForPrompt(evidence: ChunkedContent[]): string {
  // Keep it readable + source-indexed so the model can cite [N]
  return (evidence || [])
    .slice(0, 120) // safety cap; deep research can be large
    .map((e, i) => {
      const evidenceType =
        (e as any).evidenceType || e.source || 'unknown'
      const sourceType = (e as any).sourceType || 'unknown'
      return `[${i + 1}] ${e.title || 'Untitled'}
URL: ${e.url || 'N/A'}
Evidence Type: ${evidenceType}
Source Type: ${sourceType}
Notes: ${e.cleanedText || ''}`
    })
    .join('\n\n')
}

// -------------------------------
// Main synthesis API
// -------------------------------

/**
 * Synthesize evidence (from deep research) into a MarketValidationResult.
 * trendsData is optional/legacy: can be passed as [] if unused.
 */
export async function synthesizeWithMainModel(
  evidence: ChunkedContent[],
  trendsData: GoogleTrendsData[],
  ideaContext: IdeaContext,
  language: 'en' | 'es'
): Promise<MarketValidationResult> {
  const systemPrompt = `
You are the Market Validation Analyst for Decision Clarity.

MISSION CONTEXT (Decision Clarity):
- This platform exists to help founders decide before they build.
- Ideas are early and unproven. The goal is to collect signals, reduce regret, and kill weak assumptions.
- Your job is not to “grade” the idea. Your job is to identify what is supported, what is unclear, and what to test next.

EVIDENCE PRINCIPLES:
- Behavioral evidence is strongest (actions, usage, spending, adoption).
- Quantitative evidence is strong when sourced.
- Stated evidence is weaker (opinions, claims).
- Directional evidence is allowed to increase coverage but must be treated as low confidence.

CRITICAL RULES:
1) Be evidence-based — only claim what the evidence supports.
2) Acknowledge uncertainty — use confidence levels appropriately.
3) No scores, no “this will work” verdicts — advisory only.
4) Use citations using [N] referencing the evidence list item numbers.
5) Be balanced — highlight both opportunity and risk.
6) If evidence is sparse for a required section, still output the section with low confidence and explicit gaps.

${getLanguageInstruction(language)}
`

  const evidenceContext =
    evidence && evidence.length > 0
      ? `EVIDENCE LIST:\n${formatEvidenceForPrompt(evidence)}`
      : 'EVIDENCE LIST: No evidence was provided.'

  const trendsContext =
    trendsData && trendsData.length > 0
      ? `\n\nSEARCH INTEREST TRENDS (optional):\n${trendsData
          .slice(-8)
          .map((t) => `${t.date}: ${t.value}/100`)
          .join('\n')}`
      : ''

  const userPrompt = `
Create a comprehensive market validation analysis for this business idea.

IDEA TITLE: ${ideaContext.title}
DESCRIPTION: ${ideaContext.description || 'Not provided'}
TAGS: ${ideaContext.tags.join(', ')}

${evidenceContext}
${trendsContext}

Return a JSON object with this EXACT structure (no extra keys):
{
  "marketSnapshot": {
    "customerSegment": {
      "primaryUser": "description of primary user",
      "buyer": "description of buyer if different from user",
      "contextOfUse": "when/where the solution is used",
      "environment": "consumer|SMB|enterprise|regulated"
    },
    "marketContext": {
      "type": "B2C|B2B|B2B2C",
      "scope": "horizontal|vertical",
      "categoryType": "new_category|existing_category"
    },
    "geography": "description of geographic scope",
    "timingContext": "why this opportunity exists now"
  },
  "behavioralHypotheses": [
    {
      "layer": "existence",
      "title": "Problem Existence",
      "description": "detailed hypothesis description",
      "evidenceSummary": "summary of supporting evidence",
      "confidence": "low|medium|high",
      "supportingSources": [
        {
          "title": "source title",
          "url": "source url",
          "evidenceType": "behavioral|stated|quantitative|directional",
          "snippet": "short quote/paraphrase, cite with [N]"
        }
      ],
      "contradictingSignals": ["any contradicting evidence, cite with [N]"]
    }
  ],
  "marketSignals": [
    {
      "type": "demand_intensity|problem_salience|existing_spend|competitive_landscape|switching_friction|distribution|geographic_fit|timing|economic_plausibility",
      "title": "Signal Title",
      "summary": "signal analysis, cite with [N]",
      "classification": "type-specific classification (e.g., emerging, crowded, etc.)",
      "evidenceSnippets": ["supporting evidence snippets, cite with [N]"],
      "sources": [{"title": "", "url": "", "evidenceType": "behavioral|stated|quantitative|directional"}],
      "strength": "low|medium|high"
    }
  ],
  "conflictsAndGaps": {
    "contradictions": [
      {"type": "contradiction", "description": "description, cite with [N]", "relatedSignals": ["signal names"]}
    ],
    "missingSignals": [
      {"type": "missing_signal", "description": "what data is missing"}
    ],
    "riskFlags": [
      {"type": "risk_flag", "description": "identified risk, cite with [N] where possible"}
    ]
  },
  "synthesisAndNextSteps": {
    "strongPoints": ["strongest validating signals, cite with [N]"],
    "weakPoints": ["weakest or concerning signals, cite with [N]"],
    "keyUnknowns": ["unknowns requiring direct validation"],
    "suggestedNextSteps": ["specific validation tests/experiments (48–72h focused)"],
    "pivotGuidance": ["optional suggestions for reframing"]
  }
}

IMPORTANT:
- Include ALL 5 hypothesis layers: existence, awareness, consideration, intent, pay_intention
- Include ALL 9 market signal types
- Use evidence citations [N] frequently and correctly
- If a section is mostly directional, keep confidence low and say why
- All text content must be in ${language === 'es' ? 'Spanish' : 'English'}
`

  const raw = await callOpenAIResponses(
    SYNTH_MODEL,
    [
      { role: 'system', content: systemPrompt.trim() },
      { role: 'user', content: userPrompt.trim() },
    ],
    6500,
    0.5
  )

  const parsed = JSON.parse(raw)
  return validateAndCompleteResult(parsed, evidence, trendsData)
}

// -------------------------------
// Compatibility wrapper
// -------------------------------

/**
 * Backwards-compatible wrapper for existing callers.
 * - Previously: chunks = google/bing/trends ingestion
 * - Now: chunks = deep research evidence chunks
 */
export async function runMarketValidationPipeline(
  chunks: ChunkedContent[],
  trendsData: GoogleTrendsData[],
  ideaContext: IdeaContext,
  language: 'en' | 'es'
): Promise<MarketValidationResult> {
  return synthesizeWithMainModel(chunks, trendsData, ideaContext, language)
}

// -------------------------------
// Result completion (kept from legacy)
// -------------------------------

function validateAndCompleteResult(
  parsed: Partial<MarketValidationResult>,
  chunks: ChunkedContent[],
  trendsData: GoogleTrendsData[]
): Omit<MarketValidationResult, 'timestamp' | 'version'> & {
  timestamp: Date
  version: number
} {
  const marketSnapshot: MarketSnapshot = parsed.marketSnapshot || {
    customerSegment: {
      primaryUser: 'Not determined',
      contextOfUse: 'Not determined',
      environment: 'Not determined',
    },
    marketContext: {
      type: 'B2C',
      scope: 'vertical',
      categoryType: 'existing_category',
    },
    geography: 'Not determined',
    timingContext: 'Not determined',
  }

  const hypothesisLayers: Array<
    'existence' | 'awareness' | 'consideration' | 'intent' | 'pay_intention'
  > = ['existence', 'awareness', 'consideration', 'intent', 'pay_intention']

  const behavioralHypotheses: BehavioralHypothesis[] = hypothesisLayers.map(
    (layer) => {
      const existing = parsed.behavioralHypotheses?.find((h) => h.layer === layer)
      return (
        existing || {
          layer,
          title: getDefaultHypothesisTitle(layer),
          description: 'Insufficient data to validate this hypothesis',
          evidenceSummary: 'No direct evidence found',
          confidence: 'low' as const,
          supportingSources: [],
        }
      )
    }
  )

  const signalTypes: Array<
    | 'demand_intensity'
    | 'problem_salience'
    | 'existing_spend'
    | 'competitive_landscape'
    | 'switching_friction'
    | 'distribution'
    | 'geographic_fit'
    | 'timing'
    | 'economic_plausibility'
  > = [
    'demand_intensity',
    'problem_salience',
    'existing_spend',
    'competitive_landscape',
    'switching_friction',
    'distribution',
    'geographic_fit',
    'timing',
    'economic_plausibility',
  ]

  const marketSignals: MarketSignal[] = signalTypes.map((type) => {
    const existing = parsed.marketSignals?.find((s) => s.type === type)
    return (
      existing || {
        type,
        title: getDefaultSignalTitle(type),
        summary: 'Insufficient data to analyze this signal',
        evidenceSnippets: [],
        sources: [],
        strength: 'low' as const,
      }
    )
  })

  const conflictsAndGaps: ConflictsAndGaps = parsed.conflictsAndGaps || {
    contradictions: [],
    missingSignals: [
      { type: 'missing_signal', description: 'Limited research evidence available' },
    ],
    riskFlags: [],
  }

  const synthesisAndNextSteps: SynthesisAndNextSteps = parsed.synthesisAndNextSteps || {
    strongPoints: [],
    weakPoints: ['Insufficient data for comprehensive validation'],
    keyUnknowns: ['Requires direct customer research'],
    suggestedNextSteps: ['Conduct customer interviews', 'Perform deeper market research'],
    pivotGuidance: [],
  }

  // Legacy searchData fields: we now populate them from chunks where possible.
  const googleResults = chunks
    .filter((c) => c.source === 'google')
    .map((c, i) => ({
      position: i + 1,
      title: c.title,
      link: c.url,
      snippet: c.cleanedText,
    }))

  const bingResults = chunks
    .filter((c) => c.source === 'bing')
    .map((c, i) => ({
      position: i + 1,
      title: c.title,
      link: c.url,
      snippet: c.cleanedText,
    }))

  return {
    marketSnapshot,
    behavioralHypotheses,
    marketSignals,
    conflictsAndGaps,
    synthesisAndNextSteps,
    searchData: {
      googleResults,
      googleTrends: trendsData,
      bingResults,
    },
    timestamp: new Date(),
    version: 2,
  }
}

function getDefaultHypothesisTitle(layer: string): string {
  const titles: Record<string, string> = {
    existence: 'Problem Existence',
    awareness: 'Problem Awareness',
    consideration: 'Solution Consideration',
    intent: 'Adoption Intent',
    pay_intention: 'Willingness to Pay',
  }
  return titles[layer] || layer
}

function getDefaultSignalTitle(type: string): string {
  const titles: Record<string, string> = {
    demand_intensity: 'Demand Intensity & Momentum',
    problem_salience: 'Problem Salience & Urgency',
    existing_spend: 'Existing Spend & Budget Signals',
    competitive_landscape: 'Competitive Landscape & Saturation',
    switching_friction: 'Switching & Adoption Friction',
    distribution: 'Distribution & Reachability',
    geographic_fit: 'Geographic & Cultural Fit',
    timing: 'Timing & Market Readiness',
    economic_plausibility: 'Economic Plausibility',
  }
  return titles[type] || type
}
