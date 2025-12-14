'use client'

import { useState, Suspense, lazy } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { HeroCarousel } from '@/components/carousel/HeroCarousel'
import { ExploreIdeaSkeleton } from '@/components/ui/Skeleton'
import { IdeaCardSkeleton } from '@/components/ui/Skeleton'

// Lazy load components for better performance
const ForYouFeed = lazy(() => 
  import('@/components/foryou/ForYouFeed').then(module => ({ default: module.ForYouFeed }))
)

const HomeFeed = lazy(() => 
  import('@/components/home/HomeFeed').then(module => ({ default: module.HomeFeed }))
)

// Loading fallbacks
const ForYouFeedFallback = () => (
  <div className="h-screen w-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={`skeleton-${i}`} className="h-screen snap-start snap-mandatory">
        <ExploreIdeaSkeleton />
      </div>
    ))}
  </div>
)

const HomeFeedFallback = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 px-4 md:px-6 py-8">
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <IdeaCardSkeleton key={`skeleton-${i}`} />
    ))}
  </div>
)

export default function Home() {
  const [activeTab, setActiveTab] = useState<'home' | 'foryou'>('home')

  return (
    <div className="h-screen w-full overflow-hidden bg-background flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="flex-1 overflow-hidden">
        {activeTab === 'foryou' ? (
          <div className="h-full overflow-hidden">
            {/* Desktop: Center and respect aspect ratio like TikTok */}
            <div className="hidden md:flex h-full items-center justify-center bg-black">
              <div className="w-full max-w-md h-full mx-auto">
                <Suspense fallback={<ForYouFeedFallback />}>
                  <ForYouFeed />
                </Suspense>
              </div>
            </div>
            
            {/* Mobile: Full screen */}
            <div className="md:hidden h-full w-full">
              <Suspense fallback={<ForYouFeedFallback />}>
                <ForYouFeed />
              </Suspense>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto">
            {/* Hero Carousel at the top */}
            <HeroCarousel />
            {/* Home Feed below - lazy loaded */}
            <Suspense fallback={<HomeFeedFallback />}>
              <HomeFeed showHeader={false} showFooter={false} />
            </Suspense>
          </div>
        )}
      </main>
    </div>
  )
}
