/**
 * Reusable hook for video playback with start offset
 * Handles video playback starting from a specific time (default: 10 seconds)
 * Supports both active state and IntersectionObserver modes
 */

import { useEffect, useRef, RefObject } from 'react'

export interface UseVideoPlayerOptions {
  /**
   * Video source URL
   */
  videoSrc?: string

  /**
   * Whether the video should be playing (for active state mode)
   */
  isActive?: boolean

  /**
   * Container element to observe (for IntersectionObserver mode)
   * If provided, will use IntersectionObserver instead of isActive
   */
  containerRef?: RefObject<HTMLElement>

  /**
   * Start time in seconds (default: 10)
   */
  startTime?: number

  /**
   * Threshold for IntersectionObserver (default: 0.5)
   */
  threshold?: number

  /**
   * Callback when video starts playing
   */
  onPlay?: () => void

  /**
   * Callback when video pauses
   */
  onPause?: () => void
}

/**
 * Hook for managing video playback with start offset
 * 
 * @example
 * // Active state mode
 * const videoRef = useVideoPlayer({
 *   videoSrc: idea.video,
 *   isActive: isActive,
 *   startTime: 10
 * })
 * 
 * @example
 * // IntersectionObserver mode
 * const videoRef = useVideoPlayer({
 *   videoSrc: idea.video,
 *   containerRef: cardRef,
 *   startTime: 10
 * })
 */
export function useVideoPlayer({
  videoSrc,
  isActive,
  containerRef,
  startTime = 10,
  threshold = 0.5,
  onPlay,
  onPause,
}: UseVideoPlayerOptions): RefObject<HTMLVideoElement> {
  const videoRef = useRef<HTMLVideoElement>(null)

  // Set start time when video loads
  useEffect(() => {
    if (!videoSrc || !videoRef.current) return

    const video = videoRef.current

    const handleLoadedMetadata = () => {
      if (video.duration >= startTime) {
        video.currentTime = startTime
      }
    }

    const handleCanPlay = () => {
      if (video.duration >= startTime && video.currentTime < startTime) {
        video.currentTime = startTime
      }
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('canplay', handleCanPlay)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('canplay', handleCanPlay)
    }
  }, [videoSrc, startTime])

  // Active state mode (for ExploreIdea, HeroCarousel)
  useEffect(() => {
    if (!videoSrc || !videoRef.current || containerRef) return
    if (isActive === undefined) return

    const video = videoRef.current

    if (isActive) {
      requestAnimationFrame(() => {
        // Always reset to start time when becoming active
        if (video.duration >= startTime) {
          video.currentTime = startTime
        }
        video.play().catch(() => {
          // Auto-play failed, user interaction required
        })
        onPlay?.()
      })
    } else {
      requestAnimationFrame(() => {
        video.pause()
        // Reset to start time when pausing for next time
        if (video.duration >= startTime) {
          video.currentTime = startTime
        }
        onPause?.()
      })
    }
  }, [isActive, videoSrc, startTime, containerRef, onPlay, onPause])

  // IntersectionObserver mode (for IdeaCard)
  useEffect(() => {
    if (!videoSrc || !videoRef.current || !containerRef) return

    const video = videoRef.current
    const container = containerRef.current

    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            requestAnimationFrame(() => {
              // Always reset to start time when entering viewport
              if (video.duration >= startTime) {
                video.currentTime = startTime
              }
              video.play().catch(() => {
                // Auto-play failed, user interaction required
              })
              onPlay?.()
            })
          } else {
            requestAnimationFrame(() => {
              video.pause()
              // Reset to start time when leaving viewport
              if (video.duration >= startTime) {
                video.currentTime = startTime
              }
              onPause?.()
            })
          }
        })
      },
      { threshold }
    )

    observer.observe(container)

    return () => {
      observer.disconnect()
      video.pause()
    }
  }, [videoSrc, containerRef, startTime, threshold, onPlay, onPause])

  return videoRef
}

