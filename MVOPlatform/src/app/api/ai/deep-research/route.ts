import { NextRequest, NextResponse } from 'next/server'
import { runMarketValidationPipeline } from './services/openaiService'
import { IdeaContext } from '@/core/types/ai'
import { runDeepResearch } from './services/ingestionService'

export async function POST(request: NextRequest) {
  try {
    const { title, description, tags, language } = await request.json()

    const ideaContext: IdeaContext = { title, description, tags }

    // Phase 1: AI deep research
    const chunks = await runDeepResearch(ideaContext, language)

    // Phase 2: Synthesis
    const result = await runMarketValidationPipeline(
      chunks,
      [],
      ideaContext,
      language
    )

    return NextResponse.json({
      ...result,
      timestamp: new Date(),
      version: 2,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: 'Market validation failed' },
      { status: 500 }
    )
  }
}
