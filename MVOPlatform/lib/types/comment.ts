/**
 * Comment type definition
 */

export interface Comment {
  id: string
  ideaId: string
  author: string
  authorImage?: string
  content: string
  createdAt: string
  upvotes: number
  upvoted?: boolean
  downvotes: number
  downvoted?: boolean
  usefulnessScore: number
  parentId?: string // If set, this is a reply to another comment
  replies?: Comment[] // Nested replies
}
