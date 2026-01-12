'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar, MobileSidebarOverlay } from './Sidebar'
import { MobileHeader } from './MobileHeader'
import { Menu } from 'lucide-react'
import { useMediaQuery } from '@/core/lib/hooks'

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname()
  const currentLocale = pathname.startsWith('/es') ? 'es' : 'en'
  // Use useMediaQuery for stable mobile detection
  const isMobile = useMediaQuery('(max-width: 767px)')
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Check if we're on the landing page
  const isLandingPage = pathname === `/${currentLocale}`

  // Check if we're on the For You page (should not show mobile header)
  const isForYouPage = pathname.includes('/for-you')

  return (
    <div className="flex h-screen w-full bg-background">
      {/* Mobile Header - only shown on non-landing and non-ForYou pages */}
      {!isLandingPage && !isForYouPage && (
        <MobileHeader onMenuClick={() => setIsMobileOpen(true)} />
      )}

      {/* Sidebar - always rendered to prevent remounting */}
      {!isLandingPage && (
        <Sidebar
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col overflow-hidden`}>
        {/* Mobile Overlay */}
        <MobileSidebarOverlay
          isOpen={isMobileOpen}
          onClose={() => setIsMobileOpen(false)}
        />

        {/* Content Container */}
        <main
          className={`flex-1 overflow-y-auto ${isLandingPage ? 'pt-0' : isMobile ? (!isForYouPage ? 'pt-16' : 'pt-0') : 'pt-0'}`}
        >
          {children}
        </main>
      </div>
    </div>
  )
}
