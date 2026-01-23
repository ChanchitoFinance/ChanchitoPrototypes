import {
  HypothesisData,
  HypothesisId,
  GoogleSearchResult,
  TwitterSearchResult,
  RedditSearchResult,
} from '@/core/types/ai'
import { clientEnv } from '@/env-validation/config/env'

const GEMINI_API_KEY = clientEnv.geminiApiKey
const GEMINI_MODEL = clientEnv.geminiModel

// Hypothesis configurations with search terms
export const HYPOTHESIS_CONFIGS: Record<
  HypothesisId,
  {
    title: string
    titleKey: string
    description: string
    searchTerms: {
      quantitative: string[]
      qualitative: string[]
    }
  }
> = {
  HY1: {
    title: 'Founders delay building until external validation',
    titleKey: 'deep_research.hypotheses.hy1.title',
    description:
      'Testing whether founders wait for validation signals before committing resources to build',
    searchTerms: {
      quantitative: [
        'startup idea validation statistics',
        'founders market research before building',
        'startup failure rate no validation',
      ],
      qualitative: [
        'should I validate my startup idea first',
        'waiting for feedback before building',
        'need validation before starting',
      ],
    },
  },
  HY2: {
    title: 'Founders share ideas publicly when low-risk',
    titleKey: 'deep_research.hypotheses.hy2.title',
    description:
      'Testing whether founders are more willing to share ideas when perceived competition risk is low',
    searchTerms: {
      quantitative: [
        'startup idea sharing statistics',
        'founder idea theft concerns',
        'open source startup ideas trend',
      ],
      qualitative: [
        'sharing startup idea publicly',
        'afraid to share my idea',
        'building in public movement',
      ],
    },
  },
  'HY2.1': {
    title: 'Founders share for external signals to decide next steps',
    titleKey: 'deep_research.hypotheses.hy2_1.title',
    description:
      'Testing whether founders seek external feedback specifically to inform their decision-making',
    searchTerms: {
      quantitative: [
        'startup feedback decision making',
        'market signals startup pivot',
        'founder feedback loops statistics',
      ],
      qualitative: [
        'need feedback on my startup idea',
        'seeking opinions before pivoting',
        'external validation startup decision',
      ],
    },
  },
  HY3: {
    title: 'Founders iterate after feedback instead of abandoning',
    titleKey: 'deep_research.hypotheses.hy3.title',
    description:
      'Testing whether negative feedback leads to iteration rather than idea abandonment',
    searchTerms: {
      quantitative: [
        'startup pivot success rate',
        'iteration vs abandonment startups',
        'founder resilience statistics',
      ],
      qualitative: [
        'pivoted after negative feedback',
        'iterated based on user feedback',
        'changed approach after criticism',
      ],
    },
  },
  HY4: {
    title: 'Founders adopt structured validation over ad-hoc methods',
    titleKey: 'deep_research.hypotheses.hy4.title',
    description:
      'Testing whether founders prefer systematic validation frameworks over informal methods',
    searchTerms: {
      quantitative: [
        'lean startup validation adoption',
        'structured validation methods statistics',
        'startup methodology trends',
      ],
      qualitative: [
        'using lean validation method',
        'systematic approach to validation',
        'validation framework for startups',
      ],
    },
  },
}

/**
 * Generate a hypothesis segment using Gemini AI
 */
