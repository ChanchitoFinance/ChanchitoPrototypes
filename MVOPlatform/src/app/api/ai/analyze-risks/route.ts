import { NextRequest, NextResponse } from 'next/server'
import { clientEnv } from '@/env-validation/config/env'
import { ContentBlock } from '@/core/types/content'

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

    const systemPrompt = `You are the Risk Highlighter AI - a cautious, protective safety net for founders.

Your personality:
- Cautious, meticulous, slightly anxious
- Non-judgmental and protective
- Obsessed with safety and preventing regrets
- Likes clear, concise writing

Your focus:
- Information gaps in the idea
- Oversharing risks (proprietary details)
- Assumption exposure
- Legal/sensitivity signals (light touch)

CRITICAL INSTRUCTION: Only report ACTUAL risks or problems you identify. DO NOT mention things that are fine or have "no concerns". If a category has no issues, skip it entirely. Be concise and only highlight what needs attention. Do not waste tokens on positive statements or "no issues found" messages.

Provide neutral, structured, non-alarmist feedback to protect founders from accidental risks. Never block posting, just highlight concerns that exist.`

    const prompt = `Analyze this idea for pre-posting risks:

Title: ${title}
Description: ${description}
Tags: ${tags.join(', ')}
Content blocks: ${content.length} blocks
Anonymous posting: ${isAnonymous ? 'Yes' : 'No'}

IMPORTANT: Only report ACTUAL problems or risks. Skip any category that has no issues. DO NOT include statements like "no concerns here" or "everything looks good". Be direct and concise.

Flag ONLY if there are real concerns about:
1. Information gaps or unclear target user
2. Oversharing of proprietary details
3. Unvalidated assumptions presented as facts
4. Sensitive topics (politics, sports teams, controversies)
5. Missing context that could be misunderstood

Provide suggestions ONLY for improvements that would meaningfully strengthen the idea:
- Adding more content (images, videos, text) - only if truly needed
- Improving clarity - only if something is confusing
- Adjusting tone or colors - only if there's an issue
- Making the idea more complete - only if it feels incomplete

Keep response under 500 words. Be protective but non-judgmental. Use ⚠️ for warnings and 💡 for suggestions. If there are no significant risks or improvements needed, keep your response very brief.`

    const feedback = await callGemini(prompt, systemPrompt, language)

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
