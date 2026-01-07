import { NextRequest, NextResponse } from 'next/server'
import { clientEnv } from '@/env-validation/config/env'
import { Idea } from '@/core/types/idea'
import { Comment } from '@/core/types/comment'

const GEMINI_API_KEY = clientEnv.geminiApiKey
const GEMINI_MODEL = clientEnv.geminiModel

async function callGemini(
  prompt: string,
  systemPrompt: string,
  language: 'en' | 'es'
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured')
  }

  const languageInstruction =
    language === 'es'
      ? '\n\nIMPORTANT: You MUST respond in Spanish (Español). All your feedback, suggestions, and warnings must be in Spanish.'
      : '\n\nIMPORTANT: You MUST respond in English. All your feedback, suggestions, and warnings must be in English.'

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: systemPrompt + languageInstruction + '\n\n' + prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      }),
    }
  )

  if (!response.ok) {
    const errorData = await response.json()
    if (errorData.error?.code === 429) {
      const isDailyLimit =
        errorData.error?.message?.includes('daily') ||
        errorData.error?.message?.includes('quota') ||
        !errorData.error?.details?.find(
          (detail: any) =>
            detail['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
        )

      if (isDailyLimit) {
        throw new Error('AI_DAILY_LIMIT_EXCEEDED')
      }
      throw new Error('AI_RATE_LIMIT_EXCEEDED')
    }
    throw new Error(`Gemini API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
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
      technical: 'AI · Technical Feasibility',
      founder: 'AI · Founder Reality Check',
      market: 'AI · Market Skeptic',
      gtm: 'AI · GTM & Distribution',
      investor: 'AI · Investor Lens',
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
      "persona": "AI · Technical Feasibility",
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

    const response = await callGemini(prompt, systemPrompt, language)

    const cleanedResponse = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    try {
      const parsed = JSON.parse(cleanedResponse)

      const personaKeyMap: Record<string, string> = {
        'AI · Technical Feasibility': 'technical',
        'AI · Founder Reality Check': 'founder',
        'AI · Market Skeptic': 'market',
        'AI · GTM & Distribution': 'gtm',
        'AI · Investor Lens': 'investor',
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
