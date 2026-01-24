import { YouTubeSearchResult } from '@/core/types/ai'
import { serverEnv } from '@/env-validation/config/env'

const SERPAPI_API_KEY = serverEnv.serpapiApiKey
const SERPAPI_BASE_URL = 'https://serpapi.com/search.json'

/**
 * Check if YouTube search via SerpAPI is configured
 */
export function isYouTubeConfigured(): boolean {
  return !!SERPAPI_API_KEY && SERPAPI_API_KEY.length > 0
}

/**
 * Search YouTube for videos matching query using SerpAPI
 * Uses the same SerpAPI key as other search engines
 */
export async function searchYouTube(
  query: string,
  maxResults: number = 20
): Promise<YouTubeSearchResult[]> {
  if (!isYouTubeConfigured()) {
    console.warn('SerpAPI not configured, returning empty YouTube results')
    return []
  }

  try {
    const params = new URLSearchParams({
      engine: 'youtube',
      search_query: query,
      api_key: SERPAPI_API_KEY,
    })

    const response = await fetch(`${SERPAPI_BASE_URL}?${params.toString()}`)

    // Handle rate limits gracefully
    if (response.status === 429) {
      console.warn('SerpAPI rate limit exceeded for YouTube search')
      return []
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('YouTube SerpAPI error:', response.status, errorData)
      return []
    }

    const data = await response.json()
    const videoResults = data.video_results || []

    // Transform SerpAPI response to our format
    return videoResults.slice(0, maxResults).map((video: any) => ({
      id: video.link?.split('v=')?.[1] || video.id || '',
      title: video.title || '',
      link: video.link || '',
      channelName: video.channel?.name || '',
      channelLink: video.channel?.link || '',
      description: video.description || '',
      publishedDate: video.published_date || undefined,
      views: typeof video.views === 'number' ? video.views : parseInt(video.views || '0', 10) || undefined,
      length: video.length || undefined,
      thumbnail: video.thumbnail?.static || video.thumbnail || undefined,
    }))
  } catch (error) {
    console.error('YouTube search error:', error)
    return []
  }
}

/**
 * Search for potential early adopters on YouTube
 * Focuses on videos about startup validation, business ideas, etc.
 */
export async function searchYouTubeEarlyAdopters(
  ideaTitle: string,
  tags: string[]
): Promise<YouTubeSearchResult[]> {
  const searchTerms = [
    ideaTitle,
    ...tags.slice(0, 2),
    'startup idea',
    'business validation',
  ]

  // Combine search terms
  const query = searchTerms.slice(0, 3).join(' ')

  return searchYouTube(query, 20)
}

/**
 * Search YouTube for hypothesis-related content
 */
export async function searchYouTubeForHypothesis(
  searchTerms: string[]
): Promise<YouTubeSearchResult[]> {
  const query = searchTerms.slice(0, 3).join(' ')
  return searchYouTube(query, 15)
}
