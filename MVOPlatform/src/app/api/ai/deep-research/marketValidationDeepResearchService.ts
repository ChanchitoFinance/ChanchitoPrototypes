/**
 * Market Validation (3-step pipeline) — UPDATED
 * - Step A (FAST): light model drafts marketSnapshot + behavioralHypotheses (skeleton, no web)
 * - Step B (SLOW): light model uses web_search to gather:
 *    (1) evidence for behavioralHypotheses (UNCHANGED PROMPT)
 *    (2) marketSignals evidence (NEW)
 * - Step C (FAST): light model derives ONLY conflictsAndGaps + synthesisAndNextSteps (NO marketSignals here anymore)
 *
 * Net effect:
 * - marketSignals are researched (with sources) during Step B
 * - Step C does not create/modify marketSignals
 */

import { serverEnv } from '@/env-validation/config/env'
import { MarketValidationResult, IdeaContext } from '@/core/types/ai'
import { processIdeaDescription } from '@/core/lib/services/textProcessingService'

const OPENAI_API_KEY = serverEnv.openaiApiKey
const OPENAI_ORG_ID = serverEnv.openaiOrgId

const OPENAI_API_URL = 'https://api.openai.com/v1/responses'

// Models
const LIGHT_MODEL = 'gpt-4o-mini' // fast + cheap
const DEEP_MODEL = 'gpt-4o-mini'  // web_search tool call

function getLanguageInstruction(language: 'en' | 'es'): string {
  return language === 'es'
    ? 'IMPORTANT: Respond in Spanish. All titles, descriptions, and content must be in Spanish.'
    : 'IMPORTANT: Respond in English. All titles, descriptions, and content must be in English.'
}

function extractAssistantOutputText(data: any): string | null {
  const output = Array.isArray(data?.output) ? data.output : []

  const assistantMsg =
    output.find((o: any) => o?.type === 'message' && o?.role === 'assistant') ??
    output.find((o: any) => o?.role === 'assistant') ??
    null

  const content = Array.isArray(assistantMsg?.content) ? assistantMsg.content : []
  const outputTextBlock =
    content.find((c: any) => c?.type === 'output_text') ??
    content.find((c: any) => typeof c?.text === 'string') ??
    null

  const text = outputTextBlock?.text
  return typeof text === 'string' ? text : null
}

function parseRetryAfterSeconds(errJson: any, headers: Headers): number | null {
  const resetTokens = headers.get('x-ratelimit-reset-tokens')
  if (resetTokens) {
    const m = resetTokens.match(/([\d.]+)s/)
    if (m) return Math.ceil(Number(m[1]))
  }
  const msg: string = errJson?.error?.message || ''
  const m2 = msg.match(/try again in\s+([\d.]+)s/i)
  if (m2) return Math.ceil(Number(m2[1]))
  return null
}

function validateMinimalShape(obj: any): asserts obj is MarketValidationResult {
  if (!obj || typeof obj !== 'object') throw new Error('INVALID_OUTPUT_SHAPE')

  const requiredTop = [
    'marketSnapshot',
    'behavioralHypotheses',
    'marketSignals',
    'conflictsAndGaps',
    'synthesisAndNextSteps',
  ]
  for (const k of requiredTop) {
    if (!(k in obj)) throw new Error(`MISSING_KEY_${k}`)
  }

  if (!Array.isArray(obj.behavioralHypotheses)) throw new Error('INVALID_behavioralHypotheses')
  if (!Array.isArray(obj.marketSignals)) throw new Error('INVALID_marketSignals')
}

