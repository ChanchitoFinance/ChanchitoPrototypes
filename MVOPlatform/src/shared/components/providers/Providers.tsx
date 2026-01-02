'use client'

import { Provider } from 'react-redux'
import { ReactNode } from 'react'
import { AuthProvider } from './AuthProvider'
import { I18nProvider } from './I18nProvider'
import { ThemeInitializer } from './ThemeInitializer'
import { store } from '@/core/lib/store'

export function Providers({
  children,
  locale,
}: {
  children: ReactNode
  locale?: 'en' | 'es'
}) {
  return (
    <Provider store={store}>
      <I18nProvider locale={locale}>
        <ThemeInitializer>
          <AuthProvider>{children}</AuthProvider>
        </ThemeInitializer>
      </I18nProvider>
    </Provider>
  )
}
