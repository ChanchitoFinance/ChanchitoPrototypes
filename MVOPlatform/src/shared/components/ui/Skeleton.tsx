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

export function IdeaDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section Skeleton */}
      <div className="relative w-full bg-black">
        <div className="relative w-full aspect-video bg-gray-900 animate-pulse" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 md:p-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="h-6 w-16 bg-gray-700 rounded-full animate-pulse" />
              <div className="h-6 w-20 bg-gray-700 rounded-full animate-pulse" />
              <div className="h-6 w-14 bg-gray-700 rounded-full animate-pulse" />
            </div>
            <div className="h-12 w-3/4 bg-gray-700 rounded mb-4 animate-pulse" />
            <div className="flex items-center gap-4">
              <div className="h-4 w-24 bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-20 bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Article Content Skeleton */}
      <article className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
        {/* Actions Bar Skeleton */}
        <div className="flex items-center gap-4 mb-8">
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="h-10 w-24 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Description Skeleton */}
        <div className="mb-12 space-y-3">
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Content Blocks Skeleton */}
        <div className="mb-12 space-y-6">
          <div className="h-64 w-full bg-gray-200 rounded-lg animate-pulse" />
          <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
          <div className="h-4 w-4/5 bg-gray-200 rounded animate-pulse" />
        </div>

        {/* Comments Section Skeleton */}
        <div className="space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="flex gap-4 p-4 border border-gray-200 rounded-lg"
            >
              <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </article>
    </div>
  )
}

/** Skeleton for Signal Overview / analytics page – matches tabs + chart + tables layout */
export function SignalOverviewSkeleton() {
  return (
    <div className="space-y-0 bg-black rounded-lg border border-white/10 overflow-hidden animate-pulse">
      <div className="p-6 border-b border-white/10">
        <div className="h-6 w-48 bg-white/10 rounded mb-2" />
        <div className="h-4 w-full max-w-xl bg-white/5 rounded" />
      </div>
      <div className="flex gap-0 border-b border-white/10 px-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-10 w-28 bg-white/5 rounded-t mx-1" />
        ))}
      </div>
      <div className="p-6 space-y-8">
        <section>
          <div className="h-4 w-40 bg-white/10 rounded mb-3" />
          <div className="h-3 w-full max-w-2xl bg-white/5 rounded mb-4" />
          <div className="h-10 w-full rounded bg-white/5 mb-3" />
          <div className="flex gap-4">
            <div className="h-3 w-16 bg-white/5 rounded" />
            <div className="h-3 w-20 bg-white/5 rounded" />
            <div className="h-3 w-14 bg-white/5 rounded" />
          </div>
        </section>
        <section className="pt-6 border-t border-white/10">
          <div className="h-4 w-32 bg-white/10 rounded mb-3" />
          <div className="h-3 w-full max-w-xl bg-white/5 rounded mb-4" />
          <div className="h-48 w-full rounded bg-white/5" />
        </section>
        <section className="pt-6 border-t border-white/10">
          <div className="h-4 w-24 bg-white/10 rounded mb-3" />
          <div className="space-y-0 divide-y divide-white/10">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex justify-between px-4 py-3">
                <div className="h-4 w-40 bg-white/5 rounded" />
                <div className="h-4 w-20 bg-white/5 rounded" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
