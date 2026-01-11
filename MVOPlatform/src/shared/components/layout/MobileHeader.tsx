'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useMediaQuery } from '@/core/lib/hooks'

interface MobileHeaderProps {
  onMenuClick: () => void
}

export function MobileHeader({ onMenuClick }: MobileHeaderProps) {
  const pathname = usePathname()
  const currentLocale = pathname.startsWith('/es') ? 'es' : 'en'
  // Use useMediaQuery for stable mobile detection
  const isMobile = useMediaQuery('(max-width: 767px)')

  // Only show on mobile
  if (!isMobile) return null

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Hamburger Menu */}
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo */}
          <Link
            href={`/${currentLocale}/home`}
            className="text-xl font-bold text-primary"
          >
            MVO
          </Link>

          {/* Spacer for centering */}
          <div className="w-10" />
        </div>
      </div>
    </header>
  )
}
