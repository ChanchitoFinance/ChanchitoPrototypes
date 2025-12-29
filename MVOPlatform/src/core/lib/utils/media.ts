import { ContentBlock } from '@/core/types/content'

export interface IdeaMedia {
  video?: string
  image?: string
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
 * Priority: video from content > image from content > hero video > hero image
 */
export function getCardMedia(idea: {
  video?: string
  image?: string
  content?: ContentBlock[]
}): IdeaMedia {
  const contentMedia = getIdeaMedia(idea.content)

  // Prioritize content media, fallback to hero media
  return {
    video: contentMedia.video || idea.video,
    image: contentMedia.image || idea.image,
  }
}
