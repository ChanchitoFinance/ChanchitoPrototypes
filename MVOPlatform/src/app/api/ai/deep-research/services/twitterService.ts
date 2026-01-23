import { TwitterSearchResult } from '@/core/types/ai'

const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN || ''
const TWITTER_API_BASE = 'https://api.twitter.com/2'

interface TwitterApiTweet {
  id: string
  text: string
  author_id: string
  created_at?: string
  public_metrics?: {
    like_count: number
    retweet_count: number
    reply_count: number
    quote_count: number
  }
}

interface TwitterApiUser {
  id: string
  username: string
  name: string
}

interface TwitterSearchResponse {
  data?: TwitterApiTweet[]
  includes?: {
    users?: TwitterApiUser[]
  }
  meta?: {
    result_count: number
    next_token?: string
  }
  errors?: Array<{ message: string }>
}

/**
 * Check if Twitter API is configured
 */
export function isTwitterConfigured(): boolean {
  return !!TWITTER_BEARER_TOKEN && TWITTER_BEARER_TOKEN.length > 0
}

/**
 * Search Twitter/X for recent tweets matching query
 * Uses Twitter API v2 Recent Search endpoint
 * Free tier: 1,500 tweets/month
 */
export async function searchTwitter(
  query: string,
  maxResults: number = 20
): Promise<TwitterSearchResult[]> {
  if (!isTwitterConfigured()) {
    console.warn('Twitter API not configured, returning empty results')
    return []
  }

  try {
    // Build search query - focus on relevant startup/validation content
    const searchQuery = encodeURIComponent(
      `${query} -is:retweet lang:en`
    )

    const params = new URLSearchParams({
      query: `${query} -is:retweet lang:en`,
      max_results: Math.min(maxResults, 100).toString(),
      'tweet.fields': 'created_at,public_metrics,author_id',
      'user.fields': 'username,name',
      expansions: 'author_id',
    })

    const response = await fetch(
      `${TWITTER_API_BASE}/tweets/search/recent?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${TWITTER_BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    )

    // Handle rate limits gracefully
    if (response.status === 429) {
      console.warn('Twitter API rate limit exceeded')
      return []
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Twitter API error:', response.status, errorData)
      return []
    }

    const data: TwitterSearchResponse = await response.json()

    if (!data.data || data.data.length === 0) {
      return []
    }

    // Create a map of users for quick lookup
    const usersMap = new Map<string, TwitterApiUser>()
    if (data.includes?.users) {
      data.includes.users.forEach(user => {
        usersMap.set(user.id, user)
      })
    }

    // Transform Twitter API response to our format
    return data.data.map(tweet => {
      const user = usersMap.get(tweet.author_id)
      const username = user?.username || 'unknown'

      return {
        id: tweet.id,
        text: tweet.text,
        authorId: tweet.author_id,
        authorUsername: username,
        authorName: user?.name || username,
        profileUrl: `https://twitter.com/${username}`,
        tweetUrl: `https://twitter.com/${username}/status/${tweet.id}`,
        createdAt: tweet.created_at || new Date().toISOString(),
        likeCount: tweet.public_metrics?.like_count,
        retweetCount: tweet.public_metrics?.retweet_count,
      }
    })
  } catch (error) {
    console.error('Twitter search error:', error)
    return []
  }
}

/**
 * Search for potential early adopters on Twitter
 * Uses specific search terms related to startup validation
 */
export async function searchTwitterEarlyAdopters(
  ideaTitle: string,
  tags: string[]
): Promise<TwitterSearchResult[]> {
  const searchTerms = [
    `"${ideaTitle}"`,
    ...tags.slice(0, 2),
    'startup idea validation',
    'looking for feedback',
    'building in public',
  ]

  // Combine search terms with OR operator
  const query = searchTerms.slice(0, 3).join(' OR ')

  return searchTwitter(query, 20)
}

/**
 * Search Twitter for hypothesis-related content
 */
export async function searchTwitterForHypothesis(
  searchTerms: string[]
): Promise<TwitterSearchResult[]> {
  const query = searchTerms.slice(0, 3).join(' OR ')
  return searchTwitter(query, 15)
}
