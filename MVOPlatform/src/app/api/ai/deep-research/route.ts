import { NextRequest, NextResponse } from 'next/server'
import { serverEnv, clientEnv } from '@/env-validation/config/env'
import {
  GoogleSearchResult,
  GoogleTrendsData,
  BingSearchResult,
  DeepResearchResult,
  EnhancedDeepResearchResult,
  EarlyAdopter,
} from '@/core/types/ai'
import {
  searchYouTube,
  isYouTubeConfigured,
} from './services/youtubeService'
import {
  searchFacebook,
  isFacebookConfigured,
} from './services/facebookService'
import {
  generateAllHypotheses,
  generateIdeaSearchQueries,
  type IdeaContext,
} from './services/hypothesisService'

const SERPAPI_API_KEY = serverEnv.serpapiApiKey
const GEMINI_API_KEY = clientEnv.geminiApiKey
const GEMINI_MODEL = clientEnv.geminiModel
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
  num: number = 5
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

// Call Gemini for AI Summary (1 API call)
async function generateAISummary(
  title: string,
  tags: string[],
  googleResults: GoogleSearchResult[],
  googleTrends: GoogleTrendsData[],
  bingResults: BingSearchResult[],
  language: 'en' | 'es'
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured')
  }

  const languageInstruction =
    language === 'es'
      ? '\n\nIMPORTANT: You MUST respond in Spanish (Español). All your analysis must be in Spanish.'
      : '\n\nIMPORTANT: You MUST respond in English. All your analysis must be in English.'

  const systemPrompt = `You are a Deep Research AI assistant helping entrepreneurs validate their business ideas. Your role is to analyze search results from multiple sources and provide actionable insights about market feasibility and competition.

Your personality:
- Thorough and analytical
- Balanced and objective
- Focused on actionable insights
- Supportive but realistic`

  const prompt = `Analyze these search results for a business idea:

IDEA TITLE: ${title}
RELATED TAGS: ${tags.join(', ')}

=== GOOGLE SEARCH RESULTS ===
${googleResults.map(r => `${r.position}. ${r.title}\n   Link: ${r.link}\n   ${r.snippet}`).join('\n\n')}

=== GOOGLE TRENDS DATA (Last 5 periods) ===
${googleTrends.map(t => `${t.date}: Interest value ${t.value}`).join('\n')}

=== BING SEARCH RESULTS ===
${bingResults.map(r => `${r.position}. ${r.title}\n   Link: ${r.link}\n   ${r.snippet}`).join('\n\n')}

Please provide a comprehensive analysis in 2-3 paragraphs:
1. First paragraph: Summarize the market landscape based on the search results. What existing solutions or competitors exist? What's the general market sentiment?
2. Second paragraph: Analyze the trends data. Is interest in this topic growing, stable, or declining? What does this mean for the business idea?
3. Third paragraph: Provide your final verdict. Which search results are most relevant to explore further? What opportunities or gaps do you see? Give actionable recommendations.

Keep your response concise but insightful. Focus on practical advice for the entrepreneur.`

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
        errorData.error?.message?.includes('quota')

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

// Extract early adopters from social results
function extractEarlyAdopters(
  youtubeResults: Awaited<ReturnType<typeof searchYouTube>>,
  facebookResults: Awaited<ReturnType<typeof searchFacebook>>
): EarlyAdopter[] {
  const earlyAdopters: EarlyAdopter[] = []

  // Add YouTube creators as early adopters
  for (const video of youtubeResults.slice(0, 10)) {
    earlyAdopters.push({
      id: `youtube_${video.id}`,
      platform: 'youtube',
      username: video.channelName,
      displayName: video.channelName,
      profileUrl: video.channelLink,
      postUrl: video.link,
      postContent: `${video.title}: ${video.description?.slice(0, 200) || ''}`,
      relevanceScore: calculateRelevanceScore(video.views || 0, 0),
      createdAt: video.publishedDate || new Date().toISOString(),
    })
  }

  // Add Facebook pages as early adopters
  for (const page of facebookResults.slice(0, 10)) {
    earlyAdopters.push({
      id: `facebook_${page.id}`,
      platform: 'facebook',
      username: page.name,
      displayName: page.name,
      profileUrl: page.profileUrl,
      postUrl: page.profileUrl,
      postContent: page.about?.slice(0, 200) || page.category || '',
      relevanceScore: calculateRelevanceScore(page.followers || 0, page.likes || 0),
      createdAt: new Date().toISOString(),
    })
  }

  // Sort by relevance score
  return earlyAdopters.sort((a, b) => b.relevanceScore - a.relevanceScore)
}

