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
  createIdea(idea: Omit<Idea, 'id'>, spaceId: string): Promise<Idea>

  /**
   * Get available spaces for idea creation
   */
  getSpaces(): Promise<Array<{ id: string; name: string; team_id: string }>>

  /**
   * Toggle a vote for an idea
   * @param ideaId The idea ID
   * @param voteType The type of vote ('dislike', 'use', 'pay')
   */
  toggleVote(ideaId: string, voteType: 'dislike' | 'use' | 'pay'): Promise<Idea>

  /**
   * Get the current user's vote for an idea
   * @param ideaId The idea ID
   */
  getUserVote(ideaId: string): Promise<'dislike' | 'use' | 'pay' | null>

  /**
   * Get all current user's votes for an idea
   * @param ideaId The idea ID
   */
  getUserVotes(
    ideaId: string
  ): Promise<{ use: boolean; dislike: boolean; pay: boolean }>
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
        ),
        comments!left (
          id
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
        ),
        comments!left (
          id
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
        ),
        comments!left (
          id
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
        ),
        comments!left (
          id
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
        ),
        comments!left (
          id
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
        ),
        comments!left (
          id
        )
      `
      )
      .neq('status_flag', 'validated')
      .order('created_at', { ascending: false })
      .range(offset, limit ? offset + limit - 1 : undefined)

    if (error) throw error

    return data?.map(this.mapDbIdeaToIdea) || []
  }

  async toggleVote(
    ideaId: string,
    voteType: 'dislike' | 'use' | 'pay'
  ): Promise<Idea> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Handle different vote types:
    // - 'use' and 'dislike' are mutually exclusive (only one can exist)
    // - 'pay' is independent (can coexist with use/dislike)
    if (voteType === 'use' || voteType === 'dislike') {
      // Check if user has this specific vote type
      const { data: existingVote } = await supabase
        .from('idea_votes')
        .select('vote_type')
        .eq('idea_id', ideaId)
        .eq('voter_id', user.id)
        .eq('vote_type', voteType)
        .maybeSingle()

      // For use/dislike votes, remove any existing use/dislike vote first
      await supabase
        .from('idea_votes')
        .delete()
        .eq('idea_id', ideaId)
        .eq('voter_id', user.id)
        .in('vote_type', ['use', 'dislike'])

      // If clicking the same vote type, don't insert (removes the vote)
      // If clicking different vote type or no vote existed, insert the new vote
      if (!existingVote) {
        await supabase.from('idea_votes').insert({
          idea_id: ideaId,
          voter_id: user.id,
          vote_type: voteType,
        })
      }
    } else if (voteType === 'pay') {
      // Check specifically for pay vote
      const { data: existingPayVote } = await supabase
        .from('idea_votes')
        .select('vote_type')
        .eq('idea_id', ideaId)
        .eq('voter_id', user.id)
        .eq('vote_type', 'pay')
        .maybeSingle()

      // For pay votes, toggle independently
      if (existingPayVote) {
        // Remove pay vote
        await supabase
          .from('idea_votes')
          .delete()
          .eq('idea_id', ideaId)
          .eq('voter_id', user.id)
          .eq('vote_type', 'pay')
      } else {
        // Add pay vote (can coexist with use/dislike)
        await supabase.from('idea_votes').insert({
          idea_id: ideaId,
          voter_id: user.id,
          vote_type: 'pay',
        })
      }
    }

    // Return updated idea
    return this.getIdeaById(ideaId).then(idea => {
      if (!idea) throw new Error('Idea not found')
      return idea
    })
  }

  async getUserVote(ideaId: string): Promise<'dislike' | 'use' | 'pay' | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return null

    const { data, error } = await supabase
      .from('idea_votes')
      .select('vote_type')
      .eq('idea_id', ideaId)
      .eq('voter_id', user.id)
      .limit(1)
      .maybeSingle()

    if (error) throw error

    return data?.vote_type || null
  }

  async getUserVotes(
    ideaId: string
  ): Promise<{ use: boolean; dislike: boolean; pay: boolean }> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { use: false, dislike: false, pay: false }

    const { data, error } = await supabase
      .from('idea_votes')
      .select('vote_type')
      .eq('idea_id', ideaId)
      .eq('voter_id', user.id)

    if (error) throw error

    const votes = data || []
    return {
      use: votes.some(v => v.vote_type === 'use'),
      dislike: votes.some(v => v.vote_type === 'dislike'),
      pay: votes.some(v => v.vote_type === 'pay'),
    }
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

    const commentCount = dbIdea.comments?.length || 0

    return {
      id: dbIdea.id,
      title: dbIdea.title,
      description: content?.find(block => block.type === 'text')?.content || '',
      author,
      score,
      votes: totalVotes,
      votesByType: voteCounts,
      commentCount,
      tags,
      createdAt: dbIdea.created_at,
      video,
      content,
      status_flag: dbIdea.status_flag,
    }
  }

  async createIdea(ideaData: Omit<Idea, 'id'>, spaceId: string): Promise<Idea> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('ideas')
      .insert({
        space_id: spaceId,
        creator_id: user.id,
        title: ideaData.title,
        content: ideaData.content,
        status_flag: ideaData.status_flag || 'new',
      })
      .select()
      .single()

    if (error) throw error

    if (ideaData.tags && ideaData.tags.length > 0) {
      for (const tagName of ideaData.tags) {
        let { data: tag } = await supabase
          .from('tags')
          .select('id')
          .eq('name', tagName)
          .maybeSingle()

        if (!tag) {
          const { data: newTag, error: tagError } = await supabase
            .from('tags')
            .insert({ name: tagName })
            .select('id')
            .single()

          if (tagError) throw tagError

          tag = newTag
        }

        await supabase.from('idea_tags').insert({
          idea_id: data.id,
          tag_id: tag.id,
        })
      }
    }

    return this.getIdeaById(data.id).then(idea => {
      if (!idea) throw new Error('Idea not found after creation')
      return idea
    })
  }

  async getSpaces(): Promise<
    Array<{ id: string; name: string; team_id: string }>
  > {
    const { data, error } = await supabase
      .from('enterprise_spaces')
      .select('id, name, team_id')
      .order('name')

    if (error) {
      console.error('Error fetching spaces:', error)
      throw error
    }

    return data || []
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
