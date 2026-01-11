'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { MobileHeader } from './MobileHeader'
import { Menu } from 'lucide-react'
import { useMediaQuery } from '@/core/lib/hooks'

interface SidebarWrapperProps {
  children: React.ReactNode
}

export function SidebarWrapper({ children }: SidebarWrapperProps) {
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
    <div className="w-full bg-background">
      {/* Mobile Header - only shown on non-landing and non-ForYou pages */}
      {!isLandingPage && !isForYouPage && (
        <MobileHeader onMenuClick={() => setIsMobileOpen(true)} />
      )}
      {/* Sidebar - always rendered to prevent remounting */}
      <Sidebar isMobileOpen={isMobileOpen} setIsMobileOpen={setIsMobileOpen} />
      <main
        className={`${isLandingPage ? 'ml-0' : isMobile ? `ml-0 ${!isForYouPage ? 'mt-16' : ''}` : 'ml-16 md:ml-64'}`}
      >
        {children}
      </main>
    </div>
  )
}
