import { Comment } from "../types/comment"

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
