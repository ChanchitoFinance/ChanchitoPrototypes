/**
 * Idea Service - Centralized access to ideas data
 * Provides a service interface that can be easily swapped for API calls
 */

import { Idea } from '@/lib/types/idea'
import { ContentBlock } from '@/lib/types/content'
import { supabase } from '@/lib/supabase'

/**
 * Interface for Idea Service
 * Allows for easy injection and swapping of implementations
 */
export interface IIdeaService {
  /**
   * Get all ideas
   * @param limit Optional limit for number of ideas to return
   * @param offset Optional offset for pagination
   */
  getIdeas(limit?: number, offset?: number): Promise<Idea[]>

  /**
   * Get a single idea by ID
   */
  getIdeaById(id: string): Promise<Idea | null>

  /**
   * Load more ideas (for infinite scroll)
   * @param currentCount Current number of ideas loaded
   */
  loadMoreIdeas(currentCount: number): Promise<Idea[]>

  /**
   * Get featured ideas for carousel (high score, with videos)
   * @deprecated Use getTrendingIdeas instead
   */
  getFeaturedIdeas(limit?: number): Promise<Idea[]>

  /**
   * Get trending ideas for carousel (ideas with status_flag: 'trending')
   */
  getTrendingIdeas(limit?: number): Promise<Idea[]>

  /**
   * Get new ideas (ideas with status_flag: 'new')
   */
  getNewIdeas(limit?: number): Promise<Idea[]>

  /**
   * Get ideas for "For You" section (personalized/curated)
   */
  getForYouIdeas(limit?: number, offset?: number): Promise<Idea[]>

  /**
   * Get ideas for "Explore" section (all ideas, TikTok-style)
   */
  getExploreIdeas(limit?: number, offset?: number): Promise<Idea[]>

  /**
   * Create a new idea
   */
  createIdea(idea: Omit<Idea, 'id'>): Promise<Idea>
}

/**
 * Supabase Idea Service Implementation
 */
class SupabaseIdeaService implements IIdeaService {
  async getIdeas(limit?: number, offset = 0): Promise<Idea[]> {
    const { data, error } = await supabase
      .from('ideas')
      .select(
        `
        id,
        title,
        status_flag,
        content,
        created_at,
        users!ideas_creator_id_fkey (
          username,
          full_name
        ),
        idea_votes (
          vote_type
        ),
        idea_tags (
          tags (
            name
          )
        )
      `
      )
      .order('created_at', { ascending: false })
      .range(offset, limit ? offset + limit - 1 : undefined)

    if (error) throw error

    return data?.map(this.mapDbIdeaToIdea) || []
  }

  async getIdeaById(id: string): Promise<Idea | null> {
    const { data, error } = await supabase
      .from('ideas')
      .select(
        `
        id,
        title,
        status_flag,
        content,
        created_at,
        users!ideas_creator_id_fkey (
          username,
          full_name
        ),
        idea_votes (
          vote_type
        ),
        idea_tags (
          tags (
            name
          )
        )
      `
      )
      .eq('id', id)
      .single()

    if (error) return null

    return this.mapDbIdeaToIdea(data)
  }

  async loadMoreIdeas(currentCount: number): Promise<Idea[]> {
    return this.getIdeas(5, currentCount)
  }

  async getFeaturedIdeas(limit = 5): Promise<Idea[]> {
    const { data, error } = await supabase
      .from('ideas')
      .select(
        `
        id,
        title,
        status_flag,
        content,
        created_at,
        users!ideas_creator_id_fkey (
          username,
          full_name
        ),
        idea_votes (
          vote_type
        ),
        idea_tags (
          tags (
            name
          )
        )
      `
      )
      .eq('status_flag', 'trending')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return data?.map(this.mapDbIdeaToIdea) || []
  }

  async getTrendingIdeas(limit = 5): Promise<Idea[]> {
    return this.getFeaturedIdeas(limit)
  }

