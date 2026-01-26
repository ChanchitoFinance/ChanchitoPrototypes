/**
 * OpenAI Service
 * Two-stage pipeline for market validation analysis
 * Stage 1: gpt-4o-mini for partial analysis
 * Stage 2: gpt-4o for final synthesis
 */

import { serverEnv } from '@/env-validation/config/env'
import {
  ChunkedContent,
  PartialAnalysis,
  MarketValidationResult,
  MarketSnapshot,
  BehavioralHypothesis,
  MarketSignal,
  ConflictsAndGaps,
  SynthesisAndNextSteps,
  GoogleTrendsData,
  EvidenceType,
  IdeaContext,
} from '@/core/types/ai'
import { formatChunksForPrompt } from './ingestionService'

const OPENAI_API_KEY = serverEnv.openaiApiKey
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

// Models
const MINI_MODEL = 'gpt-4o-mini'
const MAIN_MODEL = 'gpt-4o'

/**
 * Make OpenAI API request
 */
async function callOpenAI(
  model: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens: number = 4096,
  temperature: number = 0.7
): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    if (response.status === 429) {
      throw new Error('OPENAI_RATE_LIMIT')
    }
    throw new Error(
      `OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`
    )
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

/**
 * Get language instruction for prompts
 */
function getLanguageInstruction(language: 'en' | 'es'): string {
  return language === 'es'
    ? 'IMPORTANT: You MUST respond in Spanish (Espanol). All analysis, titles, descriptions, and content must be in Spanish.'
    : 'IMPORTANT: You MUST respond in English. All analysis, titles, descriptions, and content must be in English.'
}

/**
 * Stage 1: Process chunks with gpt-4o-mini
 * Generates partial summaries and extracts key information
 */
export async function processWithMiniModel(
  chunks: ChunkedContent[],
  ideaContext: IdeaContext,
  language: 'en' | 'es'
): Promise<PartialAnalysis[]> {
  const systemPrompt = `You are a market research analyst specializing in startup validation.
Your task is to analyze search results and extract evidence relevant to validating a business idea.
${getLanguageInstruction(language)}

For each source, identify:
1. Key summary of relevant information
2. Important keywords
3. Relevant quotes that provide evidence
4. Evidence type: "behavioral" (what people do), "stated" (what people say), or "quantitative" (numbers, statistics)

Return a JSON object with an "analyses" array.`

  const userPrompt = `Analyze these search results for the business idea:

IDEA: ${ideaContext.title}
DESCRIPTION: ${ideaContext.description || 'Not provided'}
TAGS: ${ideaContext.tags.join(', ')}

SEARCH RESULTS:
${formatChunksForPrompt(chunks)}

Return JSON with this structure:
{
  "analyses": [
    {
      "sourceUrl": "url",
      "title": "source title",
      "summary": "key findings relevant to the idea",
      "keywords": ["keyword1", "keyword2"],
      "relevantQuotes": ["quote that provides evidence"],
      "evidenceType": "behavioral|stated|quantitative"
    }
  ]
}

Analyze each source and determine its relevance to validating this specific business idea.`

  try {
    const result = await callOpenAI(MINI_MODEL, systemPrompt, userPrompt, 4096, 0.5)
    const parsed = JSON.parse(result)
    return parsed.analyses || []
  } catch (error) {
    console.error('Error in mini model processing:', error)
    // Return empty array on error - synthesis can still work with trends data
    return []
  }
}

/**
 * Stage 2: Synthesize with gpt-4o
 * Creates the complete market validation result
 */
export async function synthesizeWithMainModel(
  partialAnalyses: PartialAnalysis[],
  trendsData: GoogleTrendsData[],
  ideaContext: IdeaContext,
  chunks: ChunkedContent[],
  language: 'en' | 'es'
): Promise<MarketValidationResult> {
  const systemPrompt = `You are an expert market validation analyst for startups. Your role is to synthesize research data into a comprehensive market validation report.

${getLanguageInstruction(language)}

CRITICAL RULES:
1. Be evidence-based - only claim what the data supports
2. Acknowledge uncertainty - use confidence levels appropriately
3. NO scores or success/failure verdicts - this is advisory only
4. Include source citations using [N] format referencing the source numbers provided
5. Be balanced - highlight both opportunities and risks

You will produce a complete market validation analysis with 5 sections:
1. Market Snapshot - Customer segment and market context
2. Behavioral Hypotheses - 5 layers of validation hypotheses
3. Market Signals - 9 types of market-level signals
4. Conflicts & Gaps - Contradictions, missing data, risks
5. Synthesis & Next Steps - Summary and recommendations`

  // Format partial analyses for the prompt
  const analysisContext = partialAnalyses.length > 0
    ? partialAnalyses.map((a, i) =>
        `[${i + 1}] ${a.title}\nURL: ${a.sourceUrl}\nSummary: ${a.summary}\nEvidence Type: ${a.evidenceType}\nKeywords: ${a.keywords.join(', ')}\nQuotes: ${a.relevantQuotes.join(' | ')}`
      ).join('\n\n')
    : 'Limited source data available. Base analysis on trends and idea description.'

  // Format trends data
  const trendsContext = trendsData.length > 0
    ? `Search Interest Trends:\n${trendsData.map(t => `${t.date}: ${t.value}/100`).join('\n')}`
    : 'No trends data available.'

  const userPrompt = `Create a comprehensive market validation analysis for this business idea.

IDEA TITLE: ${ideaContext.title}
DESCRIPTION: ${ideaContext.description || 'Not provided'}
TAGS: ${ideaContext.tags.join(', ')}

RESEARCH DATA:
${analysisContext}

${trendsContext}

Return a JSON object with this EXACT structure:
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
          "evidenceType": "behavioral|stated|quantitative",
          "snippet": "relevant quote"
        }
      ],
      "contradictingSignals": ["any contradicting evidence"]
    }
  ],
  "marketSignals": [
    {
      "type": "demand_intensity|problem_salience|existing_spend|competitive_landscape|switching_friction|distribution|geographic_fit|timing|economic_plausibility",
      "title": "Signal Title",
      "summary": "signal analysis",
      "classification": "type-specific classification (e.g., emerging, crowded, etc.)",
      "evidenceSnippets": ["supporting evidence"],
      "sources": [{"title": "", "url": "", "evidenceType": "behavioral|stated|quantitative"}],
      "strength": "low|medium|high"
    }
  ],
  "conflictsAndGaps": {
    "contradictions": [
      {"type": "contradiction", "description": "description", "relatedSignals": ["signal names"]}
    ],
    "missingSignals": [
      {"type": "missing_signal", "description": "what data is missing"}
    ],
    "riskFlags": [
      {"type": "risk_flag", "description": "identified risk"}
    ]
  },
  "synthesisAndNextSteps": {
    "strongPoints": ["strongest validating signals"],
    "weakPoints": ["weakest or concerning signals"],
    "keyUnknowns": ["unknowns requiring direct validation"],
    "suggestedNextSteps": ["specific validation tests/experiments"],
    "pivotGuidance": ["optional suggestions for reframing"]
  }
}

IMPORTANT:
- Include ALL 5 hypothesis layers: existence, awareness, consideration, intent, pay_intention
- Include ALL 9 market signal types
- Reference sources using the provided URLs
- If evidence is limited for a section, still provide the section with appropriate low confidence
- All text content must be in ${language === 'es' ? 'Spanish' : 'English'}`

  try {
    const result = await callOpenAI(MAIN_MODEL, systemPrompt, userPrompt, 8192, 0.7)
    const parsed = JSON.parse(result)

    // Validate and fill in missing structure
    return validateAndCompleteResult(parsed, chunks, trendsData)
  } catch (error) {
    console.error('Error in main model synthesis:', error)
    throw error
  }
}

