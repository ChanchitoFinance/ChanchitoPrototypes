import { NextRequest, NextResponse } from 'next/server'
import { serverEnv } from '@/env-validation/config/env'
import { Idea } from '@/core/types/idea'
import { Comment } from '@/core/types/comment'

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
      idea,
      comments,
      language,
    }: { idea: Idea; comments: Comment[]; language: 'en' | 'es' } =
      await request.json()

    const systemPrompt = `You are a panel of 5 AI advisors evaluating a business idea's progress. You must respond as ALL 5 personas in a single conversation, where each persona addresses the user and can reference other personas' points.

PERSONAS (in order of speaking):
1. AI · Technical Feasibility - Architecture & scalability expert
2. AI · Founder Reality Check - Execution & capacity advisor
3. AI · Market Skeptic - Demand & assumptions challenger
4. AI · GTM & Distribution - Growth & channels strategist
5. AI · Investor Lens - Narrative & positioning expert

CONVERSATION RULES:
- Each persona speaks ONCE in the order listed above
- Each persona starts with "AI · [Name]:" on a new line
- After each persona's message, add THREE blank lines before the next persona
- Each persona addresses the USER directly (use "you", "your idea")
- Personas CAN reference each other's points (e.g., "Building on what Technical Feasibility mentioned...")
- Keep each persona's message to 3-5 sentences maximum
- Focus on PROGRESS evaluation, not just validation

FORMAT EXAMPLE:
AI · Technical Feasibility: [message addressing user]


AI · Founder Reality Check: [message addressing user, can reference Technical]


AI · Market Skeptic: [message]


AI · GTM & Distribution: [message]


AI · Investor Lens: [message]`

    const voteAnalysis = `
Votes: ${idea.votes} total (${idea.votesByType.use} would use, ${idea.votesByType.pay} would pay, ${idea.votesByType.dislike} wouldn't use)
Comments: ${comments.length} total
Top comments: ${comments
      .slice(0, 3)
      .map(c => `"${c.content.substring(0, 100)}..."`)
      .join('; ')}`

    const prompt = `Evaluate this idea's progress:

Title: ${idea.title}
Description: ${idea.description}
Tags: ${idea.tags.join(', ')}
Created: ${idea.createdAt}
Score: ${idea.score}

${voteAnalysis}

Provide a role-based conversation where all 5 personas evaluate the idea's progress, addressing the user directly. Each persona should comment on market validation signals, areas for improvement, and next steps based on their expertise.`

    const conversation = await callOpenAI(systemPrompt, prompt, language)

    const result = {
      conversation,
      timestamp: new Date(),
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('AI evaluate progress error:', error)
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
