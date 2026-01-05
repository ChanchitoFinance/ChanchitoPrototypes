'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from '../providers/I18nProvider'
import { Bell } from 'lucide-react'
import { useLocale } from '../providers/I18nProvider'

interface UserMenuProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  onSignOut: () => void
  showProfileLink?: boolean
  position?: 'below' | 'above'
  hasUnreadNotifications?: boolean
  currentLocale?: string
}

export function UserMenu({
  user,
  onSignOut,
  showProfileLink = false,
  position = 'below',
  hasUnreadNotifications = false,
  currentLocale = 'en',
}: UserMenuProps) {
  const t = useTranslations()
  const { locale } = useLocale()
  const [isOpen, setIsOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-accent"
      >
        <div className="relative">
          {user.image ? (
            <Image
              src={user.image}
              alt={user.name || 'User'}
              width={32}
              height={32}
              className="rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-text-primary font-medium">
              {user.name?.[0] || user.email?.[0] || 'U'}
            </div>
          )}
          {hasUnreadNotifications && (
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-accent border-2 border-background"></div>
          )}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-full left-4.5 transform -translate-x-1/2 mb-2 w-60 bg-gray-100 rounded-md shadow-lg border border-border-color py-2 z-[250]"
          >
            <div className="px-4 py-2 border-b border-border-color">
              <p className="text-label">{user.name}</p>
              <p className="text-xs text-text-secondary">{user.email}</p>
            </div>
            {showProfileLink && (
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-sm text-text-secondary interactive-hover"
              >
                {t('navigation.profile')}
              </Link>
            )}
            <Link
              href={`/${currentLocale}/notifications`}
              onClick={() => setIsOpen(false)}
              className={`block px-4 py-2 text-sm interactive-hover ${
                hasUnreadNotifications
                  ? 'text-accent font-medium'
                  : 'text-text-secondary'
              }`}
            >
              <div className="flex items-center justify-between">
                <span>{t('navigation.notifications')}</span>
                {hasUnreadNotifications && (
                  <span className="w-2 h-2 rounded-full bg-accent"></span>
                )}
              </div>
            </Link>
            <Link
              href={`/${locale}/settings`}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-sm text-text-secondary interactive-hover"
            >
              {t('settings.title')}
            </Link>
            <button
              onClick={onSignOut}
              className="w-full text-left px-4 py-2 text-sm text-text-secondary interactive-hover"
            >
              {t('actions.sign_out')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
