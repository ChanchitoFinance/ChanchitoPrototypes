'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export type HeroSlide = {
  headline: string
  accentWord?: string
  /** Optional: CSS color for accent word (e.g. "var(--primary-accent)", "#a07bcf") */
  accentColor?: string
  subheadline: string
  cta: string
  /** Optional: "url(/path.png)" for image left, or full-bleed background when fullBackground is true */
  background?: string
  /** When true: image is full-bleed background (darkened), text overlay aligned left. Use for landing slide. */
  fullBackground?: boolean
}

const AUTO_ADVANCE_MS = 6000
const SLIDE_FADE_MS = 400
const IMAGE_FADE_MS = 200
const SWIPE_THRESHOLD_PX = 50

function parseBackgroundUrl(background: string | undefined): string | null {
  if (!background?.startsWith('url(')) return null
  const match = background.match(/url\(['"]?([^'")]+)['"]?\)/)
  return match ? match[1] : null
}

export function LandingHeroCarousel({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0)
  const [displayedImageIndex, setDisplayedImageIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [imageOpacity, setImageOpacity] = useState(1)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const phase1Ref = useRef<ReturnType<typeof setTimeout> | null>(null)
  const phase2Ref = useRef<ReturnType<typeof setTimeout> | null>(null)
  const touchStartXRef = useRef<number | null>(null)

  const total = slides.length
  const current = total ? index % total : 0
  const slide = slides[current]
  const imageSlide = slides[displayedImageIndex]
  const imageUrl = parseBackgroundUrl(imageSlide?.background)
  const fullBgUrl = slide?.fullBackground
    ? parseBackgroundUrl(imageSlide?.background)
    : null
  const isFullBackground = Boolean(slide?.fullBackground)
  const accentColor = slide?.accentColor ?? 'var(--primary-accent)'

  const clearTransitionTimeouts = () => {
    if (phase1Ref.current) {
      clearTimeout(phase1Ref.current)
      phase1Ref.current = null
    }
    if (phase2Ref.current) {
      clearTimeout(phase2Ref.current)
      phase2Ref.current = null
    }
  }

  const transitionToIndex = (nextIndex: number) => {
    clearTransitionTimeouts()
    setIsTransitioning(true)
    setImageOpacity(0)
    phase1Ref.current = setTimeout(() => {
      phase1Ref.current = null
      setIndex(nextIndex)
      setDisplayedImageIndex(nextIndex)
      setImageOpacity(1)
      setIsTransitioning(false)
    }, SLIDE_FADE_MS)
  }

  const go = (next: number) => {
    if (total <= 1) return
    const nextIndex = (current + next + total) % total
    transitionToIndex(nextIndex)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartXRef.current
    touchStartXRef.current = null
    if (start == null || total <= 1) return
    const end = e.changedTouches[0].clientX
    const deltaX = end - start
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return
    if (deltaX > 0) go(-1)
    else go(1)
  }

  useEffect(() => {
    if (total <= 1) return
    timerRef.current = setInterval(() => go(1), AUTO_ADVANCE_MS)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [total, index])

  useEffect(() => {
    return () => clearTransitionTimeouts()
  }, [])

  if (!slide) return null

  const textFadeClass = `transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`

  return (
    <section
      className="relative py-4 sm:py-8 lg:py-24 min-h-screen flex items-center overflow-hidden"
      style={{
        backgroundColor: isFullBackground ? 'transparent' : 'var(--background)',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Full-background: darkened image behind everything */}
      {fullBgUrl && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-300 ease-out"
            style={{
              backgroundImage: `url(${fullBgUrl})`,
              opacity: imageOpacity,
            }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-black/55" aria-hidden />
        </>
      )}

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute left-4 top-1/3 -translate-y-1/2 z-20 p-2 rounded-full border border-[var(--border-color)] bg-[var(--background)]/80 hover:bg-[var(--gray-100)] text-[var(--text-primary)] transition-colors sm:top-1/2"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute right-4 top-1/3 -translate-y-1/2 z-20 p-2 rounded-full border border-[var(--border-color)] bg-[var(--background)]/80 hover:bg-[var(--gray-100)] text-[var(--text-primary)] transition-colors sm:top-1/2"
            aria-label="Next slide"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      <div
        className={`relative z-10 w-full max-w-[95vw] lg:max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-12 sm:gap-14 md:gap-10 ${
          isFullBackground
            ? 'pl-6 pr-4 md:pl-12 lg:pl-16 justify-start'
            : 'pl-6 pr-4 md:pl-8 md:pr-6'
        }`}
      >
        {!isFullBackground && imageUrl && (
          <div className="flex-shrink-0 w-full md:w-[68%] lg:w-[72%] flex items-center justify-center md:justify-start min-h-[30vh] sm:min-h-[350px] md:min-h-[560px] lg:min-h-[640px] order-first md:-ml-10 lg:-ml-24 xl:-ml-32">
            <div
              className="w-full max-w-[95vw] sm:max-w-3xl md:max-w-5xl lg:max-w-6xl xl:max-w-7xl aspect-[4/3] md:aspect-[3/2] rounded-lg overflow-hidden bg-no-repeat bg-center transition-opacity duration-200 ease-out"
              style={{
                backgroundImage: `url(${imageUrl})`,
                backgroundSize:
                  typeof window !== 'undefined' && window.innerWidth < 768
                    ? '100%'
                    : '70%',
                opacity: imageOpacity,
              }}
              role="img"
              aria-hidden
            />
          </div>
        )}

        <div
          className={`flex-1 min-w-0 min-w-[260px] md:min-w-[340px] max-w-xl ${textFadeClass} ${
            isFullBackground
              ? 'text-left md:-ml-0 md:mt-0 lg:mt-0 md:pl-0'
              : 'md:-ml-32 lg:-ml-32 xl:-ml-32 md:mt-24 lg:mt-32 xl:mt-40'
          }`}
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] mb-6 sm:mb-8 break-words [text-wrap:balance]">
            {slide.headline}
            {slide.accentWord && (
              <span
                style={{ color: slide.accentColor ?? 'var(--primary-accent)' }}
              >
                {slide.accentWord}
              </span>
            )}
            .
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-[var(--text-secondary)] mb-8 sm:mb-10 break-words">
            {slide.subheadline}
          </p>
        </div>
      </div>

      {/* Dots: elevated, same style as HeroCarousel */}
      {total > 1 && (
        <div className="absolute bottom-20 sm:bottom-36 md:bottom-28 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {' '}
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => transitionToIndex(i)}
              className={`transition-all ${
                i === current
                  ? 'w-8 h-2 bg-accent rounded-full shadow-lg'
                  : 'w-2 h-2 bg-[var(--text-primary)]/30 rounded-full hover:bg-[#66D3FF]/50 border border-gray-400'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
