export type AIPersonaType =
  | 'technical'
  | 'founder'
  | 'market'
  | 'gtm'
  | 'investor'
  | 'risk'

export interface AIPersona {
  id: AIPersonaType
  name: string
  description: string
  personality: string
  color: string
  icon: string
}

export interface AIFeedback {
  persona: AIPersonaType
  feedback: string
  suggestions: string[]
  warnings?: string[]
  timestamp: Date
}

export interface AIPersonaFeedback {
  conversation: string
  timestamp: Date
}

// Deep Research Types
export interface GoogleSearchResult {
  position: number
  title: string
  link: string
  snippet: string
  displayedLink?: string
  date?: string
}

export interface GoogleTrendsData {
  query: string
  date: string
  value: number
  extractedValue: number
}

export interface BingSearchResult {
  position: number
  title: string
  link: string
  snippet: string
  displayedLink?: string
  date?: string
}

export interface DeepResearchResult {
  googleResults: GoogleSearchResult[]
  googleTrends: GoogleTrendsData[]
  bingResults: BingSearchResult[]
  aiSummary: string
  timestamp: Date
}

// Enhanced Deep Research Types
export type HypothesisId = 'HY1' | 'HY2' | 'HY2.1' | 'HY3' | 'HY4'

export interface HypothesisData {
  id: HypothesisId
  title: string
  quantitativeSegment: string
  qualitativeSegment: string
  sources: {
    serp: string[]
    twitter: string[]
    reddit: string[]
  }
}

export interface TwitterSearchResult {
  id: string
  text: string
  authorId: string
  authorUsername: string
  authorName: string
  profileUrl: string
  tweetUrl: string
  createdAt: string
  likeCount?: number
  retweetCount?: number
}

export interface RedditSearchResult {
  id: string
  title: string
  selftext: string
  author: string
  subreddit: string
  postUrl: string
  profileUrl: string
  score: number
  numComments: number
  createdUtc: number
}

export interface EarlyAdopter {
  id: string
  platform: 'twitter' | 'reddit'
  username: string
  displayName?: string
  profileUrl: string
  postUrl: string
  postContent: string
  relevanceScore: number
  createdAt: string
}

export type DeepResearchMainTab = 'hypotheses' | 'earlyAdopters' | 'deepResearch'
export type DeepResearchSubTab = 'summary' | 'google' | 'trends' | 'bing'

export interface EnhancedDeepResearchResult {
  // Original data
  googleResults: GoogleSearchResult[]
  googleTrends: GoogleTrendsData[]
  bingResults: BingSearchResult[]
  aiSummary: string

  // Enhanced data
  hypotheses: HypothesisData[]
  earlyAdopters: EarlyAdopter[]
  twitterResults: TwitterSearchResult[]
  redditResults: RedditSearchResult[]

  // Metadata
  timestamp: Date
  version: number
  enhanced: boolean
}

export const AI_PERSONAS: Record<AIPersonaType, AIPersona> = {
  technical: {
    id: 'technical',
    name: 'AI · Technical Feasibility',
    description:
      'Architecture, scalability, and technical implementation risks',
    personality:
      'Analytical, methodical, precise. Patient, calm, slightly pedantic.',
    color: '#60A5FA',
    icon: '🔧',
  },
  founder: {
    id: 'founder',
    name: 'AI · Founder Reality Check',
    description: 'Scope, capacity, and execution feasibility',
    personality:
      'Practical, realistic, empathetic. Encourages but never sugarcoats.',
    color: '#F59E0B',
    icon: '💼',
  },
  market: {
    id: 'market',
    name: 'AI · Market Skeptic',
    description: 'Challenging assumptions, identifying demand risks',
    personality:
      'Cynical but constructive. Loves asking "what if this doesn\'t happen?"',
    color: '#A78BFA',
    icon: '🦉',
  },
  gtm: {
    id: 'gtm',
    name: 'AI · GTM & Distribution',
    description: 'Go-to-market strategy and acquisition channels',
    personality:
      'Energetic, opportunistic, slightly impatient. Loves practical growth hacks.',
    color: '#10B981',
    icon: '📢',
  },
  investor: {
    id: 'investor',
    name: 'AI · Investor Lens',
    description: 'Narrative clarity, differentiation, and investor perspective',
    personality: 'Professional, concise, high-level. Polite but skeptical.',
    color: '#1E40AF',
    icon: '💰',
  },
  risk: {
    id: 'risk',
    name: 'AI · Risk Highlighter',
    description: 'Pre-posting risk analysis and safety checks',
    personality:
      'Cautious, meticulous, slightly anxious. Non-judgmental but protective.',
    color: '#EAB308',
    icon: '⚠️',
  },
}
