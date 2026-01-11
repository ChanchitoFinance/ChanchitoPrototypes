'use client'

import { Toaster } from 'sonner'
import { useMediaQuery } from '@/core/lib/hooks'

export function ToasterWrapper() {
  const isMobile = useMediaQuery('(max-width: 767px)')

  return (
    <Toaster
      closeButton
      richColors
      theme="dark"
      position={isMobile ? 'top-center' : 'bottom-right'}
    />
  )
}
