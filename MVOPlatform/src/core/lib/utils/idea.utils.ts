import { IdeaVotes, IdeaVoteType } from "@/core/types/idea";

// Colors for each vote type
export const VOTE_COLORS: Record<IdeaVoteType, string> = {
  dislike: '#9CA3AF', // grey-400
  use: '#66D3FF', // accent cyan
  pay: '#A78BFA', // accent-alt violet
}

export function getMostVotedType(
  votes: IdeaVotes
): { type: IdeaVoteType; color: string } | null {
  const totalVotes = votes.dislike + votes.use + votes.pay
  if (totalVotes === 0) return null

  const voteCounts = [
    { type: 'dislike' as IdeaVoteType, count: votes.dislike },
    { type: 'use' as IdeaVoteType, count: votes.use },
    { type: 'pay' as IdeaVoteType, count: votes.pay },
  ]

  const mostVoted = voteCounts.reduce((max, current) =>
    current.count > max.count ? current : max
  )

  return {
    type: mostVoted.type,
    color: VOTE_COLORS[mostVoted.type],
  }
}

/**
 * Calculate vote sentiment percentage (positive vs negative)
 * Returns a value between -100 (all negative) and 100 (all positive)
 */
export function getVoteSentiment(votes: IdeaVotes): number {
  const totalVotes = votes.dislike + votes.use + votes.pay
  if (totalVotes === 0) return 0

  const positiveVotes = votes.use + votes.pay
  const negativeVotes = votes.dislike

  return ((positiveVotes - negativeVotes) / totalVotes) * 100
}

/**
 * Get engagement level based on total interactions
 */
export function getEngagementLevel(votes: IdeaVotes, commentCount: number): 'low' | 'medium' | 'high' {
  const totalVotes = votes.dislike + votes.use + votes.pay
  const totalEngagement = totalVotes + commentCount

  if (totalEngagement >= 20) return 'high'
  if (totalEngagement >= 10) return 'medium'
  return 'low'
}
