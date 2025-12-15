/**
 * Comment Service - Centralized access to comments data
 * Provides a service interface that can be easily swapped for API calls
 */

import { Comment } from '@/lib/types/comment'

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
  addComment(ideaId: string, content: string, author: string, authorImage?: string, parentId?: string): Promise<Comment>

  /**
   * Like/unlike a comment
   */
  toggleLikeComment(commentId: string, ideaId: string): Promise<Comment>

  /**
   * Upvote/downvote a comment
   */
  toggleUpvoteComment(commentId: string, ideaId: string): Promise<Comment>

  /**
   * Get comment count for an idea
   */
  getCommentCount(ideaId: string): Promise<number>
}

// Mock comments storage - shared across components
const mockCommentsStorage: Map<string, Comment[]> = new Map()

// Initialize with some mock comments for each idea
const initializeMockComments = (ideaId: string): Comment[] => {
  if (mockCommentsStorage.has(ideaId)) {
    return mockCommentsStorage.get(ideaId)!
  }

  const comments: Comment[] = [
    {
      id: `${ideaId}-1`,
      ideaId,
      author: 'john_doe',
      content: 'Esta es una idea increíble! Me encanta cómo aborda el problema desde una perspectiva única.',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      likes: 12,
      liked: false,
      upvotes: 8,
      upvoted: false,
      usefulnessScore: 4.5,
      replies: [
        {
          id: `${ideaId}-1-reply-1`,
          ideaId,
          author: 'sarah_smith',
          content: 'Totalmente de acuerdo! La perspectiva es muy innovadora.',
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          likes: 3,
          liked: false,
          upvotes: 2,
          upvoted: false,
          usefulnessScore: 4.0,
          parentId: `${ideaId}-1`,
        },
      ],
    },
    {
      id: `${ideaId}-2`,
      ideaId,
      author: 'sarah_smith',
      content: '¿Has considerado el impacto en el mercado internacional? Sería interesante explorar esa dimensión.',
      createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      likes: 8,
      liked: true,
      upvotes: 5,
      upvoted: true,
      usefulnessScore: 4.8,
      replies: [],
    },
    {
      id: `${ideaId}-3`,
      ideaId,
      author: 'tech_enthusiast',
      content: 'La implementación técnica parece sólida. ¿Tienes algún prototipo funcionando?',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      likes: 15,
      liked: false,
      upvotes: 12,
      upvoted: false,
      usefulnessScore: 4.7,
      replies: [],
    },
    {
      id: `${ideaId}-4`,
      ideaId,
      author: 'business_analyst',
      content: 'El modelo de negocio es prometedor. Creo que hay potencial para escalar esto rápidamente.',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      likes: 6,
      liked: false,
      upvotes: 4,
      upvoted: false,
      usefulnessScore: 4.2,
      replies: [],
    },
  ]

  mockCommentsStorage.set(ideaId, comments)
  return comments
}

/**
 * Mock Comment Service Implementation
 */
class MockCommentService implements ICommentService {
  async getComments(ideaId: string): Promise<Comment[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))
    return initializeMockComments(ideaId)
  }

  async addComment(
    ideaId: string,
    content: string,
    author: string,
    authorImage?: string,
    parentId?: string
  ): Promise<Comment> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 200))

    const comments = mockCommentsStorage.get(ideaId) || initializeMockComments(ideaId)

    const newComment: Comment = {
      id: `${ideaId}-${Date.now()}`,
      ideaId,
      author,
      authorImage,
      content: content.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      liked: false,
      upvotes: 0,
      upvoted: false,
      usefulnessScore: 0,
      parentId,
      replies: [],
    }

    if (parentId) {
      // Add as reply to parent comment
      const parentComment = comments.find((c) => c.id === parentId)
      if (parentComment) {
        if (!parentComment.replies) {
          parentComment.replies = []
        }
        parentComment.replies.unshift(newComment) // Add newest replies first
      }
    } else {
      // Add as top-level comment
      comments.unshift(newComment)
    }
    
    mockCommentsStorage.set(ideaId, comments)

    return newComment
  }

  async toggleLikeComment(commentId: string, ideaId: string): Promise<Comment> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100))

    const comments = mockCommentsStorage.get(ideaId) || initializeMockComments(ideaId)
    
    // Find comment in top-level or replies
    let comment: Comment | undefined
    for (const c of comments) {
      if (c.id === commentId) {
        comment = c
        break
      }
      if (c.replies) {
        const reply = c.replies.find((r) => r.id === commentId)
        if (reply) {
          comment = reply
          break
        }
      }
    }

    if (!comment) {
      throw new Error('Comment not found')
    }

    const wasLiked = comment.liked || false
    comment.liked = !wasLiked
    comment.likes = wasLiked ? comment.likes - 1 : comment.likes + 1
    
    // Update usefulness score based on likes and upvotes
    const totalVotes = comment.upvotes + comment.likes
    comment.usefulnessScore = totalVotes > 0 ? Math.min(5, (comment.upvotes / (totalVotes + 1)) * 5) : 0

    mockCommentsStorage.set(ideaId, comments)

    return comment
  }

  async toggleUpvoteComment(commentId: string, ideaId: string): Promise<Comment> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100))

    const comments = mockCommentsStorage.get(ideaId) || initializeMockComments(ideaId)
    
    // Find comment in top-level or replies
    let comment: Comment | undefined
    for (const c of comments) {
      if (c.id === commentId) {
        comment = c
        break
      }
      if (c.replies) {
        const reply = c.replies.find((r) => r.id === commentId)
        if (reply) {
          comment = reply
          break
        }
      }
    }

    if (!comment) {
      throw new Error('Comment not found')
    }

    const wasUpvoted = comment.upvoted || false
    comment.upvoted = !wasUpvoted
    comment.upvotes = wasUpvoted ? comment.upvotes - 1 : comment.upvotes + 1
    
    // Update usefulness score based on upvotes (simple formula: upvotes / (upvotes + 1) * 5)
    const totalVotes = comment.upvotes + (comment.likes || 0)
    comment.usefulnessScore = totalVotes > 0 ? Math.min(5, (comment.upvotes / (totalVotes + 1)) * 5) : 0

    mockCommentsStorage.set(ideaId, comments)

    return comment
  }

  async getCommentCount(ideaId: string): Promise<number> {
    const comments = mockCommentsStorage.get(ideaId) || initializeMockComments(ideaId)
    // Count top-level comments only
    return comments.length
  }
}

// Export singleton instance
export const commentService = new MockCommentService()