async function callResponsesJSON(
  body: any,
  headers: Record<string, string>
): Promise<any> {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    let errJson: any = {}
    try {
      errJson = await response.json()
      console.error('OPENAI_ERROR_BODY', errJson)
    } catch {
      const errText = await response.text().catch(() => '')
      console.error('OPENAI_ERROR_TEXT', errText)
    }

    if (response.status === 429 && errJson?.error?.code === 'rate_limit_exceeded') {
      const retryAfterSec = parseRetryAfterSeconds(errJson, response.headers) ?? 3
      const e = new Error('OPENAI_RATE_LIMIT')
      ;(e as any).retryAfterSeconds = retryAfterSec
      ;(e as any).details = errJson?.error?.message || 'Rate limit exceeded'
      throw e
    }

    throw new Error('OPENAI_CALL_FAILED')
  }

  const data = await response.json()

  if (data?.status === 'incomplete') {
    console.error('OPENAI_INCOMPLETE', data?.incomplete_details)
    const e = new Error('OPENAI_INCOMPLETE')
    ;(e as any).details = data?.incomplete_details
    ;(e as any).responseId = data?.id
    throw e
  }

  const text = extractAssistantOutputText(data)
  if (!text) {
    console.error('OPENAI_MISSING_OUTPUT_TEXT', data)
    throw new Error('OPENAI_MISSING_OUTPUT_TEXT')
  }

  try {
    return JSON.parse(text)
  } catch {
    console.error('OPENAI_JSON_PARSE_FAILED', { text })
    throw new Error('OPENAI_JSON_PARSE_FAILED')
  }
}

/**
 * Step A: FAST draft (no web)
 * Produces marketSnapshot + behavioralHypotheses skeleton with required layers.
 */
async function draftSnapshotAndHypotheses(
  idea: IdeaContext,
  language: 'en' | 'es',
  compactDescription: string,
  keywords: string,
  headers: Record<string, string>
): Promise<Pick<MarketValidationResult, 'marketSnapshot' | 'behavioralHypotheses'>> {
  const prompt = `
You are a Market Validation Analyst.

TASK:
- Create marketSnapshot AND behavioralHypotheses SKELETON (no web research).
- Do NOT browse. Do NOT cite sources. Do NOT invent URLs.

RULES:
- Output MUST be valid JSON ONLY. No extra text. No markdown.
- behavioralHypotheses MUST include ALL 5 layers:
  existence, awareness, consideration, intent, pay_intention
- supportingSources MUST be an empty array for now [] (no evidence yet).
- Keep descriptions concise (<= 260 chars each).

Return JSON with EXACTLY this structure (no extra keys):
{
  "marketSnapshot": {
    "customerSegment": {
      "primaryUser": "",
      "buyer": "",
      "contextOfUse": "",
      "environment": "consumer|SMB|enterprise|regulated"
    },
    "marketContext": {
      "type": "B2C|B2B|B2B2C",
      "scope": "horizontal|vertical",
      "categoryType": "new_category|existing_category"
    },
    "geography": "",
    "timingContext": ""
  },
  "behavioralHypotheses": [
    {
      "layer": "existence|awareness|consideration|intent|pay_intention",
      "title": "",
      "description": "",
      "evidenceSummary": "",
      "confidence": "low|medium|high",
      "supportingSources": [],
      "contradictingSignals": []
    }
  ]
}

${getLanguageInstruction(language)}

IDEA:
TITLE: ${idea.title}
DESCRIPTION (compact): ${compactDescription}
KEYWORDS: ${keywords}
TAGS: ${(idea.tags || []).join(', ')}
`.trim()

  return callResponsesJSON(
    {
      model: LIGHT_MODEL,
      input: prompt,
      max_output_tokens: 2000,
      temperature: 0.2,
      text: { format: { type: 'json_object' } },
    },
    headers
  )
}

/**
 * Step B1: DEEP RESEARCH (web_search) for hypothesis evidence
 * IMPORTANT: DO NOT MODIFY THIS PROMPT (per user instruction)
 */
