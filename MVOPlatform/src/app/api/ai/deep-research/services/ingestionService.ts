/**
 * Deep Research Ingestion Service
 * Uses o4-mini-deep-research to autonomously gather market signals
 */

import { serverEnv } from '@/env-validation/config/env'
import { ChunkedContent, IdeaContext } from '@/core/types/ai'

const OPENAI_API_KEY = serverEnv.openaiApiKey
const OPENAI_API_URL = 'https://api.openai.com/v1/responses'
const DEEP_MODEL = 'o4-mini-deep-research'

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

export async function runDeepResearch(
  idea: IdeaContext,
  language: 'en' | 'es'
): Promise<ChunkedContent[]> {
  const instructions = `
You are a market signal researcher for Decision Clarity.

MISSION CONTEXT:
- This platform exists to help founders decide before they build.
- Ideas are EARLY and UNPROVEN.
- Your job is to gather real-world signals, not conclusions.
- Behavioral evidence is preferred over opinions.
- Weak or directional signals are allowed but must be labeled.

RESEARCH GOALS:
- Identify how people currently behave around this problem.
- Look for evidence of pain, workarounds, spending, attention, or avoidance.
- Include forums, communities, blog posts, product pages, reviews, social discussions.
- Avoid SEO fluff and generic startup articles.

EVIDENCE LABELS:
- behavioral: actions, usage, spending, adoption
- quantitative: numbers, metrics, stats
- stated: explicit opinions or claims
- directional: early discussion, indirect interest, emerging awareness

OUTPUT:
Return a JSON object with a "sources" array. Each source must include:
- title
- url
- summary (why it matters)
- evidenceType
- excerpt (short quote or paraphrase)
`.trim()

  const userInput = `
${instructions}

LANGUAGE: ${language}

IDEA TITLE: ${idea.title}
DESCRIPTION: ${idea.description || ''}
TAGS: ${idea.tags.join(', ')}

Research this idea deeply. Expand queries as needed.
Return as many relevant sources as you find, across different evidence strengths.
`.trim()

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: DEEP_MODEL,
      reasoning: { effort: 'medium' },
      max_output_tokens: 6000,

      // Add a data source for deep research
      tools: [{ type: 'web_search_preview' }],

      // Use instructions + input as a single user string
      input: userInput,

      // Replace response_format with text.format
      text: { format: { type: 'json_object' } },
    }),
  })

  console.log('description', idea.description)
  console.log('response', response)

  if (!response.ok) {
    let errJson: any = {}
    try {
      errJson = await response.json()
      console.error('DEEP_RESEARCH_ERROR_BODY', errJson)
    } catch (e) {
      try {
        const errText = await response.text()
        console.error('DEEP_RESEARCH_ERROR_TEXT', errText)
      } catch {
        console.error('DEEP_RESEARCH_ERROR_BODY_UNREADABLE')
      }
    }

    const errorMessage = errJson?.error?.message || ''
    if (
      errorMessage.includes('must be verified') ||
      errorMessage.includes('Verify Organization') ||
      errJson?.error?.code === 'model_not_found'
    ) {
      const verificationError = new Error('ORGANIZATION_VERIFICATION_REQUIRED')
      ;(verificationError as any).details = errJson?.error?.message || 'Organization verification required for deep research models'
      throw verificationError
    }

    throw new Error('DEEP_RESEARCH_FAILED')
  }

  const data = await response.json()

  // Parse reply from data.output -> assistant message -> output_text -> JSON.parse
  const outputText = extractAssistantOutputText(data)
  if (!outputText) {
    console.error('DEEP_RESEARCH_MISSING_OUTPUT_TEXT', data)
    throw new Error('DEEP_RESEARCH_FAILED')
  }

  let parsed: any
  try {
    parsed = JSON.parse(outputText)
  } catch (e) {
    console.error('DEEP_RESEARCH_JSON_PARSE_FAILED', { outputText })
    throw new Error('DEEP_RESEARCH_FAILED')
  }

  // Read sources from parsed JSON (no output_parsed)
  const sources =
    Array.isArray(parsed) ? parsed : Array.isArray(parsed?.sources) ? parsed.sources : []

  return sources.map((s: any) => ({
    title: s.title,
    url: s.url,
    cleanedText: `${s.summary}\nExcerpt: ${s.excerpt}`,
    source: s.evidenceType,
  }))
}