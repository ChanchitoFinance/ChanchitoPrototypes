import { commentService } from './commentService'
import { Idea } from '@/core/types/idea'
import { Comment } from '@/core/types/comment'

export const AI_PERSONA_NAMES: Record<string, string> = {
  technical: 'AI · Technical Feasibility',
  founder: 'AI · Founder Reality Check',
  market: 'AI · Market Skeptic',
  gtm: 'AI · GTM & Distribution',
  investor: 'AI · Investor Lens',
}

export const AI_PERSONA_HANDLES: Record<string, string> = {
  technical: '@ai_technical_feasibility',
  founder: '@ai_founder_reality_check',
  market: '@ai_market_skeptic',
  gtm: '@ai_gtm_distribution',
  investor: '@ai_investor_lens',
}

class AICommentService {
  async createInitialAIComments(
    idea: Idea,
    userId: string,
    language: 'en' | 'es'
  ): Promise<void> {
    try {
      const response = await fetch('/api/ai/generate-initial-comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idea,
          language,
        }),
      })

      if (!response.ok) {
        if (response.status === 429) {
          console.warn('AI daily limit exceeded for initial comments')
          return
        }
        throw new Error('Failed to generate initial comments')
      }

      const result = await response.json()

      if (result.comments.length === 0) return

      const commentIdMap: Record<string, string> = {}

      for (const aiComment of result.comments) {
        const personaName = AI_PERSONA_NAMES[aiComment.personaKey]
        const content = `${personaName}: ${aiComment.content}`

        let parentId: string | undefined = undefined

        if (
          aiComment.referencesPersona &&
          commentIdMap[aiComment.referencesPersona]
        ) {
          parentId = commentIdMap[aiComment.referencesPersona]
        }

        const newComment = await commentService.addComment(
          idea.id,
          content,
          personaName,
          `/ai-personas/${aiComment.personaKey}.png`,
          parentId
        )

        commentIdMap[aiComment.personaKey] = newComment.id
      }
    } catch (error) {
      console.error('Error creating initial AI comments:', error)
    }
  }

  async handleMentionedPersonas(
    idea: Idea,
    allComments: Comment[],
    userComment: Comment,
    mentionedPersonas: string[],
    userId: string,
    language: 'en' | 'es'
  ): Promise<void> {
    if (mentionedPersonas.length === 0 || mentionedPersonas.length > 3) return

    try {
      const response = await fetch('/api/ai/respond-to-mention', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idea,
          allComments,
          mentionComment: userComment,
          mentionedPersonas,
          language,
        }),
      })

      if (!response.ok) {
        if (response.status === 429) {
          console.warn('AI daily limit exceeded for mention response')
          return
        }
        throw new Error('Failed to respond to mention')
      }

      const result = await response.json()

      if (result.responses.length === 0) return

      const commentIdMap: Record<string, string> = {
        user: userComment.id,
      }

      for (const aiResponse of result.responses) {
        const personaName = AI_PERSONA_NAMES[aiResponse.personaKey]
        const content = `${personaName}: ${aiResponse.content}`

        let parentId = userComment.id

        if (
          aiResponse.referencesPersona &&
          commentIdMap[aiResponse.referencesPersona]
        ) {
          parentId = commentIdMap[aiResponse.referencesPersona]
        }

        const newComment = await commentService.addComment(
          idea.id,
          content,
          personaName,
          `/ai-personas/${aiResponse.personaKey}.png`,
          parentId
        )

        commentIdMap[aiResponse.personaKey] = newComment.id
      }
    } catch (error) {
      console.error('Error handling mentioned personas:', error)
    }
  }

  extractMentionedPersonas(content: string): string[] {
    const handles = Object.values(AI_PERSONA_HANDLES)
    const mentioned: string[] = []

    for (const [key, handle] of Object.entries(AI_PERSONA_HANDLES)) {
      if (content.toLowerCase().includes(handle.toLowerCase())) {
        mentioned.push(key)
      }
    }

    return mentioned.slice(0, 3)
  }

  isAIComment(content: string): boolean {
    return Object.values(AI_PERSONA_NAMES).some(name =>
      content.startsWith(`${name}:`)
    )
  }

  extractAIPersonaFromComment(content: string): {
    personaKey: string | null
    cleanContent: string
  } {
    for (const [key, name] of Object.entries(AI_PERSONA_NAMES)) {
      if (content.startsWith(`${name}:`)) {
        return {
          personaKey: key,
          cleanContent: content.substring(name.length + 1).trim(),
        }
      }
    }

    return {
      personaKey: null,
      cleanContent: content,
    }
  }

  highlightMentions(content: string): string {
    let highlighted = content

    for (const handle of Object.values(AI_PERSONA_HANDLES)) {
      const regex = new RegExp(`(${handle})`, 'gi')
      highlighted = highlighted.replace(
        regex,
        '<span class="text-accent font-medium cursor-pointer hover:underline">$1</span>'
      )
    }

    return highlighted
  }
}

export const aiCommentService = new AICommentService()
