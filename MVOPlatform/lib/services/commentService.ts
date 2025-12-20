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
        users!comments_user_id_fkey (
          username,
          full_name
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

    // Build nested structure
    const topLevelComments: Comment[] = []
    const repliesMap = new Map<string, Comment[]>()

    for (const comment of comments) {
      if (comment.parentId) {
        if (!repliesMap.has(comment.parentId)) {
          repliesMap.set(comment.parentId, [])
        }
        repliesMap.get(comment.parentId)!.push(comment)
      } else {
        topLevelComments.push(comment)
      }
    }

    // Attach replies
    for (const comment of topLevelComments) {
      comment.replies = repliesMap.get(comment.id) || []
    }

    return topLevelComments
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
        users!comments_user_id_fkey (
          username,
          full_name
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
        users!comments_user_id_fkey (
          username,
          full_name
        ),
        comment_votes (
          reaction_type
        )
      `
      )
      .eq('id', commentId)
      .single()

    if (error) throw error

    return this.mapDbCommentToComment(data)
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
        dbComment.users?.username || dbComment.users?.full_name || 'Anonymous',
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
