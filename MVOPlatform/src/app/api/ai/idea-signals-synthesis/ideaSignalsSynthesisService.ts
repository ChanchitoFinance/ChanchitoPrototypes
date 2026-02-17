/**
 * Idea Signals Synthesis — Decision Clarity master synthesis
 * Builds input bundle (idea + decision evidence + market validation), calls OpenAI,
 * returns structured synthesis (decision framing, signal summary, risks, recommendation, etc.)
 */

import { serverEnv } from '@/env-validation/config/env'
import type { IdeaSignalsSynthesisResult } from '@/core/types/ai'
import type { IdeaDecisionEvidence } from '@/core/types/analytics'
import type { ContentBlock } from '@/core/types/content'
import type { MarketValidationResult } from '@/core/types/ai'

const OPENAI_API_KEY = serverEnv.openaiApiKey
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'
const MODEL = 'gpt-4o-mini'

export interface SynthesisInputBundle {
  idea: {
    title: string
    decision_making: string
    content: ContentBlock[]
  }
  decisionEvidence: IdeaDecisionEvidence | null
  marketValidation: MarketValidationResult | null
}

function buildInputSpec(): string {
  return `
The JSON bundle you receive contains:

1. idea: { title, decision_making, content }
   - title: string
   - decision_making: string (the decision question)
   - content: array of content blocks (type, content, size, etc.)

2. decisionEvidence: internal signals for this idea (or null)
   - totalVotes, voteTypeBreakdown (use, dislike, pay)
   - detailViews, avgDwellTimeMs, medianDwellTimeMs, scrollDepthPct, returnRate
   - timeToFirstSignalSec, timeToFirstCommentSec, voteLatencyAvgSec
   - pctVotesAfterComment, earlyExitRatePct, highDwellNoVotePct
   - voteChangeOverTime (array of { date, use, dislike, pay, total })
   - dwellDistribution, segments (First-time vs Returning viewers with signals, avgDwellMs, voteTypePct)

3. marketValidation: external signals (or null)
   - marketSnapshot: customer segment, market context, geography, timing
   - behavioralHypotheses: layers existence → pay_intention with evidence, confidence
   - marketSignals: array of { type, title, summary, strength, evidenceSnippets, sources }
   - conflictsAndGaps: contradictions, missingSignals, riskFlags
   - synthesisAndNextSteps: strongPoints, weakPoints, keyUnknowns, suggestedNextSteps
`
}

function getSystemPrompt(): string {
  return `You are an evidence synthesizer for Decision Clarity. You do not validate ideas. You help users decide what to do next before irreversible work.

Context
The idea in the bundle is for an app, product, or solution that does not yet exist. Do not require or expect external evidence of the proposed product itself. Your job is to reduce uncertainty and surface signals clearly so the user can decide before committing to build or an MVP.

Non-negotiables
- No hype. No emojis. No exclamation marks.
- Do not claim certainty. Do not invent facts.
- Treat internal community signals as noisy and biased. Treat external signals as incomplete and context-dependent.
- Do not recommend building. Recommend a decision path: wait, test, narrow, pivot, or commit.
- Preserve reversibility. If evidence is weak, say so.
- Humans > AI. AI is advisory.

Input
You will receive a JSON bundle with:
${buildInputSpec()}

Task
Produce a decision synthesis that:
- states what is known vs unknown,
- compares internal belief vs external evidence,
- highlights the highest-risk assumptions,
- recommends the next action that most reduces uncertainty per unit effort.

Output schema (strict)
- Respond with a single valid JSON object only. No markdown code fence, no trailing commas.
- Every key must have a STRING value. Do not use arrays or nested objects for any key.
- Formatting rules for all string values:
  * Use markdown: **bold** for labels, "- " for list items.
  * One list item per line. Use newlines (\\n) between items, never join bullets with commas or ".,".
  * End each sentence with a single period. Never write ".," or "..".
  * Write in clear, grammatical sentences. Avoid run-on sentences.

Exact keys and structure (each value is a single string):

1) decisionFraming: One string containing:
   - A line "**Decision:** " plus the decision statement.
   - A line "**What makes this costly to reverse:**" then 1-3 bullets on separate lines (each line: "- " then text ending with a period).
   - A line "**Current confidence:**" then Low/Medium/High with brief justification.

2) signalSummary: One string with short paragraphs or bullets: Internal signal strength (Weak/Mixed/Strong and why). External signal strength and why. Signal alignment (Aligned/Conflicted/Insufficient). Use newlines between parts.

3) whatSignalsSay: One string with exactly 5-8 bullets. Each bullet on its own line: "- " then the point (cite signal type: internal votes, comments, dwell, external research, etc.). End each bullet with a period. Do not join bullets with commas or ".,".

4) keyRisksAndAssumptions: One string. Structure exactly like the UI expects. For each of 3-5 risks, output this exact sequence on separate lines (one risk after another, separate risks with a blank line):
**Risk:** [One sentence describing the risk.]
**Why it matters:** [One sentence.]
**Evidence for/against:** [One sentence.]
**How to reduce:** [One sentence.]
Use only these four labels per risk. At least 2 risks must be about demand, willingness to pay, distribution, or target clarity.

5) recommendation: One string. Use exactly these labels on their own line so the UI can parse them: **Path:** (exactly one of: Wait and clarify | Run targeted validation test | Narrow scope | Pivot | Commit to MVP). Then **Why:** (one sentence). **Success in 7-14 days:** (one sentence). **Failure / stop conditions:** (one sentence). **If mixed:** (one sentence).

6) founderSafeSummary: One string. A short closing paragraph (2-4 sentences). Normalize uncertainty; state the single most important next step; remind that no decision is locked.

Reasoning rules
- Weight signals by reliability: External tests with clear audience > internal votes. High dwell + deep scroll > shallow views. "Pay" votes require higher scrutiny than "Use". Small samples and short windows lower confidence.
- Detect bias: Early adopter bias, community bias, novelty bias, selection bias.
- Avoid false precision: If n is small, say "insufficient."
- Be explicit about missing data: "We cannot conclude X because Y is missing."

Output only valid JSON with keys: decisionFraming, signalSummary, whatSignalsSay, keyRisksAndAssumptions, recommendation, founderSafeSummary.`
}

