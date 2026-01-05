'use client'

import { usePathname } from 'next/navigation'
import { Sidebar } from './Sidebar'

interface SidebarWrapperProps {
  children: React.ReactNode
}

export function SidebarWrapper({ children }: SidebarWrapperProps) {
  const pathname = usePathname()
  const currentLocale = pathname.startsWith('/es') ? 'es' : 'en'

  // Check if we're on the landing page
  const isLandingPage = pathname === `/${currentLocale}`

  return (
    <div className="w-fullbg-background">
      {!isLandingPage && <Sidebar />}
      <main className={`${isLandingPage ? 'ml-0' : 'ml-16 md:ml-64'}`}>
        {children}
      </main>
    </div>
  )
}
