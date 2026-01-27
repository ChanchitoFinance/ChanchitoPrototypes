'use client'

import { useRouter, useParams } from 'next/navigation'
import { useEffect } from 'react'

export default function Home() {
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  useEffect(() => {
    router.push(`/${locale}/home`)
  }, [router, locale])

  return null
}
