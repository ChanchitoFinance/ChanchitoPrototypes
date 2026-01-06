import { ContentBlock } from '@/core/types/content'
import { clientEnv } from '@/env-validation/config/env'

const GEMINI_API_KEY = clientEnv.geminiApiKey
const GEMINI_MODEL = clientEnv.geminiModel

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

class AIService {
  private rateLimitDelay = 1000 // 1 second delay between calls
  private lastCallTime = 0

  private async callGemini(
    prompt: string,
    systemPrompt: string,
    language: 'en' | 'es'
  ): Promise<string> {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured')
    }

    // Rate limiting: ensure at least 1 second between calls
    const now = Date.now()
    const timeSinceLastCall = now - this.lastCallTime
    if (timeSinceLastCall < this.rateLimitDelay) {
      await new Promise(resolve =>
        setTimeout(resolve, this.rateLimitDelay - timeSinceLastCall)
      )
    }
    this.lastCallTime = Date.now()

    const languageInstruction =
      language === 'es'
        ? '\n\nIMPORTANT: You MUST respond in Spanish (Español). All your feedback, suggestions, and warnings must be in Spanish.'
        : '\n\nIMPORTANT: You MUST respond in English. All your feedback, suggestions, and warnings must be in English.'

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
        // Handle rate limit error
        const retryDelay = errorData.error?.details?.find(
          (detail: any) =>
            detail['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
        )?.retryDelay
        const delay = retryDelay ? parseFloat(retryDelay) * 1000 : 45000 // Default to 45 seconds
        console.warn(
          `Rate limit exceeded. Retrying in ${delay / 1000} seconds...`
        )
        await new Promise(resolve => setTimeout(resolve, delay))
        return this.callGemini(prompt, systemPrompt, language) // Retry
      }
      throw new Error(`Gemini API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  }

  private getSystemPrompt(persona: AIPersonaType): string {
    const basePrompts: Record<AIPersonaType, string> = {
      technical: `You are the Technical Feasibility AI - an analytical, methodical expert in software architecture and scalability.

Your personality:
- Analytical, methodical, precise
- Patient, calm, slightly pedantic
- Loves modularity and code cleanliness
- Slightly obsessed with scalability and security
- Can be blunt but fair

Your focus:
- Architecture complexity and requirements
- Scalability risks and infrastructure challenges
- Build vs buy decisions
- Hidden technical debt and shortcuts

Provide direct, technical feedback focused on execution reality. Be honest about technical challenges but constructive.`,

      founder: `You are the Founder Reality Check AI - a practical, empathetic advisor who knows the pain of being a solo founder.

Your personality:
- Practical, realistic, empathetic
- Encourages founders but never sugarcoats
- Often asks clarifying questions
- Dislikes overconfidence or "fake it till you make it"

Your focus:
- Scope vs solo founder capacity
- Realistic time-to-MVP estimates
- Execution risks and founder constraints
- Resource limitations

Provide pragmatic, empathetic but honest feedback focused on what's actually achievable.`,

      market: `You are the Market Skeptic AI - a cynical but constructive questioner of assumptions.

Your personality:
- Cynical but constructive
- Loves asking "what if this doesn't happen?"
- Obsessed with validation data
- Uses polite sarcasm in small doses

Your focus:
- Challenging "why this might not matter"
- Identifying weak assumptions
- Questioning demand risks
- Requiring evidence for claims

Provide skeptical, challenging feedback that makes founders think critically about their assumptions.`,

      gtm: `You are the GTM & Distribution AI - an energetic, opportunistic growth strategist.

Your personality:
- Energetic, opportunistic, slightly impatient
- Loves practical hacks and clever growth experiments
- Can be overexcited if distribution seems easy
- Dislikes vague GTM plans

Your focus:
- Likely acquisition channels
- Cold-start risks and initial traction
- Sales motion alignment with product
- Distribution strategy

Provide strategic, channel-focused, pragmatic feedback about how to actually reach users.`,

      investor: `You are the Investor Lens AI - a professional, high-level perspective on fundability.

Your personality:
- Professional, concise, high-level
- Polite but skeptical
- Always thinks about risk vs reward
- Likes clear narratives and defensible ideas

Your focus:
- Narrative clarity and story
- Differentiation and uniqueness
- Common pre-seed investor red flags
- Market positioning

Provide investor-focused feedback on narrative, positioning, and fundability concerns.`,

      risk: `You are the Risk Highlighter AI - a cautious, protective safety net for founders.

Your personality:
- Cautious, meticulous, slightly anxious
- Non-judgmental and protective
- Obsessed with safety and preventing regrets
- Likes clear, concise writing

Your focus:
- Information gaps in the idea
- Oversharing risks (proprietary details)
- Assumption exposure
- Legal/sensitivity signals (light touch)

CRITICAL INSTRUCTION: Only report ACTUAL risks or problems you identify. DO NOT mention things that are fine or have "no concerns". If a category has no issues, skip it entirely. Be concise and only highlight what needs attention. Do not waste tokens on positive statements or "no issues found" messages.

Provide neutral, structured, non-alarmist feedback to protect founders from accidental risks. Never block posting, just highlight concerns that exist.`,
    }

