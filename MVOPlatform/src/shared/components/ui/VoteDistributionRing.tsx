'use client'

import { useState } from 'react'
import { IdeaVotes, IdeaVoteType } from '@/core/types/idea'
import * as Tooltip from '@radix-ui/react-tooltip'
import { VOTE_COLORS } from '@/core/lib/utils/idea.utils'
import { useTranslations } from '@/shared/components/providers/I18nProvider'

// Default labels (match analytics: Like, Dislike, I'd pay for it)
export const VOTE_LABELS: Record<IdeaVoteType, string> = {
  dislike: 'Dislike',
  use: 'Like',
  pay: "I'd pay for it",
}

interface VoteDistributionRingProps {
  votes: IdeaVotes
  size?: number // Diameter in pixels
}

export function VoteDistributionRing({
  votes,
  size = 120,
}: VoteDistributionRingProps) {
  const t = useTranslations()
  const [hoveredArc, setHoveredArc] = useState<number | null>(null)
  const labels: Record<IdeaVoteType, string> = {
    dislike: t('activity.signal_overview.labels.dislike') || VOTE_LABELS.dislike,
    use: t('activity.signal_overview.labels.like') || VOTE_LABELS.use,
    pay: t('activity.signal_overview.labels.id_pay_for_it') || VOTE_LABELS.pay,
  }
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
            <Tooltip.Root key={`${arc.type}-${index}`}>
              <Tooltip.Trigger asChild>
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
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  className="bg-gray-900 text-white px-3 py-2 rounded-md text-sm shadow-lg"
                  sideOffset={5}
                >
                  <span className="font-semibold">{labels[arc.type]}</span>
                  <br />
                  <span className="text-xs">
                    {arc.count} votes <span className="opacity-50">•</span>{' '}
                    {arc.percentage.toFixed(1)}%
                  </span>
                  <Tooltip.Arrow className="fill-gray-900" />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
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
            fill: 'var(--text-primary)',
          }}
        >
          {totalVotes}
        </text>
      </svg>
    </div>
  )
}
