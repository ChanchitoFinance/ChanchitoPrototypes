'use client'

import { Idea } from '@/core/types/idea'
import { HorizontalScrollSection } from './HorizontalScrollSection'
import { VerticalIdeasSection } from './VerticalIdeasSection'

export interface TrendsSectionData {
  activeDiscussion: Idea[]
  topLiked: Idea[]
  topCommented: Idea[]
  mostDetailed: Idea[]
  payIntention: Idea[]
  mostIterated: Idea[]
}

type TrendsSectionKey = keyof TrendsSectionData

const HORIZONTAL_KEYS: TrendsSectionKey[] = ['topLiked', 'topCommented']
const VERTICAL_KEYS: TrendsSectionKey[] = [
  'activeDiscussion',
  'mostDetailed',
  'payIntention',
  'mostIterated',
]

interface TrendsSectionProps {
  title: string
  data: TrendsSectionData
  loading?: boolean
  onIdeaHover?: (ideaId: string | null) => void
  hoveredIdeaId?: string | null
  titleActiveDiscussion: string
  titleTopLiked: string
  titleTopCommented: string
  titleMostDetailed: string
  titlePayIntention: string
  titleMostIterated: string
  hasMore?: Record<TrendsSectionKey, boolean>
  setSentinelRef?: (key: string, el: HTMLDivElement | null) => void
}

const sectionTitlesMap = (
  titleActiveDiscussion: string,
  titleTopLiked: string,
  titleTopCommented: string,
  titleMostDetailed: string,
  titlePayIntention: string,
  titleMostIterated: string
): Record<TrendsSectionKey, string> => ({
  activeDiscussion: titleActiveDiscussion,
  topLiked: titleTopLiked,
  topCommented: titleTopCommented,
  mostDetailed: titleMostDetailed,
  payIntention: titlePayIntention,
  mostIterated: titleMostIterated,
})

const visibleCards: Record<TrendsSectionKey, number> = {
  activeDiscussion: 3,
  topLiked: 2,
  topCommented: 3,
  mostDetailed: 3,
  payIntention: 3,
  mostIterated: 3,
}

export function TrendsSection({
  title,
  data,
  loading = false,
  onIdeaHover,
  hoveredIdeaId,
  titleActiveDiscussion,
  titleTopLiked,
  titleTopCommented,
  titleMostDetailed,
  titlePayIntention,
  titleMostIterated,
  hasMore,
  setSentinelRef,
}: TrendsSectionProps) {
  const sectionTitles = sectionTitlesMap(
    titleActiveDiscussion,
    titleTopLiked,
    titleTopCommented,
    titleMostDetailed,
    titlePayIntention,
    titleMostIterated
  )

  return (
    <section className="mb-2 md:mb-6">
      <div className="space-y-4">
        {/* Horizontal rows: Top Liked, Top Commented */}
        {HORIZONTAL_KEYS.map(key => (
          <div key={key}>
            <HorizontalScrollSection
              title={sectionTitles[key]}
              ideas={data[key]}
              loading={loading}
              visibleCards={visibleCards[key]}
              onIdeaHover={onIdeaHover}
              hoveredIdeaId={hoveredIdeaId}
            />
            {hasMore?.[key] && setSentinelRef && (
              <div
                ref={el => setSentinelRef(key, el)}
                className="h-4 w-full"
              />
            )}
          </div>
        ))}

        {/* Title "Trends" just before the vertical columns */}
        <h2 className="text-xl md:text-2xl font-bold text-text-primary mb-4">
          {title}
        </h2>

        {/* Vertical columns: on phones horizontal scroll (tighter so columns feel closer), on sm+ grid */}
        <div className="flex overflow-x-auto gap-2 pb-3 scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] sm:overflow-visible sm:grid sm:grid-cols-2 sm:gap-3 lg:grid-cols-4 lg:gap-4">
          {VERTICAL_KEYS.map(key => (
            <div
              key={key}
              className="flex-shrink-0 w-[72vw] min-w-[260px] sm:w-auto sm:min-w-0"
            >
              <VerticalIdeasSection
                title={sectionTitles[key]}
                ideas={data[key]}
                loading={loading}
                onIdeaHover={onIdeaHover}
                hoveredIdeaId={hoveredIdeaId}
                showSentinel={!!hasMore?.[key]}
                sectionKey={key}
                setSentinelRef={setSentinelRef}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
