/**
 * Centralized Idea type definition
 * Single source of truth for Idea interface
 */

import { ContentBlock } from './content'

export type IdeaStatusFlag =
  | 'new'
  | 'active_discussion'
  | 'trending'
  | 'validated'

export type IdeaVoteType = 'dislike' | 'use' | 'pay'

export interface IdeaVotes {
  dislike: number
  use: number
  pay: number
}

export interface Idea {
  id: string
  title: string
  description: string
  author: string
  score: number
  votes: number
  votesByType: IdeaVotes // Distribution of votes by type (mandatory)
  commentCount: number
  tags: string[]
  createdAt: string
  image?: string
  video?: string
  // Rich content for detail page
  content?: ContentBlock[]
  // Status flag for visual differentiation
  status_flag?: IdeaStatusFlag
  // User vote state for this idea
  userVotes?: {
    use: boolean
    dislike: boolean
    pay: boolean
  }
  // Categorization for different sections (deprecated - use status_flag instead)
  featured?: boolean // For carousel (deprecated - use status_flag: 'trending')
  trending?: boolean // For trending section (deprecated)
  forYou?: boolean // For personalized "For You" section
}
