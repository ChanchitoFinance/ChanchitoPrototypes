/**
 * Comment Service - Centralized access to comments data
 * Provides a service interface that can be easily swapped for API calls
 */

import { Comment } from '@/lib/types/comment'
import { supabase } from '@/lib/supabase'

/**
 * Interface for Comment Service
 */
export interface ICommentService {
  /**
   * Get comments for an idea
   */
  getComments(ideaId: string): Promise<Comment[]>

  /**
   * Add a new comment to an idea
   */
  addComment(
    ideaId: string,
    content: string,
    author: string,
    authorImage?: string,
    parentId?: string
  ): Promise<Comment>

  /**
   * Upvote/downvote a comment
   */
  toggleUpvoteComment(commentId: string, ideaId: string): Promise<Comment>

  /**
   * Downvote/undownvote a comment
   */
  toggleDownvoteComment(commentId: string, ideaId: string): Promise<Comment>

  /**
   * Get comment count for an idea
   */
  getCommentCount(ideaId: string): Promise<number>

  /**
   * Get user votes for multiple comments
   */
  getUserCommentVotes(
    commentIds: string[]
  ): Promise<Record<string, { upvoted: boolean; downvoted: boolean }>>
}

/**
 * Supabase Comment Service Implementation
 */
class SupabaseCommentService implements ICommentService {
  async getComments(ideaId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from('comments')
      .select(
        `
        id,
        idea_id,
        user_id,
        parent_comment_id,
        content,
        created_at,
        public_user_profiles!comments_user_id_fkey (
          username,
          full_name,
          profile_media_id,
          media_assets (
            url
          )
        ),
        comment_votes (
          reaction_type
        )
      `
      )
      .eq('idea_id', ideaId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) throw error

    const comments = data?.map(this.mapDbCommentToComment) || []

    // Build nested structure up to 4 levels deep
    const buildCommentTree = (
      parentId: string | null,
      depth: number = 0
    ): Comment[] => {
      if (depth >= 4) return [] // Limit to 4 levels

      const children = comments.filter(comment => comment.parentId === parentId)
      return children.map(comment => ({
        ...comment,
        replies: buildCommentTree(comment.id, depth + 1),
      }))
    }

    return buildCommentTree(null)
  }

  async addComment(
    ideaId: string,
    content: string,
    author: string,
    authorImage?: string,
    parentId?: string
  ): Promise<Comment> {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('comments')
      .insert({
        idea_id: ideaId,
        user_id: user.user.id,
        content: content.trim(),
        parent_comment_id: parentId || null,
      })
      .select(
        `
        id,
        idea_id,
        user_id,
        parent_comment_id,
        content,
        created_at,
        public_user_profiles!comments_user_id_fkey (
          username,
          full_name,
          profile_media_id,
          media_assets (
            url
          )
        )
      `
      )
      .single()

    if (error) throw error

    return this.mapDbCommentToComment(data)
  }

  async toggleUpvoteComment(
    commentId: string,
    ideaId: string
  ): Promise<Comment> {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error('Not authenticated')

    // Check if vote exists
    const { data: existingVote } = await supabase
      .from('comment_votes')
      .select('reaction_type')
      .eq('comment_id', commentId)
      .eq('user_id', user.user.id)
      .single()

    if (existingVote?.reaction_type === 'upvote') {
      // Remove upvote
      await supabase
        .from('comment_votes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', user.user.id)
    } else {
      // Remove any existing vote and add upvote
      await supabase
        .from('comment_votes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', user.user.id)

      await supabase.from('comment_votes').insert({
        comment_id: commentId,
        user_id: user.user.id,
        reaction_type: 'upvote',
      })
    }

    // Return updated comment
    return this.getCommentById(commentId)
  }

