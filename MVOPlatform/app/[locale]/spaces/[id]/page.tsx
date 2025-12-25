'use client'

import { SpaceDetailPage } from '@/components/pages/SpaceDetailPage'

interface SpaceDetailRouteProps {
  params: {
    id: string
    locale: string
  }
}

export default function SpaceDetailRoute({ params }: SpaceDetailRouteProps) {
  return <SpaceDetailPage spaceId={params.id} />
}

