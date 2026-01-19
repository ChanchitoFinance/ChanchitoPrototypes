'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '@/core/lib/store'
import {
  setTheme,
  setLanguage,
  toggleTheme,
  savePreferences,
} from '@/core/lib/slices/themeSlice'
import {
  useTranslations,
  useLocale,
} from '@/shared/components/providers/I18nProvider'
import { Button } from '@/shared/components/ui/Button'

export default function SettingsPage() {
  const t = useTranslations()
  const { locale, setLocale } = useLocale()
  const dispatch = useDispatch()
  const router = useRouter()

  const theme = useSelector((state: RootState) => state.theme.theme)
  const language = useSelector((state: RootState) => state.theme.language)
  const userEmail = useSelector((state: RootState) => state.auth.profile?.email)

  const [currentTheme, setCurrentTheme] = useState(theme)
  const [currentLanguage, setCurrentLanguage] = useState(language)

  // Synchronize Redux state with actual I18nProvider locale on initial load
  useEffect(() => {
    if (language !== locale) {
      dispatch(setLanguage(locale))
    }
  }, [language, locale, dispatch])

  useEffect(() => {
    setCurrentTheme(theme)
    setCurrentLanguage(language)
  }, [theme, language])

  const handleThemeChange = (newTheme: 'dark' | 'light') => {
    dispatch(setTheme(newTheme))
    setCurrentTheme(newTheme)
    applyTheme(newTheme)
    dispatch(savePreferences({ userEmail }))
  }

  const handleLanguageChange = (newLanguage: 'en' | 'es') => {
    dispatch(setLanguage(newLanguage))
    setCurrentLanguage(newLanguage)

    // Update locale immediately - the I18nProvider will handle URL updates
    if (newLanguage !== locale) {
      setLocale(newLanguage)
      // Force a page reload to ensure the new locale is properly applied
      window.location.reload()
    }

    dispatch(savePreferences({ userEmail }))
  }

  const applyTheme = (theme: 'dark' | 'light') => {
    const root = document.documentElement
    if (theme === 'light') {
      root.style.setProperty('--background', '#FFFFFF')
      root.style.setProperty('--text-primary', '#000000')
      root.style.setProperty('--text-secondary', '#666666')
      root.style.setProperty('--border-color', '#E5E5E5')
      root.style.setProperty('--gray-50', '#F5F5F5')
      root.style.setProperty('--gray-100', '#FFFFFF')
      root.style.setProperty('--gray-200', '#F0F0F0')
    } else {
      root.style.setProperty('--background', '#000000')
      root.style.setProperty('--text-primary', '#FFFFFF')
      root.style.setProperty('--text-secondary', '#A0A0A0')
      root.style.setProperty('--border-color', '#1F1F1F')
      root.style.setProperty('--gray-50', '#1A1A1A')
      root.style.setProperty('--gray-100', '#1F1F1F')
      root.style.setProperty('--gray-200', '#2A2A2A')
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          {t('settings.title')}
        </h1>
        <p className="text-sm text-text-secondary  mb-8">
          {t('settings.auto_save_message')}
        </p>
        <div className="space-y-6">
          {/* Theme Settings */}
          <div className="card-base">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              {t('settings.theme_settings')}
            </h2>
            <p className="text-sm text-text-secondary mb-4">
              {t('settings.theme_description')}
            </p>
            <div className="flex space-x-4">
              <Button
                onClick={() => handleThemeChange('light')}
                variant={currentTheme === 'light' ? 'primary' : 'secondary'}
                className="flex-1 transition-all duration-200"
              >
                {t('settings.light_mode')}
              </Button>
              <Button
                onClick={() => handleThemeChange('dark')}
                variant={currentTheme === 'dark' ? 'primary' : 'secondary'}
                className="flex-1 transition-all duration-200"
              >
                {t('settings.dark_mode')}
              </Button>
            </div>
          </div>

          {/* Language Settings */}
          <div className="card-base">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              {t('settings.language_settings')}
            </h2>
            <p className="text-sm text-text-secondary mb-4">
              {t('settings.language_description')}
            </p>
            <div className="flex space-x-4">
              <Button
                onClick={() => handleLanguageChange('en')}
                variant={currentLanguage === 'en' ? 'primary' : 'secondary'}
                className="flex-1 transition-all duration-200"
              >
                English
              </Button>
              <Button
                onClick={() => handleLanguageChange('es')}
                variant={currentLanguage === 'es' ? 'primary' : 'secondary'}
                className="flex-1 transition-all duration-200"
              >
                Español
              </Button>
            </div>
          </div>

          {/* Premium Plans */}
          <div className="card-base">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Subscription Plans
            </h2>
            <p className="text-sm text-text-secondary mb-4">
              Upgrade your plan to unlock more AI features and credits
            </p>
            <Link href={`/${locale}/premium`}>
              <Button variant="primary" className="w-full">
                View Plans & Upgrade
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