async function deepResearchHypothesesEvidence(
  idea: IdeaContext,
  language: 'en' | 'es',
  compactDescription: string,
  keywords: string,
  hypotheses: any[],
  headers: Record<string, string>
): Promise<{ behavioralHypotheses: any[] }> {
  const prompt = `
You are a market signal researcher.

GOAL:
Fill evidence for the provided behavioralHypotheses ONLY.

HARD RULES:
- You MUST use web_search to find evidence for the hypotheses.
- Output MUST be VALID JSON ONLY. No extra text. No markdown. No code fences.
- Return ONLY this JSON structure: { "behavioralHypotheses": [...] }
- Do NOT return marketSnapshot, marketSignals, conflictsAndGaps, or synthesisAndNextSteps.

EVIDENCE REQUIREMENTS (strict):
For EACH hypothesis, set:
- evidenceSummary (<= 260 chars)
- confidence: low|medium|high
- supportingSources: EXACTLY 5 items total:
  - EXACTLY 3 behavioral
  - EXACTLY 2 quantitative
Each source must include:
  title, url, evidenceType, snippet
Snippet limits:
- snippet <= 180 characters
- no multi-paragraph text
- avoid long quotes

GLOBAL UNIQUENESS — ONE SIGNAL, ONE LAYER, ONE SOURCE (strict):
- Across ALL behavioralHypotheses, every source (every domain/site) may appear at most ONCE in the entire response.
- A source used in one hypothesis (one layer) must NOT appear in any other hypothesis. Example: if reddit.com is used in the "existence" hypothesis, it cannot appear in "awareness", "consideration", "intent", or "pay_intention".
- Each evidence item (each supportingSource entry) belongs to exactly one layer (one hypothesis) and must not be reused in another layer. Each signal — quantitative or qualitative — is used for one unique layer only.
- So: 5 hypotheses × 5 sources per hypothesis = 25 distinct sources total. No domain may appear twice anywhere. Plan your search so each of the 25 sources is from a different domain.
- Before returning, check: no URL/domain appears in more than one hypothesis.

SOURCE PRIORITY FOR BEHAVIORAL EVIDENCE:
- For behavioral evidence, PRIORITIZE in this order:
  1) Real people’s observable behavior: comments, posts, threads on X (Twitter), Reddit, niche forums, community discussions, product reviews, and similar.
  2) Direct quotes or paraphrases of what people say they do, want, or struggle with (not analyst summaries).
- DEPRIORITIZE for behavioral signals: generic news articles, press releases, analyst reports, and “thought leadership” unless they cite or quote real users/customers.
- When you have both: prefer a Reddit thread, X post, or forum comment over an article that only summarizes it.
- Snippets for behavioral sources should be short quotes or paraphrases from real people (e.g. “I always…”, “We tried…”, “Nobody I know…”), not article headlines or analyst language.

ONE SOURCE PER EVIDENCE (strict — non-negotiable):
- For EACH hypothesis, all 5 supportingSources MUST be from 5 DIFFERENT sources.
- A "source" = one site/domain (e.g. reddit.com, twitter.com, a single blog, a single news site). Different pages on the same domain count as the SAME source.
- You are PROHIBITED from citing more than one signal from the same source in a single hypothesis. Example: two different Reddit threads = one source (reddit.com) → only one of them may appear in that hypothesis's supportingSources.
- If you have multiple good signals from the same domain, pick the single strongest one and find the other 4 from other domains/sites.
- Valid: 5 items from reddit.com, twitter.com, quora.com, nytimes.com, a niche forum (5 different domains).
- Invalid: 2 items from reddit.com + 3 from elsewhere (reddit counts once only).
- And (see GLOBAL UNIQUENESS): that single reddit.com citation must be the only time reddit.com appears in the entire response.

SOURCE PRIORITY FOR BEHAVIORAL EVIDENCE:
- For behavioral evidence, PRIORITIZE in this order:
  1) Real people's observable behavior: comments, posts, threads on X (Twitter), Reddit, niche forums, community discussions, product reviews, and similar.
  2) Direct quotes or paraphrases of what people say they do, want, or struggle with (not analyst summaries).
- DEPRIORITIZE for behavioral signals: generic news articles, press releases, analyst reports, analyst reports, and "thought leadership" unless they cite or quote real users/customers.
- When you have both: prefer a Reddit thread, X post, or forum comment over an article that only summarizes it.
- Snippets for behavioral sources should be short quotes or paraphrases from real people (e.g. "I always…", "We tried…", "Nobody I know…"), not article headlines or analyst language.

CONTRADICTIONS:
- contradictingSignals: 0–2 short strings (<= 140 chars each) if any conflicts found.

INPUT IDEA:
TITLE: ${idea.title}
DESCRIPTION (compact): ${compactDescription}
KEYWORDS: ${keywords}
TAGS: ${(idea.tags || []).join(', ')}

HYPOTHESES SKELETON (fill evidence for these):
${JSON.stringify(hypotheses, null, 2)}

${getLanguageInstruction(language)}

Return JSON ONLY:
{ "behavioralHypotheses": [ ...filled hypotheses... ] }
`.trim()

  return callResponsesJSON(
    {
      model: DEEP_MODEL,
      max_tool_calls: 24,
      max_output_tokens: 18000,
      tools: [{ type: 'web_search_preview', search_context_size: 'medium' }],
      input: prompt,
    },
    headers
  )
}

