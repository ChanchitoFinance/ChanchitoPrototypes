'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'

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
      <section className="relative py-24 min-h-screen flex items-center overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-cover bg-center opacity-20 brightness-50"
          style={{ backgroundImage: 'url(/ai-personas/v2/landing.png)' }}
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-accent/10 to-background" />
        <div className="relative z-10 max-w-4xl px-6">
          <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-6">
            {t('home.landing.headline')}<span className="text-primary-accent">{t('home.landing.accent_word')}</span>.
          </h1>
          <p className="text-xl md:text-2xl text-text-secondary mb-8">
            {t('home.landing.subheadline')}
          </p>
          <button
            onClick={() => {
              const element = document.getElementById('ideas-carousel')
              const main = document.querySelector('main')
              if (element && main) {
                main.scrollTo({ top: element.offsetTop, behavior: 'smooth' })
              }
            }}
            className="bg-premium-cta text-white px-8 py-4 rounded-lg font-semibold hover:bg-premium-cta/90 transition-colors"
          >
            {t('home.landing.cta')}
          </button>
        </div>
      </section>

      <HeroCarousel />

      <HomeFeed />
    </>
  )
}
