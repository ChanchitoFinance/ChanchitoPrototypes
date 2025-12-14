/**
 * Skeleton loading components for better UX
 */

export function IdeaCardSkeleton() {
  return (
    <div className="card-hover overflow-hidden animate-pulse">
      <div className="p-4">
        {/* Media skeleton */}
        <div className="relative w-full aspect-video mb-3 rounded-md overflow-hidden bg-gray-200 animate-pulse" />

        {/* Content skeleton */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <div className="h-5 bg-gray-200 rounded mb-2 w-3/4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded mb-1 w-full animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse" />
          </div>
          <div className="text-right flex-shrink-0">
            <div className="h-8 w-12 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 w-8 bg-gray-200 rounded mt-1 animate-pulse" />
          </div>
        </div>

        {/* Actions skeleton */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
            <div className="h-8 w-12 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
            <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>

        {/* Footer skeleton */}
        <div className="flex items-center justify-between pt-2 border-t border-background">
          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export function ExploreIdeaSkeleton() {
  return (
    <div className="relative w-full h-screen snap-start snap-mandatory flex items-center justify-center bg-black animate-pulse">
      {/* Background skeleton */}
      <div className="absolute inset-0 bg-gray-900" />

      {/* Content overlay skeleton */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between p-4 md:p-6">
        {/* Top section skeleton */}
        <div className="flex items-start justify-between">
          <div className="flex flex-wrap gap-2">
            <div className="h-6 w-16 bg-gray-700 rounded-full animate-pulse" />
            <div className="h-6 w-20 bg-gray-700 rounded-full animate-pulse" />
            <div className="h-6 w-14 bg-gray-700 rounded-full animate-pulse" />
          </div>
          <div className="text-right">
            <div className="h-12 w-16 bg-gray-700 rounded animate-pulse mb-1" />
            <div className="h-3 w-12 bg-gray-700 rounded animate-pulse" />
          </div>
        </div>

        {/* Bottom section skeleton */}
        <div className="flex flex-col md:flex-row items-end justify-between gap-4">
          <div className="flex-1">
            <div className="h-8 w-3/4 bg-gray-700 rounded mb-2 animate-pulse" />
            <div className="h-4 w-full bg-gray-700 rounded mb-1 animate-pulse" />
            <div className="h-4 w-2/3 bg-gray-700 rounded mb-2 animate-pulse" />
            <div className="h-4 w-1/2 bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="flex flex-col items-center gap-4">
            <div className="h-12 w-12 bg-gray-700 rounded-full animate-pulse" />
            <div className="h-12 w-12 bg-gray-700 rounded-full animate-pulse" />
            <div className="h-12 w-12 bg-gray-700 rounded-full animate-pulse" />
            <div className="h-12 w-12 bg-gray-700 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function CarouselItemSkeleton() {
  return (
    <div className="min-w-full h-full relative flex-shrink-0 snap-start animate-pulse">
      <div className="absolute inset-0 bg-gray-900" />
      <div className="relative z-10 h-full flex items-center px-4 md:px-8 lg:px-16">
        <div className="max-w-4xl w-full">
          <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
            <div className="h-6 w-16 bg-gray-700 rounded-full animate-pulse" />
            <div className="h-6 w-20 bg-gray-700 rounded-full animate-pulse" />
          </div>
          <div className="h-12 w-3/4 bg-gray-700 rounded mb-3 md:mb-4 animate-pulse" />
          <div className="h-6 w-full bg-gray-700 rounded mb-2 animate-pulse" />
          <div className="h-6 w-2/3 bg-gray-700 rounded mb-4 md:mb-6 animate-pulse" />
          <div className="h-10 w-32 bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    </div>
  )
}

