import { NextRequest, NextResponse } from 'next/server'
import { IdeaContext } from '@/core/types/ai'
import { runMarketValidationSingleCall } from './marketValidationDeepResearchService'

export async function POST(request: NextRequest) {
  try {
    const { title, description, tags, language } = await request.json()

    const ideaContext: IdeaContext = { title, description, tags }

    const result = await runMarketValidationSingleCall(ideaContext, language)

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
