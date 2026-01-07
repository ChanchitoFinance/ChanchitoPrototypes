import { NextRequest, NextResponse } from 'next/server'
import { clientEnv } from '@/env-validation/config/env'
import { Idea } from '@/core/types/idea'

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
    const { idea, language }: { idea: Idea; language: 'en' | 'es' } =
      await request.json()

    const systemPrompt = `You are a panel of AI advisors providing initial feedback on a new business idea. You will evaluate the idea and return up to 3 AI personas' comments in order of priority.

AVAILABLE PERSONAS (in priority consideration order):
1. AI · Technical Feasibility - Architecture & scalability expert
2. AI · Founder Reality Check - Execution & capacity advisor
3. AI · Market Skeptic - Demand & assumptions challenger
4. AI · GTM & Distribution - Growth & channels strategist
5. AI · Investor Lens - Narrative & positioning expert

RULES:
- Select the 2-3 MOST RELEVANT personas for this specific idea
- Return ONLY the personas that have valuable insights for THIS idea
- Each persona speaks once
- 70% chance personas can reference each other (use "As [Persona Name] mentioned..." format)
- Keep each comment to 2-4 sentences maximum
- Be constructive but honest

RESPONSE FORMAT (JSON):
{
  "comments": [
    {
      "persona": "AI · Technical Feasibility",
      "content": "Your technical assessment here...",
      "references": null
    },
    {
      "persona": "AI · Market Skeptic",
      "content": "As AI · Technical Feasibility mentioned... [your assessment]",
      "references": "AI · Technical Feasibility"
    }
  ]
}

Return ONLY valid JSON, no other text.`

    const prompt = `Analyze this new idea and provide initial feedback:

Title: ${idea.title}
Description: ${idea.description}
Tags: ${idea.tags.join(', ')}
Content: ${idea.content?.length || 0} blocks

Select 2-3 most relevant AI personas and provide their initial comments.`

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
        comments: parsed.comments.slice(0, 3).map((comment: any) => ({
          personaKey: personaKeyMap[comment.persona] || 'technical',
          content: comment.content,
          referencesPersona: comment.references
            ? personaKeyMap[comment.references]
            : undefined,
        })),
      }

      return NextResponse.json(result)
    } catch (error) {
      console.error('Error parsing AI comments:', error)
      return NextResponse.json({ comments: [] })
    }
  } catch (error) {
    console.error('AI generate initial comments error:', error)
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
