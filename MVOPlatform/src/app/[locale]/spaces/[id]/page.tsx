'use client'

import React from 'react'
import { SpaceDetailPage } from '@/features/spaces/components/SpaceDetailPage'

interface SpaceDetailRouteProps {
  params: Promise<{
    id: string
    locale: string
  }>
}

export default function SpaceDetailRoute({ params }: SpaceDetailRouteProps) {
  const resolvedParams = React.use(params)
  return <SpaceDetailPage spaceId={resolvedParams.id} />
}
