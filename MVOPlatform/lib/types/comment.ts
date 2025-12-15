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
  likes: number
  liked?: boolean
  upvotes: number
  upvoted?: boolean
  usefulnessScore: number
  parentId?: string // If set, this is a reply to another comment
  replies?: Comment[] // Nested replies
}

