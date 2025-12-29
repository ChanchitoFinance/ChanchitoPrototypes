'use client'

export function SpaceCardSkeleton() {
  return (
    <div className="flex flex-col bg-background rounded-lg border border-border-color overflow-hidden animate-pulse">
      {/* Media Skeleton - Vertical aspect ratio */}
      <div className="relative w-full aspect-[3/4] bg-gray-50/10" />

      {/* Content Skeleton */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {/* Title skeleton */}
              <div className="h-5 bg-gray-50/10 rounded w-3/4" />
              {/* Icon skeleton */}
              <div className="h-4 w-4 bg-gray-50/10 rounded" />
            </div>
            {/* Team name skeleton */}
            <div className="h-4 bg-gray-50/10 rounded w-1/2 mb-3" />
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="flex items-center gap-4 pt-3 border-t border-border-color mt-auto">
          <div className="flex items-center gap-1.5">
            <div className="h-3.5 w-3.5 bg-gray-50/10 rounded" />
            <div className="h-3 bg-gray-50/10 rounded w-16" />
          </div>
          <div className="h-3 bg-gray-50/10 rounded w-12" />
        </div>
      </div>
    </div>
  )
}

