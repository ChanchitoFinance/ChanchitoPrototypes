'use client'

import { useEffect } from 'react'
import { HomeFeed } from '@/features/home/components/HomeFeed'
import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { HeroCarousel } from '@/features/home/components/HeroCarousel'

export default function Home() {
  const t = useTranslations()
  // Restore scroll position on mount
  useEffect(() => {
    const restoreScroll = () => {
      if (typeof window === 'undefined') return false

      // Check if we should restore scroll from navigation back
      const shouldRestore = sessionStorage.getItem('shouldRestoreScroll')
      const restorePath = sessionStorage.getItem('restoreScrollPath')
      const restorePosition = sessionStorage.getItem('restoreScrollPosition')

      let scrollY: number | null = null

      if (
        shouldRestore === 'true' &&
        restorePath === window.location.pathname &&
        restorePosition
      ) {
        // Use the position from sessionStorage (more reliable for back navigation)
        scrollY = parseInt(restorePosition, 10)
        // Clear the flag
        sessionStorage.removeItem('shouldRestoreScroll')
        sessionStorage.removeItem('restoreScrollPath')
        sessionStorage.removeItem('restoreScrollPosition')
      } else {
        // Otherwise try to restore from localStorage
        const savedScroll = localStorage.getItem(
          `scrollPosition_${window.location.pathname}`
        )
        if (savedScroll) {
          scrollY = parseInt(savedScroll, 10)
        }
      }

      if (scrollY !== null && !isNaN(scrollY) && scrollY > 0) {
        // Find the scrollable container (main element)
        const scrollContainer = document.querySelector('main') as HTMLElement

        if (scrollContainer) {
          // Scroll the container
          requestAnimationFrame(() => {
            scrollContainer.scrollTo({ top: scrollY!, behavior: 'instant' })
          })
        } else {
          // Fallback to window scroll
          requestAnimationFrame(() => {
            window.scrollTo({ top: scrollY!, behavior: 'instant' })
          })
        }
        return true
      }
      return false
    }

    // Try immediately
    let restored = restoreScroll()

    // If not restored, try after delays to handle async content loading
    const timeouts: NodeJS.Timeout[] = []

    if (!restored) {
      timeouts.push(
        setTimeout(() => {
          restored = restoreScroll() || restored
        }, 100),
        setTimeout(() => {
          restored = restoreScroll() || restored
        }, 300),
        setTimeout(() => {
          restored = restoreScroll() || restored
        }, 600),
        setTimeout(() => {
          restoreScroll()
        }, 1000)
      )
    }

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout))
    }
  }, [])

  // Save scroll position before navigating away
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window === 'undefined') return

      // Find the scrollable container (main element)
      const scrollContainer = document.querySelector('main') as HTMLElement
      const scrollY = scrollContainer
        ? scrollContainer.scrollTop
        : window.scrollY
      const pathname = window.location.pathname

      // Save to both sessionStorage (for immediate back navigation) and localStorage (for persistence)
      sessionStorage.setItem(`scrollPosition_${pathname}`, scrollY.toString())
      localStorage.setItem(`scrollPosition_${pathname}`, scrollY.toString())
    }

    // Throttle scroll events for better performance
    let ticking = false
    const throttledScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    // Listen to scroll on main element
    const scrollContainer = document.querySelector('main') as HTMLElement
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', throttledScroll, {
        passive: true,
      })
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', throttledScroll)
      }
    }
  }, [])

  return (
    <>
      <HeroCarousel />
      <HomeFeed />
    </>
  )
}
