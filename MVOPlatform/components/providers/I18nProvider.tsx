'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import en from '../../messages/en.json'
import es from '../../messages/es.json'

type Locale = 'en' | 'es'

interface I18nContextType {
  locale: Locale
  messages: any
  t: (key: string) => string
  setLocale: (locale: Locale) => void
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en')
  const [messages, setMessages] = useState<any>(en)

  useEffect(() => {
    // Detect locale from URL path on client side
    const pathname = window.location.pathname
    const detectedLocale = pathname.startsWith('/es') ? 'es' : 'en'
    console.log(
      'Client-side locale detection:',
      detectedLocale,
      'from pathname:',
      pathname
    )

    setLocaleState(detectedLocale)
    setMessages(detectedLocale === 'es' ? es : en)
  }, [])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    setMessages(newLocale === 'es' ? es : en)

    // Update URL
    const newPath = newLocale === 'en' ? '/' : `/${newLocale}`
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
