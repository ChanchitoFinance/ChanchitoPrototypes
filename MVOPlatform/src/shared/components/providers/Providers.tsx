'use client'

import { Provider } from 'react-redux'
import { ReactNode } from 'react'
import { AuthProvider } from './AuthProvider'
import { I18nProvider } from './I18nProvider'
import { PostHogProvider } from './PostHogProvider'
import { ThemeInitializer } from './ThemeInitializer'
import { store } from '@/core/lib/store'
import * as Tooltip from '@radix-ui/react-tooltip'

export function Providers({
  children,
  locale,
}: {
  children: ReactNode
  locale?: 'en' | 'es'
}) {
  return (
    <Provider store={store}>
      <PostHogProvider>
        <I18nProvider locale={locale}>
          <ThemeInitializer>
            <AuthProvider>
              <Tooltip.Provider>{children}</Tooltip.Provider>
            </AuthProvider>
          </ThemeInitializer>
        </I18nProvider>
      </PostHogProvider>
    </Provider>
  )
}
