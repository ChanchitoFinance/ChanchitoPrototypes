'use client'

import { ForYouFeed } from '@/features/foryou/components/ForYouFeed'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ideaService } from '@/core/lib/services/ideaService'

interface ForYouPageProps {
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default function ForYouPage({ searchParams }: ForYouPageProps) {
  const router = useRouter()
  const [initialIdeaId, setInitialIdeaId] = useState<string | undefined>()
  const [isLoadingFirstIdea, setIsLoadingFirstIdea] = useState(false)

  useEffect(() => {
    // Check if we have an ID in the URL
    const urlIdeaId = typeof searchParams?.id === 'string' ? searchParams.id : undefined

    if (urlIdeaId) {
      // If we have an ID in the URL, use it
      setInitialIdeaId(urlIdeaId)
    } else {
      // If no ID in URL, fetch the first idea and redirect with its ID
      setIsLoadingFirstIdea(true)
      ideaService.getExploreIdeas(1).then(ideas => {
        if (ideas.length > 0) {
          const firstIdeaId = ideas[0].id
          // Redirect to include the first idea's ID in the URL
          router.replace(`?id=${firstIdeaId}`, { scroll: false })
        }
        setIsLoadingFirstIdea(false)
      }).catch(error => {
        console.error('Error fetching first idea:', error)
        setIsLoadingFirstIdea(false)
      })
    }
  }, [searchParams?.id, router])

  if (isLoadingFirstIdea) {
    return (
      <main className="flex-1 overflow-hidden">
        <div className="h-full overflow-hidden flex items-center justify-center">
          <div className="text-text-primary">Loading...</div>
        </div>
      </main>
    )
  }

  return (
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
  )
}
