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
