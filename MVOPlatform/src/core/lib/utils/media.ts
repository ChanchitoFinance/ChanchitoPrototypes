import { ContentBlock } from '@/core/types/content'

export interface IdeaMedia {
  video?: string
  image?: string
}

/**
 * Checks if a URL is accessible media content
 * Uses different strategies based on context and CORS limitations
 */
export async function isUrlValid(
  url: string,
  strict: boolean = false
): Promise<boolean> {
  if (!url || typeof url !== 'string') return false

  // Basic URL validation
  let urlObj: URL
  try {
    urlObj = new URL(url)
  } catch {
    return false
  }

  // Check if URL looks like media
  const isImageUrl = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i.test(url)
  const isVideoUrl = /\.(mp4|webm|ogg|avi|mov|wmv|flv|m4v)(\?.*)?$/i.test(url)

  const currentOrigin =
    typeof window !== 'undefined' ? window.location.origin : ''

  // For same-origin URLs, always validate properly
  if (urlObj.origin === currentOrigin) {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      if (!response.ok) return false

      const contentType = response.headers.get('content-type') || ''
      return (
        contentType.startsWith('image/') || contentType.startsWith('video/')
      )
    } catch {
      return false
    }
  }

  // For external URLs
  if (isImageUrl || isVideoUrl) {
    if (strict) {
      // Strict validation for forms - try to actually load the media
      return new Promise(resolve => {
        if (isImageUrl) {
          const img = new Image()
          img.onload = () => resolve(true)
          img.onerror = () => resolve(false)
          img.src = url
        } else {
          // For videos, use different event handling
          const video = document.createElement('video')
          video.preload = 'metadata'
          video.onloadedmetadata = () => resolve(true)
          video.onerror = () => resolve(false)
          video.onabort = () => resolve(false)
          video.src = url
        }

        // Timeout after 5 seconds
        setTimeout(() => resolve(false), 5000)
      })
    } else {
      // Permissive validation for display - be more lenient for videos
      if (isVideoUrl) {
        // For videos in display context, just check if URL is well-formed and looks like video
        // Don't try to load metadata as it can be slow and cause intermittent failures
        return Promise.resolve(true)
      }

      // For images, still try to load but with shorter timeout
      return new Promise(resolve => {
        const img = new Image()
        img.onload = () => resolve(true)
        img.onerror = () => resolve(false)
        img.src = url

        // Shorter timeout for display components (2 seconds)
        setTimeout(() => resolve(false), 2000)
      })
    }
  }

  // For non-media URLs, try to validate content-type
  try {
    const response = await fetch(url, { method: 'HEAD' })
    if (!response.ok) return false

    const contentType = response.headers.get('content-type') || ''
    return contentType.startsWith('image/') || contentType.startsWith('video/')
  } catch {
    return false
  }
}
/**
 * Extracts the first video and/or image from idea content blocks
 * Prioritizes videos over images
 */
export function getIdeaMedia(content?: ContentBlock[]): IdeaMedia {
  if (!content || content.length === 0) {
    return {}
  }

  let firstVideo: string | undefined
  let firstImage: string | undefined

  for (const block of content) {
    if (block.type === 'video' && block.src && !firstVideo) {
      firstVideo = block.src
    } else if (block.type === 'image' && block.src && !firstImage) {
      firstImage = block.src
    }

    // If we have both, we can stop
    if (firstVideo && firstImage) break
  }

  return {
    video: firstVideo,
    image: firstImage,
  }
}

/**
 * Gets the best media for an idea card display
 * Priority: hero video > hero image > video from content > image from content
 */
export function getCardMedia(idea: {
  video?: string
  image?: string
  content?: ContentBlock[]
}): IdeaMedia {
  // Prioritize hero media, only get content media if needed
  if (idea.video) {
    return { video: idea.video }
  }
  if (idea.image) {
    return { image: idea.image }
  }
  return getIdeaMedia(idea.content)
}
