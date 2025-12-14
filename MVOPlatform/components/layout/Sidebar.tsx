'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Home,
  Heart,
  Activity,
  Plus,
  User,
  MoreHorizontal,
  X,
  LogIn,
} from 'lucide-react'
import { clientEnv } from '@/config/env'
import { UserMenu } from '@/components/ui/UserMenu'
import Image from 'next/image'
import { UI_LABELS } from '@/lib/constants/ui'

interface SidebarProps {
  activeTab?: 'home' | 'foryou'
  onTabChange?: (tab: 'home' | 'foryou') => void
}

// Sidebar styling constants
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
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const { data: session } = useSession()
  const pathname = usePathname()

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

  const showExpanded = isMobileOpen || (!isMobile && !isCollapsed)

  const isHomePage = pathname === '/'

  const navItems = [
    {
      id: 'home',
      label: UI_LABELS.HOME,
      icon: Home,
      href: '/',
      onClick: () => {
        if (isHomePage && onTabChange) {
          onTabChange('home')
        }
      },
      active: isHomePage && activeTab === 'home',
    },
    {
      id: 'foryou',
      label: UI_LABELS.FOR_YOU,
      icon: Heart,
      href: '/',
      onClick: () => {
        if (isHomePage && onTabChange) {
          onTabChange('foryou')
        }
      },
      active: isHomePage && activeTab === 'foryou',
    },
    {
      id: 'activity',
      label: UI_LABELS.ACTIVITY,
      icon: Activity,
      href: '/activity',
      active: pathname === '/activity',
    },
    {
      id: 'upload',
      label: UI_LABELS.UPLOAD,
      icon: Plus,
      href: '/submit',
      active: pathname === '/submit',
    },
  ]

  const bottomItems = [
    {
      id: 'profile',
      label: UI_LABELS.PROFILE,
      icon: User,
      href: '/profile',
      active: pathname === '/profile',
    },
    {
      id: 'more',
      label: UI_LABELS.MORE,
      icon: MoreHorizontal,
      href: '/more',
      active: pathname === '/more',
    },
  ]

  const handleItemClick = (item: typeof navItems[0]) => {
    if (item.onClick) {
      item.onClick()
    }
    setIsMobileOpen(false)
  }

  const sidebarContent = (
    <div className="h-full flex flex-col bg-background">
      {/* Logo/Brand */}
      <div className={SIDEBAR_STYLES.container.padding.logo}>
        <div className="flex items-center justify-between">
          {showExpanded && (
            <>
              <Link href="/" className={`${SIDEBAR_STYLES.logo.expanded.text} font-semibold text-text-primary`}>
                {UI_LABELS.BRAND_NAME}
              </Link>
              {isMobile && (
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1 rounded-md interactive-hover"
                  aria-label="Close sidebar"
                >
                  <X className={`${SIDEBAR_STYLES.icon.size} text-text-secondary`} />
                </button>
              )}
            </>
          )}
          {!showExpanded && (
            <div className={`${SIDEBAR_STYLES.logo.collapsed.size} ${SIDEBAR_STYLES.button.borderRadius} bg-accent flex items-center justify-center mx-auto`}>
              <span className={`text-text-primary ${SIDEBAR_STYLES.logo.collapsed.text}`}>MVO</span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Items */}
      <nav className={`flex-1 ${SIDEBAR_STYLES.container.padding.nav.vertical} overflow-y-auto`}>
        <div className={`${SIDEBAR_STYLES.container.spacing.items} ${showExpanded ? SIDEBAR_STYLES.container.padding.nav.horizontal.expanded : SIDEBAR_STYLES.container.padding.nav.horizontal.collapsed}`}>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.active || false

            if (isHomePage && (item.id === 'home' || item.id === 'foryou')) {
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`w-full flex items-center ${showExpanded ? `${SIDEBAR_STYLES.button.gap.expanded} ${SIDEBAR_STYLES.button.padding.horizontal.expanded}` : `justify-center ${SIDEBAR_STYLES.button.padding.horizontal.collapsed}`} ${SIDEBAR_STYLES.button.padding.vertical} ${SIDEBAR_STYLES.button.borderRadius} transition-colors ${
                    isActive
                      ? SIDEBAR_STYLES.colors.active
                      : SIDEBAR_STYLES.colors.inactive
                  }`}
                  title={!showExpanded ? item.label : ''}
                >
                  <Icon className={`${SIDEBAR_STYLES.icon.size} flex-shrink-0`} />
                  {showExpanded && (
                    <span className={`${SIDEBAR_STYLES.button.text.size} ${SIDEBAR_STYLES.button.text.weight}`}>{item.label}</span>
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
                  <span className={`${SIDEBAR_STYLES.button.text.size} ${SIDEBAR_STYLES.button.text.weight}`}>{item.label}</span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom Items */}
      <div className={`${showExpanded ? SIDEBAR_STYLES.container.padding.bottom.expanded : SIDEBAR_STYLES.container.padding.bottom.collapsed} ${SIDEBAR_STYLES.container.spacing.items}`}>
        {bottomItems.map((item) => {
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
                <span className={`${SIDEBAR_STYLES.button.text.size} ${SIDEBAR_STYLES.button.text.weight}`}>{item.label}</span>
              )}
            </Link>
          )
        })}

                {/* Auth Section */}
                <div className={`${SIDEBAR_STYLES.container.padding.auth.top} ${SIDEBAR_STYLES.container.padding.auth.margin}`}>
          {session ? (
            <>
              {session.user?.email === clientEnv.adminEmail && (
                <Link
                  href="/admin"
                  onClick={() => setIsMobileOpen(false)}
                  className={`w-full flex items-center ${SIDEBAR_STYLES.button.gap.expanded} ${SIDEBAR_STYLES.button.padding.horizontal.expanded} ${SIDEBAR_STYLES.button.padding.vertical} ${SIDEBAR_STYLES.button.borderRadius} transition-colors ${
                    pathname === '/admin'
                      ? SIDEBAR_STYLES.colors.active
                      : SIDEBAR_STYLES.colors.inactive
                  } ${!showExpanded ? 'justify-center' : ''}`}
                  title={!showExpanded ? UI_LABELS.ADMIN : ''}
                >
                  <Activity className={`${SIDEBAR_STYLES.icon.size} flex-shrink-0`} />
                  {showExpanded && (
                    <span className={`${SIDEBAR_STYLES.button.text.size} ${SIDEBAR_STYLES.button.text.weight}`}>{UI_LABELS.ADMIN}</span>
                  )}
                </Link>
              )}
              {!showExpanded ? (
                <div className={`${SIDEBAR_STYLES.container.padding.auth.horizontal} ${SIDEBAR_STYLES.container.padding.auth.vertical} flex justify-center`}>
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      width={SIDEBAR_STYLES.avatar.size.image}
                      height={SIDEBAR_STYLES.avatar.size.image}
                      className="rounded-full"
                    />
                  ) : (
                    <div className={`${SIDEBAR_STYLES.avatar.size.placeholder} rounded-full bg-accent flex items-center justify-center text-text-primary font-medium ${SIDEBAR_STYLES.avatar.size.text}`}>
                      {session.user?.name?.[0] || session.user?.email?.[0] || 'U'}
                    </div>
                  )}
                </div>
              ) : (
                <div className={`${SIDEBAR_STYLES.container.padding.auth.horizontal} ${SIDEBAR_STYLES.container.padding.auth.vertical}`}>
                  <UserMenu user={session.user} onSignOut={() => signOut()} />
                </div>
              )}
            </>
          ) : (
            <button
              onClick={() => {
                signIn('google')
                setIsMobileOpen(false)
              }}
              className={`w-full flex items-center ${SIDEBAR_STYLES.button.gap.expanded} ${SIDEBAR_STYLES.button.padding.horizontal.expanded} ${SIDEBAR_STYLES.button.padding.vertical} ${SIDEBAR_STYLES.button.borderRadius} transition-colors ${SIDEBAR_STYLES.colors.inactive} ${
                !showExpanded ? 'justify-center' : ''
              }`}
              title={!showExpanded ? UI_LABELS.SIGN_IN : ''}
            >
              <LogIn className={`${SIDEBAR_STYLES.icon.size} flex-shrink-0`} />
              {showExpanded && (
                <span className={`${SIDEBAR_STYLES.button.text.size} ${SIDEBAR_STYLES.button.text.weight}`}>{UI_LABELS.SIGN_IN}</span>
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
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`relative h-screen z-50 transition-all duration-300 flex-shrink-0 ${
          showExpanded ? SIDEBAR_STYLES.width.expanded : SIDEBAR_STYLES.width.collapsed
        } shadow-lg md:shadow-none`}
      >
        {sidebarContent}
      </aside>
    </>
  )
}