/**
 * Step B2: DEEP RESEARCH (web_search) for marketSignals evidence (NEW)
 * Returns ONLY: { "marketSignals": [...] }
 *
 * Signals required (fixed):
 * - Existing Workarounds
 * - Direct and Possible Competitors
 * - Social Media Trending (TikTok/Instagram/etc.)
 * - Cost-Per-Attention Signals
 * - Channel-Idea Fit
 * - Share Triggers
 * - Market Sophistication Level
 * - Objection Density
 *
 * For each signal: minimum 2 unique sources, behavioral-first.
 *
 * NOTE: We keep global uniqueness *within marketSignals* to reduce repeats.
 * We also try to avoid domains already used in hypotheses by passing a "bannedDomains" list.
 */
function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase()
  } catch {
    return ''
  }
}

function collectDomainsFromHypotheses(hypotheses: any[]): string[] {
  const set = new Set<string>()
  for (const h of hypotheses || []) {
    for (const s of h?.supportingSources || []) {
      const d = getDomain(s?.url || '')
      if (d) set.add(d)
    }
  }
  return Array.from(set)
}

async function deepResearchMarketSignals(
  idea: IdeaContext,
  language: 'en' | 'es',
  compactDescription: string,
  keywords: string,
  bannedDomains: string[],
  headers: Record<string, string>
): Promise<{ marketSignals: any[] }> {
    const prompt = `
    You are a marketing-focused market signal researcher.
    
    GOAL:
    Return evidence-backed marketSignals for the idea using web_search.
    
    HARD RULES (non-negotiable):
    - You MUST use web_search.
    - Output MUST be VALID JSON ONLY. No extra text. No markdown. No code fences.
    - Return ONLY this JSON structure: { "marketSignals": [...] }
    - Do NOT return marketSnapshot, behavioralHypotheses, conflictsAndGaps, or synthesisAndNextSteps.
    - You MUST NOT reuse the same domain anywhere in the entire marketSignals output.
    
    SIGNALS (fixed list; return ALL 8, in this exact order):
    1) Existing Workarounds
    2) Direct and Possible Competitors
    3) Social Media Trending (TikTok/Instagram/etc.)
    4) Cost-Per-Attention Signals
    5) Channel-Idea Fit
    6) Share Triggers
    7) Market Sophistication Level
    8) Objection Density
    
    GLOBAL UNIQUENESS — HARD CONSTRAINT:
    - Each signal MUST have EXACTLY 2 sources.
    - Therefore the full response MUST contain EXACTLY 16 sources TOTAL.
    - Each of those 16 sources MUST be from a DIFFERENT domain (hostname).
    - This means: 16 sources => 16 unique domains. No exceptions.
    - If you cannot find evidence for a signal without reusing a domain:
      - still output the signal,
      - but use evidenceType="directional" for BOTH sources,
      - and set strength="low".
      - DO NOT reuse any domain to “fill the gap”.
    
    BANNED DOMAINS:
    - Do NOT use any domain in this banned list (domains already used in hypotheses evidence):
    ${JSON.stringify(bannedDomains, null, 2)}
    
    SIGNAL-APPROPRIATE SOURCE REQUIREMENTS (prevents “Pelago everywhere”):
    - Existing Workarounds: local ordering behavior, informal solutions, delivery groups, WhatsApp/Facebook groups, local directories.
    - Competitors: apps/sites offering similar value, app store listings, local platforms, restaurant delivery apps, entertainment-food apps.
    - Social Media Trending: TikTok/IG hashtags, creator posts, comment sections, trend pages (must clearly show trend behavior).
    - Cost-Per-Attention: ad libraries, ad rate benchmarks, campaign case studies, CPM/CPC references, app install benchmarks.
    - Channel–Idea Fit: channels where the target audience is already converting (creator affiliate funnels, food pages, game loops, promo mechanics).
    - Share Triggers: explicit “I shared this / tag a friend / sent to my group” behavior in comments/reviews/posts.
    - Market Sophistication: evidence users compare options, know pricing, expect UX features, talk about quality/service metrics.
    - Objection Density: complaints, friction, “too expensive”, “slow delivery”, “not worth it”, “trust/safety”, “payment issues”.
    
    QUALITY RULES (behavioral-first, but honest):
    - PRIORITIZE: real user comments, reviews, community threads, app store reviews, forum discussions, YouTube comments.
    - USE quantitative only when it fits the signal (esp. cost-per-attention, competitors).
    - DEPRIORITIZE: generic SEO listicles, press releases, “things to do” tourism pages, aggregator activity pages.
    - Each evidenceSnippet MUST read like a real observation (complaint, desire, behavior) OR a concrete metric.
    
    IMPORTANT ANTI-REUSE RULES:
    - Do NOT reuse the same “brand/entity” as the core evidence across multiple signals unless it is truly unavoidable.
      Example: If you cite a cooking-class marketplace for Social Trend, you cannot cite the same marketplace again for Channel Fit or Share Triggers.
    - Do NOT “reframe the same page” as multiple signals. Each signal must be supported by distinct domains and distinct contexts.
    
    EVIDENCE SNIPPETS:
    - Provide exactly 2 evidenceSnippets per signal.
    - Each snippet <= 160 characters.
    - Snippet 1 must correspond to source 1; snippet 2 to source 2.
    
    OUTPUT FORMAT (exact; no extra keys):
    {
      "marketSignals": [
        {
          "type": "existing_workarounds|competitors|social_trend|cost_per_attention|channel_fit|share_triggers|market_sophistication|objection_density",
          "title": "short title",
          "summary": "what the signal indicates (<= 280 chars)",
          "classification": "short classification label",
          "evidenceSnippets": ["<=160 chars", "<=160 chars"],
          "sources": [
            { "title": "", "url": "", "evidenceType": "behavioral|quantitative|stated|directional" },
            { "title": "", "url": "", "evidenceType": "behavioral|quantitative|stated|directional" }
          ],
          "strength": "low|medium|high"
        }
      ]
    }
    
    MANDATORY SELF-CHECK BEFORE YOU RETURN (do this silently):
    1) Count sources: must be 16 total.
    2) Extract hostnames from all 16 URLs: must be 16 unique hostnames.
    3) None of the hostnames appear in bannedDomains.
    4) Signals are in the required order and all 8 are present.
    5) evidenceSnippets match their source order.
    
    ${getLanguageInstruction(language)}
    
    IDEA:
    TITLE: ${idea.title}
    DESCRIPTION (compact): ${compactDescription}
    KEYWORDS: ${keywords}
    TAGS: ${(idea.tags || []).join(', ')}
    
    Return JSON ONLY.
    `.trim()

    
  return callResponsesJSON(
    {
      model: DEEP_MODEL,
      max_tool_calls: 24,
      max_output_tokens: 9000,
      tools: [{ type: 'web_search_preview', search_context_size: 'medium' }],
      input: prompt,
    },
    headers
  )
}