export function buildInputBundle(bundle: SynthesisInputBundle): string {
  return JSON.stringify(
    {
      idea: bundle.idea,
      decisionEvidence: bundle.decisionEvidence,
      marketValidation: bundle.marketValidation
        ? {
            marketSnapshot: bundle.marketValidation.marketSnapshot,
            behavioralHypotheses: bundle.marketValidation.behavioralHypotheses,
            marketSignals: bundle.marketValidation.marketSignals,
            conflictsAndGaps: bundle.marketValidation.conflictsAndGaps,
            synthesisAndNextSteps:
              bundle.marketValidation.synthesisAndNextSteps,
          }
        : null,
    },
    null,
    2
  )
}

/** Convert any value to a displayable string; never return "[object Object]". */
function valueToDisplayString(v: unknown): string {
  if (v == null) return ''
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  if (Array.isArray(v)) {
    const parts = v.map(item => valueToDisplayString(item)).filter(Boolean)
    return parts.join('\n\n')
  }
  if (typeof v === 'object') {
    const obj = v as Record<string, unknown>
    const text =
      obj.text ?? obj.content ?? obj.summary ?? obj.message ?? obj.value
    if (text != null) return valueToDisplayString(text)
    const values = Object.values(obj).map(valueToDisplayString).filter(Boolean)
    return values.join('\n\n')
  }
  return String(v)
}

function parseSynthesisResponse(text: string): IdeaSignalsSynthesisResult {
  const raw = text.trim()
  const jsonStr = raw.replace(/^```json\s*/i, '').replace(/\s*```\s*$/, '')
  const parsed = JSON.parse(jsonStr) as Record<string, unknown>

  const getStr = (key: string): string => {
    const v = parsed[key] ?? parsed[key.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '')]
    return valueToDisplayString(v)
  }

  return {
    decisionFraming: getStr('decisionFraming'),
    signalSummary: getStr('signalSummary'),
    whatSignalsSay: getStr('whatSignalsSay'),
    keyRisksAndAssumptions: getStr('keyRisksAndAssumptions'),
    recommendation: getStr('recommendation'),
    founderSafeSummary: getStr('founderSafeSummary'),
  }
}

export async function runIdeaSignalsSynthesis(
  bundle: SynthesisInputBundle,
  language: 'en' | 'es'
): Promise<IdeaSignalsSynthesisResult> {
  if (!OPENAI_API_KEY) throw new Error('OPENAI_API_KEY_MISSING')

  const langInstruction =
    language === 'es'
      ? 'Respond in Spanish. All section content must be in Spanish.'
      : 'Respond in English. All section content must be in English.'

  const userMessage = `Language: ${langInstruction}\n\nJSON bundle:\n${buildInputBundle(bundle)}`

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: getSystemPrompt() },
        { role: 'user', content: userMessage },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
    }),
  })

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}))
    if (response.status === 429) {
      const e = new Error('AI_RATE_LIMIT_EXCEEDED')
      ;(e as any).retryAfterSeconds = 60
      throw e
    }
    throw new Error((errJson as any)?.error?.message || 'OpenAI request failed')
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>
  }
  const content =
    data?.choices?.[0]?.message?.content?.trim() ?? ''
  if (!content) throw new Error('Empty synthesis response')

  return parseSynthesisResponse(content)
}
