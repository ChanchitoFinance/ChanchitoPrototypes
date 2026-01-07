'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/core/lib/hooks'
import { checkAuth } from '@/core/lib/slices/authSlice'
import { supabase } from '@/core/lib/supabase'
import { useLocale } from '@/shared/components/providers/I18nProvider'

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useAppDispatch()
  const router = useRouter()
  const pathname = usePathname()
  const { locale } = useLocale()
  const { isAuthenticated, initialized, profile, error } = useAppSelector(
    state => state.auth
  )

  useEffect(() => {
    // Only check auth if not already initialized to prevent unnecessary loading states
    if (!initialized) dispatch(checkAuth());

    const { data: authListener } = supabase.auth.onAuthStateChange(event => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        dispatch(checkAuth())
      } else if (event === 'SIGNED_OUT') {
        dispatch(checkAuth())
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [dispatch, initialized])

  useEffect(() => {
    const isAuthPage = pathname.startsWith('/auth')
    const isProtectedPage =
      pathname.startsWith('/upload') ||
      pathname.startsWith('/admin') ||
      pathname.startsWith('/activity')

    if (initialized && !isAuthPage && isProtectedPage) {
      if (!isAuthenticated || !profile || error) {
        router.replace(`/${locale}/auth`)
      }
    }
  }, [initialized, isAuthenticated, profile, error, pathname, router])

  return <>{children}</>
}
