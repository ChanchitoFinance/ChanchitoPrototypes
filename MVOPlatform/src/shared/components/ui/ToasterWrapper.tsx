'use client'

import { Toaster } from 'sonner'
import { useMediaQuery } from '@/core/lib/hooks'

export function ToasterWrapper() {
  const isMobile = useMediaQuery('(max-width: 767px)')

  return (
    <Toaster
      closeButton
      theme="dark"
      position={isMobile ? 'top-center' : 'bottom-right'}
      toastOptions={{
        style: {
          background: 'var(--gray-100)',
          border: '1px solid var(--border-color)',
          color: 'var(--text-primary)',
        },
        success: {
          style: {
            borderLeftColor: 'var(--success)',
            borderLeftWidth: '4px',
          },
          iconTheme: { primary: 'var(--success)' },
        },
        error: {
          style: {
            borderLeftColor: 'var(--error)',
            borderLeftWidth: '4px',
          },
          iconTheme: { primary: 'var(--error)' },
        },
        warning: {
          style: {
            borderLeftColor: 'var(--warning)',
            borderLeftWidth: '4px',
          },
          iconTheme: { primary: 'var(--warning)' },
        },
      }}
    />
  )
}
