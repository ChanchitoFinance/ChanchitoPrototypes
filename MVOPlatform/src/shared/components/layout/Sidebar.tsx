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
  Shield,
  Compass,
  DollarSign,
} from 'lucide-react'
import { UserMenu } from '@/shared/components/ui/UserMenu'
import { TermsAcceptanceModal } from '@/shared/components/ui/TermsAcceptanceModal'

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
  const [sidebarHeight, setSidebarHeight] = useState('100vh')
  const [showTermsModal, setShowTermsModal] = useState(false)
  const pathname = usePathname()
  // Use useMediaQuery for stable mobile detection that doesn't flicker during navigation
  const isMobile = useMediaQuery('(max-width: 767px)')

  // Check if we're on a landing page
  const currentLocale = pathname.startsWith('/es') ? 'es' : 'en'
  const isLandingPage = pathname === '/' || pathname === `/${currentLocale}`

  // Use external state if provided, otherwise internal
  const isMobileOpen =
    externalIsMobileOpen !== undefined
      ? externalIsMobileOpen
      : internalIsMobileOpen
  const setIsMobileOpen = externalSetIsMobileOpen || setInternalIsMobileOpen
  const [isNavigating, setIsNavigating] = useState(false)
  const { user, profile, isAuthenticated } = useAppSelector(state => state.auth)
  const router = useRouter()
  const { getUnreadCount } = useNotifications()
  const hasUnreadNotifications = getUnreadCount() > 0

  // Check if terms are accepted after user is authenticated
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      const hasAcceptedTerms =
        localStorage.getItem(`${user.email}_termsAccepted`) === 'true'
      if (!hasAcceptedTerms) {
        setShowTermsModal(true)
      }
    }
  }, [isAuthenticated, user])

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

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobile && isMobileOpen) {
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [isMobile, isMobileOpen])

  // Handle dynamic viewport height changes for mobile
  useEffect(() => {
    if (!isMobile) return

    const updateSidebarHeight = () => {
      // Get the actual visible viewport height - use it directly without buffer
      const viewportHeight = window.innerHeight
      setSidebarHeight(`${viewportHeight}px`)
    }

    // Initial update
    updateSidebarHeight()

    // Update on resize and scroll events
    window.addEventListener('resize', updateSidebarHeight)
    window.addEventListener('scroll', updateSidebarHeight, { passive: true })

    return () => {
      window.removeEventListener('resize', updateSidebarHeight)
      window.removeEventListener('scroll', updateSidebarHeight)
    }
  }, [isMobile])

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
      id: 'browse',
      label: t('navigation.browse'),
      icon: Compass,
      href: `/${currentLocale}/browse`,
      active: pathname === `/${currentLocale}/browse`,
    },
    // {
    //   id: 'foryou',
    //   label: t('navigation.for_you'),
    //   icon: Heart,
    //   href: `/${currentLocale}/for-you`,
    //   active: pathname === `/${currentLocale}/for-you`,
    // },
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
    // ...(profile?.role === 'admin'
    //   ? [
    //       {
    //         id: 'admin',
    //         label: t('navigation.admin'),
    //         icon: Shield,
    //         href: `/${currentLocale}/admin`,
    //         active: pathname === `/${currentLocale}/admin`,
    //       },
    //     ]
    //   : []),
  ]

  const bottomItems = [
    {
      id: 'pricing',
      label: t('navigation.pricing'),
      icon: DollarSign,
      href: `/${currentLocale}/premium`,
      active: pathname === `/${currentLocale}/premium`,
    },
  ]

  // Don't render sidebar on landing pages
  if (isLandingPage) {
    return null
  }

  const handleSignInClick = () => {
    // Directly sign in without checking terms first
    dispatch(signInWithGoogle())
  }

  const handleTermsAccepted = () => {
    setShowTermsModal(false)
    // Store terms acceptance in localStorage for the current user
    if (user?.email) {
      const key = `${user.email}_termsAccepted`
      localStorage.setItem(key, 'true')
    }
  }

  return (
    <>
      <TermsAcceptanceModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
        onAccept={handleTermsAccepted}
        userEmail={user?.email}
      />
      <aside
        className={`flex-shrink-0 ${
          isMobile
            ? isMobileOpen
              ? 'fixed left-0 top-0 w-64 z-[200] transition-all duration-300'
              : 'w-0 overflow-hidden'
            : 'w-[13.5rem]'
        } shadow-lg md:shadow-none h-full`}
        style={{
          height: isMobile ? sidebarHeight : '100vh',
          maxHeight: isMobile ? sidebarHeight : '100vh',
        }}
      >
        <div className="h-full flex flex-col bg-background overflow-visible">
          {/* Logo/Brand - Acts as back button on detail pages */}
          <div className="p-4 flex-shrink-0">
            <div className="flex items-center justify-between">
              {isDetailPage ? (
                <button
                  onClick={handleBack}
                  className="text-xl font-semibold text-text-primary hover:text-primary-accent transition-colors cursor-pointer truncate flex-1 min-w-0"
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
              {isMobile && isMobileOpen && (
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

                // Handle home item with special logic
                if (item.id === 'home') {
                  if (isDetailPage) {
                    // On detail pages, home icon acts as back button
                    return (
                      <button
                        key={item.id}
                        onClick={handleBack}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${
                          isActive
                            ? 'bg-primary-accent/10 text-primary-accent'
                            : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'
                        }`}
                      >
                        <Icon className="w-7 h-7 flex-shrink-0" />
                        <span className="text-sm font-medium whitespace-nowrap">
                          {item.label}
                        </span>
                      </button>
                    )
                  } else if (isHomePage && onTabChange) {
                    // On home page with tab change handler
                    return (
                      <button
                        key={item.id}
                        onClick={() => onTabChange('home')}
                        className={`w-full flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${
                          isActive
                            ? 'bg-primary-accent/10 text-primary-accent'
                            : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'
                        }`}
                      >
                        <Icon className="w-7 h-7 flex-shrink-0" />
                        <span className="text-sm font-medium whitespace-nowrap">
                          {item.label}
                        </span>
                      </button>
                    )
                  }
                }

                // Regular navigation items
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${
                      isActive
                        ? 'bg-primary-accent/10 text-primary-accent'
                        : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'
                    }`}
                  >
                    <Icon className="w-7 h-7 flex-shrink-0" />
                    <span className="text-sm font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Bottom Items */}
          <div className="p-2 pb-4 space-y-1">
            {bottomItems.map(item => {
              const Icon = item.icon
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${
                    item.active
                      ? 'bg-primary-accent/10 text-primary-accent'
                      : 'text-text-secondary hover:bg-gray-100 hover:text-text-primary'
                  }`}
                >
                  <Icon className="w-7 h-7 flex-shrink-0" />
                  <span className="text-sm font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                </Link>
              )
            })}

            {/* Auth Section */}
            <div className="pt-0">
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
                    handleSignInClick()
                    setIsMobileOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-text-secondary hover:bg-gray-100 hover:text-text-primary`}
                >
                  <LogIn className="w-7 h-7 flex-shrink-0" />
                  <span className="text-sm font-medium whitespace-nowrap">
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

// Mobile Sidebar Overlay component
interface MobileSidebarOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileSidebarOverlay({
  isOpen,
  onClose,
}: MobileSidebarOverlayProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] md:hidden"
        />
      )}
    </AnimatePresence>
  )
}
