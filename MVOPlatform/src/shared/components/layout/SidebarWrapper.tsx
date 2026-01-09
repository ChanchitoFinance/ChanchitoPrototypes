'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { MobileHeader } from './MobileHeader'
import { Menu } from 'lucide-react'

interface SidebarWrapperProps {
  children: React.ReactNode
}

export function SidebarWrapper({ children }: SidebarWrapperProps) {
  const pathname = usePathname()
  const currentLocale = pathname.startsWith('/es') ? 'es' : 'en'
  const [isMobile, setIsMobile] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  // Check if we're on the landing page
  const isLandingPage = pathname === `/${currentLocale}`

  // Check if we're on the For You page (should not show mobile header)
  const isForYouPage = pathname.includes('/for-you')

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="w-full bg-background">
      {!isLandingPage && !isForYouPage && (
        <>
          {/* Mobile Header */}
          <MobileHeader onMenuClick={() => setIsMobileOpen(true)} />
          <Sidebar
            isMobileOpen={isMobileOpen}
            setIsMobileOpen={setIsMobileOpen}
          />
        </>
      )}
      {!isLandingPage && isForYouPage && (
        <Sidebar
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
        />
      )}
      <main
        className={`${isLandingPage ? 'ml-0' : isMobile ? `ml-0 ${!isForYouPage ? 'mt-16' : ''}` : 'ml-16 md:ml-64'}`}
      >
        {children}
      </main>
    </div>
  )
}