export async function generateHypothesisSegment(
  hypothesisId: HypothesisId,
  segmentType: 'quantitative' | 'qualitative',
  serpResults: GoogleSearchResult[],
  twitterResults: TwitterSearchResult[],
  redditResults: RedditSearchResult[],
  language: 'en' | 'es'
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured')
  }

  const config = HYPOTHESIS_CONFIGS[hypothesisId]

  const languageInstruction =
    language === 'es'
      ? '\n\nIMPORTANT: You MUST respond in Spanish (Español). All your analysis must be in Spanish.'
      : '\n\nIMPORTANT: You MUST respond in English. All your analysis must be in English.'

  const segmentPrompt =
    segmentType === 'quantitative'
      ? `You are analyzing QUANTITATIVE data to support or refute a hypothesis about startup founders.

Hypothesis: "${config.title}"
Description: ${config.description}

Use the following search results to write a single paragraph (2-4 sentences) with quantitative evidence:

SEARCH RESULTS:
${serpResults.map(r => `- ${r.title}: ${r.snippet}`).join('\n')}

Write a concise paragraph citing specific statistics, percentages, or numerical data from the search results. If specific numbers aren't available, reference trends or patterns observed in market data. Start the paragraph directly without any headers.`
      : `You are analyzing QUALITATIVE data to support or refute a hypothesis about startup founders.

Hypothesis: "${config.title}"
Description: ${config.description}

Use the following social media data to write a single paragraph (2-4 sentences) with qualitative evidence:

TWITTER/X POSTS:
${twitterResults.map(t => `- @${t.authorUsername}: "${t.text.slice(0, 200)}"`).join('\n')}

REDDIT POSTS:
${redditResults.map(r => `- r/${r.subreddit} by u/${r.author}: "${r.title}" - ${r.selftext.slice(0, 150)}`).join('\n')}

Write a concise paragraph describing behavioral patterns and sentiments observed in social discussions. Reference specific platforms or communities where these patterns are seen. Start the paragraph directly without any headers.`

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
                text: segmentPrompt + languageInstruction,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 300,
        },
      }),
    }
  )

  if (!response.ok) {
    const errorData = await response.json()
    if (errorData.error?.code === 429) {
      throw new Error('AI_RATE_LIMIT_EXCEEDED')
    }
    throw new Error(`Gemini API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
}

/**
 * Generate all hypotheses with their segments
 */
export async function generateAllHypotheses(
  serpResultsMap: Map<HypothesisId, GoogleSearchResult[]>,
  twitterResultsMap: Map<HypothesisId, TwitterSearchResult[]>,
  redditResultsMap: Map<HypothesisId, RedditSearchResult[]>,
  language: 'en' | 'es'
): Promise<HypothesisData[]> {
  const hypotheses: HypothesisData[] = []
  const hypothesisIds: HypothesisId[] = ['HY1', 'HY2', 'HY2.1', 'HY3', 'HY4']

  for (const id of hypothesisIds) {
    const config = HYPOTHESIS_CONFIGS[id]
    const serpResults = serpResultsMap.get(id) || []
    const twitterResults = twitterResultsMap.get(id) || []
    const redditResults = redditResultsMap.get(id) || []

    try {
      // Generate both segments (can be parallelized if needed)
      const [quantitativeSegment, qualitativeSegment] = await Promise.all([
        generateHypothesisSegment(
          id,
          'quantitative',
          serpResults,
          twitterResults,
          redditResults,
          language
        ),
        generateHypothesisSegment(
          id,
          'qualitative',
          serpResults,
          twitterResults,
          redditResults,
          language
        ),
      ])

      hypotheses.push({
        id,
        title: config.title,
        quantitativeSegment,
        qualitativeSegment,
        sources: {
          serp: serpResults.map(r => r.link),
          twitter: twitterResults.map(t => t.tweetUrl),
          reddit: redditResults.map(r => r.postUrl),
        },
      })
    } catch (error) {
      console.error(`Error generating hypothesis ${id}:`, error)
      // Add hypothesis with empty segments if generation fails
      hypotheses.push({
        id,
        title: config.title,
        quantitativeSegment: '',
        qualitativeSegment: '',
        sources: {
          serp: [],
          twitter: [],
          reddit: [],
        },
      })
    }
  }

  return hypotheses
}

/**
 * Get search terms for a specific hypothesis
 */
export function getHypothesisSearchTerms(
  hypothesisId: HypothesisId
): { quantitative: string[]; qualitative: string[] } {
  return HYPOTHESIS_CONFIGS[hypothesisId].searchTerms
}

/**
 * Get all hypothesis IDs
 */
export function getHypothesisIds(): HypothesisId[] {
  return ['HY1', 'HY2', 'HY2.1', 'HY3', 'HY4']
}
