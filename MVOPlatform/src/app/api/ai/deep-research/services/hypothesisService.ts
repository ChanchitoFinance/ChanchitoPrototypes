import {
  HypothesisData,
  HypothesisId,
  GoogleSearchResult,
  YouTubeSearchResult,
  FacebookSearchResult,
} from '@/core/types/ai'
import { clientEnv } from '@/env-validation/config/env'

const GEMINI_API_KEY = clientEnv.geminiApiKey
const GEMINI_MODEL = clientEnv.geminiModel

// Hypothesis configurations - titles are idea-agnostic but analysis will be idea-specific
export const HYPOTHESIS_CONFIGS: Record<
  HypothesisId,
  {
    title: string
    titleKey: string
    description: string
  }
> = {
  HY1: {
    title: 'There is market demand for this solution',
    titleKey: 'deep_research.hypotheses.hy1.title',
    description: 'Testing whether there is evidence of market demand and user interest in this type of solution',
  },
  HY2: {
    title: 'The target audience is actively seeking solutions',
    titleKey: 'deep_research.hypotheses.hy2.title',
    description: 'Testing whether potential users are actively looking for solutions to the problem this idea addresses',
  },
  HY3: {
    title: 'Existing solutions leave gaps that this idea can fill',
    titleKey: 'deep_research.hypotheses.hy3.title',
    description: 'Testing whether current market offerings have shortcomings that create opportunities',
  },
  HY4: {
    title: 'The business model is viable in this market',
    titleKey: 'deep_research.hypotheses.hy4.title',
    description: 'Testing whether similar business models have shown traction and monetization potential',
  },
  HY5: {
    title: 'Early adopters can be identified and reached',
    titleKey: 'deep_research.hypotheses.hy5.title',
    description: 'Testing whether there are identifiable communities and channels to reach early adopters',
  },
}

/**
 * Idea context for generating idea-specific hypotheses
 */
export interface IdeaContext {
  title: string
  description?: string
  tags: string[]
}

/**
 * Generate idea-specific search queries
 */
export function generateIdeaSearchQueries(idea: IdeaContext): {
  serpQueries: string[]
  youtubeQueries: string[]
  facebookQueries: string[]
} {
  const keyTerms = [idea.title, ...idea.tags.slice(0, 3)].filter(Boolean)
  const mainTopic = idea.title

  return {
    // SERP queries - focused on market research for this specific idea
    serpQueries: [
      `${mainTopic} market size statistics`,
      `${mainTopic} industry trends ${new Date().getFullYear()}`,
      `${keyTerms.slice(0, 2).join(' ')} competitors analysis`,
      `${mainTopic} user demand research`,
      `${keyTerms[0] || mainTopic} startup opportunities`,
    ],
    // YouTube queries - focused on finding content creators discussing similar topics
    youtubeQueries: [
      `${mainTopic} review`,
      `${mainTopic} tutorial how to`,
      `${keyTerms.slice(0, 2).join(' ')} explained`,
    ],
    // Facebook queries - focused on finding communities and pages
    facebookQueries: [
      `${mainTopic}`,
      `${keyTerms[0] || mainTopic} community`,
    ],
  }
}

/**
 * Generate ALL hypotheses with a SINGLE Gemini API call
 * This dramatically reduces API usage from 10+ calls to just 1
 */
