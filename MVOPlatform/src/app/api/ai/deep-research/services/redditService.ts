import { RedditSearchResult } from '@/core/types/ai'

const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID || ''
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET || ''
const REDDIT_USER_AGENT = process.env.REDDIT_USER_AGENT || 'MVO-Platform/1.0'
const REDDIT_API_BASE = 'https://oauth.reddit.com'
const REDDIT_AUTH_URL = 'https://www.reddit.com/api/v1/access_token'

// Default subreddits relevant to startup validation
const DEFAULT_SUBREDDITS = [
  'startups',
  'SideProject',
  'Entrepreneur',
  'smallbusiness',
  'indiehackers',
  'SaaS',
]

// Token cache to avoid unnecessary re-authentication
let cachedToken: { token: string; expiresAt: number } | null = null

interface RedditAuthResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
}

interface RedditPost {
  kind: string
  data: {
    id: string
    title: string
    selftext: string
    author: string
    subreddit: string
    permalink: string
    score: number
    num_comments: number
    created_utc: number
    url: string
  }
}

interface RedditSearchResponse {
  kind: string
  data: {
    children: RedditPost[]
    after?: string
    before?: string
  }
}

/**
 * Check if Reddit API is configured
 */
export function isRedditConfigured(): boolean {
  return !!REDDIT_CLIENT_ID && !!REDDIT_CLIENT_SECRET
}

/**
 * Get OAuth token for Reddit API
 * Uses Application-Only OAuth (client credentials)
 */
async function getRedditToken(): Promise<string | null> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) {
    return cachedToken.token
  }

  if (!isRedditConfigured()) {
    console.warn('Reddit API not configured')
    return null
  }

  try {
    const auth = Buffer.from(
      `${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`
    ).toString('base64')

    const response = await fetch(REDDIT_AUTH_URL, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': REDDIT_USER_AGENT,
      },
      body: 'grant_type=client_credentials',
    })

    if (!response.ok) {
      console.error('Reddit auth failed:', response.status)
      return null
    }

    const data: RedditAuthResponse = await response.json()

    // Cache the token
    cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    }

    return data.access_token
  } catch (error) {
    console.error('Reddit auth error:', error)
    return null
  }
}

/**
 * Search Reddit for posts matching query
 * Free tier: 600 requests/hour
 */
export async function searchReddit(
  query: string,
  subreddits: string[] = DEFAULT_SUBREDDITS,
  limit: number = 25
): Promise<RedditSearchResult[]> {
  const token = await getRedditToken()

  if (!token) {
    return []
  }

  try {
    const results: RedditSearchResult[] = []

    // Search across all specified subreddits
    const subredditString = subreddits.join('+')
    const params = new URLSearchParams({
      q: query,
      sort: 'relevance',
      t: 'year', // Last year
      limit: Math.min(limit, 100).toString(),
      restrict_sr: 'true',
    })

    const response = await fetch(
      `${REDDIT_API_BASE}/r/${subredditString}/search?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'User-Agent': REDDIT_USER_AGENT,
        },
      }
    )

    // Handle rate limits gracefully
    if (response.status === 429) {
      console.warn('Reddit API rate limit exceeded')
      return []
    }

    if (!response.ok) {
      console.error('Reddit API error:', response.status)
      return []
    }

    const data: RedditSearchResponse = await response.json()

    if (!data.data?.children) {
      return []
    }

    // Transform Reddit API response to our format
    for (const post of data.data.children) {
      if (post.kind !== 't3') continue // Only include posts (not comments)

      const postData = post.data
      results.push({
        id: postData.id,
        title: postData.title,
        selftext: postData.selftext?.slice(0, 500) || '', // Truncate long text
        author: postData.author,
        subreddit: postData.subreddit,
        postUrl: `https://reddit.com${postData.permalink}`,
        profileUrl: `https://reddit.com/user/${postData.author}`,
        score: postData.score,
        numComments: postData.num_comments,
        createdUtc: postData.created_utc,
      })
    }

    return results
  } catch (error) {
    console.error('Reddit search error:', error)
    return []
  }
}

/**
 * Search Reddit for potential early adopters
 * Focuses on users asking for feedback or sharing ideas
 */
export async function searchRedditEarlyAdopters(
  ideaTitle: string,
  tags: string[]
): Promise<RedditSearchResult[]> {
  const searchTerms = [
    ideaTitle,
    ...tags.slice(0, 2),
    'looking for feedback',
    'idea validation',
  ]

  const query = searchTerms.slice(0, 3).join(' ')

  return searchReddit(query, DEFAULT_SUBREDDITS, 25)
}

/**
 * Search Reddit for hypothesis-related content
 */
export async function searchRedditForHypothesis(
  searchTerms: string[]
): Promise<RedditSearchResult[]> {
  const query = searchTerms.slice(0, 3).join(' ')
  return searchReddit(query, DEFAULT_SUBREDDITS, 15)
}

/**
 * Search specific subreddits for market research
 */
export async function searchSubredditForResearch(
  query: string,
  subreddit: string,
  limit: number = 10
): Promise<RedditSearchResult[]> {
  return searchReddit(query, [subreddit], limit)
}
