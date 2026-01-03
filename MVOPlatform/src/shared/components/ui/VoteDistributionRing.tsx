'use client'

import { useState } from 'react'
import { IdeaVotes, IdeaVoteType } from '@/core/types/idea'
import { Tooltip } from '@radix-ui/themes'

interface VoteDistributionRingProps {
  votes: IdeaVotes
  size?: number // Diameter in pixels
}

// Colors for each vote type
export const VOTE_COLORS: Record<IdeaVoteType, string> = {
  dislike: '#9CA3AF', // grey-400
  use: '#66D3FF', // accent cyan
  pay: '#A78BFA', // accent-alt violet
}

// Labels for each vote type
export const VOTE_LABELS: Record<IdeaVoteType, string> = {
  dislike: "Wouldn't Use",
  use: 'Would Use',
  pay: 'Would Pay',
}

export function VoteDistributionRing({
  votes,
  size = 120,
}: VoteDistributionRingProps) {
  const [hoveredArc, setHoveredArc] = useState<number | null>(null)
  const totalVotes = votes.dislike + votes.use + votes.pay

  // If no votes, don't show anything
  if (totalVotes === 0) {
    return null
  }

  // Calculate percentages based on total votes
  const percentages = {
    dislike: (votes.dislike / totalVotes) * 100,
    use: (votes.use / totalVotes) * 100,
    pay: (votes.pay / totalVotes) * 100,
  }

  const center = size / 2
  const strokeWidth = size * 0.15 // 15% of size for nice thickness
  const hoverStrokeWidth = strokeWidth * 1.15 // 15% increase on hover
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  // Create arcs in order: pay, use, dislike (starting from top)
  const arcs: Array<{
    type: IdeaVoteType
    count: number
    percentage: number
    offset: number
    length: number
  }> = []
  let currentOffset = 0

  const voteTypes: IdeaVoteType[] = ['pay', 'use', 'dislike']

  voteTypes.forEach(type => {
    const percentage = percentages[type]
    const length = (percentage / 100) * circumference

    if (percentage > 0) {
      arcs.push({
        type,
        count: votes[type],
        percentage,
        offset: currentOffset,
        length,
      })
      currentOffset += length
    }
  })

  return (
    <div className="relative inline-block">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        style={{ filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))' }}
      >
        {/* Background circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="#1F2937"
          strokeWidth={strokeWidth}
          opacity={0.1}
        />

        {/* Vote arcs */}
        {arcs.map((arc, index) => {
          const isHovered = hoveredArc === index
          const currentStrokeWidth = isHovered ? hoverStrokeWidth : strokeWidth

          return (
            <Tooltip
              key={`${arc.type}-${index}`}
              content={
                <>
                  <span className="font-semibold">{VOTE_LABELS[arc.type]}</span>
                  <br />
                  <span className="text-xs">
                    {arc.count} votes <span className="opacity-50">•</span>{' '}
                    {arc.percentage.toFixed(1)}%
                  </span>
                </>
              }
            >
              <circle
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={VOTE_COLORS[arc.type]}
                strokeWidth={currentStrokeWidth}
                strokeDasharray={`${arc.length} ${circumference - arc.length}`}
                strokeDashoffset={-arc.offset}
                strokeLinecap="round"
                className="transition-all duration-200 cursor-pointer"
                style={{
                  transition: 'stroke-width 0.2s ease, opacity 0.2s ease',
                }}
                onMouseEnter={() => setHoveredArc(index)}
                onMouseLeave={() => setHoveredArc(null)}
              />
            </Tooltip>
          )
        })}

        {/* Center text showing total votes */}
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="central"
          alignmentBaseline="central"
          className="transform rotate-90 origin-center pointer-events-none"
          style={{
            fontSize: size * 0.35,
            fontWeight: 'bold',
            fill: '#E5E7EB',
          }}
        >
          {totalVotes}
        </text>
      </svg>
    </div>
  )
}
