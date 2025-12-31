'use client'

import { useState, useEffect } from 'react'
import { getCardMedia, isUrlValid } from '@/core/lib/utils/media'
import { Idea } from '@/core/types/idea'

export function useMediaValidation(idea: Idea) {
  const [validCardMedia, setValidCardMedia] = useState(getCardMedia(idea))

  // Check and filter invalid media URLs
  useEffect(() => {
    const checkMediaValidity = async () => {
      const media = getCardMedia(idea)
      const validMedia: { video?: string; image?: string } = {}

      if (media.video) {
        const isValid = await isUrlValid(media.video)
        if (isValid) validMedia.video = media.video
      }

      if (media.image) {
        const isValid = await isUrlValid(media.image)
        if (isValid) validMedia.image = media.image
      }

      setValidCardMedia(validMedia)
    }

    checkMediaValidity()
  }, [idea])

  return validCardMedia
}
