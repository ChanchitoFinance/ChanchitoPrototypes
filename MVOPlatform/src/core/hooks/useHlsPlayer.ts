/**
 * HLS Video Player Hook with Adaptive Bitrate Streaming
 * Provides smooth video playback with quality switching based on network conditions
 */

import { useEffect, useRef, RefObject, useState, useCallback } from 'react'
import Hls from 'hls.js'

export interface UseHlsPlayerOptions {
  /**
   * Video source URL
   */
  videoSrc?: string

  /**
   * Container element to observe (for IntersectionObserver mode)
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

  /**
   * Callback when video quality changes
   */
  onQualityChange?: (level: number) => void

  /**
   * Enable adaptive bitrate (default: true)
   */
  adaptiveBitrate?: boolean

  /**
   * Initial quality level (-1 = auto)
   */
  initialQuality?: number
}

/**
 * Hook for managing HLS video playback with adaptive streaming
 * Falls back to native HLS on Safari
 */
export function useHlsPlayer({
  videoSrc,
  containerRef,
  startTime = 10,
  threshold = 0.5,
  onPlay,
  onPause,
  onQualityChange,
  adaptiveBitrate = true,
  initialQuality = -1,
}: UseHlsPlayerOptions): RefObject<HTMLVideoElement> {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsInstanceRef = useRef<Hls | null>(null)

  // Initialize HLS.js
  useEffect(() => {
    if (!videoSrc || !videoRef.current) return

    const video = videoRef.current

    // Check if native HLS (Safari)
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = videoSrc
      return
    }

    // Check if HLS.js is supported
    if (!Hls.isSupported()) {
      // Fallback to regular video
      video.src = videoSrc
      return
    }

    const hls = new Hls({
      startLevel: initialQuality,
      capLevelToPlayerSize: !adaptiveBitrate,
      maxBufferLength: 30,
      maxMaxBufferLength: 60,
      maxBufferSize: 60 * 1000 * 1000, // 60MB
      maxBufferHole: 0.5,
    })

    hlsInstanceRef.current = hls

    hls.loadSource(videoSrc)
    hls.attachMedia(video)

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      if (video.duration >= startTime) {
        video.currentTime = startTime
      }
    })

    hls.on(Hls.Events.LEVEL_SWITCHED, (_event, data) => {
      onQualityChange?.(data.level)
    })

    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            hls.startLoad()
            break
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls.recoverMediaError()
            break
          default:
            hls.destroy()
            break
        }
      }
    })

    return () => {
      hls.destroy()
      hlsInstanceRef.current = null
    }
  }, [videoSrc, initialQuality, adaptiveBitrate, startTime, onQualityChange])

  // Set start time
  useEffect(() => {
    if (!videoSrc || !videoRef.current) return

    const video = videoRef.current

    const handleLoadedMetadata = () => {
      if (video.duration >= startTime) {
        video.currentTime = startTime
      }
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [videoSrc, startTime])

  // IntersectionObserver mode for auto-play/pause
  useEffect(() => {
    if (!videoSrc || !videoRef.current || !containerRef) return

    const video = videoRef.current
    const container = containerRef.current

    if (!container) return

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            requestAnimationFrame(() => {
              if (video.duration >= startTime) {
                video.currentTime = startTime
              }
              video.play().catch(() => {})
              onPlay?.()
            })
          } else {
            requestAnimationFrame(() => {
              video.pause()
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

/**
 * Hook for getting available quality levels
 */
export function useQualityLevels(hls: Hls | null) {
  const [levels, setLevels] = useState<{ height: number; bitrate: number }[]>(
    []
  )

  const refreshLevels = useCallback(() => {
    if (Hls.isSupported() && hls) {
      setLevels(
        hls.levels.map(level => ({
          height: level.height,
          bitrate: level.bitrate,
        }))
      )
    }
  }, [hls])

  return { levels, refreshLevels }
}

/**
 * Hook for manual quality selection
 */
export function useQualitySelector(hls: Hls | null) {
  const [currentLevel, setCurrentLevel] = useState(-1)
  const [autoQuality, setAutoQuality] = useState(true)

  const setQuality = useCallback(
    (level: number) => {
      if (Hls.isSupported() && hls) {
        hls.currentLevel = level
        setCurrentLevel(level)
        setAutoQuality(level === -1)
      }
    },
    [hls]
  )

  const toggleAuto = useCallback(() => {
    if (Hls.isSupported() && hls) {
      if (autoQuality) {
        // Switch to highest quality
        const highestLevel = hls.levels.length - 1
        hls.currentLevel = highestLevel
        setCurrentLevel(highestLevel)
      } else {
        // Switch to auto
        hls.currentLevel = -1
        setCurrentLevel(-1)
      }
      setAutoQuality(!autoQuality)
    }
  }, [autoQuality, hls])

  return { currentLevel, autoQuality, setQuality, toggleAuto }
}
