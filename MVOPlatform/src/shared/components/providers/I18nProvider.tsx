'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import en from '../../../../messages/en.json'
import es from '../../../../messages/es.json'

type Locale = 'en' | 'es'

interface I18nContextType {
  locale: Locale
  messages: any
  t: (key: string) => string
  setLocale: (locale: Locale) => void
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({
  children,
  locale: initialLocale,
}: {
  children: React.ReactNode
  locale?: Locale
}) {
  // Use provided locale or detect synchronously if possible
  const getInitialLocale = (): Locale => {
    if (initialLocale) return initialLocale
    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname
      return pathname.startsWith('/es') ? 'es' : 'en'
    }
    return 'en'
  }

  const [locale, setLocaleState] = useState<Locale>(getInitialLocale)
  const [messages, setMessages] = useState<any>(
    getInitialLocale() === 'es' ? es : en
  )

  useEffect(() => {
    // Re-detect locale from URL path on client side in case it changed
    const pathname = window.location.pathname
    const detectedLocale = pathname.startsWith('/es') ? 'es' : 'en'
    console.log(
      'Client-side locale detection:',
      detectedLocale,
      'from pathname:',
      pathname
    )

    if (detectedLocale !== locale) {
      setLocaleState(detectedLocale)
      setMessages(detectedLocale === 'es' ? es : en)
    }
  }, [locale])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    setMessages(newLocale === 'es' ? es : en)

    // Update URL while preserving the current route
    const currentPath = window.location.pathname
    const pathWithoutLocale = currentPath.replace(/^\/\w{2}/, '') || '/'
    // Always include locale prefix for consistency with Next.js i18n routing
    const newPath = `/${newLocale}${pathWithoutLocale}`
    window.history.pushState({}, '', newPath)
  }

  const t = (key: string): string => {
    const keys = key.split('.')
    let value: any = messages

    for (const k of keys) {
      value = value?.[k]
    }

    return value || key
  }

  return (
    <I18nContext.Provider value={{ locale, messages, t, setLocale }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useTranslations() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useTranslations must be used within an I18nProvider')
  }
  return context.t
}

export function useLocale() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useLocale must be used within an I18nProvider')
  }
  return { locale: context.locale, setLocale: context.setLocale }
}