/**
 * Validate and complete the result structure
 */
function validateAndCompleteResult(
  parsed: Partial<MarketValidationResult>,
  chunks: ChunkedContent[],
  trendsData: GoogleTrendsData[]
): Omit<MarketValidationResult, 'timestamp' | 'version'> & { timestamp: Date; version: number } {
  // Ensure all required fields exist with defaults
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

  // Ensure all 5 hypothesis layers exist
  const hypothesisLayers: Array<'existence' | 'awareness' | 'consideration' | 'intent' | 'pay_intention'> = [
    'existence', 'awareness', 'consideration', 'intent', 'pay_intention'
  ]

  const behavioralHypotheses: BehavioralHypothesis[] = hypothesisLayers.map(layer => {
    const existing = parsed.behavioralHypotheses?.find(h => h.layer === layer)
    return existing || {
      layer,
      title: getDefaultHypothesisTitle(layer),
      description: 'Insufficient data to validate this hypothesis',
      evidenceSummary: 'No direct evidence found',
      confidence: 'low' as const,
      supportingSources: [],
    }
  })

  // Ensure all 9 market signal types exist
  const signalTypes: Array<'demand_intensity' | 'problem_salience' | 'existing_spend' | 'competitive_landscape' | 'switching_friction' | 'distribution' | 'geographic_fit' | 'timing' | 'economic_plausibility'> = [
    'demand_intensity', 'problem_salience', 'existing_spend', 'competitive_landscape',
    'switching_friction', 'distribution', 'geographic_fit', 'timing', 'economic_plausibility'
  ]

  const marketSignals: MarketSignal[] = signalTypes.map(type => {
    const existing = parsed.marketSignals?.find(s => s.type === type)
    return existing || {
      type,
      title: getDefaultSignalTitle(type),
      summary: 'Insufficient data to analyze this signal',
      evidenceSnippets: [],
      sources: [],
      strength: 'low' as const,
    }
  })

  const conflictsAndGaps: ConflictsAndGaps = parsed.conflictsAndGaps || {
    contradictions: [],
    missingSignals: [{ type: 'missing_signal', description: 'Limited web research data available' }],
    riskFlags: [],
  }

  const synthesisAndNextSteps: SynthesisAndNextSteps = parsed.synthesisAndNextSteps || {
    strongPoints: [],
    weakPoints: ['Insufficient data for comprehensive validation'],
    keyUnknowns: ['Requires direct customer research'],
    suggestedNextSteps: ['Conduct customer interviews', 'Perform deeper market research'],
  }

  // Build search data from chunks
  const googleResults = chunks
    .filter(c => c.source === 'google')
    .map((c, i) => ({
      position: i + 1,
      title: c.title,
      link: c.url,
      snippet: c.cleanedText,
    }))

  const bingResults = chunks
    .filter(c => c.source === 'bing')
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
    version: 1,
  }
}

/**
 * Get default hypothesis title for a layer
 */
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

/**
 * Get default signal title for a type
 */
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

/**
 * Main pipeline function - runs both stages
 */
export async function runMarketValidationPipeline(
  chunks: ChunkedContent[],
  trendsData: GoogleTrendsData[],
  ideaContext: IdeaContext,
  language: 'en' | 'es'
): Promise<MarketValidationResult> {
  // Stage 1: Process chunks with mini model
  const partialAnalyses = await processWithMiniModel(chunks, ideaContext, language)

  // Stage 2: Synthesize with main model
  const result = await synthesizeWithMainModel(
    partialAnalyses,
    trendsData,
    ideaContext,
    chunks,
    language
  )

  return result
}
