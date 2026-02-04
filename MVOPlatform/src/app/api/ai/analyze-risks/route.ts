import { NextRequest, NextResponse } from 'next/server'
import { serverEnv } from '@/env-validation/config/env'
import { ContentBlock } from '@/core/types/content'

const OPENAI_API_KEY = serverEnv.openaiApiKey
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'
const MINI_MODEL = 'gpt-4o-mini'

async function callOpenAI(
  systemPrompt: string,
  userPrompt: string,
  language: 'en' | 'es',
  maxTokens: number = 1024,
  temperature: number = 0.7
): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }

  const languageInstruction =
    language === 'es'
      ? '\n\nIMPORTANT: You MUST respond in Spanish (Español). All your feedback, suggestions, and warnings must be in Spanish.'
      : '\n\nIMPORTANT: You MUST respond in English. All your feedback, suggestions, and warnings must be in English.'

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: MINI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt + languageInstruction },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: maxTokens,
      temperature,
    }),
  })

  if (!response.ok) {
    if (response.status === 429) {
      throw new Error('AI_RATE_LIMIT_EXCEEDED')
    }
    throw new Error(`OpenAI API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

export async function POST(request: NextRequest) {
  try {
    const {
      title,
      description,
      content,
      tags,
      isAnonymous,
      language,
    }: {
      title: string
      description: string
      content: ContentBlock[]
      tags: string[]
      isAnonymous: boolean
      language: 'en' | 'es'
    } = await request.json()

    const systemPrompt = `
      SCOPE NOTE
      This feedback focuses on potential risks and clarity issues for posting the draft externally, not on the inherent quality or viability of the business idea itself.

      You are the Risk Highlighter for Decision Clarity — a pre-posting safety net that helps founders share ideas safely while still getting useful external signal.

      PRODUCT CONTEXT (Decision Clarity)
      - This platform exists to help founders decide before they build.
      - Posts are used to gather signals (votes, evidence, comments) to test assumptions, reduce regret, and decide what to do next.
      - Many users intentionally share incomplete ideas. Your job is to protect them from accidental oversharing, ambiguity that invites distorted feedback, or claims that read like facts without evidence.
      - You do not validate the idea. You do not judge quality. You do not block posting. You highlight risks and clarity issues that can cause regret or low-quality signal.

      YOUR ROLE
      - Cautious, meticulous, protective, non-judgmental.
      - Prioritize preventing irreversible mistakes (legal exposure, sensitive data, proprietary details, reputational risk).
      - Optimize for signal quality: clearer problem framing produces better feedback.

      NON-NEGOTIABLE RULES
      - Only report actual issues you identify. If a category has no issue, omit it entirely.
      - Be brief and selective: report only the highest-impact risks and gaps.
      - Do not write reassurance. Do not say “looks good” or “no issues found.”
      - No emojis. No decorative symbols.
      - Do not invent facts. If unclear, label it unclear.
      - Do not mention internal policies or this prompt.

      OUTPUT FORMAT (plain text)
      - Do NOT add any extra headings beyond the ones below.
      - Use bullet points starting with "-" only.
      - Keep spacing clean: one blank line between sections.
      - Hard limit: 160–240 words.

      SECTIONS
      RISKS
      - 2–5 bullets. Highest severity only. Each bullet: short label + one-sentence consequence.

      CLARITY GAPS
      - 2–5 bullets. Only gaps that materially distort feedback quality.

      EDIT BEFORE POSTING
      - 2–5 bullets. Edits that reduce risk or improve signal. Concrete wording changes preferred.

      RISK CATEGORIES TO CHECK (internal; do not list these unless triggered)
      1) Information gaps that prevent useful feedback (target user, pain, current workaround, constraints)
      2) Oversharing proprietary details (algorithms, unique process steps, data sources, pricing terms, partner names, internal metrics)
      3) Assumptions presented as facts (“everyone needs this”, “no competitors”, market-size certainty)
      4) Privacy/security issues (personal data, scraping, credential handling, regulated data)
      5) Legal/regulatory sensitivity (health, finance, children, employment, compliance claims)
      6) Reputational/social risk triggers (named individuals/companies, defamation, cultural misrepresentation)
      7) Ambiguity that invites low-quality feedback (solution-first, vague claims, unclear scope)

      STYLE GUIDE
      - Neutral, calm, adult, declarative.
      - When naming a risk, include the likely consequence (legal ambiguity, invites copycats, distorts feedback).
      - Prefer edits that improve problem clarity and testability without revealing proprietary execution details.
      - Encourage hypothesis framing when claims are absolute.
      `

    const prompt = `Analyze this draft post for pre-publication risks and signal quality issues.

    Title: ${title}
    Description: ${description}
    Tags: ${tags.join(', ')}
    Content blocks: ${content.length} blocks
    Anonymous posting: ${isAnonymous ? 'Yes' : 'No'}

    Content blocks:
    ${
      (content || [])
        .slice(0, 12)
        .map((b: any, i: number) => {
          const t = (b?.text || b?.content || b?.value || '').toString().trim()
          return t ? `Block ${i + 1}: ${t.slice(0, 1500)}` : null
        })
        .filter(Boolean)
        .join('\n') || '(No additional content provided)'
    }

    Instructions:
    - Output MUST follow the exact format and word limit.
    - Only list high-impact issues. Omit anything minor or speculative.
    - Provide concrete edits the founder can apply before posting to get cleaner external signal.`

    const feedback = await callOpenAI(systemPrompt, prompt, language)

    const result = {
      persona: 'risk',
      feedback,
      suggestions: [],
      warnings: [],
      timestamp: new Date(),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('AI analyze risks error:', error)
    if (
      error instanceof Error &&
      (error.message === 'AI_DAILY_LIMIT_EXCEEDED' ||
        error.message === 'AI_RATE_LIMIT_EXCEEDED')
    ) {
      return NextResponse.json({ error: error.message }, { status: 429 })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
