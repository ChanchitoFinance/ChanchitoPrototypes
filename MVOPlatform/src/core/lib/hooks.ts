'use client'

import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux'
import type { RootState, AppDispatch } from './store'
import { useState, useEffect } from 'react'

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

/**
 * Hook to detect if the window matches a media query
 * Uses a stable approach that doesn't cause hydration mismatches
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // Check if window is defined (client-side)
    if (typeof window === 'undefined') return

    const media = window.matchMedia(query)
    // Set initial value
    setMatches(media.matches)

    const listener = (e: MediaQueryListEvent) => {
      setMatches(e.matches)
    }

    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}