/**
 * Step C: FAST synthesis (no web)
 * Builds ONLY conflictsAndGaps + synthesisAndNextSteps from:
 * - marketSnapshot
 * - enrichedHypotheses (with sources)
 * - researched marketSignals (with sources)
 *
 * IMPORTANT: marketSignals are NOT generated here.
 */
async function synthesizeFinalNoMarketSignals(
  idea: IdeaContext,
  language: 'en' | 'es',
  marketSnapshot: any,
  enrichedHypotheses: any[],
  researchedMarketSignals: any[],
  headers: Record<string, string>
): Promise<Pick<MarketValidationResult, 'conflictsAndGaps' | 'synthesisAndNextSteps'>> {
  const prompt = `
You are a Market Validation Analyst.

TASK:
Using ONLY the provided marketSnapshot + behavioralHypotheses (with supportingSources) + marketSignals (with sources),
derive:
- conflictsAndGaps
- synthesisAndNextSteps

HARD RULES:
- Do NOT browse the web.
- Do NOT invent new URLs.
- Output MUST be valid JSON ONLY. No extra text. No markdown.

OUTPUT LIMITS:
- synthesisAndNextSteps:
  - strongPoints: max 5
  - weakPoints: max 5
  - keyUnknowns: max 6
  - suggestedNextSteps: max 7 (each is a 48–72h test)
  - pivotGuidance: max 4

Return JSON with EXACTLY this structure (no extra keys):
{
  "conflictsAndGaps": {
    "contradictions": [
      { "type": "contradiction", "description": "", "relatedSignals": [""] }
    ],
    "missingSignals": [
      { "type": "missing_signal", "description": "" }
    ],
    "riskFlags": [
      { "type": "risk_flag", "description": "" }
    ]
  },
  "synthesisAndNextSteps": {
    "strongPoints": [""],
    "weakPoints": [""],
    "keyUnknowns": [""],
    "suggestedNextSteps": [""],
    "pivotGuidance": [""]
  }
}

${getLanguageInstruction(language)}

INPUTS:
marketSnapshot:
${JSON.stringify(marketSnapshot, null, 2)}

behavioralHypotheses (enriched):
${JSON.stringify(enrichedHypotheses, null, 2)}

marketSignals (researched, treat as additional evidence):
${JSON.stringify(researchedMarketSignals, null, 2)}
`.trim()

  return callResponsesJSON(
    {
      model: LIGHT_MODEL,
      input: prompt,
      max_output_tokens: 2600,
      temperature: 0.2,
      text: { format: { type: 'json_object' } },
    },
    headers
  )
}

