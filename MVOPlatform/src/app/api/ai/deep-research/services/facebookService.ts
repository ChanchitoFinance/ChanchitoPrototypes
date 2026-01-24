import { FacebookSearchResult } from '@/core/types/ai'
import { serverEnv } from '@/env-validation/config/env'

const SERPAPI_API_KEY = serverEnv.serpapiApiKey
const SERPAPI_BASE_URL = 'https://serpapi.com/search.json'

/**
 * Check if Facebook search via SerpAPI is configured
 */
export function isFacebookConfigured(): boolean {
  return !!SERPAPI_API_KEY && SERPAPI_API_KEY.length > 0
}

/**
 * Fetch a Facebook profile by profile ID using SerpAPI
 * Note: This API fetches profile information, not search results.
 * Profile ID can be found in Facebook URLs (e.g., facebook.com/Meta -> "Meta")
 */
export async function fetchFacebookProfile(
  profileId: string
): Promise<FacebookSearchResult | null> {
  if (!isFacebookConfigured()) {
    console.warn('SerpAPI not configured, cannot fetch Facebook profile')
    return null
  }

  try {
    const params = new URLSearchParams({
      engine: 'facebook_profile',
      profile_id: profileId,
      api_key: SERPAPI_API_KEY,
    })

    const response = await fetch(`${SERPAPI_BASE_URL}?${params.toString()}`)

    // Handle rate limits gracefully
    if (response.status === 429) {
      console.warn('SerpAPI rate limit exceeded for Facebook profile')
      return null
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Facebook SerpAPI error:', response.status, errorData)
      return null
    }

    const data = await response.json()
    const profile = data.profile_results

    if (!profile) {
      return null
    }

    // Transform SerpAPI response to our format
    return {
      id: profile.id || profileId,
      name: profile.name || '',
      profileUrl: profile.url || `https://www.facebook.com/${profileId}`,
      category: profile.category || undefined,
      likes: parseFacebookCount(profile.likes),
      followers: parseFacebookCount(profile.followers),
      about: profile.profile_intro_text || undefined,
      posts: [], // Facebook Profile API doesn't return posts
    }
  } catch (error) {
    console.error('Facebook profile fetch error:', error)
    return null
  }
}

/**
 * Parse Facebook follower/like counts (e.g., "29K" -> 29000)
 */
function parseFacebookCount(count: string | number | undefined): number | undefined {
  if (typeof count === 'number') return count
  if (!count) return undefined

  const cleanCount = count.toString().toUpperCase().trim()

  if (cleanCount.endsWith('K')) {
    return Math.round(parseFloat(cleanCount.replace('K', '')) * 1000)
  }
  if (cleanCount.endsWith('M')) {
    return Math.round(parseFloat(cleanCount.replace('M', '')) * 1000000)
  }
  if (cleanCount.endsWith('B')) {
    return Math.round(parseFloat(cleanCount.replace('B', '')) * 1000000000)
  }

  return parseInt(cleanCount.replace(/,/g, ''), 10) || undefined
}

/**
 * Search Facebook for profiles related to a query
 * Note: The Facebook Profile API doesn't support searching - only fetching by profile ID.
 * This function uses Google Search with site:facebook.com to find relevant profiles.
 */
export async function searchFacebook(
  query: string,
  maxResults: number = 10
): Promise<FacebookSearchResult[]> {
  if (!isFacebookConfigured()) {
    console.warn('SerpAPI not configured, returning empty Facebook results')
    return []
  }

  try {
    // Use Google search with site:facebook.com to find relevant Facebook pages
    const params = new URLSearchParams({
      engine: 'google',
      q: `site:facebook.com ${query}`,
      api_key: SERPAPI_API_KEY,
      num: maxResults.toString(),
    })

    const response = await fetch(`${SERPAPI_BASE_URL}?${params.toString()}`)

    if (response.status === 429) {
      console.warn('SerpAPI rate limit exceeded for Facebook search')
      return []
    }

    if (!response.ok) {
      console.error('Facebook search via Google error:', response.status)
      return []
    }

    const data = await response.json()
    const organicResults = data.organic_results || []

    // Extract Facebook profile IDs from Google results
    const results: FacebookSearchResult[] = []

    for (const result of organicResults.slice(0, maxResults)) {
      const link = result.link || ''

      // Extract profile ID from Facebook URL
      const profileId = extractFacebookProfileId(link)

      if (profileId) {
        results.push({
          id: profileId,
          name: result.title?.replace(' | Facebook', '').replace(' - Facebook', '') || profileId,
          profileUrl: link,
          category: undefined,
          about: result.snippet || undefined,
        })
      }
    }

    return results
  } catch (error) {
    console.error('Facebook search error:', error)
    return []
  }
}

/**
 * Extract profile ID from a Facebook URL
 */
function extractFacebookProfileId(url: string): string | null {
  try {
    const urlObj = new URL(url)
    if (!urlObj.hostname.includes('facebook.com')) {
      return null
    }

    // Handle different Facebook URL formats
    const pathname = urlObj.pathname

    // facebook.com/profile.php?id=123
    if (pathname === '/profile.php') {
      return urlObj.searchParams.get('id')
    }

    // facebook.com/username or facebook.com/pages/...
    const parts = pathname.split('/').filter(Boolean)
    if (parts.length > 0 && parts[0] !== 'watch' && parts[0] !== 'events') {
      return parts[parts.length - 1]
    }

    return null
  } catch {
    return null
  }
}

/**
 * Search for potential early adopters on Facebook
 * Uses Google search with site:facebook.com to find relevant pages/profiles
 */
export async function searchFacebookEarlyAdopters(
  ideaTitle: string,
  tags: string[]
): Promise<FacebookSearchResult[]> {
  const searchTerms = [
    ideaTitle,
    ...tags.slice(0, 2),
    'startup',
    'entrepreneur',
  ]

  const query = searchTerms.slice(0, 3).join(' ')

  return searchFacebook(query, 15)
}

/**
 * Search Facebook for hypothesis-related content
 */
export async function searchFacebookForHypothesis(
  searchTerms: string[]
): Promise<FacebookSearchResult[]> {
  const query = searchTerms.slice(0, 3).join(' ')
  return searchFacebook(query, 10)
}