  async getNewIdeas(limit = 2): Promise<Idea[]> {
    const { data, error } = await supabase
      .from('ideas')
      .select(
        `
        id,
        title,
        status_flag,
        content,
        created_at,
        users!ideas_creator_id_fkey (
          username,
          full_name
        ),
        idea_votes (
          vote_type
        ),
        idea_tags (
          tags (
            name
          )
        )
      `
      )
      .eq('status_flag', 'new')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return data?.map(this.mapDbIdeaToIdea) || []
  }

  async getForYouIdeas(limit?: number, offset = 0): Promise<Idea[]> {
    const { data, error } = await supabase
      .from('ideas')
      .select(
        `
        id,
        title,
        status_flag,
        content,
        created_at,
        users!ideas_creator_id_fkey (
          username,
          full_name
        ),
        idea_votes (
          vote_type
        ),
        idea_tags (
          tags (
            name
          )
        )
      `
      )
      .neq('status_flag', 'validated')
      .order('created_at', { ascending: false })
      .range(offset, limit ? offset + limit - 1 : undefined)

    if (error) throw error

    return data?.map(this.mapDbIdeaToIdea) || []
  }

  async getExploreIdeas(limit?: number, offset = 0): Promise<Idea[]> {
    const { data, error } = await supabase
      .from('ideas')
      .select(
        `
        id,
        title,
        status_flag,
        content,
        created_at,
        users!ideas_creator_id_fkey (
          username,
          full_name
        ),
        idea_votes (
          vote_type
        ),
        idea_tags (
          tags (
            name
          )
        )
      `
      )
      .neq('status_flag', 'validated')
      .order('created_at', { ascending: false })
      .range(offset, limit ? offset + limit - 1 : undefined)

    if (error) throw error

    return data?.map(this.mapDbIdeaToIdea) || []
  }

  private mapDbIdeaToIdea(dbIdea: any): Idea {
    const votes = dbIdea.idea_votes || []
    const voteCounts = {
      dislike: votes.filter((v: any) => v.vote_type === 'dislike').length,
      use: votes.filter((v: any) => v.vote_type === 'use').length,
      pay: votes.filter((v: any) => v.vote_type === 'pay').length,
    }
    const totalVotes = voteCounts.dislike + voteCounts.use + voteCounts.pay
    const score = voteCounts.pay * 3 + voteCounts.use * 2 - voteCounts.dislike

    const tags = dbIdea.idea_tags?.map((it: any) => it.tags.name) || []

    const author =
      dbIdea.users?.username || dbIdea.users?.full_name || 'Anonymous'

    const content = dbIdea.content as ContentBlock[] | undefined

    const video =
      content?.find(block => block.type === 'video')?.src ||
      content
        ?.find(block => block.type === 'carousel')
        ?.slides?.find(slide => slide.video)?.video

    return {
      id: dbIdea.id,
      title: dbIdea.title,
      description: content?.find(block => block.type === 'text')?.content || '',
      author,
      score,
      votes: totalVotes,
      votesByType: voteCounts,
      tags,
      createdAt: dbIdea.created_at,
      video,
      content,
      status_flag: dbIdea.status_flag,
    }
  }

  async createIdea(ideaData: Omit<Idea, 'id'>): Promise<Idea> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    // Generate a unique ID
    const newId = `${MOCK_IDEAS.length + 1}`
    
    // Create the new idea with ID
    const newIdea: Idea = {
      ...ideaData,
      id: newId,
    }
    
    // Add to the beginning of the array so it appears first
    MOCK_IDEAS.unshift(newIdea)
    
    return newIdea
  }
}

/**
 * Export singleton instance of the idea service
 * In the future, this can be swapped with an API-based service
 */
export const ideaService: IIdeaService = new SupabaseIdeaService()

/**
 * Factory function to create idea service instances
 * Useful for testing or dependency injection
 */
export function createIdeaService(): IIdeaService {
  return new SupabaseIdeaService()
}
