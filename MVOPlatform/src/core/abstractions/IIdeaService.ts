import { Idea } from '../types/idea'

export interface IIdeaService {
  getIdeas(limit?: number, offset?: number): Promise<Idea[]>

  getIdeaById(id: string): Promise<Idea | null>

  loadMoreIdeas(currentCount: number): Promise<Idea[]>

  getFeaturedIdeas(limit?: number): Promise<Idea[]>

  getTrendingIdeas(limit?: number): Promise<Idea[]>

  getNewIdeas(limit?: number): Promise<Idea[]>

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

  toggleVote(ideaId: string, voteType: 'dislike' | 'use' | 'pay'): Promise<Idea>

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
}
