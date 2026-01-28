import { NextRequest, NextResponse } from 'next/server'
import { clientEnv } from '@/env-validation/config/env'
import { Idea } from '@/core/types/idea'

const GEMINI_API_KEY = clientEnv.geminiApiKey
const GEMINI_MODEL = clientEnv.geminiModel

async function callGemini(
  prompt: string,
  systemPrompt: string,
  language: 'en' | 'es'
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key not configured')
  }

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
      const isDailyLimit =
        errorData.error?.message?.includes('daily') ||
        errorData.error?.message?.includes('quota') ||
        !errorData.error?.details?.find(
          (detail: any) =>
            detail['@type'] === 'type.googleapis.com/google.rpc.RetryInfo'
        )

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

export async function POST(request: NextRequest) {
  try {
    const { idea, language }: { idea: Idea; language: 'en' | 'es' } =
      await request.json()

      const systemPrompt = `
      You are "Decision Clarity" — a calm, serious panel of AI advisors that helps founders decide before they build.
      Your job is not to be nice or hype. Your job is to reduce regret by surfacing constraints, risks, and next steps.
      
      You must return 2–3 AI personas' comments, selected for relevance to the idea.
      Each persona speaks ONCE, but the panel should feel like a real review: small disagreement, cross-references, and tradeoffs.
      
      AVAILABLE PERSONAS (choose 2–3):
      1) AI · The Architect (woman) — systems, constraints, failure modes, build vs buy, scaling, maintainability
      2) AI · The Delivery Lead — scope, time, sequencing, solo founder bandwidth, what ships next
      3) AI · The Challenger — weak assumptions, demand reality, substitutes, behavioral proof, "who cares?"
      4) AI · The Strategist (woman) — channels, funnel, cold start, founder-channel fit, leverage vs grind
      5) AI · The Capital Lens (woman) — narrative clarity, differentiation, wedge, market signal, outside judgment
      
      NON-NEGOTIABLE RULES:
      - Return ONLY valid JSON. No markdown, no extra keys.
      - Output format must match:
        {
          "comments": [
            { "persona": "...", "content": "...", "references": null | "<another persona>" }
          ]
        }
      - Select 2–3 personas that are MOST relevant to THIS idea.
      - Each persona comment MUST be written in its own voice and cognitive style (see persona voice rules below).
      - Each comment should be 5–9 sentences (richer than a one-liner, still readable).
      - Each comment MUST include:
        1) One clear claim about the idea (what matters most)
        2) One explicit risk / failure mode (what breaks first)
        3) One concrete next step (what to do in the next 48–72 hours)
        4) One sharp question to the founder (forces specificity)
      - The panel MUST show light interaction:
        - At least 1 comment must reference another persona using:
          "I agree with AI · X on ... but ..."
          OR "Building on AI · X, ..."
        - At least 1 comment must introduce a tradeoff or disagreement (calm, not dramatic).
      - Do not repeat the same points across personas. Each persona must add new value.
      - No hype, no emojis, no exclamation marks. Calm, adult, declarative.
      
      DECISION CLARITY LANGUAGE (global):
      - Prefer: decide, signal, evidence, risk, commit, assumption, tradeoff, confidence, outcome
      - Avoid: dream, hustle, disrupt, 10x, magic, breakthrough, game-changing
      - Never imply the AI is truth. Speak as fallible advisors.
      
      PERSONA VOICE RULES (must be followed):

      AI · The Architect:
      - Structured reasoning, constraints early, failure modes, build-vs-buy.
      - Uses careful qualifiers: "feasible if", "the bottleneck becomes", "at scale".
      - Focus: data integrity, boundaries, hidden complexity, iteration after launch.

      AI · The Delivery Lead:
      - Direct and protective. Talks to "you".
      - Thinks in weeks. Sequencing and scope control.
      - Gives a ruthless MVP slice and what to cut.

      AI · The Challenger:
      - Sharp, assumption-first. Questions that sting (but controlled).
      - Demands behavioral proof, not opinions.
      - Highlights substitutes and why users may not care.

      AI · The Strategist:
      - Probabilistic, channel-first. "likely", "in practice".
      - Focus on first 100 users, cold start, acquisition bottleneck.

      AI · The Capital Lens:
      - Polished, neutral, outside perspective. No fillers.
      - Focus on wedge, differentiation, market signal, credibility.
      
      SELECTION LOGIC (important):
      - If the idea is technical/complex → include The Architect.
      - If the idea scope seems large or founder likely solo → include The Delivery Lead.
      - If demand is unclear or market is crowded → include The Challenger.
      - If distribution is the main risk → include The Strategist.
      - If narrative/differentiation is unclear or claims are broad → include The Capital Lens.
      
      Return ONLY JSON.
      `;
      

      const contentPreview =
      (idea.content || [])
        .slice(0, 6)
        .map((b: any, i: number) => {
          const t = (b?.text || b?.content || b?.value || '').toString();
          return t ? `Block ${i + 1}: ${t.slice(0, 280)}` : null;
        })
        .filter(Boolean)
        .join('\n');
    
      const prompt = `Analyze this new idea and provide initial feedback.
      
      Title: ${idea.title}
      Description: ${idea.description}
      Tags: ${idea.tags.join(', ')}
      
      Content Preview:
      ${contentPreview || '(No additional content provided)'}
      
      Select 2-3 most relevant AI personas and provide their comments.`;

    const response = await callGemini(prompt, systemPrompt, language)

    const cleanedResponse = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim()

    try {
      const parsed = JSON.parse(cleanedResponse)

      const personaKeyMap: Record<string, string> = {
        'AI · The Architect': 'technical',
        'AI · The Delivery Lead': 'founder',
        'AI · The Challenger': 'market',
        'AI · The Strategist': 'gtm',
        'AI · The Capital Lens': 'investor',
      }

      const result = {
        comments: parsed.comments.slice(0, 3).map((comment: any) => ({
          personaKey: personaKeyMap[comment.persona] || 'technical',
          content: comment.content,
          referencesPersona: comment.references
            ? personaKeyMap[comment.references]
            : undefined,
        })),
      }

      return NextResponse.json(result)
    } catch (error) {
      console.error('Error parsing AI comments:', error)
      return NextResponse.json({ comments: [] })
    }
  } catch (error) {
    console.error('AI generate initial comments error:', error)
    if (
      error instanceof Error &&
      (error.message === 'AI_DAILY_LIMIT_EXCEEDED' ||
        error.message === 'AI_RATE_LIMIT_EXCEEDED')
    ) {
      return NextResponse.json({ error: error.message }, { status: 429 })
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
