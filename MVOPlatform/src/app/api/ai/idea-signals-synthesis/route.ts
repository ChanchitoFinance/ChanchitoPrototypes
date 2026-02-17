import { NextRequest, NextResponse } from 'next/server'
import { runIdeaSignalsSynthesis } from './ideaSignalsSynthesisService'
import type { IdeaDecisionEvidence } from '@/core/types/analytics'
import type { MarketValidationResult } from '@/core/types/ai'
import type { ContentBlock } from '@/core/types/content'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      ideaId,
      ideaVersionNumber,
      title,
      decision_making,
      content,
      decisionEvidence,
      marketValidation,
      language = 'en',
    } = body as {
      ideaId: string
      ideaVersionNumber: number
      title: string
      decision_making: string
      content: ContentBlock[]
      decisionEvidence: IdeaDecisionEvidence | null
      marketValidation: MarketValidationResult | null
      language?: 'en' | 'es'
    }

    if (!ideaId || ideaVersionNumber == null || !title) {
      return NextResponse.json(
        { error: 'Missing ideaId, ideaVersionNumber, or title' },
        { status: 400 }
      )
    }

    const synthesis = await runIdeaSignalsSynthesis(
      {
        idea: {
          title,
          decision_making: decision_making ?? '',
          content: Array.isArray(content) ? content : [],
        },
        decisionEvidence: decisionEvidence ?? null,
        marketValidation: marketValidation ?? null,
      },
      language === 'es' ? 'es' : 'en'
    )

    return NextResponse.json({
      synthesis,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Idea signals synthesis error:', error)
    const message = error instanceof Error ? error.message : 'Synthesis failed'
    const status =
      message === 'AI_RATE_LIMIT_EXCEEDED' ? 429 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
