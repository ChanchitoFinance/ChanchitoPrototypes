'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAppSelector } from '@/core/lib/hooks'
import { signInWithGoogle, signOut } from '@/core/lib/slices/authSlice'
import { useAppDispatch } from '@/core/lib/hooks'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from '@/shared/components/providers/I18nProvider'
import {
  Home,
  Heart,
  Activity,
  Plus,
  MoreHorizontal,
  X,
  LogIn,
  FolderKanban,
  Shield,
  Bell,
} from 'lucide-react'
import { UserMenu } from '@/shared/components/ui/UserMenu'

interface SidebarProps {
  activeTab?: 'home' | 'foryou'
  onTabChange?: (tab: 'home' | 'foryou') => void
}

const SIDEBAR_STYLES = {
  // Widths
  width: {
    expanded: 'w-64',
    collapsed: 'w-16',
  },
  // Icon sizes
  icon: {
    size: 'w-7 h-7',
  },
  // Button styles
  button: {
    padding: {
      vertical: 'py-3',
      horizontal: {
        expanded: 'px-3',
        collapsed: 'px-0',
      },
    },
    gap: {
      expanded: 'gap-3',
      collapsed: 'gap-0',
    },
    text: {
      size: 'text-sm',
      weight: 'font-medium',
    },
    borderRadius: 'rounded-md',
  },
  // Container padding
  container: {
    padding: {
      logo: 'p-4',
      nav: {
        vertical: 'py-4',
        horizontal: {
          expanded: 'px-2',
          collapsed: 'px-0',
        },
      },
      bottom: {
        expanded: 'p-2',
        collapsed: 'p-1',
      },
      auth: {
        top: 'pt-3',
        margin: 'mt-3',
        horizontal: 'px-3',
        vertical: 'py-2.5',
      },
    },
    spacing: {
      items: 'space-y-1',
    },
  },
  // State colors
  colors: {
    active: 'bg-accent/10 text-accent',
    inactive: 'text-text-secondary hover:bg-gray-100 hover:text-text-primary',
  },
  // Logo styles
  logo: {
    collapsed: {
      size: 'w-12 h-8', // Wider to fit "MVO"
      text: 'text-sx font-bold',
    },
    expanded: {
      text: 'text-xl',
    },
  },
  // User avatar
  avatar: {
    size: {
      image: 32,
      placeholder: 'w-8 h-8',
      text: 'text-sm',
    },
  },
} as const

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const dispatch = useAppDispatch()
  const t = useTranslations()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
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

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      // On mobile, start with sidebar closed (icon-only)
      if (window.innerWidth < 768) {
        setIsMobileOpen(false)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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
      router.back()
    } else {
      router.push(previousPath)
    }
  }

  const showExpanded = isMobileOpen || (!isMobile && !isCollapsed)

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

  const bottomItems = [
    {
      id: 'more',
      label: t('navigation.more'),
      icon: MoreHorizontal,
      href: `/${currentLocale}/more`,
      active: pathname === `/${currentLocale}/more`,
    },
  ]

  const handleItemClick = (item: (typeof navItems)[0]) => {
    if (item.onClick) {
      item.onClick()
    }
    setIsMobileOpen(false)
  }

  const sidebarContent = (
    <div className="h-full flex flex-col bg-background">
      {/* Logo/Brand - Acts as back button on detail pages */}
      <div className={`${SIDEBAR_STYLES.container.padding.logo} flex-shrink-0`}>
        <div
          className={`flex items-center ${showExpanded ? 'justify-between' : 'justify-center'}`}
        >
          {showExpanded && (
            <>
              {isDetailPage ? (
                <button
                  onClick={handleBack}
                  className={`${SIDEBAR_STYLES.logo.expanded.text} font-semibold text-text-primary hover:text-accent transition-colors cursor-pointer truncate flex-1 min-w-0`}
                >
                  {t('brand.name')}
                </button>
              ) : (
                <Link
                  href={`/${currentLocale}/home`}
                  className={`${SIDEBAR_STYLES.logo.expanded.text} font-semibold text-text-primary truncate flex-1 min-w-0`}
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
                  <X
                    className={`${SIDEBAR_STYLES.icon.size} text-text-secondary`}
                  />
                </button>
              )}
            </>
          )}
          {!showExpanded &&
            (isDetailPage ? (
              <button
                onClick={handleBack}
                className={`${SIDEBAR_STYLES.logo.collapsed.size} ${SIDEBAR_STYLES.button.borderRadius} bg-accent flex items-center justify-center cursor-pointer hover:bg-accent/80 transition-colors`}
              >
                <span
                  className={`text-text-primary ${SIDEBAR_STYLES.logo.collapsed.text} font-bold`}
                >
                  MVO
                </span>
              </button>
            ) : (
              <Link
                href={`/${currentLocale}/home`}
                className={`${SIDEBAR_STYLES.logo.collapsed.size} ${SIDEBAR_STYLES.button.borderRadius} bg-accent flex items-center justify-center`}
              >
                <span
                  className={`text-text-primary ${SIDEBAR_STYLES.logo.collapsed.text} font-bold`}
                >
                  MVO
                </span>
              </Link>
            ))}
        </div>
      </div>

      {/* Navigation Items */}
      <nav
        className={`flex-1 ${SIDEBAR_STYLES.container.padding.nav.vertical} overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`}
      >
        <div
          className={`${SIDEBAR_STYLES.container.spacing.items} ${showExpanded ? SIDEBAR_STYLES.container.padding.nav.horizontal.expanded : SIDEBAR_STYLES.container.padding.nav.horizontal.collapsed}`}
        >
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
                  className={`w-full flex items-center ${showExpanded ? `${SIDEBAR_STYLES.button.gap.expanded} ${SIDEBAR_STYLES.button.padding.horizontal.expanded}` : `justify-center ${SIDEBAR_STYLES.button.padding.horizontal.collapsed}`} ${SIDEBAR_STYLES.button.padding.vertical} ${SIDEBAR_STYLES.button.borderRadius} transition-colors ${
                    isActive
                      ? SIDEBAR_STYLES.colors.active
                      : SIDEBAR_STYLES.colors.inactive
                  }`}
                  title={!showExpanded ? item.label : ''}
                >
                  <Icon
                    className={`${SIDEBAR_STYLES.icon.size} flex-shrink-0`}
                  />
                  {showExpanded && (
                    <span
                      className={`${SIDEBAR_STYLES.button.text.size} ${SIDEBAR_STYLES.button.text.weight}`}
                    >
                      {item.label}
                    </span>
                  )}
                </button>
              )
            }

            // Handle home icon on detail pages (when not on home page)
            if (isDetailPage && item.id === 'home') {
              return (
                <button
                  key={item.id}
                  onClick={handleBack}
                  className={`w-full flex items-center ${showExpanded ? `${SIDEBAR_STYLES.button.gap.expanded} ${SIDEBAR_STYLES.button.padding.horizontal.expanded}` : `justify-center ${SIDEBAR_STYLES.button.padding.horizontal.collapsed}`} ${SIDEBAR_STYLES.button.padding.vertical} ${SIDEBAR_STYLES.button.borderRadius} transition-colors ${
                    isActive
                      ? SIDEBAR_STYLES.colors.active
                      : SIDEBAR_STYLES.colors.inactive
                  }`}
                  title={!showExpanded ? item.label : ''}
                >
                  <Icon
                    className={`${SIDEBAR_STYLES.icon.size} flex-shrink-0`}
                  />
                  {showExpanded && (
                    <span
                      className={`${SIDEBAR_STYLES.button.text.size} ${SIDEBAR_STYLES.button.text.weight}`}
                    >
                      {item.label}
                    </span>
                  )}
                </button>
              )
            }

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`w-full flex items-center ${showExpanded ? `${SIDEBAR_STYLES.button.gap.expanded} ${SIDEBAR_STYLES.button.padding.horizontal.expanded}` : `justify-center ${SIDEBAR_STYLES.button.padding.horizontal.collapsed}`} ${SIDEBAR_STYLES.button.padding.vertical} ${SIDEBAR_STYLES.button.borderRadius} transition-colors ${
                  isActive
                    ? SIDEBAR_STYLES.colors.active
                    : SIDEBAR_STYLES.colors.inactive
                }`}
                title={!showExpanded ? item.label : ''}
              >
                <Icon className={`${SIDEBAR_STYLES.icon.size} flex-shrink-0`} />
                {showExpanded && (
                  <span
                    className={`${SIDEBAR_STYLES.button.text.size} ${SIDEBAR_STYLES.button.text.weight}`}
                  >
                    {item.label}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom Items */}
      <div
        className={`${showExpanded ? SIDEBAR_STYLES.container.padding.bottom.expanded : SIDEBAR_STYLES.container.padding.bottom.collapsed} ${SIDEBAR_STYLES.container.spacing.items}`}
      >
        {bottomItems.map(item => {
          const Icon = item.icon
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setIsMobileOpen(false)}
              className={`w-full flex items-center ${showExpanded ? `${SIDEBAR_STYLES.button.gap.expanded} ${SIDEBAR_STYLES.button.padding.horizontal.expanded}` : `justify-center ${SIDEBAR_STYLES.button.padding.horizontal.collapsed}`} ${SIDEBAR_STYLES.button.padding.vertical} ${SIDEBAR_STYLES.button.borderRadius} transition-colors ${
                item.active
                  ? SIDEBAR_STYLES.colors.active
                  : SIDEBAR_STYLES.colors.inactive
              }`}
              title={!showExpanded ? item.label : ''}
            >
              <Icon className={`${SIDEBAR_STYLES.icon.size} flex-shrink-0`} />
              {showExpanded && (
                <span
                  className={`${SIDEBAR_STYLES.button.text.size} ${SIDEBAR_STYLES.button.text.weight}`}
                >
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}

        {/* Auth Section */}
        <div
          className={`${SIDEBAR_STYLES.container.padding.auth.top} ${SIDEBAR_STYLES.container.padding.auth.margin}`}
        >
          {isAuthenticated ? (
            <div
              className={`${SIDEBAR_STYLES.container.padding.auth.horizontal} ${SIDEBAR_STYLES.container.padding.auth.vertical}`}
            >
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
              className={`w-full flex items-center ${SIDEBAR_STYLES.button.gap.expanded} ${SIDEBAR_STYLES.button.padding.horizontal.expanded} ${SIDEBAR_STYLES.button.padding.vertical} ${SIDEBAR_STYLES.button.borderRadius} transition-colors ${SIDEBAR_STYLES.colors.inactive} ${
                !showExpanded ? 'justify-center' : ''
              }`}
              title={!showExpanded ? t('actions.sign_in') : ''}
            >
              <LogIn className={`${SIDEBAR_STYLES.icon.size} flex-shrink-0`} />
              {showExpanded && (
                <span
                  className={`${SIDEBAR_STYLES.button.text.size} ${SIDEBAR_STYLES.button.text.weight}`}
                >
                  {t('actions.sign_in')}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )

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
        className={`fixed left-0 top-0 h-screen z-[9998] transition-all duration-300 flex-shrink-0 ${
          showExpanded
            ? SIDEBAR_STYLES.width.expanded
            : SIDEBAR_STYLES.width.collapsed
        } shadow-lg md:shadow-none`}
      >
        {sidebarContent}
      </aside>
    </>
  )
}
