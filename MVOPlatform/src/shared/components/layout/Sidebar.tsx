'use client'

import { useState, useEffect, startTransition } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAppSelector } from '@/core/lib/hooks'
import { signInWithGoogle, signOut } from '@/core/lib/slices/authSlice'
import { useAppDispatch } from '@/core/lib/hooks'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { useMediaQuery } from '@/core/lib/hooks'
import {
  Home,
  Heart,
  Activity,
  Plus,
  X,
  LogIn,
  FolderKanban,
  Shield,
} from 'lucide-react'
import { UserMenu } from '@/shared/components/ui/UserMenu'

interface SidebarProps {
  activeTab?: 'home' | 'foryou'
  onTabChange?: (tab: 'home' | 'foryou') => void
  isMobileOpen?: boolean
  setIsMobileOpen?: (open: boolean) => void
}

export function Sidebar({
  activeTab,
  onTabChange,
  isMobileOpen: externalIsMobileOpen,
  setIsMobileOpen: externalSetIsMobileOpen,
}: SidebarProps) {
  const dispatch = useAppDispatch()
  const t = useTranslations()
  const [internalIsMobileOpen, setInternalIsMobileOpen] = useState(false)
  // Use useMediaQuery for stable mobile detection that doesn't flicker during navigation
  const isMobile = useMediaQuery('(max-width: 767px)')

  // Use external state if provided, otherwise internal
  const isMobileOpen =
    externalIsMobileOpen !== undefined
      ? externalIsMobileOpen
      : internalIsMobileOpen
  const setIsMobileOpen = externalSetIsMobileOpen || setInternalIsMobileOpen
  const [isNavigating, setIsNavigating] = useState(false)
  const { user, profile, isAuthenticated } = useAppSelector(state => state.auth)
  const pathname = usePathname()
  const router = useRouter()
  const { getUnreadCount } = useNotifications()
  const hasUnreadNotifications = getUnreadCount() > 0

  // Extract current locale from pathname
  const currentLocale = pathname.startsWith('/es') ? 'es' : 'en'

  // Check if we're on a detail page that needs fixed sidebar
  const isDetailPage = pathname?.startsWith('/ideas/') && pathname !== '/ideas'

  // Track navigation to disable animations
  useEffect(() => {
    setIsNavigating(true)
    const timer = setTimeout(() => {
      setIsNavigating(false)
    }, 100) // Small delay to ensure transition completes
    return () => clearTimeout(timer)
  }, [pathname])

  // Handle sidebar state based on mobile/desktop
  useEffect(() => {
    if (externalSetIsMobileOpen) {
      if (isMobile) {
        // On mobile, start with sidebar closed
        externalSetIsMobileOpen(false)
      } else {
        // On desktop, ensure it's not open
        externalSetIsMobileOpen(false)
      }
    }
  }, [isMobile, externalSetIsMobileOpen])

  const handleBack = () => {
    // Get the previous path from sessionStorage (set when navigating to idea)
    const previousPath = sessionStorage.getItem('previousPath') || '/'
    const scrollPosition = sessionStorage.getItem('previousScrollPosition')

    // Save scroll position to localStorage before navigating
    if (scrollPosition && previousPath) {
      localStorage.setItem(`scrollPosition_${previousPath}`, scrollPosition)
      // Set a flag to indicate we need to restore scroll
      sessionStorage.setItem('shouldRestoreScroll', 'true')
      sessionStorage.setItem('restoreScrollPath', previousPath)
      sessionStorage.setItem('restoreScrollPosition', scrollPosition)
    }

    // Navigate back using router.back() if possible, otherwise push
    if (typeof window !== 'undefined' && window.history.length > 1) {
      startTransition(() => {
        router.back()
      })
    } else {
      startTransition(() => {
        router.push(previousPath)
      })
    }
  }

  const isHomePage =
    pathname === '/' ||
    pathname === `/${currentLocale}` ||
    pathname === `/${currentLocale}/home`

  const navItems = [
    {
      id: 'home',
      label: t('navigation.home'),
      icon: Home,
      href: `/${currentLocale}/home`,
      onClick: () => {
        if (isDetailPage) {
          // On detail pages, use back navigation
          handleBack()
        } else if (isHomePage && onTabChange) {
          onTabChange('home')
        }
      },
      active:
        pathname === '/' ||
        pathname === `/${currentLocale}` ||
        pathname === `/${currentLocale}/home`,
    },
    {
      id: 'foryou',
      label: t('navigation.for_you'),
      icon: Heart,
      href: `/${currentLocale}/for-you`,
      active: pathname === `/${currentLocale}/for-you`,
    },
    {
      id: 'spaces',
      label: t('navigation.spaces'),
      icon: FolderKanban,
      href: `/${currentLocale}/spaces`,
      active:
        pathname === `/${currentLocale}/spaces` ||
        pathname?.startsWith(`/${currentLocale}/spaces/`),
    },
    {
      id: 'activity',
      label: t('navigation.activity'),
      icon: Activity,
      href: `/${currentLocale}/activity`,
      active: pathname === `/${currentLocale}/activity`,
    },
    {
      id: 'upload',
      label: t('navigation.upload'),
      icon: Plus,
      href: `/${currentLocale}/upload`,
      active: pathname === `/${currentLocale}/upload`,
    },
    ...(profile?.role === 'admin'
      ? [
          {
            id: 'admin',
            label: t('navigation.admin'),
            icon: Shield,
            href: `/${currentLocale}/admin`,
            active: pathname === `/${currentLocale}/admin`,
          },
        ]
      : []),
  ]

  const bottomItems = []

  const handleItemClick = (item: (typeof navItems)[0]) => {
    if (item.onClick) {
      item.onClick()
    }
    setIsMobileOpen(false)
  }

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: isNavigating && isMobile ? 0 : 0.2 }}
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed left-0 top-0 h-full max-h-screen z-[9998] flex-shrink-0 ${
          isMobile
            ? isMobileOpen
              ? 'w-64 transition-all duration-300 mobile-sidebar-fix'
              : 'w-0'
            : 'w-64'
        } shadow-lg md:shadow-none`}
      >
        <div className="h-full flex flex-col bg-background">
          {/* Logo/Brand - Acts as back button on detail pages */}
          <div className="p-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              {isDetailPage ? (
                <button
                  onClick={handleBack}
                  className="text-xl font-semibold text-text-primary hover:text-accent transition-colors cursor-pointer truncate flex-1 min-w-0"
                >
                  {t('brand.name')}
                </button>
              ) : (
                <Link
                  href={`/${currentLocale}/home`}
                  className="text-xl font-semibold text-text-primary truncate flex-1 min-w-0"
                >
                  {t('brand.name')}
                </Link>
              )}
              {isMobile && (
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1 rounded-md interactive-hover flex-shrink-0 ml-2"
                  aria-label="Close sidebar"
                >
                  <X className="w-7 h-7 text-text-secondary" />
                </button>
              )}
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="flex-1 py-4 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <div className="space-y-1 px-2">
              {navItems.map(item => {
                const Icon = item.icon
                const isActive = item.active || false

                if (isHomePage && item.id === 'home') {
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (isDetailPage && item.id === 'home') {
                          // On detail pages, home icon acts as back button
                          handleBack()
                        } else {
                          handleItemClick(item)
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${
                        isActive
                          ? 'bg-accent/10 text-accent'
                          : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'
                      }`}
                    >
                      <Icon className="w-7 h-7 flex-shrink-0" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  )
                }

                // Handle home icon on detail pages (when not on home page)
                if (isDetailPage && item.id === 'home') {
                  return (
                    <button
                      key={item.id}
                      onClick={handleBack}
                      className={`w-full flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${
                        isActive
                          ? 'bg-accent/10 text-accent'
                          : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'
                      }`}
                    >
                      <Icon className="w-7 h-7 flex-shrink-0" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  )
                }

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${
                      isActive
                        ? 'bg-accent/10 text-accent'
                        : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'
                    }`}
                  >
                    <Icon className="w-7 h-7 flex-shrink-0" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Bottom Items */}
          <div className="p-2 space-y-1">
            {bottomItems.map(item => {
              const Icon = item.icon
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${
                    item.active
                      ? 'bg-accent/10 text-accent'
                      : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'
                  }`}
                >
                  <Icon className="w-7 h-7 flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              )
            })}

            {/* Auth Section */}
            <div className="pt-3 mt-3">
              {isAuthenticated ? (
                <div className="px-3 py-2.5">
                  <UserMenu
                    user={{
                      name: profile?.full_name || user?.email || 'User',
                      email: user?.email || '',
                      image:
                        profile?.media_assets?.url ||
                        user?.user_metadata?.avatar_url ||
                        null,
                    }}
                    onSignOut={() => dispatch(signOut())}
                    showProfileLink={false}
                    position="above"
                    hasUnreadNotifications={hasUnreadNotifications}
                    currentLocale={currentLocale}
                  />
                </div>
              ) : (
                <button
                  onClick={() => {
                    dispatch(signInWithGoogle())
                    setIsMobileOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-text-secondary hover:bg-gray-100 hover:text-text-primary`}
                >
                  <LogIn className="w-7 h-7 flex-shrink-0" />
                  <span className="text-sm font-medium">
                    {t('actions.sign_in')}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