export async function generateAllHypotheses(
  idea: IdeaContext,
  serpResults: GoogleSearchResult[],
  youtubeResults: YouTubeSearchResult[],
  facebookResults: FacebookSearchResult[],
  language: 'en' | 'es'
): Promise<HypothesisData[]> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured')
  }

  const languageInstruction =
    language === 'es'
      ? 'You MUST respond in Spanish (Español). All analysis must be in Spanish.'
      : 'You MUST respond in English. All analysis must be in English.'

  // Build context from search results
  const serpContext = serpResults
    .slice(0, 10)
    .map(r => `- ${r.title}: ${r.snippet}`)
    .join('\n')

  const youtubeContext = youtubeResults
    .slice(0, 8)
    .map(v => `- "${v.title}" by ${v.channelName}${v.views ? ` (${v.views.toLocaleString()} views)` : ''}: ${v.description?.slice(0, 100) || 'No description'}`)
    .join('\n')

  const facebookContext = facebookResults
    .slice(0, 5)
    .map(p => `- ${p.name}${p.category ? ` (${p.category})` : ''}${p.followers ? ` - ${p.followers.toLocaleString()} followers` : ''}: ${p.about?.slice(0, 100) || 'No description'}`)
    .join('\n')

  const prompt = `You are a startup validation expert. Analyze the following research data for a business idea and generate hypothesis validations.

## BUSINESS IDEA
Title: ${idea.title}
${idea.description ? `Description: ${idea.description}` : ''}
Tags: ${idea.tags.join(', ')}

## RESEARCH DATA

### Web Search Results (Market Data):
${serpContext || 'No web results available'}

### YouTube Content (Creator/Audience Insights):
${youtubeContext || 'No YouTube results available'}

### Facebook Pages (Community Data):
${facebookContext || 'No Facebook results available'}

## TASK
Based on the research data above, generate validation analysis for 5 hypotheses about this SPECIFIC business idea. Each hypothesis should be analyzed in the context of "${idea.title}".

For each hypothesis, provide:
1. A "quantitative" paragraph (2-3 sentences) citing specific data, statistics, numbers, or market trends from the web search results that relate to this idea
2. A "qualitative" paragraph (2-3 sentences) describing behavioral patterns, community sentiment, or audience engagement observed in the YouTube/Facebook data

${languageInstruction}

Respond with a valid JSON object in this exact format (no markdown, no code blocks, just raw JSON):
{
  "hypotheses": [
    {
      "id": "HY1",
      "title": "There is market demand for this solution",
      "quantitative": "Your quantitative analysis paragraph here...",
      "qualitative": "Your qualitative analysis paragraph here..."
    },
    {
      "id": "HY2",
      "title": "The target audience is actively seeking solutions",
      "quantitative": "...",
      "qualitative": "..."
    },
    {
      "id": "HY3",
      "title": "Existing solutions leave gaps that this idea can fill",
      "quantitative": "...",
      "qualitative": "..."
    },
    {
      "id": "HY4",
      "title": "The business model is viable in this market",
      "quantitative": "...",
      "qualitative": "..."
    },
    {
      "id": "HY5",
      "title": "Early adopters can be identified and reached",
      "quantitative": "...",
      "qualitative": "..."
    }
  ]
}

IMPORTANT:
- Make ALL analysis specific to "${idea.title}" - do not give generic startup advice
- Reference actual data from the search results when possible
- If data is limited, acknowledge this but still provide relevant analysis based on what's available
- Keep each paragraph focused and actionable`

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
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2500,
        },
      }),
    }
  )

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    if (errorData.error?.code === 429) {
      throw new Error('AI_RATE_LIMIT_EXCEEDED')
    }
    throw new Error(`Gemini API error: ${response.statusText}`)
  }

  const data = await response.json()
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

  // Parse JSON response
  try {
    // Clean the response - remove markdown code blocks if present
    const cleanedText = rawText
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .trim()

    const parsed = JSON.parse(cleanedText)

    // Map to our HypothesisData format
    const hypothesisIds: HypothesisId[] = ['HY1', 'HY2', 'HY3', 'HY4', 'HY5']

    return hypothesisIds.map((id, index) => {
      const hyp = parsed.hypotheses?.[index] || {}
      const config = HYPOTHESIS_CONFIGS[id]

      return {
        id,
        title: config.title,
        quantitativeSegment: hyp.quantitative || '',
        qualitativeSegment: hyp.qualitative || '',
        sources: {
          serp: serpResults.slice(0, 3).map(r => r.link),
          youtube: youtubeResults.slice(0, 2).map(v => v.link),
          facebook: facebookResults.slice(0, 2).map(p => p.profileUrl),
        },
      }
    })
  } catch (parseError) {
    console.error('Failed to parse hypothesis JSON:', parseError, rawText)

    // Return empty hypotheses on parse failure
    return getHypothesisIds().map(id => ({
      id,
      title: HYPOTHESIS_CONFIGS[id].title,
      quantitativeSegment: '',
      qualitativeSegment: '',
      sources: { serp: [], youtube: [], facebook: [] },
    }))
  }
}

/**
 * Get all hypothesis IDs
 */
export function getHypothesisIds(): HypothesisId[] {
  return ['HY1', 'HY2', 'HY3', 'HY4', 'HY5']
}