    return basePrompts[persona]
  }

  async analyzeTechnicalFeasibility(
    title: string,
    description: string,
    content: ContentBlock[],
    tags: string[],
    language: 'en' | 'es'
  ): Promise<AIFeedback> {
    const prompt = `Analyze this business idea for technical feasibility:

Title: ${title}
Description: ${description}
Tags: ${tags.join(', ')}
Content blocks: ${content.length} blocks

Provide concise feedback on:
1. Architecture complexity and requirements
2. Scalability concerns
3. Technical risks or debt
4. Build vs buy recommendations

Keep response under 500 words. Be direct and technical.`

    const feedback = await this.callGemini(
      prompt,
      this.getSystemPrompt('technical'),
      language
    )

    return {
      persona: 'technical',
      feedback,
      suggestions: this.extractSuggestions(feedback),
      timestamp: new Date(),
    }
  }

  async analyzeFounderReality(
    title: string,
    description: string,
    content: ContentBlock[],
    tags: string[],
    language: 'en' | 'es'
  ): Promise<AIFeedback> {
    const prompt = `Analyze this business idea from a solo founder perspective:

Title: ${title}
Description: ${description}
Tags: ${tags.join(', ')}
Content blocks: ${content.length} blocks

Provide honest feedback on:
1. Scope vs solo founder capacity
2. Realistic time-to-MVP estimate
3. Execution risks
4. What to prioritize or cut

Keep response under 500 words. Be empathetic but realistic.`

    const feedback = await this.callGemini(
      prompt,
      this.getSystemPrompt('founder'),
      language
    )

    return {
      persona: 'founder',
      feedback,
      suggestions: this.extractSuggestions(feedback),
      timestamp: new Date(),
    }
  }

  async analyzeMarketSkepticism(
    title: string,
    description: string,
    content: ContentBlock[],
    tags: string[],
    language: 'en' | 'es'
  ): Promise<AIFeedback> {
    const prompt = `Challenge this business idea's assumptions:

Title: ${title}
Description: ${description}
Tags: ${tags.join(', ')}
Content blocks: ${content.length} blocks

Provide skeptical feedback on:
1. Why this might not matter
2. Weak or untested assumptions
3. Demand risks
4. "What if you're wrong" scenarios

Keep response under 500 words. Be constructively cynical.`

    const feedback = await this.callGemini(
      prompt,
      this.getSystemPrompt('market'),
      language
    )

    return {
      persona: 'market',
      feedback,
      suggestions: this.extractSuggestions(feedback),
      warnings: this.extractWarnings(feedback),
      timestamp: new Date(),
    }
  }

  async analyzeGTMStrategy(
    title: string,
    description: string,
    content: ContentBlock[],
    tags: string[],
    language: 'en' | 'es'
  ): Promise<AIFeedback> {
    const prompt = `Analyze go-to-market strategy for this idea:

Title: ${title}
Description: ${description}
Tags: ${tags.join(', ')}
Content blocks: ${content.length} blocks

Provide strategic feedback on:
1. Likely acquisition channels
2. Cold-start risks
3. Sales motion alignment
4. Early traction ideas

Keep response under 500 words. Be practical and channel-focused.`

    const feedback = await this.callGemini(
      prompt,
      this.getSystemPrompt('gtm'),
      language
    )

    return {
      persona: 'gtm',
      feedback,
      suggestions: this.extractSuggestions(feedback),
      timestamp: new Date(),
    }
  }

  async analyzeInvestorLens(
    title: string,
    description: string,
    content: ContentBlock[],
    tags: string[],
    language: 'en' | 'es'
  ): Promise<AIFeedback> {
    const prompt = `Analyze this idea from a pre-seed investor perspective:

Title: ${title}
Description: ${description}
Tags: ${tags.join(', ')}
Content blocks: ${content.length} blocks

Provide investor-focused feedback on:
1. Narrative clarity
2. Differentiation and defensibility
3. Red flags for investors
4. Positioning recommendations

Keep response under 500 words. Be professional and concise.`

    const feedback = await this.callGemini(
      prompt,
      this.getSystemPrompt('investor'),
      language
    )

    return {
      persona: 'investor',
      feedback,
      suggestions: this.extractSuggestions(feedback),
      warnings: this.extractWarnings(feedback),
      timestamp: new Date(),
    }
  }

  async analyzeRisks(
    title: string,
    description: string,
    content: ContentBlock[],
    tags: string[],
    isAnonymous: boolean,
    language: 'en' | 'es'
  ): Promise<AIFeedback> {
    const prompt = `Analyze this idea for pre-posting risks:

Title: ${title}
Description: ${description}
Tags: ${tags.join(', ')}
Content blocks: ${content.length} blocks
Anonymous posting: ${isAnonymous ? 'Yes' : 'No'}

IMPORTANT: Only report ACTUAL problems or risks. Skip any category that has no issues. DO NOT include statements like "no concerns here" or "everything looks good". Be direct and concise.

Flag ONLY if there are real concerns about:
1. Information gaps or unclear target user
2. Oversharing of proprietary details
3. Unvalidated assumptions presented as facts
4. Sensitive topics (politics, sports teams, controversies)
5. Missing context that could be misunderstood

Provide suggestions ONLY for improvements that would meaningfully strengthen the idea:
- Adding more content (images, videos, text) - only if truly needed
- Improving clarity - only if something is confusing
- Adjusting tone or colors - only if there's an issue
- Making the idea more complete - only if it feels incomplete

Keep response under 500 words. Be protective but non-judgmental. Use ⚠️ for warnings and 💡 for suggestions. If there are no significant risks or improvements needed, keep your response very brief.`

    const feedback = await this.callGemini(
      prompt,
      this.getSystemPrompt('risk'),
      language
    )

    return {
      persona: 'risk',
      feedback,
      suggestions: [],
      warnings: [],
      timestamp: new Date(),
    }
  }

  private extractSuggestions(feedback: string): string[] {
    const suggestions: string[] = []
    const lines = feedback.split('\n')

    let currentSuggestion = ''
    let inSuggestionsSection = false
    for (const line of lines) {
      if (line.includes('Suggestions for Improvement:')) {
        inSuggestionsSection = true
        continue
      }
      if (inSuggestionsSection) {
        if (line.trim().startsWith('•') || line.trim().startsWith('*')) {
          if (currentSuggestion) {
            suggestions.push(currentSuggestion.trim())
          }
          currentSuggestion = line.replace(/^[•*]\s*/, '').trim()
        } else if (currentSuggestion && line.trim()) {
          currentSuggestion += ' ' + line.trim()
        }
      }
    }
    if (currentSuggestion) {
      suggestions.push(currentSuggestion.trim())
    }

    return suggestions.slice(0, 10)
  }

  private extractWarnings(feedback: string): string[] {
    const warnings: string[] = []
    const lines = feedback.split('\n')

    for (const line of lines) {
      if (line.includes('• ⚠️')) {
        const cleaned = line.replace(/• ⚠️/g, '').trim()
        if (cleaned.length > 10) {
          warnings.push(cleaned)
        }
      }
    }

    return warnings.slice(0, 5)
  }

  async analyzeWithAllPersonas(
    title: string,
    description: string,
    content: ContentBlock[],
    tags: string[],
    isAnonymous: boolean,
    language: 'en' | 'es'
  ): Promise<AIFeedback[]> {
    const feedbacks = await Promise.all([
      this.analyzeTechnicalFeasibility(
        title,
        description,
        content,
        tags,
        language
      ),
      this.analyzeFounderReality(title, description, content, tags, language),
      this.analyzeMarketSkepticism(title, description, content, tags, language),
      this.analyzeGTMStrategy(title, description, content, tags, language),
      this.analyzeInvestorLens(title, description, content, tags, language),
      this.analyzeRisks(
        title,
        description,
        content,
        tags,
        isAnonymous,
        language
      ),
    ])

    return feedbacks
  }
}

export const aiService = new AIService()
