'use client'

import { ForYouFeed } from '@/components/foryou/ForYouFeed'
import { Sidebar } from '@/components/layout/Sidebar'

interface ForYouPageProps {
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default function ForYouPage({ searchParams }: ForYouPageProps) {
  const initialIdeaId =
    typeof searchParams?.id === 'string' ? searchParams.id : undefined

  return (
    <div className="h-screen w-full overflow-hidden bg-background flex">
      <Sidebar />

      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-hidden">
          {/* Desktop: Center and respect aspect ratio like TikTok */}
          <div className="hidden md:flex h-full items-center justify-center bg-black">
            <div className="w-full max-w-md h-full mx-auto">
              <ForYouFeed initialIdeaId={initialIdeaId} />
            </div>
          </div>

          {/* Mobile: Full screen */}
          <div className="md:hidden h-full w-full">
            <ForYouFeed initialIdeaId={initialIdeaId} />
          </div>
        </div>
      </main>
    </div>
  )
}
