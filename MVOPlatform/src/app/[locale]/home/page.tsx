'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'

import { HomeFeed } from '@/features/home/components/HomeFeed'

import { useTranslations } from '@/shared/components/providers/I18nProvider'

import { HeroCarousel } from '@/features/home/components/HeroCarousel'

import { LandingHeroCarousel } from '@/features/home/components/LandingHeroCarousel'

export default function Home() {
  const t = useTranslations()

  const slides = [
    {
      headline: t('home.landing.slide0.headline'),
      accentWord: t('home.landing.slide0.accent_word'),
      subheadline: t('home.landing.slide0.subheadline'),
      cta: t('home.landing.slide0.cta'),
      background: 'url(/hero/hero0.png)',
    },
    {
      headline: t('home.landing.slide1.headline'),
      accentWord: t('home.landing.slide1.accent_word'),
      subheadline: t('home.landing.slide1.subheadline'),
      accentColor: 'var(--error)', 
      cta: t('home.landing.slide1.cta'),
      background: 'url(/hero/hero1.png)',
    },
    {
      headline: t('home.landing.slide2.headline'),
      accentWord: t('home.landing.slide2.accent_word'),
      subheadline: t('home.landing.slide2.subheadline'),
      cta: t('home.landing.slide2.cta'),
      background: 'url(/hero/hero2.png)',
    },
    {
      headline: t('home.landing.slide3.headline'),
      accentWord: t('home.landing.slide3.accent_word'),
      subheadline: t('home.landing.slide3.subheadline'),
      accentColor: 'var(--error)', 
      cta: t('home.landing.slide3.cta'),
      background: 'url(/hero/hero3.png)',
    },
    {
      headline: t('home.landing.slide4.headline'),
      accentWord: t('home.landing.slide4.accent_word'),
      subheadline: t('home.landing.slide4.subheadline'),
      cta: t('home.landing.slide4.cta'),
      background: 'url(/hero/hero4.png)',
    },
  ]
  // Scroll on mount: first time = top; coming back = restore last position
  useEffect(() => {
    const pathname =
      typeof window !== 'undefined' ? window.location.pathname : ''

    const scrollToTop = () => {
      const scrollContainer = document.querySelector('main') as HTMLElement
      if (scrollContainer) {
        scrollContainer.scrollTo({ top: 0, behavior: 'instant' })
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' })
      }
    }

    const restoreScroll = (): boolean => {
      if (typeof window === 'undefined') return false

      const shouldRestore = sessionStorage.getItem('shouldRestoreScroll')
      const restorePath = sessionStorage.getItem('restoreScrollPath')
      const restorePosition = sessionStorage.getItem('restoreScrollPosition')

      let scrollY: number | null = null

      if (
        shouldRestore === 'true' &&
        restorePath === pathname &&
        restorePosition
      ) {
        scrollY = parseInt(restorePosition, 10)
        sessionStorage.removeItem('shouldRestoreScroll')
        sessionStorage.removeItem('restoreScrollPath')
        sessionStorage.removeItem('restoreScrollPosition')
      } else {
        const savedScroll = localStorage.getItem(
          `scrollPosition_${pathname}`
        )
        if (savedScroll) {
          scrollY = parseInt(savedScroll, 10)
        }
      }

      if (scrollY !== null && !isNaN(scrollY) && scrollY > 0) {
        const scrollContainer = document.querySelector('main') as HTMLElement
        if (scrollContainer) {
          requestAnimationFrame(() => {
            scrollContainer.scrollTo({ top: scrollY!, behavior: 'instant' })
          })
        } else {
          requestAnimationFrame(() => {
            window.scrollTo({ top: scrollY!, behavior: 'instant' })
          })
        }
        return true
      }
      return false
    }

    let restored = restoreScroll()
    const timeouts: NodeJS.Timeout[] = []

    if (!restored) {
      // First time on home (no saved position): start at top
      requestAnimationFrame(() => scrollToTop())
      timeouts.push(
        setTimeout(() => {
          if (!restoreScroll()) requestAnimationFrame(() => scrollToTop())
        }, 100),
        setTimeout(() => restoreScroll(), 300),
        setTimeout(() => restoreScroll(), 600)
      )
    } else {
      // Retry restore after layout in case main isn't ready yet
      timeouts.push(
        setTimeout(() => restoreScroll(), 100),
        setTimeout(() => restoreScroll(), 300)
      )
    }

    return () => {
      timeouts.forEach(t => clearTimeout(t))
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
      <LandingHeroCarousel slides={slides} />

      <HeroCarousel />

      <HomeFeed />
    </>
  )
}
