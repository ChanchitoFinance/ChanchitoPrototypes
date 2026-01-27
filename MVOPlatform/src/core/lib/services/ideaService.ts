/**
 * Idea Service - Centralized access to ideas data
 * Provides a service interface that can be easily swapped for API calls
 */

import { Idea, IdeaVersionInfo, IdeaVersionGroup } from '@/core/types/idea'
import { ContentBlock } from '@/core/types/content'
import {
  supabase,
  toggleVoteRPC,
  getUserVotesForIdeasRPC,
} from '@/core/lib/supabase'
import { IIdeaService } from '@/core/abstractions/IIdeaService'

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
        anonymous,
        version_number,
        idea_group_id,
        is_active_version,
        users!ideas_creator_id_fkey (
          username,
          full_name,
          email
        ),
        idea_votes (
          vote_type
        ),
        tags,
        comments!left (
          id
        )
      `
      )
      .eq('is_active_version', true)
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
        anonymous,
        version_number,
        idea_group_id,
        is_active_version,
        users!ideas_creator_id_fkey (
          username,
          full_name,
          email
        ),
        idea_votes (
          vote_type
        ),
        tags,
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
        anonymous,
        version_number,
        idea_group_id,
        is_active_version,
        users!ideas_creator_id_fkey (
          username,
          full_name
        ),
        idea_votes (
          vote_type
        ),
        tags,
        comments!left (
          id
        )
      `
      )
      .eq('is_active_version', true)
      .eq('status_flag', 'trending')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return data?.map(this.mapDbIdeaToIdea) || []
  }

  async getTrendingIdeas(limit = 5): Promise<Idea[]> {
    const { data, error } = await supabase
      .from('ideas')
      .select(
        `
        id,
        title,
        status_flag,
        content,
        created_at,
        anonymous,
        version_number,
        idea_group_id,
        is_active_version,
        users!ideas_creator_id_fkey (
          username,
          full_name
        ),
        idea_votes (
          vote_type
        ),
        tags,
        comments!left (
          id
        )
      `
      )
      .eq('is_active_version', true)
      .neq('status_flag', 'validated')
      .order('created_at', { ascending: false })
      .limit(limit * 10) // Fetch more to filter later

    if (error) throw error

    const ideas = data?.map(this.mapDbIdeaToIdea) || []

    // Filter ideas with at least one video or image
    const ideasWithMedia = ideas.filter(idea => idea.video || idea.image)

    // Sort by total engagement (votes + comments, descending)
    const sortedIdeas = ideasWithMedia.sort(
      (a, b) => b.votes + b.commentCount - (a.votes + a.commentCount)
    )

    // Return top ideas up to the limit
    return sortedIdeas.slice(0, limit)
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
        anonymous,
        version_number,
        idea_group_id,
        is_active_version,
        users!ideas_creator_id_fkey (
          username,
          full_name
        ),
        idea_votes (
          vote_type
        ),
        tags,
        comments!left (
          id
        )
      `
      )
      .eq('is_active_version', true)
      .eq('status_flag', 'new')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return data?.map(this.mapDbIdeaToIdea) || []
  }

  async getRecentIdeas(limit = 30): Promise<Idea[]> {
    const { data, error } = await supabase
      .from('ideas')
      .select(
        `
        id,
        title,
        status_flag,
        content,
        created_at,
        anonymous,
        version_number,
        idea_group_id,
        is_active_version,
        users!ideas_creator_id_fkey (
          username,
          full_name
        ),
        idea_votes (
          vote_type
        ),
        tags,
        comments!left (
          id
        )
      `
      )
      .eq('is_active_version', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return data?.map(this.mapDbIdeaToIdea) || []
  }

  async getFeaturedByScore(limit = 30): Promise<Idea[]> {
    const { data, error } = await supabase
      .from('ideas')
      .select(
        `
        id,
        title,
        status_flag,
        content,
        created_at,
        anonymous,
        version_number,
        idea_group_id,
        is_active_version,
        users!ideas_creator_id_fkey (
          username,
          full_name
        ),
        idea_votes (
          vote_type
        ),
        tags,
        comments!left (
          id
        )
      `
      )
      .eq('is_active_version', true)
      .order('created_at', { ascending: false })
      .limit(limit * 3)

    if (error) throw error

    const ideas = data?.map(this.mapDbIdeaToIdea) || []

    // Sort by score (most positive) descending
    const sortedIdeas = ideas.sort((a, b) => b.score - a.score)

    return sortedIdeas.slice(0, limit)
  }

  async getIdeasByStatusFlag(
    statusFlag: 'new' | 'active_discussion' | 'trending' | 'validated',
    limit = 30
  ): Promise<Idea[]> {
    const { data, error } = await supabase
      .from('ideas')
      .select(
        `
        id,
        title,
        status_flag,
        content,
        created_at,
        anonymous,
        version_number,
        idea_group_id,
        is_active_version,
        users!ideas_creator_id_fkey (
          username,
          full_name
        ),
        idea_votes (
          vote_type
        ),
        tags,
        comments!left (
          id
        )
      `
      )
      .eq('is_active_version', true)
      .eq('status_flag', statusFlag)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return data?.map(this.mapDbIdeaToIdea) || []
  }

  async getCommunitiesFavorite(limit = 30): Promise<Idea[]> {
    const { data, error } = await supabase
      .from('ideas')
      .select(
        `
        id,
        title,
        status_flag,
        content,
        created_at,
        anonymous,
        version_number,
        idea_group_id,
        is_active_version,
        users!ideas_creator_id_fkey (
          username,
          full_name
        ),
        idea_votes (
          vote_type
        ),
        tags,
        comments!left (
          id
        )
      `
      )
      .eq('is_active_version', true)
      .order('created_at', { ascending: false })
      .limit(limit * 3)

    if (error) throw error

    const ideas = data?.map(this.mapDbIdeaToIdea) || []

    // Sort by votes (use + pay) descending - community favorites
    const sortedIdeas = ideas.sort((a, b) => {
      const aFavoriteScore = a.votesByType.use + a.votesByType.pay * 2
      const bFavoriteScore = b.votesByType.use + b.votesByType.pay * 2
      return bFavoriteScore - aFavoriteScore
    })

    return sortedIdeas.slice(0, limit)
  }

  async getMostCommented(limit = 30): Promise<Idea[]> {
    const { data, error } = await supabase
      .from('ideas')
      .select(
        `
        id,
        title,
        status_flag,
        content,
        created_at,
        anonymous,
        version_number,
        idea_group_id,
        is_active_version,
        users!ideas_creator_id_fkey (
          username,
          full_name
        ),
        idea_votes (
          vote_type
        ),
        tags,
        comments!left (
          id
        )
      `
      )
      .eq('is_active_version', true)
      .order('created_at', { ascending: false })
      .limit(limit * 3)

    if (error) throw error

    const ideas = data?.map(this.mapDbIdeaToIdea) || []

    // Sort by comment count descending
    const sortedIdeas = ideas.sort((a, b) => b.commentCount - a.commentCount)

    return sortedIdeas.slice(0, limit)
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
        anonymous,
        version_number,
        idea_group_id,
        is_active_version,
        users!ideas_creator_id_fkey (
          username,
          full_name
        ),
        idea_votes (
          vote_type
        ),
        tags,
        comments!left (
          id
        )
      `
      )
      .eq('is_active_version', true)
      .neq('status_flag', 'validated')
      .order('created_at', { ascending: false })
      .range(offset, limit ? offset + limit - 1 : undefined)

    if (error) throw error

    return data?.map(this.mapDbIdeaToIdea) || []
  }

  async getExploreIdeas(limit?: number, offset = 0): Promise<Idea[]> {
    // Fetch more ideas to sort by popularity (score)
    const fetchLimit = limit ? Math.max(limit * 5, 50) : 100

    const { data, error } = await supabase
      .from('ideas')
      .select(
        `
        id,
        title,
        status_flag,
        content,
        created_at,
        anonymous,
        version_number,
        idea_group_id,
        is_active_version,
        users!ideas_creator_id_fkey (
          username,
          full_name,
          email
        ),
        idea_votes (
          vote_type
        ),
        tags,
        comments!left (
          id
        )
      `
      )
      .eq('is_active_version', true)
      .neq('status_flag', 'validated')
      .order('created_at', { ascending: false })
      .limit(fetchLimit)

    if (error) throw error

    const ideas = data?.map(this.mapDbIdeaToIdea) || []

    // Sort by score (popularity) descending
    const sortedIdeas = ideas.sort((a, b) => b.score - a.score)

    // Apply offset and limit after sorting
    const startIndex = offset
    const endIndex = limit ? startIndex + limit : undefined

    return sortedIdeas.slice(startIndex, endIndex)
  }

  async getAllIdeasForAdmin(
    search?: string,
    limit = 20,
    offset = 0
  ): Promise<{ ideas: Idea[]; total: number }> {
    // First, get the total count
    let countQuery = supabase
      .from('ideas')
      .select('id', { count: 'exact', head: true })

    // Add search functionality if search query is provided
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`

      // Search in title and content fields
      countQuery = countQuery.or(
        `title.ilike.${searchTerm},` +
          `content->>description.ilike.${searchTerm}`
      )
    }

    const { count: titleDescCount, error: countError } = await countQuery

    let totalCount = titleDescCount || 0

    // If searching, also count tag-matched ideas
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`
      const { count: tagCount, error: tagCountError } = await supabase
        .from('ideas')
        .select('id', { count: 'exact', head: true })
        .filter('tags', 'cs', [searchTerm.replace(/%/g, '')])

      if (!tagCountError && tagCount) {
        // Subtract overlapping ideas to avoid double counting
        totalCount = (titleDescCount || 0) + tagCount
      }
    }

    let query = supabase
      .from('ideas')
      .select(
        `
        id,
        title,
        status_flag,
        content,
        created_at,
        anonymous,
        users!ideas_creator_id_fkey (
          username,
          full_name,
          ,
        ),
        idea_votes (
          vote_type
        ),
        ),
        tags,
        comments!left (
          id
        )
      `
      )
      .order('created_at', { ascending: false })

    // Add search functionality if search query is provided
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`

      // Search in title and content fields
      query = query.or(
        `title.ilike.${searchTerm},` +
          `content->>description.ilike.${searchTerm}`
      )
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    let { data, error } = await query

    if (error) {
      console.error('Error fetching all ideas for admin:', error)
      throw error
    }

    // If we have search results, also fetch ideas that match tags
    let tagMatchedIdeas: any[] = []
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`
      const { data: tagData, error: tagError } = await supabase
        .from('ideas')
        .select(
          `
          id,
          title,
          status_flag,
          content,
          created_at,
          anonymous,
          users!ideas_creator_id_fkey (
            username,
            full_name,
            ,
          ),
          idea_votes (
            vote_type
        ),
          ),
          ,
          comments!left (
            id
          )
        `
        )
        .filter('tags', 'cs', [searchTerm.replace(/%/g, '')])
        .order('created_at', { ascending: false })
        .range(0, limit * 2) // Fetch more to account for overlaps

      if (tagError) {
        console.error('Error fetching tag-matched ideas for admin:', tagError)
      } else {
        tagMatchedIdeas = tagData || []
      }
    }

    // Combine results and remove duplicates
    const allIdeas = [...(data || []), ...tagMatchedIdeas]
    const uniqueIdeas = allIdeas.filter(
      (idea, index, self) => index === self.findIndex(i => i.id === idea.id)
    )

    // Apply final pagination after combining and deduplicating
    const paginatedIdeas = uniqueIdeas.slice(offset, offset + limit)

    return {
      ideas: paginatedIdeas.map(this.mapDbIdeaToIdea),
      total: totalCount,
    }
  }

  async getIdeasWithAdvancedFilters(filters: {
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
  }): Promise<{ ideas: Idea[]; total: number }> {
    const {
      searchQuery,
      filterConditions = [],
      sortField = 'createdAt',
      sortDirection = 'desc',
      limit = 20,
      offset = 0,
    } = filters

    const { data, error } = await supabase.rpc('rpc_get_filtered_ideas', {
      search_query: searchQuery || null,
      filter_conditions: filterConditions.length > 0 ? filterConditions : null,
      sort_field: sortField,
      sort_direction: sortDirection,
      limit_int: limit,
      offset_int: offset,
    })

    if (error) {
      console.error('Error fetching filtered ideas:', error)
      throw error
    }

    if (!data || data.length === 0) {
      return { ideas: [], total: 0 }
    }

    const result = data[0]
    const totalCount = result.total_count || 0

    let ideasData = result.ideas
    if (typeof ideasData === 'string') {
      ideasData = JSON.parse(ideasData)
    }

    if (!Array.isArray(ideasData)) {
      console.error('ideasData is not an array:', ideasData)
      ideasData = []
    }

    const ideas: Idea[] = ideasData.map((ideaJson: any) => {
      // Handle content parsing similar to mapDbIdeaToIdea
      let contentBlocks: ContentBlock[] | undefined
      let heroImage: string | undefined
      let heroVideo: string | undefined
      let description: string | undefined

      // New format: content is an object with blocks, hero_image, hero_video, description
      contentBlocks = ideaJson.content?.blocks as ContentBlock[] | undefined
      heroImage = ideaJson.content?.hero_image
      heroVideo = ideaJson.content?.hero_video
      description = ideaJson.content?.description

      const video =
        heroVideo ||
        contentBlocks?.find(block => block.type === 'video')?.src ||
        contentBlocks
          ?.find(block => block.type === 'carousel')
          ?.slides?.find(slide => slide.video)?.video

      const image =
        heroImage ||
        contentBlocks?.find(block => block.type === 'image')?.src ||
        contentBlocks
          ?.find(block => block.type === 'carousel')
          ?.slides?.find(slide => slide.image)?.image

      return {
        id: ideaJson.id,
        title: ideaJson.title,
        description: description || '',
        author:
          ideaJson.creator?.username ||
          ideaJson.creator?.full_name ||
          'Anonymous',
        score: ideaJson.score || 0,
        votes: ideaJson.votes || 0,
        votesByType: {
          use: ideaJson.votesByType?.use || 0,
          dislike: ideaJson.votesByType?.dislike || 0,
          pay: ideaJson.votesByType?.pay || 0,
        },
        commentCount: ideaJson.commentCount || 0,
        tags: ideaJson.tags || [],
        createdAt: ideaJson.createdAt,
        image: image,
        video: video,
        content: contentBlocks,
        status_flag: ideaJson.status_flag,
        anonymous: ideaJson.anonymous || false,
        creatorEmail: ideaJson.creator?.email || null,
      }
    })

    return {
      ideas,
      total: totalCount,
    }
  }

  private getFieldValueForFiltering(idea: Idea, field: string): number {
    // Handle nested fields like 'votesByType.use'
    if (field.startsWith('votesByType.')) {
      const voteType = field.split('.')[1] as keyof typeof idea.votesByType
      return idea.votesByType[voteType] || 0
    }

    // Handle regular fields
    switch (field) {
      case 'score':
        return idea.score
      case 'votes':
        return idea.votes
      case 'commentCount':
        return idea.commentCount
      default:
        return 0
    }
  }

  private compareValues(
    value: number,
    operator: string,
    target: number
  ): boolean {
    switch (operator) {
      case '>':
        return value > target
      case '<':
        return value < target
      case '=':
        return value === target
      case '>=':
        return value >= target
      case '<=':
        return value <= target
      default:
        return true
    }
  }

  private applyClientSideSorting(
    ideas: Idea[],
    sortField: string,
    sortDirection: string
  ): Idea[] {
    return [...ideas].sort((a, b) => {
      const fieldA = this.getFieldValueForFiltering(a, sortField)
      const fieldB = this.getFieldValueForFiltering(b, sortField)

      if (sortDirection === 'asc') {
        return fieldA - fieldB
      } else {
        return fieldB - fieldA
      }
    })
  }

  async getAllTags(): Promise<string[]> {
    // Extract unique tags from all ideas
    const { data, error } = await supabase
      .from('ideas')
      .select('tags')
      .eq('is_active_version', true)

    if (error) throw error

    const allTags = new Set<string>()
    data?.forEach(idea => {
      if (idea.tags && Array.isArray(idea.tags)) {
        idea.tags.forEach((tag: string) => allTags.add(tag))
      }
    })

    return Array.from(allTags).sort()
  }

  async getIdeasWithFilters(
    options: {
      limit?: number
      offset?: number
      sortBy?: 'date' | 'popularity' | 'comments'
      tags?: string[]
    } = {}
  ): Promise<Idea[]> {
    const { limit, offset = 0, sortBy = 'date', tags } = options
    // Fetch more if sorting by popularity or comments or filtering
    const fetchLimit =
      sortBy === 'date' && !tags ? limit || 20 : limit ? limit * 5 : 100
    const { data, error } = await supabase
      .from('ideas')
      .select(
        `
        id,
        title,
        status_flag,
        content,
        created_at,
        anonymous,
        version_number,
        idea_group_id,
        is_active_version,
        users!ideas_creator_id_fkey (
          username,
          full_name
        idea_votes (
          vote_type
        ),
        tags,
        comments!left (
          id
        )
      `
      )
      .eq('is_active_version', true)
      .order('created_at', { ascending: false })
      .limit(fetchLimit)
    if (error) throw error
    let ideas = data?.map(this.mapDbIdeaToIdea) || []
    // Filter by tags if provided
    if (tags && tags.length > 0) {
      ideas = ideas.filter(idea => idea.tags.some(tag => tags.includes(tag)))
    }
    // Sort
    if (sortBy === 'popularity') {
      ideas = ideas.sort((a, b) => b.score - a.score)
    } else if (sortBy === 'comments') {
      ideas = ideas.sort((a, b) => b.commentCount - a.commentCount)
    }
    // Apply offset and limit
    return ideas.slice(offset, limit ? offset + limit : undefined)
  }

  async toggleVote(
    ideaId: string,
    voteType: 'dislike' | 'use' | 'pay'
  ): Promise<Idea> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Use optimized RPC function for single query operation
    const result = await toggleVoteRPC(ideaId, voteType)

    // Map the result back to Idea format
    const updatedIdea = this.mapRpcResultToIdea(result)
    if (!updatedIdea) throw new Error('Idea not found')

    return updatedIdea
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

  async getUserVotesForIdeas(
    ideaIds: string[]
  ): Promise<Record<string, { use: boolean; dislike: boolean; pay: boolean }>> {
    // Use optimized RPC function for batch fetch
    const votes = await getUserVotesForIdeasRPC(ideaIds)

    // Ensure the response is properly formatted
    if (!votes || typeof votes !== 'object') {
      console.warn('Invalid votes response format, returning empty object')
      return {}
    }

    // Transform the response to ensure all vote types are present for each idea
    const result: Record<
      string,
      { use: boolean; dislike: boolean; pay: boolean }
    > = {}

    for (const ideaId of ideaIds) {
      if (votes[ideaId]) {
        result[ideaId] = {
          use: votes[ideaId].use || false,
          dislike: votes[ideaId].dislike || false,
          pay: votes[ideaId].pay || false,
        }
      } else {
        // If no votes for this idea, set all to false
        result[ideaId] = {
          use: false,
          dislike: false,
          pay: false,
        }
      }
    }

    return result
  }

  async getUserIdeas(limit?: number, offset = 0): Promise<Idea[]> {
    // Get the current session instead of just the user
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('getUserIdeas - Session error:', sessionError)
      throw sessionError
    }

    if (!session?.user) {
      console.error('getUserIdeas - No active session found')
      throw new Error('User not authenticated')
    }

    const user = session.user

    // Call getUserIdeasAnalytics to get the data, then extract just the ideas
    try {
      const analyticsData = await this.getUserIdeasAnalytics()

      if (analyticsData.totalIdeas === 0) {
        return []
      }

      // Apply sorting based on the requested sort option
      let sortedIdeas = [
        ...analyticsData.topPerformingIdeas,
        ...analyticsData.worstPerformingIdeas,
        ...analyticsData.mostDiscussedIdeas,
      ]

      // Remove duplicates and sort by creation date (most recent first)
      const uniqueIdeas = sortedIdeas.filter(
        (idea, index, self) => index === self.findIndex(t => t.id === idea.id)
      )

      uniqueIdeas.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )

      // Apply limit if specified
      const limitedIdeas = limit ? uniqueIdeas.slice(0, limit) : uniqueIdeas

      return limitedIdeas
    } catch (error) {
      console.error(
        'getUserIdeas - Error using analytics method, falling back to direct query:',
        error
      )

      // Fallback to direct query if analytics method fails
      const { data, error: directError } = await supabase
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
          ),
          ,
          comments!left (
            id
          )
        `
        )
        .eq('creator_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, limit ? offset + limit - 1 : undefined)

      if (directError) {
        console.error('getUserIdeas - Direct query error:', directError)
        throw directError
      }

      const mappedIdeas = data?.map(this.mapDbIdeaToIdea) || []

      return mappedIdeas
    }
  }

  async getUserIdeasAnalytics() {
    // Get the current session instead of just the user
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      console.error('getUserIdeasAnalytics - Session error:', sessionError)
      throw sessionError
    }

    if (!session?.user) {
      console.error('getUserIdeasAnalytics - No active session found')
      throw new Error('User not authenticated')
    }

    const user = session.user

    const { data: ideas, error } = await supabase
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
          full_name,
          ,
        ),
        idea_votes (
          vote_type
        ),
        ),
        tags,
        comments!left (
          id
        )
      `
      )
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    if (!ideas || ideas.length === 0) {
      return {
        totalIdeas: 0,
        totalVotes: 0,
        totalComments: 0,
        averageScore: 0,
        engagementRate: 0,
        impactScore: 0,
        feasibilityScore: 0,
        ideasWithStats: [],
        topPerformingIdeas: [],
        worstPerformingIdeas: [],
        mostDiscussedIdeas: [],
        voteTypeBreakdown: { use: 0, dislike: 0, pay: 0 },
        categoryBreakdown: {},
        sentimentAnalysis: { positive: 0, neutral: 0, negative: 0 },
      }
    }

    const mappedIdeas = ideas.map(this.mapDbIdeaToIdea)

    const totalIdeasCount = mappedIdeas.length
    const totalVotes = mappedIdeas.reduce((sum, idea) => sum + idea.votes, 0)
    const totalComments = mappedIdeas.reduce(
      (sum, idea) => sum + idea.commentCount,
      0
    )
    const averageScore =
      totalIdeasCount > 0
        ? mappedIdeas.reduce((sum, idea) => sum + idea.score, 0) /
          totalIdeasCount
        : 0

    // Calculate engagement rate (0-100%)
    const totalInteractions = totalVotes + totalComments
    const engagementRate =
      totalIdeasCount > 0
        ? Math.min(100, (totalInteractions / totalIdeasCount) * 10)
        : 0

    // Calculate impact score (based on pay votes and comments)
    const totalPayVotes = mappedIdeas.reduce(
      (sum, idea) => sum + idea.votesByType.pay,
      0
    )
    const impactScore =
      totalIdeasCount > 0
        ? Math.min(
            100,
            ((totalPayVotes * 3 + totalComments) / totalIdeasCount) * 5
          )
        : 0

    // Calculate feasibility score (based on use votes vs dislike votes)
    const totalUseVotes = mappedIdeas.reduce(
      (sum, idea) => sum + idea.votesByType.use,
      0
    )
    const totalDislikeVotes = mappedIdeas.reduce(
      (sum, idea) => sum + idea.votesByType.dislike,
      0
    )
    const feasibilityScore =
      totalVotes > 0
        ? Math.min(
            100,
            ((totalUseVotes - totalDislikeVotes) / (totalVotes + 1)) * 50 + 50
          )
        : 0

    const voteTypeBreakdown = mappedIdeas.reduce(
      (acc, idea) => ({
        use: acc.use + idea.votesByType.use,
        dislike: acc.dislike + idea.votesByType.dislike,
        pay: acc.pay + idea.votesByType.pay,
      }),
      { use: 0, dislike: 0, pay: 0 }
    )

    // Calculate category breakdown
    const categoryBreakdown: Record<string, number> = {}
    mappedIdeas.forEach(idea => {
      idea.tags.forEach(tag => {
        categoryBreakdown[tag] = (categoryBreakdown[tag] || 0) + 1
      })
    })

    // Simple sentiment analysis based on score distribution
    const positiveIdeas = mappedIdeas.filter(idea => idea.score > 50).length
    const neutralIdeas = mappedIdeas.filter(
      idea => idea.score >= 20 && idea.score <= 50
    ).length
    const negativeIdeas = mappedIdeas.filter(idea => idea.score < 20).length

    const sentimentAnalysis = {
      positive:
        totalIdeasCount > 0 ? (positiveIdeas / totalIdeasCount) * 100 : 0,
      neutral: totalIdeasCount > 0 ? (neutralIdeas / totalIdeasCount) * 100 : 0,
      negative:
        totalIdeasCount > 0 ? (negativeIdeas / totalIdeasCount) * 100 : 0,
    }

    const ideasWithStats = mappedIdeas.map(idea => {
      const ideaInteractions = idea.votes + idea.commentCount
      const ideaEngagementRate =
        ideaInteractions > 0
          ? Math.min(100, (ideaInteractions / (totalInteractions + 1)) * 100)
          : 0

      // Calculate category distribution for this idea
      const ideaCategoryDistribution: Record<string, number> = {}
      idea.tags.forEach(tag => {
        ideaCategoryDistribution[tag] = 1
      })

      return {
        idea,
        engagementRate: ideaEngagementRate,
        voteDistribution: idea.votesByType,
        categoryDistribution: ideaCategoryDistribution,
      }
    })

    const sortedByScore = [...mappedIdeas].sort((a, b) => b.score - a.score)
    const sortedByComments = [...mappedIdeas].sort(
      (a, b) => b.commentCount - a.commentCount
    )

    return {
      totalIdeas: totalIdeasCount,
      totalVotes,
      totalComments,
      averageScore,
      engagementRate,
      impactScore,
      feasibilityScore,
      ideasWithStats,
      topPerformingIdeas: sortedByScore.slice(0, 5),
      worstPerformingIdeas: sortedByScore.slice(-3).reverse(),
      mostDiscussedIdeas: sortedByComments.slice(0, 3),
      voteTypeBreakdown,
      categoryBreakdown,
      sentimentAnalysis,
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

    // Check if anonymous flag is set
    const isAnonymous = dbIdea.anonymous || false

    const author = isAnonymous
      ? 'Anonymous'
      : dbIdea.users?.username || dbIdea.users?.full_name || 'Unknown User'

    // New format: content is an object with blocks, hero_image, hero_video, description
    const contentBlocks = dbIdea.content?.blocks as ContentBlock[] | undefined
    const heroImage = dbIdea.content?.hero_image
    const heroVideo = dbIdea.content?.hero_video
    const description = dbIdea.content?.description

    // Include creator email for ownership verification
    const creatorEmail = dbIdea.users?.email || null

    const tags = dbIdea.tags || []

    const content = dbIdea.content as ContentBlock[] | undefined

    const video =
      heroVideo ||
      contentBlocks?.find(block => block.type === 'video')?.src ||
      contentBlocks
        ?.find(block => block.type === 'carousel')
        ?.slides?.find(slide => slide.video)?.video

    const commentCount = dbIdea.comments?.length || 0

    const image =
      heroImage ||
      contentBlocks?.find(block => block.type === 'image')?.src ||
      contentBlocks
        ?.find(block => block.type === 'carousel')
        ?.slides?.find(slide => slide.image)?.image

    return {
      id: dbIdea.id,
      title: dbIdea.title,
      description: description || '',
      author,
      score,
      votes: totalVotes,
      votesByType: voteCounts,
      commentCount,
      tags,
      createdAt: dbIdea.created_at,
      image: image,
      video: video,
      content: contentBlocks, // Only content blocks, hero media is stored separately
      status_flag: dbIdea.status_flag,
      anonymous: dbIdea.anonymous || false,
      creatorEmail, // Add creator email for ownership verification
      // Versioning fields
      versionNumber: dbIdea.version_number || 1,
      ideaGroupId: dbIdea.idea_group_id || dbIdea.id,
      isActiveVersion: dbIdea.is_active_version !== false, // Default to true if not set
    }
  }

  /**
   * Map RPC result to Idea format
   * Used for optimized vote operations
   */
  private mapRpcResultToIdea(rpcResult: any): Idea | null {
    if (!rpcResult) return null

    const voteCounts = {
      dislike: rpcResult.dislike_votes || 0,
      use: rpcResult.use_votes || 0,
      pay: rpcResult.pay_votes || 0,
    }
    const totalVotes = voteCounts.dislike + voteCounts.use + voteCounts.pay

    // New format: content is an object with blocks, hero_image, hero_video, description
    const contentBlocks = rpcResult.content?.blocks as
      | ContentBlock[]
      | undefined
    const heroImage = rpcResult.content?.hero_image
    const heroVideo = rpcResult.content?.hero_video
    const description = rpcResult.content?.description

    const video =
      heroVideo ||
      contentBlocks?.find(block => block.type === 'video')?.src ||
      contentBlocks
        ?.find(block => block.type === 'carousel')
        ?.slides?.find(slide => slide.video)?.video

    const image =
      heroImage ||
      contentBlocks?.find(block => block.type === 'image')?.src ||
      contentBlocks
        ?.find(block => block.type === 'carousel')
        ?.slides?.find(slide => slide.image)?.image

    return {
      id: rpcResult.id,
      title: rpcResult.title,
      description: description || '',
      author: 'Anonymous', // RPC doesn't include user data
      score: rpcResult.score || 0,
      votes: totalVotes,
      votesByType: voteCounts,
      commentCount: rpcResult.comment_count || 0,
      tags: rpcResult.tags || [],
      createdAt: rpcResult.created_at,
      image: image,
      video: video,
      content: contentBlocks,
      status_flag: rpcResult.status_flag,
      anonymous: rpcResult.anonymous || false,
      creatorEmail: null,
    }
  }

  async createIdea(ideaData: Omit<Idea, 'id'>): Promise<Idea> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Prepare content with hero media metadata
    const contentWithMetadata = ideaData.content || []

    // Store hero media in content metadata (first element if it's image/video, or add metadata)
    let finalContent = contentWithMetadata
    if (ideaData.image || ideaData.video) {
      // Add hero media as metadata in content structure
      // We'll store it separately but also ensure it's accessible
      finalContent = contentWithMetadata
    }

    const { data, error } = await supabase
      .from('ideas')
      .insert({
        creator_id: user.id,
        title: ideaData.title,
        content: {
          blocks: finalContent,
          hero_image: ideaData.image,
          hero_video: ideaData.video,
          description: ideaData.description,
        },
        tags: ideaData.tags || [],
        status_flag: ideaData.status_flag || 'new',
        anonymous: ideaData.anonymous || false,
      })
      .select()
      .single()

    if (error) throw error

    return this.getIdeaById(data.id).then(idea => {
      if (!idea) throw new Error('Idea not found after creation')
      return idea
    })
  }

  async updateIdea(ideaId: string, updates: Partial<Idea>): Promise<Idea> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Build update object
    const updateData: any = {}
    if (updates.title !== undefined) updateData.title = updates.title
    if (updates.status_flag !== undefined)
      updateData.status_flag = updates.status_flag
    if (updates.anonymous !== undefined)
      updateData.anonymous = updates.anonymous
    // Handle content update with hero media
    if (
      updates.content !== undefined ||
      updates.image !== undefined ||
      updates.video !== undefined ||
      updates.description !== undefined
    ) {
      // Get current idea to merge content
      const currentIdea = await this.getIdeaById(ideaId)
      const currentContent = currentIdea?.content || []

      updateData.content = {
        blocks: updates.content || currentContent,
        hero_image:
          updates.image !== undefined ? updates.image : currentIdea?.image,
        hero_video:
          updates.video !== undefined ? updates.video : currentIdea?.video,
        description:
          updates.description !== undefined
            ? updates.description
            : currentIdea?.description,
      }
    }

    // Handle tags update
    if (updates.tags !== undefined) {
      updateData.tags = updates.tags
    }

    const { data, error } = await supabase
      .from('ideas')
      .update(updateData)
      .eq('id', ideaId)
      .select()
      .single()

    if (error) throw error

    return this.getIdeaById(ideaId).then(idea => {
      if (!idea) throw new Error('Idea not found after update')
      return idea
    })
  }

  // =====================================================
  // VERSIONING METHODS
  // =====================================================

  /**
   * Get all versions of an idea group
   */
  async getIdeaVersions(ideaGroupId: string): Promise<IdeaVersionInfo[]> {
    const { data, error } = await supabase
      .from('ideas')
      .select(
        `
        id,
        title,
        version_number,
        is_active_version,
        created_at,
        idea_votes (
          vote_type
        ),
        comments!left (
          id
        )
      `
      )
      .eq('idea_group_id', ideaGroupId)
      .order('version_number', { ascending: false })

    if (error) throw error

    return (
      data?.map(v => {
        const votes = v.idea_votes || []
        const voteCounts = {
          dislike: votes.filter((vote: any) => vote.vote_type === 'dislike')
            .length,
          use: votes.filter((vote: any) => vote.vote_type === 'use').length,
          pay: votes.filter((vote: any) => vote.vote_type === 'pay').length,
        }
        const totalVotes = voteCounts.dislike + voteCounts.use + voteCounts.pay
        const score =
          voteCounts.pay * 3 + voteCounts.use * 2 - voteCounts.dislike

        return {
          id: v.id,
          versionNumber: v.version_number,
          isActiveVersion: v.is_active_version,
          createdAt: v.created_at,
          title: v.title,
          votes: totalVotes,
          commentCount: v.comments?.length || 0,
          score,
        }
      }) || []
    )
  }

  /**
   * Create a new version of an idea
   */
  async createIdeaVersion(
    sourceIdeaId: string,
    updates?: Partial<Idea>
  ): Promise<Idea> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Prepare content if provided
    let newContent = null
    if (updates?.content || updates?.image || updates?.video) {
      newContent = {
        blocks: updates?.content || [],
        hero_image: updates?.image,
        hero_video: updates?.video,
        description: updates?.description,
      }
    }

    const { data, error } = await supabase.rpc('create_idea_version', {
      source_idea_id: sourceIdeaId,
      new_title: updates?.title || null,
      new_content: newContent,
    })

    if (error) throw error

    // Update anonymous status if provided
    if (updates?.anonymous !== undefined) {
      await supabase
        .from('ideas')
        .update({ anonymous: updates.anonymous })
        .eq('id', data)
    }

    // Update tags if provided
    if (updates?.tags !== undefined) {
      await supabase.from('ideas').update({ tags: updates.tags }).eq('id', data)
    }

    // Fetch the newly created idea
    const newIdea = await this.getIdeaById(data)
    if (!newIdea) throw new Error('Failed to fetch new version')

    return newIdea
  }

  /**
   * Set a version as the active (public) version
   */
  async setActiveVersion(ideaId: string): Promise<void> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { error } = await supabase.rpc('set_active_version', {
      target_idea_id: ideaId,
    })

    if (error) throw error
  }

  /**
   * Get version group information for an idea
   */
  async getVersionGroup(ideaId: string): Promise<IdeaVersionGroup | null> {
    // First get the idea to find its group
    const idea = await this.getIdeaById(ideaId)
    if (!idea || !idea.ideaGroupId) return null

    const versions = await this.getIdeaVersions(idea.ideaGroupId)
    const activeVersion = versions.find(v => v.isActiveVersion)

    return {
      ideaGroupId: idea.ideaGroupId,
      totalVersions: versions.length,
      activeVersionId: activeVersion?.id || ideaId,
      versions,
    }
  }

  async deleteIdea(ideaId: string): Promise<boolean> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Delete idea (cascade will handle related records)
    const { error } = await supabase.from('ideas').delete().eq('id', ideaId)

    if (error) throw error
    return true
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