  async toggleDownvoteComment(
    commentId: string,
    ideaId: string
  ): Promise<Comment> {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error('Not authenticated')

    // Check if vote exists
    const { data: existingVote } = await supabase
      .from('comment_votes')
      .select('reaction_type')
      .eq('comment_id', commentId)
      .eq('user_id', user.user.id)
      .single()

    if (existingVote?.reaction_type === 'downvote') {
      // Remove downvote
      await supabase
        .from('comment_votes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', user.user.id)
    } else {
      // Remove any existing vote and add downvote
      await supabase
        .from('comment_votes')
        .delete()
        .eq('comment_id', commentId)
        .eq('user_id', user.user.id)

      await supabase.from('comment_votes').insert({
        comment_id: commentId,
        user_id: user.user.id,
        reaction_type: 'downvote',
      })
    }

    // Return updated comment
    return this.getCommentById(commentId)
  }

  async getCommentCount(ideaId: string): Promise<number> {
    const { count, error } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('idea_id', ideaId)
      .is('parent_comment_id', null)
      .is('deleted_at', null)

    if (error) throw error
    return count || 0
  }

  async getUserCommentVotes(
    commentIds: string[]
  ): Promise<Record<string, { upvoted: boolean; downvoted: boolean }>> {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return {}

    const { data, error } = await supabase
      .from('comment_votes')
      .select('comment_id, reaction_type')
      .in('comment_id', commentIds)
      .eq('user_id', user.id)

    if (error) throw error

    const votes = data || []
    const result: Record<string, { upvoted: boolean; downvoted: boolean }> = {}

    // Initialize all comments with false votes
    commentIds.forEach(commentId => {
      result[commentId] = { upvoted: false, downvoted: false }
    })

    // Fill in the actual votes
    votes.forEach(vote => {
      if (result[vote.comment_id]) {
        if (vote.reaction_type === 'upvote') {
          result[vote.comment_id].upvoted = true
        } else if (vote.reaction_type === 'downvote') {
          result[vote.comment_id].downvoted = true
        }
      }
    })

    return result
  }

  private async getCommentById(commentId: string): Promise<Comment> {
    const { data, error } = await supabase
      .from('comments')
      .select(
        `
        id,
        idea_id,
        user_id,
        parent_comment_id,
        content,
        created_at,
        public_user_profiles!comments_user_id_fkey (
          username,
          full_name,
          profile_media_id,
          media_assets (
            url
          )
        ),
        comment_votes (
          reaction_type
        )
      `
      )
      .eq('id', commentId)
      .single()

    if (error) throw error

    const comment = this.mapDbCommentToComment(data)

    // Get current user's vote for this comment
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { data: userVote } = await supabase
        .from('comment_votes')
        .select('reaction_type')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (userVote) {
        comment.upvoted = userVote.reaction_type === 'upvote'
        comment.downvoted = userVote.reaction_type === 'downvote'
      }
    }

    return comment
  }

  private mapDbCommentToComment(dbComment: any): Comment {
    const votes = dbComment.comment_votes || []
    const upvotes = votes.filter(
      (v: any) => v.reaction_type === 'upvote'
    ).length
    const downvotes = votes.filter(
      (v: any) => v.reaction_type === 'downvote'
    ).length

    const totalVotes = upvotes + downvotes
    const usefulnessScore =
      totalVotes > 0
        ? Math.min(5, ((upvotes - downvotes) / (totalVotes + 1)) * 5 + 2.5)
        : 0

    return {
      id: dbComment.id,
      ideaId: dbComment.idea_id,
      author:
        dbComment.public_user_profiles?.username ||
        dbComment.public_user_profiles?.full_name ||
        'Anonymous',
      authorImage: dbComment.public_user_profiles?.media_assets?.url,
      content: dbComment.content,
      createdAt: dbComment.created_at,
      upvotes,
      downvotes,
      usefulnessScore,
      parentId: dbComment.parent_comment_id,
      replies: [],
    }
  }
}

// Export singleton instance
export const commentService = new SupabaseCommentService()