export async function runMarketValidationSingleCall(
  idea: IdeaContext,
  language: 'en' | 'es'
): Promise<MarketValidationResult> {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY_MISSING')

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${OPENAI_API_KEY}`,
  }
  if (OPENAI_ORG_ID) headers['OpenAI-Organization'] = OPENAI_ORG_ID

  const { compactDescription, keywords } = processIdeaDescription({
    title: idea.title,
    description: idea.description || '',
    tags: idea.tags,
  })

  // A) fast draft
  const draft = await draftSnapshotAndHypotheses(
    idea,
    language,
    compactDescription,
    keywords,
    headers
  )

  // B1) deep research evidence for hypotheses ONLY (prompt unchanged)
  const enriched = await deepResearchHypothesesEvidence(
    idea,
    language,
    compactDescription,
    keywords,
    draft.behavioralHypotheses,
    headers
  )

  // B2) deep research marketSignals evidence (NEW)
  const bannedDomains = collectDomainsFromHypotheses(enriched.behavioralHypotheses)
  const researchedSignals = await deepResearchMarketSignals(
    idea,
    language,
    compactDescription,
    keywords,
    bannedDomains,
    headers
  )

  // C) fast synthesis from enriched hypotheses + researched marketSignals (NO marketSignals generation here)
  const synthesized = await synthesizeFinalNoMarketSignals(
    idea,
    language,
    draft.marketSnapshot,
    enriched.behavioralHypotheses,
    researchedSignals.marketSignals,
    headers
  )

  const finalResult: MarketValidationResult = {
    marketSnapshot: draft.marketSnapshot,
    behavioralHypotheses: enriched.behavioralHypotheses,
    marketSignals: researchedSignals.marketSignals, // <-- researched in Step B now
    conflictsAndGaps: synthesized.conflictsAndGaps,
    synthesisAndNextSteps: synthesized.synthesisAndNextSteps,
    searchData: {
      googleResults: [],
      googleTrends: [],
      bingResults: [],
    },
    timestamp: new Date(),
    version: 1,
  }

  validateMinimalShape(finalResult)
  return finalResult
}