// Calculate relevance score based on engagement metrics
function calculateRelevanceScore(primaryMetric: number, secondaryMetric: number): number {
  const score = Math.min(1, (primaryMetric * 0.7 + secondaryMetric * 0.3) / 100)
  return Math.round(score * 100) / 100
}

export async function POST(request: NextRequest) {
  try {
    const {
      title,
      description,
      tags,
      language,
      enhanced = false,
    }: {
      title: string
      description?: string
      tags: string[]
      language: 'en' | 'es'
      enhanced?: boolean
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

    // Build search query from title and tags (idea-specific)
    const searchQuery = `${title} ${tags.slice(0, 3).join(' ')}`.trim()

    // Fetch all search results in parallel with retry logic
    // These results are used for both basic Deep Research and Hypotheses
    const [googleResults, googleTrends, bingResults] = await Promise.all([
      retryWithBackoff(() => fetchGoogleSearchResults(searchQuery, enhanced ? 10 : 5)),
      retryWithBackoff(() => fetchGoogleTrends(title)),
      retryWithBackoff(() => fetchBingSearchResults(searchQuery)),
    ])

    // Generate AI summary (1st Gemini API call)
    const aiSummary = await retryWithBackoff(() =>
      generateAISummary(
        title,
        tags,
        googleResults,
        googleTrends,
        bingResults,
        language
      )
    )

    // If not enhanced mode, return basic result
    if (!enhanced) {
      const result: DeepResearchResult = {
        googleResults: googleResults.slice(0, 5),
        googleTrends,
        bingResults,
        aiSummary,
        timestamp: new Date(),
      }

      return NextResponse.json(result)
    }

    // ============================================
    // ENHANCED MODE
    // Uses only 2 Gemini API calls total:
    // 1. AI Summary (above)
    // 2. All hypotheses in one call (below)
    // ============================================

    const youtubeConfigured = isYouTubeConfigured()
    const facebookConfigured = isFacebookConfigured()

    // Create idea context for idea-specific searches
    const ideaContext: IdeaContext = {
      title,
      description,
      tags,
    }

    // Generate idea-specific search queries
    const ideaQueries = generateIdeaSearchQueries(ideaContext)

    // Fetch social data for early adopters AND hypothesis analysis
    // Uses idea-specific queries instead of generic ones
    const [youtubeResults, facebookResults] = await Promise.all([
      youtubeConfigured
        ? searchYouTube(ideaQueries.youtubeQueries[0], 15)
        : Promise.resolve([]),
      facebookConfigured
        ? searchFacebook(ideaQueries.facebookQueries[0], 10)
        : Promise.resolve([]),
    ])

    // Extract early adopters from social results
    const earlyAdopters = extractEarlyAdopters(youtubeResults, facebookResults)

    // Generate ALL hypotheses with a SINGLE Gemini API call (2nd call)
    // Passes the idea context and all collected data
    const hypotheses = await generateAllHypotheses(
      ideaContext,
      googleResults, // Reuse the google results we already have
      youtubeResults,
      facebookResults,
      language
    )

    const enhancedResult: EnhancedDeepResearchResult = {
      // Original data (for Deep Research subtabs)
      googleResults: googleResults.slice(0, 5),
      googleTrends,
      bingResults,
      aiSummary,

      // Enhanced data
      hypotheses,
      earlyAdopters,
      youtubeResults,
      facebookResults,

      // Metadata
      timestamp: new Date(),
      version: 1,
      enhanced: true,
    }

    return NextResponse.json(enhancedResult)
  } catch (error) {
    console.error('Deep research error:', error)

    if (error instanceof Error) {
      if (error.message === 'SERPAPI_RATE_LIMIT') {
        return NextResponse.json(
          { error: 'Search API rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      }
      if (
        error.message === 'AI_DAILY_LIMIT_EXCEEDED' ||
        error.message === 'AI_RATE_LIMIT_EXCEEDED'
      ) {
        return NextResponse.json({ error: error.message }, { status: 429 })
      }
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
