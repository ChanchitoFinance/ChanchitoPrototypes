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
      response_format: { type: 'json_object' },
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
      allComments,
      mentionComment,
      mentionedPersonas,
      language,
    }: {
      idea: Idea
      allComments: Comment[]
      mentionComment: Comment
      mentionedPersonas: string[]
      language: 'en' | 'es'
    } = await request.json()

    const personaNames: Record<string, string> = {
      technical: 'AI · The Architect',
      founder: 'AI · The Delivery Lead',
      market: 'AI · The Challenger',
      gtm: 'AI · The Strategist',
      investor: 'AI · The Capital Lens',
    }

    const systemPrompt = `You are responding to a user who mentioned you in a comment thread. Provide helpful, contextual responses.

MENTIONED PERSONAS: ${mentionedPersonas.map(p => personaNames[p]).join(', ')}

RULES:
- Each mentioned persona responds once
- Keep responses to 2-4 sentences
- Be helpful and address the user's specific question/comment
- Personas CAN reference each other if relevant (70% chance)
- Use "As [Persona Name] mentioned..." if referencing another persona

RESPONSE FORMAT (JSON):
{
  "responses": [
    {
      "persona": "AI · The Architect",
      "content": "Your response here...",
      "references": null
    }
  ]
}

Return ONLY valid JSON, no other text.`

    const commentsContext = allComments
      .slice(0, 10)
      .map(c => `${c.author}: ${c.content}`)
      .join('\n')

    const prompt = `Context:
Idea: ${idea.title}
Description: ${idea.description}

Recent Comments:
${commentsContext}

User's Comment (mentioning you): ${mentionComment.content}

Provide responses from the mentioned personas: ${mentionedPersonas.map(p => personaNames[p]).join(', ')}`

    const response = await callOpenAI(systemPrompt, prompt, language)

    const cleanedResponse = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    try {
      const parsed = JSON.parse(cleanedResponse)

      const personaKeyMap: Record<string, string> = {
        'AI · The Architect': 'technical',
        'AI · The Delivery Lead': 'founder',
        'AI · The Challenger': 'market',
        'AI · The Strategist': 'gtm',
        'AI · The Capital Lens': 'investor',
      }

      const result = {
        responses: parsed.responses.map((response: any) => ({
          personaKey: personaKeyMap[response.persona] || mentionedPersonas[0],
          content: response.content,
          referencesPersona: response.references
            ? personaKeyMap[response.references]
            : undefined,
        })),
      }

      return NextResponse.json(result)
    } catch (error) {
      console.error('Error parsing AI responses:', error)
      return NextResponse.json({ responses: [] })
    }
  } catch (error) {
    console.error('AI respond to mention error:', error)
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
