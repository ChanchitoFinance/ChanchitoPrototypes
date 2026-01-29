/**
 * AI Market Validation & Analysis API Route
 *
 * This route implements the new market validation system using:
 * - SerpAPI for web search (Google, Bing, Trends)
 * - OpenAI two-stage pipeline (gpt-4o-mini + gpt-4o) for analysis
 *
 */

import { NextRequest, NextResponse } from 'next/server'
import { serverEnv } from '@/env-validation/config/env'
import {
  GoogleSearchResult,
  GoogleTrendsData,
  BingSearchResult,
  MarketValidationResult,
  IdeaContext,
} from '@/core/types/ai'
import { ingestSearchResults } from './services/ingestionService'
import { runMarketValidationPipeline } from './services/openaiService'

const SERPAPI_API_KEY = serverEnv.serpapiApiKey
const SERPAPI_BASE_URL = 'https://serpapi.com/search.json'

// Retry with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

// Fetch Google Search Results
async function fetchGoogleSearchResults(
  query: string,
  num: number = 10
): Promise<GoogleSearchResult[]> {
  const params = new URLSearchParams({
    engine: 'google',
    q: query,
    api_key: SERPAPI_API_KEY,
    num: num.toString(),
  })

  const response = await fetch(`${SERPAPI_BASE_URL}?${params.toString()}`)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    if (response.status === 429) {
      throw new Error('SERPAPI_RATE_LIMIT')
    }
    throw new Error(
      `Google Search API error: ${response.status} - ${errorData.error || response.statusText}`
    )
  }

  const data = await response.json()
  const organicResults = data.organic_results || []

  return organicResults.slice(0, num).map((result: any, index: number) => ({
    position: index + 1,
    title: result.title || '',
    link: result.link || '',
    snippet: result.snippet || '',
    displayedLink: result.displayed_link || '',
    date: result.date || undefined,
  }))
}

// Fetch Google Trends Data
async function fetchGoogleTrends(query: string): Promise<GoogleTrendsData[]> {
  const params = new URLSearchParams({
    engine: 'google_trends',
    q: query,
    api_key: SERPAPI_API_KEY,
    data_type: 'TIMESERIES',
    date: 'today 12-m',
  })

  const response = await fetch(`${SERPAPI_BASE_URL}?${params.toString()}`)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    if (response.status === 429) {
      throw new Error('SERPAPI_RATE_LIMIT')
    }
    throw new Error(
      `Google Trends API error: ${response.status} - ${errorData.error || response.statusText}`
    )
  }

  const data = await response.json()
  const timelineData = data.interest_over_time?.timeline_data || []

  // Get the most recent 5 data points
  const recentData = timelineData.slice(-5)

  return recentData.map((item: any) => ({
    query: item.values?.[0]?.query || query,
    date: item.date || '',
    value: parseInt(item.values?.[0]?.value || '0', 10),
    extractedValue: item.values?.[0]?.extracted_value || 0,
  }))
}

// Fetch Bing Search Results
async function fetchBingSearchResults(
  query: string
): Promise<BingSearchResult[]> {
  const params = new URLSearchParams({
    engine: 'bing',
    q: query,
    api_key: SERPAPI_API_KEY,
  })

  const response = await fetch(`${SERPAPI_BASE_URL}?${params.toString()}`)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    if (response.status === 429) {
      throw new Error('SERPAPI_RATE_LIMIT')
    }
    throw new Error(
      `Bing Search API error: ${response.status} - ${errorData.error || response.statusText}`
    )
  }

  const data = await response.json()
  const organicResults = data.organic_results || []

  return organicResults.slice(0, 5).map((result: any, index: number) => ({
    position: index + 1,
    title: result.title || '',
    link: result.link || '',
    snippet: result.snippet || '',
    displayedLink: result.displayed_link || '',
    date: result.date || undefined,
  }))
}

export async function POST(request: NextRequest) {
  try {
    const {
      title,
      description,
      tags,
      language,
    }: {
      title: string
      description?: string
      tags: string[]
      language: 'en' | 'es'
    } = await request.json()

    if (!title || title.length < 10) {
      return NextResponse.json(
        { error: 'Title must be at least 10 characters' },
        { status: 400 }
      )
    }

    if (!SERPAPI_API_KEY) {
      return NextResponse.json(
        { error: 'SerpAPI key not configured' },
        { status: 500 }
      )
    }

    // Build search query from title and tags
    const searchQuery = `${title} ${tags.slice(0, 3).join(' ')}`.trim()

    // Phase 1: Fetch all search results in parallel with SerpAPI
    const [googleResults, googleTrends, bingResults] = await Promise.all([
      retryWithBackoff(() => fetchGoogleSearchResults(searchQuery, 10)),
      retryWithBackoff(() => fetchGoogleTrends(title)),
      retryWithBackoff(() => fetchBingSearchResults(searchQuery)),
    ])

    // Phase 2: Ingest and chunk the search results
    const chunks = ingestSearchResults(googleResults, bingResults, googleTrends)

    // Create idea context for the AI pipeline
    const ideaContext: IdeaContext = {
      title,
      description,
      tags,
    }

    // Phase 3 & 4: Run the two-stage OpenAI pipeline
    const validationResult = await runMarketValidationPipeline(
      chunks,
      googleTrends,
      ideaContext,
      language
    )

    // Return the complete market validation result
    const result: MarketValidationResult = {
      ...validationResult,
      // Ensure search data is properly populated
      searchData: {
        googleResults,
        googleTrends,
        bingResults,
      },
      timestamp: new Date(),
      version: 1,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Market validation error:', error)

    if (error instanceof Error) {
      if (error.message === 'SERPAPI_RATE_LIMIT') {
        return NextResponse.json(
          { error: 'Search API rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      }
      if (error.message === 'OPENAI_RATE_LIMIT') {
        return NextResponse.json(
          { error: 'AI_RATE_LIMIT_EXCEEDED' },
          { status: 429 }
        )
      }
      if (error.message.includes('OpenAI API key not configured')) {
        return NextResponse.json(
          { error: 'AI service not configured' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
