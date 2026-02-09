'use client'

import React from 'react'
import { IdeaDetail } from '@/features/ideas/components/IdeaDetail'
import { ideaService } from '@/core/lib/services/ideaService'
import { notFound } from 'next/navigation'

export default function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const resolvedParams = React.use(params)
  const [ideaId, setIdeaId] = React.useState<string | null>(null)
  const [notFoundState, setNotFoundState] = React.useState(false)

  React.useEffect(() => {
    let cancelled = false
    ideaService
      .getIdeaBySlug(resolvedParams.slug)
      .then(idea => {
        if (cancelled) return
        if (!idea) {
          setNotFoundState(true)
          return
        }
        setIdeaId(idea.id)
      })
      .catch(() => {
        if (!cancelled) setNotFoundState(true)
      })
    return () => {
      cancelled = true
    }
  }, [resolvedParams.slug])

  if (notFoundState) notFound()
  if (ideaId === null) {
    return (
      <div className="bg-background flex flex-1 items-center justify-center min-h-[40vh]">
        <div className="animate-pulse text-text-secondary">Loading...</div>
      </div>
    )
  }

  return (
    <div className="bg-background flex">
      <div className="flex-1 flex flex-col transition-all duration-300">
        <IdeaDetail ideaId={ideaId} />
      </div>
    </div>
  )
}
