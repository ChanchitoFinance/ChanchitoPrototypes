import { Idea, IdeaVersionInfo, IdeaVersionGroup } from '../types/idea'

export interface IIdeaService {
  getIdeas(limit?: number, offset?: number): Promise<Idea[]>

  getIdeaById(id: string): Promise<Idea | null>

  getIdeaBySlug(slug: string): Promise<Idea | null>

  getArticles(limit?: number, offset?: number): Promise<Idea[]>

  loadMoreIdeas(currentCount: number): Promise<Idea[]>

  getFeaturedIdeas(limit?: number): Promise<Idea[]>

  getTrendingIdeas(limit?: number): Promise<Idea[]>

  getNewIdeas(limit?: number): Promise<Idea[]>

  getRecentIdeas(limit?: number): Promise<Idea[]>

  getFeaturedByScore(limit?: number): Promise<Idea[]>

  getIdeasByStatusFlag(
    statusFlag: 'new' | 'active_discussion' | 'trending' | 'validated',
    limit?: number
  ): Promise<Idea[]>

  getCommunitiesFavorite(limit?: number): Promise<Idea[]>

  getMostCommented(limit?: number): Promise<Idea[]>

  getMostDetailedIdeas(limit?: number): Promise<Idea[]>

  getHighestPayIntentionIdeas(limit?: number): Promise<Idea[]>

  getMostIteratedIdeas(limit?: number): Promise<Idea[]>

  getForYouIdeas(limit?: number, offset?: number): Promise<Idea[]>

  getExploreIdeas(limit?: number, offset?: number): Promise<Idea[]>

  getAllIdeasForAdmin(
    search?: string,
    limit?: number,
    offset?: number
  ): Promise<{ ideas: Idea[]; total: number }>

  getIdeasWithAdvancedFilters(filters: {
    searchQuery?: string
    filterConditions?: {
      field: string
      operator: string
      value: number
    }[]
    sortField?: string
    sortDirection?: string
    limit?: number
    offset?: number
  }): Promise<{ ideas: Idea[]; total: number }>

  getAllTags(): Promise<string[]>

  getIdeasWithFilters(options: {
    limit?: number
    offset?: number
    sortBy?: 'date' | 'popularity' | 'comments'
    tags?: string[]
  }): Promise<Idea[]>

  createIdea(idea: Omit<Idea, 'id'>): Promise<Idea>

  updateIdea(ideaId: string, updates: Partial<Idea>): Promise<Idea>

  deleteIdea(ideaId: string): Promise<boolean>

  // Versioning methods
  getIdeaVersions(ideaGroupId: string): Promise<IdeaVersionInfo[]>

  createIdeaVersion(
    sourceIdeaId: string,
    updates?: Partial<Idea>
  ): Promise<Idea>

  setActiveVersion(ideaId: string): Promise<void>

  getVersionGroup(ideaId: string): Promise<IdeaVersionGroup | null>

  toggleVote(
    ideaId: string,
    voteType: 'dislike' | 'use' | 'pay',
    originalIdea?: Idea
  ): Promise<Idea>

  getUserVote(ideaId: string): Promise<'dislike' | 'use' | 'pay' | null>

  getUserVotes(
    ideaId: string
  ): Promise<{ use: boolean; dislike: boolean; pay: boolean }>

  getUserVotesForIdeas(
    ideaIds: string[]
  ): Promise<Record<string, { use: boolean; dislike: boolean; pay: boolean }>>

  getUserIdeas(limit?: number, offset?: number): Promise<Idea[]>

  getUserIdeasAnalytics(): Promise<{
    totalIdeas: number
    totalVotes: number
    totalComments: number
    averageScore: number
    engagementRate: number
    impactScore: number
    feasibilityScore: number
    ideasWithStats: Array<{
      idea: Idea
      engagementRate: number
      voteDistribution: { use: number; dislike: number; pay: number }
      categoryDistribution: Record<string, number>
    }>
    topPerformingIdeas: Idea[]
    worstPerformingIdeas: Idea[]
    mostDiscussedIdeas: Idea[]
    voteTypeBreakdown: { use: number; dislike: number; pay: number }
    categoryBreakdown: Record<string, number>
    sentimentAnalysis: { positive: number; neutral: number; negative: number }
  }>

  // Market Validation methods
  saveMarketValidation(
    ideaId: string,
    ideaVersionNumber: number,
    validation: {
      marketSnapshot?: any
      behavioralHypotheses?: any
      marketSignals?: any
      conflictsAndGaps?: any
      synthesisAndNextSteps?: any
      searchData?: any
      language?: string
    }
  ): Promise<void>

  getMarketValidationByIdeaId(
    ideaId: string,
    ideaVersionNumber?: number
  ): Promise<any[]>

  getLatestMarketValidation(
    ideaId: string,
    ideaVersionNumber: number
  ): Promise<any | null>

  getMarketValidationVersion(
    ideaId: string,
    ideaVersionNumber: number,
    version: number
  ): Promise<any | null>

  deleteMarketValidation(
    ideaId: string,
    ideaVersionNumber?: number
  ): Promise<void>

  saveIdeaSignalsSynthesis(
    ideaId: string,
    ideaVersionNumber: number,
    synthesis: { synthesisResult: Record<string, string>; language?: string }
  ): Promise<void>

  getIdeaSignalsSynthesisByIdeaId(
    ideaId: string,
    ideaVersionNumber?: number
  ): Promise<any[]>

  getLatestIdeaSignalsSynthesis(
    ideaId: string,
    ideaVersionNumber: number
  ): Promise<any | null>

  getIdeaSignalsSynthesisVersion(
    ideaId: string,
    ideaVersionNumber: number,
    version: number
  ): Promise<any | null>

  deleteIdeaSignalsSynthesis(
    ideaId: string,
    ideaVersionNumber?: number
  ): Promise<void>

  // AI Personas Evaluation methods
  saveAIPersonasEvaluation(
    ideaId: string,
    ideaVersionNumber: number,
    evaluation: {
      aiPersonasEvaluation?: any
      language?: string
    }
  ): Promise<void>

  getAIPersonasEvaluationByIdeaId(
    ideaId: string,
    ideaVersionNumber?: number
  ): Promise<any[]>

  getLatestAIPersonasEvaluation(
    ideaId: string,
    ideaVersionNumber: number
  ): Promise<any | null>

  getAIPersonasEvaluationVersion(
    ideaId: string,
    ideaVersionNumber: number,
    version: number
  ): Promise<any | null>

  deleteAIPersonasEvaluation(
    ideaId: string,
    ideaVersionNumber?: number
  ): Promise<void>
}
