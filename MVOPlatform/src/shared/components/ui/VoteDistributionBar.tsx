'use client'

import { IdeaVotes, IdeaVoteType } from '@/core/types/idea'

interface VoteDistributionBarProps {
  votes: IdeaVotes
  orientation?: 'horizontal' | 'vertical'
  thickness?: 'normal' | 'thin' | 'extra-thin'
}

// Colors for each vote type
export const VOTE_COLORS: Record<IdeaVoteType, string> = {
  dislike: '#9CA3AF', // grey-400
  use: '#66D3FF', // accent cyan
  pay: '#A78BFA', // accent-alt violet
}

export function VoteDistributionBar({
  votes,
  orientation = 'horizontal',
  thickness = 'normal',
}: VoteDistributionBarProps) {
  const totalVotes = votes.dislike + votes.use + votes.pay

  // If no votes, don't show the bar
  if (totalVotes === 0) {
    return null
  }

  // Calculate percentages based on total votes
  const percentages = {
    dislike: (votes.dislike / totalVotes) * 100,
    use: (votes.use / totalVotes) * 100,
    pay: (votes.pay / totalVotes) * 100,
  }

  // Fixed concentric order: dislike -> use -> pay -> use -> dislike
  // Pay is always in the center, followed by use, then dislike on the edges
  // Each segment width reflects its percentage of total votes
  // Outer segments are split in half to create the concentric pattern
  const segments: Array<{ type: IdeaVoteType; width: number }> = [
    { type: 'dislike', width: percentages.dislike / 2 }, // Left edge: half of dislike percentage
    { type: 'use', width: percentages.use / 2 }, // Left inner: half of use percentage
    { type: 'pay', width: percentages.pay }, // Center: full pay percentage
    { type: 'use', width: percentages.use / 2 }, // Right inner: half of use percentage
    { type: 'dislike', width: percentages.dislike / 2 }, // Right edge: half of dislike percentage
  ]

  // Verify total width equals 100% (with small tolerance for floating point errors)
  const totalWidth = segments.reduce((sum, seg) => sum + seg.width, 0)
  if (Math.abs(totalWidth - 100) > 0.01) {
    // Normalize to ensure exact 100%
    const scaleFactor = 100 / totalWidth
    segments.forEach(seg => {
      seg.width *= scaleFactor
    })
  }

  const isVertical = orientation === 'vertical'
  const heightClass =
    thickness === 'extra-thin' ? 'h-0.5' : thickness === 'thin' ? 'h-1' : 'h-2'
  const widthClass = thickness === 'thin' ? 'w-1' : 'w-1.5'

  if (isVertical) {
    return (
      <div
        className={`${widthClass} h-full flex flex-col overflow-hidden rounded-sm`}
      >
        {segments.map((segment, index) => {
          const color = VOTE_COLORS[segment.type]
          const isLast = index === segments.length - 1

          return (
            <div
              key={`${segment.type}-${index}`}
              className="w-full"
              style={{
                height: `${segment.width}%`,
                backgroundColor: color,
                borderBottom: isLast ? 'none' : '1px solid rgba(0, 0, 0, 0.3)',
              }}
            />
          )
        })}
      </div>
    )
  }

  return (
    <div className={`w-full ${heightClass} flex overflow-hidden rounded-sm`}>
      {segments.map((segment, index) => {
        const color = VOTE_COLORS[segment.type]
        const isLast = index === segments.length - 1

        return (
          <div
            key={`${segment.type}-${index}`}
            className="h-full"
            style={{
              width: `${segment.width}%`,
              backgroundColor: color,
              borderRight: isLast ? 'none' : '1px solid rgba(0, 0, 0, 0.3)',
            }}
          />
        )
      })}
    </div>
  )
}
