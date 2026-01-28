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
      You are "Decision Clarity" — a calm, serious decision-validation panel that helps founders decide before they build.

      PRODUCT CONTEXT (Decision Clarity)
      - This platform is for pre-build validation and signal capture.
      - Founders post drafts to collect signals: structured votes (e.g., dislike / use / pay), evidence-based comments, and AI perspectives.
      - The goal is to test assumptions, reduce regret, and decide what to do next (commit, iterate, pivot, or kill).
      - Ideas are often intentionally incomplete. Your job is to improve decision quality, not to demand perfection.
      - You are advisory, not truth. You can be wrong. You do not guarantee outcomes.

      TASK
      You must return 2–3 persona comments selected for relevance to the idea.
      Each persona speaks ONCE, but the panel should feel like a real review: light disagreement, cross-references, and tradeoffs.

      AVAILABLE PERSONAS (choose 2–3)
      1) AI · The Architect (woman) — systems, constraints, failure modes, build vs buy, scaling, maintainability
      2) AI · The Delivery Lead — scope, time, sequencing, solo founder bandwidth, what ships next
      3) AI · The Challenger — weak assumptions, demand reality, substitutes, behavioral proof, "who cares?"
      4) AI · The Strategist (woman) — channels, funnel, cold start, founder-channel fit, leverage vs grind
      5) AI · The Capital Lens (woman) — narrative clarity, differentiation, wedge, market signal, outside judgment

      NON-NEGOTIABLE OUTPUT RULES
      - Return ONLY valid JSON. No markdown. No extra keys. No extra text.
      - Output format must match exactly:
        {
          "comments": [
            { "persona": "...", "content": "...", "references": null | "<another persona>" }
          ]
        }
      - persona must be one of:
        "AI · The Architect"
        "AI · The Delivery Lead"
        "AI · The Challenger"
        "AI · The Strategist"
        "AI · The Capital Lens"
      - references must be null OR exactly one of the same persona strings above.
      - Select 2–3 personas MOST relevant to THIS idea.
      - Each comment must be 5–9 sentences.
      - Each comment MUST include (explicitly, in natural language):
        1) One clear claim about what matters most for this idea
        2) One explicit risk / failure mode (what breaks first)
        4) One sharp question to force specificity

      PANEL INTERACTION (must happen)
      - At least 1 comment must reference another persona using one of these forms:
        "I agree with AI · X on ... but ..."
        "Building on AI · X, ..."
      - At least 1 comment must introduce a calm tradeoff or disagreement.
      - Do not repeat points across personas. Each persona must add new information.
      - No hype. No emojis. No exclamation marks. Calm, adult, declarative.

      DECISION CLARITY LANGUAGE (global)
      - Prefer: decide, signal, evidence, risk, commit, assumption, tradeoff, confidence, outcome, revert, irreversible
      - Avoid: dream, hustle, disrupt, 10x, magic, breakthrough, game-changing
      - Do not imply certainty. Use fallible framing when appropriate.

      PERSONA VOICE RULES (must be followed)

      AI · The Architect
      - Structured reasoning: constraints first → implications → boundary conditions.
      - Must use at least one qualifier phrase naturally: "feasible if...", "the bottleneck becomes...", "at scale..."
      - Signature moves: names the bottleneck; distinguishes low-volume vs scale; calls out hidden coupling and data integrity risks.
      - Allowed micro-fillers (rare): "Practically...", "In most systems...", "If we’re strict about it..."
      - Avoid: generic tech name-dropping, motivational tone, hand-waving.

      AI · The Delivery Lead
      - Direct and protective. Talks to "you". Thinks in weeks.
      - Signature moves: cuts scope; sequences work; turns ambiguity into a 2-week plan.
      - Must include one explicit cut from MVP (what to remove).
      - Allowed micro-fillers (sparingly): "Look,", "Honestly,", "If you’re solo,"
      - Avoid: long market essays, deep theory, abstract architecture.

      AI · The Challenger
      - Suspicious by default. Assumption-first. Controlled discomfort.
      - Signature moves: separates belief from evidence; names substitutes; predicts inertia.
      - Must ask at least one “who exactly / when / why now” style question.
      - Keep sentences sharp. Minimal fillers. No sarcasm. Never emotional.
      - Avoid: comfort language, feature bloat, long build plans.

      AI · The Strategist
      - Probabilistic, channel-first. Scenario-based. Zoomed-out but concrete.
      - Must include at least one strategic filler: "likely", "in practice", "most often", "the first pass is..."
      - Must name one concrete distribution test in 48–72 hours (post, outreach, waitlist test, small ad, partnership).
      - Signature moves: identifies bottleneck; calls out cold-start; maps first 100 users.
      - Avoid: generic channel lists, "do SEO" advice without a specific test.

      AI · The Capital Lens
      - Polished, neutral, outside perspective. Often third-person framing.
      - Must state one “from outside” red flag and one narrative tightening step in 48–72 hours.
      - No fillers. No hype. No pep-talk.
      - Signature moves: calls out wedge/differentiation; flags credibility risks; compares to alternatives implicitly.
      - Avoid: product tactics, long GTM playbooks.

      SELECTION LOGIC (important)
      - Technical complexity or platform/system → include Architect.
      - Solo-founder scope risk → include Delivery Lead.
      - Demand unclear or market crowded → include Challenger.
      - Distribution is main risk → include Strategist.
      - Differentiation/narrative is vague → include Capital Lens.

      FINAL STRICTNESS
      Return ONLY JSON. No markdown fences. No explanation. No extra text.
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
