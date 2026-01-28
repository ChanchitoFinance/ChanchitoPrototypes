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

// ============================================
// Market Validation Types (New System)
// ============================================

// Confidence levels for hypotheses and signals
export type ConfidenceLevel = 'low' | 'medium' | 'high'

// Market context types
export type MarketType = 'B2C' | 'B2B' | 'B2B2C'
export type MarketScope = 'horizontal' | 'vertical'
export type CategoryType = 'new_category' | 'existing_category'

// Demand momentum classification
export type DemandMomentum = 'emerging' | 'accelerating' | 'stable' | 'declining' | 'seasonal'

// Competitive landscape classification
export type CompetitiveLandscape = 'sparse' | 'fragmented' | 'crowded' | 'commoditized'

// Geographic scope classification
export type GeographicScope = 'local' | 'regional' | 'global' | 'global_with_localization'

// Evidence type classification
export type EvidenceType = 'behavioral' | 'stated' | 'quantitative'

// Source with citation info
export interface CitedSource {
  title: string
  url: string
  evidenceType: EvidenceType
  snippet?: string
}

// Market Snapshot section (Section 1)
export interface MarketSnapshot {
  customerSegment: {
    primaryUser: string
    buyer?: string
    contextOfUse: string
    environment: string // consumer, SMB, enterprise, regulated
  }
  marketContext: {
    type: MarketType
    scope: MarketScope
    categoryType: CategoryType
  }
  geography: string
  timingContext: string
}

// Behavioral Hypothesis layer types
export type HypothesisLayer = 'existence' | 'awareness' | 'consideration' | 'intent' | 'pay_intention'

// Behavioral Hypothesis (Section 2)
export interface BehavioralHypothesis {
  layer: HypothesisLayer
  title: string
  description: string
  evidenceSummary: string
  confidence: ConfidenceLevel
  supportingSources: CitedSource[]
  contradictingSignals?: string[]
}

// Market Signal types (Section 3)
export type MarketSignalType =
  | 'demand_intensity'
  | 'problem_salience'
  | 'existing_spend'
  | 'competitive_landscape'
  | 'switching_friction'
  | 'distribution'
  | 'geographic_fit'
  | 'timing'
  | 'economic_plausibility'

// Market Signal (Section 3)
export interface MarketSignal {
  type: MarketSignalType
  title: string
  summary: string
  classification?: string // Type-specific classification (e.g., "Emerging" for demand)
  evidenceSnippets: string[]
  sources: CitedSource[]
  strength: ConfidenceLevel
}

// Conflict/Gap item (Section 4)
export interface ConflictItem {
  type: 'contradiction' | 'missing_signal' | 'risk_flag'
  description: string
  relatedSignals?: string[]
}

// Conflicts & Gaps section (Section 4)
export interface ConflictsAndGaps {
  contradictions: ConflictItem[]
  missingSignals: ConflictItem[]
  riskFlags: ConflictItem[]
}

// Synthesis & Next Steps (Section 5)
export interface SynthesisAndNextSteps {
  strongPoints: string[]
  weakPoints: string[]
  keyUnknowns: string[]
  suggestedNextSteps: string[]
  pivotGuidance?: string[]
}

// Complete Market Validation Result
export interface MarketValidationResult {
  marketSnapshot: MarketSnapshot
  behavioralHypotheses: BehavioralHypothesis[]
  marketSignals: MarketSignal[]
  conflictsAndGaps: ConflictsAndGaps
  synthesisAndNextSteps: SynthesisAndNextSteps

  // Raw search data (for reference/transparency)
  searchData: {
    googleResults: GoogleSearchResult[]
    googleTrends: GoogleTrendsData[]
    bingResults: BingSearchResult[]
  }

  // Metadata
  timestamp: Date
  version: number
}

// Tab type for Market Validation UI
export type MarketValidationTab =
  | 'market_snapshot'
  | 'behavioral_hypotheses'
  | 'market_signals'
  | 'conflicts_gaps'
  | 'synthesis'

// ============================================
// Search Result Types (Used by Market Validation)
// ============================================
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

// ============================================
// OpenAI Pipeline Types
// ============================================

// Chunked content from ingestion service
export interface ChunkedContent {
  url: string
  title: string
  cleanedText: string
  source: 'google' | 'bing' | 'trends'
}

// Partial analysis from gpt-4o-mini stage
export interface PartialAnalysis {
  sourceUrl: string
  title: string
  summary: string
  keywords: string[]
  relevantQuotes: string[]
  evidenceType: EvidenceType
}

// Idea context for the AI pipeline
export interface IdeaContext {
  title: string
  description?: string
  tags: string[]
}


export const AI_PERSONAS: Record<AIPersonaType, AIPersona> = {
  technical: {
    id: 'technical',
    name: 'AI · The Architect',
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
