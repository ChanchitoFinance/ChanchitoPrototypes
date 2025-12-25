'use client'

import { useState, useRef, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import { RichContentEditor } from './RichContentEditor'
import { ContentBlock } from '@/lib/types/content'
import { useAppSelector } from '@/lib/hooks'
import { ContentRenderer } from '@/components/ideas/ContentRenderer'
import { ideaService } from '@/lib/services/ideaService'
import { teamService, SpaceWithTeam } from '@/lib/services/teamService'
import { Idea } from '@/lib/types/idea'
import { supabase } from '@/lib/supabase'
import { useTranslations, useLocale } from '@/components/providers/I18nProvider'
import {
  X,
  ChevronDown,
  ChevronUp,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  Video,
  Crop,
  ZoomIn,
  ZoomOut,
  Eye,
  Edit,
  Loader2,
  UserX,
  Check,
  Globe,
  Lock,
  Search,
} from 'lucide-react'
import Image from 'next/image'

type IdeaFormData = {
  title: string
  space_id: string
  tags?: string
}

// LocalStorage key for form persistence
const FORM_STORAGE_KEY = 'idea_form_draft'

interface IdeaFormProps {
  defaultSpaceId?: string
  ideaId?: string // For editing existing ideas
  onSuccess?: () => void
  onCancel?: () => void
}

export function IdeaForm({ defaultSpaceId, ideaId, onSuccess, onCancel }: IdeaFormProps = {}) {
  const router = useRouter()
  const t = useTranslations()
  const { locale } = useLocale()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitProgress, setSubmitProgress] = useState('')
  const [spaces, setSpaces] = useState<SpaceWithTeam[]>([])
  const [spaceSearchQuery, setSpaceSearchQuery] = useState('')
  const [isSpaceDropdownOpen, setIsSpaceDropdownOpen] = useState(false)
  const spaceDropdownRef = useRef<HTMLDivElement>(null)
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isTagsExpanded, setIsTagsExpanded] = useState(true)
  const [heroImage, setHeroImage] = useState<string | null>(null)
  const [heroVideo, setHeroVideo] = useState<string | null>(null)
  const [heroCrop, setHeroCrop] = useState<{
    x: number
    y: number
    width: number
    height: number
    scale?: number
  } | null>(null)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [showVideoUpload, setShowVideoUpload] = useState(false)
  const [showHeroCrop, setShowHeroCrop] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isUploadingHeroImage, setIsUploadingHeroImage] = useState(false)
  const [isUploadingHeroVideo, setIsUploadingHeroVideo] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const { profile, user } = useAppSelector(state => state.auth)

  const ideaSchema = z.object({
    title: z.string().min(10, t('validation.title_min_length')),
    space_id: z.string().min(1, t('validation.space_required')),
    tags: z.string().optional(),
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<IdeaFormData>({
    resolver: zodResolver(ideaSchema),
  })

  const selectedSpaceId = watch('space_id')
  const titleValue = watch('title')

  // Load idea data when editing
  useEffect(() => {
    if (!ideaId) return

    const loadIdea = async () => {
      try {
        // Fetch idea with space_id from database
        const { data: dbData, error: dbError } = await supabase
          .from('ideas')
          .select('id, title, content, anonymous, space_id, status_flag')
          .eq('id', ideaId)
          .single()

        if (dbError || !dbData) {
          console.error('Error loading idea from database:', dbError)
          return
        }

        const idea = await ideaService.getIdeaById(ideaId)
        if (!idea) return

        // Set title
        setValue('title', idea.title)

        // Set space_id from database
        if (dbData.space_id) {
          setValue('space_id', dbData.space_id)
        } else if (defaultSpaceId) {
          setValue('space_id', defaultSpaceId)
        }

        // Set tags
        if (idea.tags && idea.tags.length > 0) {
          setSelectedTags(idea.tags)
          setValue('tags', idea.tags.join(','))
        }

        // Set anonymous flag
        setIsAnonymous(idea.anonymous || false)

        // Set content blocks
        if (idea.content && idea.content.length > 0) {
          // Extract hero media from first block if it's image/video
          const firstBlock = idea.content[0]
          if (firstBlock.type === 'image') {
            setHeroImage(firstBlock.src)
            if (firstBlock.crop) {
              setHeroCrop(firstBlock.crop)
            }
          } else if (firstBlock.type === 'video') {
            setHeroVideo(firstBlock.src)
            if (firstBlock.crop) {
              setHeroCrop(firstBlock.crop)
            }
          }

          // Set remaining content blocks (skip first if it's hero media)
          const remainingBlocks = firstBlock.type === 'image' || firstBlock.type === 'video'
            ? idea.content.slice(1)
            : idea.content
          setContentBlocks(remainingBlocks)
        } else {
          // Fallback to image/video from idea root
          if (idea.image) {
            setHeroImage(idea.image)
          }
          if (idea.video) {
            setHeroVideo(idea.video)
          }
        }
      } catch (error) {
        console.error('Error loading idea:', error)
      }
    }

    loadIdea()
  }, [ideaId, setValue, defaultSpaceId])

  // Load saved form data from localStorage on mount (only if not editing)
  useEffect(() => {
    if (typeof window === 'undefined' || ideaId) return

    try {
      const savedData = localStorage.getItem(FORM_STORAGE_KEY)
      let parsed: any = null
      
      if (savedData) {
        parsed = JSON.parse(savedData)

        // Restore form values
        if (parsed.title) {
          setValue('title', parsed.title)
        }
        if (parsed.tags && Array.isArray(parsed.tags)) {
          setSelectedTags(parsed.tags)
          setValue('tags', parsed.tags.join(','))
        }
        // Restore content blocks - ensure all types are preserved
        if (parsed.contentBlocks && Array.isArray(parsed.contentBlocks)) {
          // Validate and restore all block types including carousel, video, and html
          const restoredBlocks = parsed.contentBlocks
            .map((block: any) => {
              // Ensure the block has a valid type
              if (!block || !block.type) return null

              // Restore carousel blocks
              if (block.type === 'carousel') {
                return {
                  type: 'carousel',
                  slides: Array.isArray(block.slides)
                    ? block.slides
                    : [{ description: '' }],
                }
              }

              // Restore video blocks
              if (block.type === 'video') {
                return {
                  type: 'video',
                  src: block.src || '',
                  title: block.title,
                  description: block.description,
                  objectFit: block.objectFit || 'fit',
                  alignment: block.alignment || 'center',
                  crop: block.crop || undefined,
                }
              }

              // Restore html blocks
              if (block.type === 'html') {
                return {
                  type: 'html',
                  content: block.content || '',
                }
              }

              // Restore other block types as-is
              return block
            })
            .filter((block: any) => block !== null)

          setContentBlocks(restoredBlocks)
        }
        if (parsed.heroImage) {
          setHeroImage(parsed.heroImage)
        }
        if (parsed.heroVideo) {
          setHeroVideo(parsed.heroVideo)
        }
        if (parsed.heroCrop) {
          setHeroCrop(parsed.heroCrop)
        }
        if (parsed.isAnonymous !== undefined) {
          setIsAnonymous(parsed.isAnonymous)
        }
      }
      
      // Set default space if provided (prioritize defaultSpaceId over saved data)
      if (defaultSpaceId) {
        setValue('space_id', defaultSpaceId)
      } else if (parsed?.space_id) {
        // Only use saved space_id if no defaultSpaceId is provided
        setValue('space_id', parsed.space_id)
      }
    } catch (error) {
      console.error('Error loading saved form data:', error)
    }
  }, [setValue, defaultSpaceId, ideaId])

  // Fetch available spaces from Supabase
  useEffect(() => {
    const loadSpaces = async () => {
      try {
        const spacesData = await teamService.getVisibleSpaces(user?.id)
        setSpaces(spacesData)
      } catch (error) {
        console.error('Error loading spaces:', error)
      }
    }

    loadSpaces()
  }, [user?.id])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        spaceDropdownRef.current &&
        !spaceDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSpaceDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Deep clone contentBlocks to ensure all nested properties are preserved
    const serializedBlocks = contentBlocks.map(block => {
      // Ensure carousel slides are fully serialized
      if (block.type === 'carousel') {
        return {
          ...block,
          slides: block.slides.map(slide => ({
            image: slide.image || undefined,
            video: slide.video || undefined,
            title: slide.title || undefined,
            description: slide.description || '',
          })),
        }
      }
      // Ensure video blocks are fully serialized
      if (block.type === 'video') {
        return {
          ...block,
          src: block.src || '',
          title: block.title || undefined,
          description: block.description || undefined,
          objectFit: block.objectFit || 'fit',
          alignment: block.alignment || 'center',
          crop: block.crop || undefined,
        }
      }
      // Ensure html blocks are fully serialized
      if (block.type === 'html') {
        return {
          ...block,
          content: block.content || '',
        }
      }
      // Return other blocks as-is
      return block
    })

    // Try to save with video, but if it fails due to size, save without video
    const formDataWithVideo = {
      title: titleValue || '',
      space_id: selectedSpaceId || '',
      tags: selectedTags,
      contentBlocks: serializedBlocks,
      heroImage: heroImage,
      heroVideo: heroVideo,
      heroCrop: heroCrop,
      isAnonymous: isAnonymous,
    }

    // Fallback: save without video if video is too large
    const formDataWithoutVideo = {
      title: titleValue || '',
      space_id: selectedSpaceId || '',
      tags: selectedTags,
      contentBlocks: serializedBlocks,
      heroImage: heroImage,
      heroVideo: null, // Don't save video if it's too large
      heroCrop: heroCrop,
      isAnonymous: isAnonymous,
    }

    // Only save if there's actual content
    const hasContent =
      titleValue ||
      selectedSpaceId ||
      selectedTags.length > 0 ||
      contentBlocks.length > 0 ||
      heroImage ||
      heroVideo

    if (hasContent) {
      try {
        // Try to save with video first
        const serialized = JSON.stringify(formDataWithVideo)
        localStorage.setItem(FORM_STORAGE_KEY, serialized)
      } catch (error) {
        console.error('Error saving form data:', error)

        // If storage quota exceeded or video is too large, try saving without video
        if (
          error instanceof Error &&
          (error.name === 'QuotaExceededError' ||
            error.message.includes('exceeded'))
        ) {
          console.warn('localStorage quota exceeded, saving without hero video')
          try {
            // Save without video to preserve other content
            localStorage.setItem(
              FORM_STORAGE_KEY,
              JSON.stringify(formDataWithoutVideo)
            )
          } catch (retryError) {
            console.error('Error saving without video:', retryError)
            // Last resort: try clearing and saving minimal data
            try {
              localStorage.removeItem(FORM_STORAGE_KEY)
              localStorage.setItem(
                FORM_STORAGE_KEY,
                JSON.stringify(formDataWithoutVideo)
              )
            } catch (finalError) {
              console.error('Error in final save attempt:', finalError)
            }
          }
        }
      }
    }
  }, [
    titleValue,
    selectedSpaceId,
    selectedTags,
    contentBlocks,
    heroImage,
    heroVideo,
    heroCrop,
  ])

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !selectedTags.includes(tag)) {
      const newTags = [...selectedTags, tag]
      setSelectedTags(newTags)
      setValue('tags', newTags.join(','))
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    const newTags = selectedTags.filter(t => t !== tag)
    setSelectedTags(newTags)
    setValue('tags', newTags.join(','))
  }

  const uploadFile = async (
    file: File,
    folder: string = 'uploads'
  ): Promise<string> => {
    if (file.size > 50 * 1024 * 1024) {
      throw new Error('File size exceeds 50MB limit')
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', folder)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Upload failed')
    }

    const data = await response.json()
    return data.url
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        setIsUploadingHeroImage(true)
        const url = await uploadFile(file, 'images')
        setHeroImage(url)
        setHeroVideo(null)
        setShowImageUpload(false)
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Upload failed')
      } finally {
        setIsUploadingHeroImage(false)
      }
    }
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      try {
        setIsUploadingHeroVideo(true)
        const url = await uploadFile(file, 'videos')
        setHeroVideo(url)
        setHeroImage(null)
        setShowVideoUpload(false)
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Upload failed')
      } finally {
        setIsUploadingHeroVideo(false)
      }
    }
  }

  const onSubmit = async (data: IdeaFormData) => {
    // Filter out empty blocks (blocks with no content)
    const validBlocks = contentBlocks.filter(block => {
      if (block.type === 'heading') return block.text.trim().length > 0
      if (block.type === 'text') return block.content.trim().length > 0
      if (block.type === 'image') return block.src.trim().length > 0
      if (block.type === 'video') return block.src.trim().length > 0
      if (block.type === 'carousel')
        return (
          block.slides.length > 0 &&
          block.slides.some(s => s.description.trim().length > 0)
        )
      if (block.type === 'button') return block.text.trim().length > 0
      if (block.type === 'html') return block.content.trim().length > 0
      return true // spacer blocks are always valid
    })

    if (validBlocks.length === 0) {
      alert(t('validation.content_required'))
      return
    }

    setIsSubmitting(true)
    setSubmitProgress('Preparing idea data...')

    try {
      setSubmitProgress('Processing content...')

      // Generate description from first text block or use title
      let description = data.title
      const firstTextBlock = validBlocks.find(block => block.type === 'text')
      if (firstTextBlock && firstTextBlock.type === 'text') {
        // Use first 150 characters of the first text block
        description = firstTextBlock.content.trim().substring(0, 150)
        if (firstTextBlock.content.length > 150) {
          description += '...'
        }
      } else {
        // Fallback: use title as description
        description = data.title
      }

      // Get today's date in YYYY-MM-DD format
      const today = new Date()
      const createdAt = today.toISOString().split('T')[0]

      // Get author name from profile or use default
      const author = profile?.email || profile?.id || 'Anonymous'

      setSubmitProgress('Serializing content...')

      // Ensure all blocks are properly serialized, especially carousels
      const serializedContentBlocks = validBlocks.map(block => {
        // Ensure carousel slides are fully serialized
        if (block.type === 'carousel') {
          // Ensure slides array exists and is valid
          const slides = Array.isArray(block.slides) ? block.slides : []
          return {
            type: 'carousel' as const,
            slides: slides
              .map(slide => ({
                image: slide?.image || undefined,
                video: slide?.video || undefined,
                title: slide?.title || undefined,
                description: slide?.description || '',
              }))
              .filter(slide => slide.description || slide.image || slide.video), // Only include slides with content
          }
        }
        // Ensure video blocks are fully serialized
        if (block.type === 'video') {
          return {
            type: 'video' as const,
            src: block.src || '',
            title: block.title || undefined,
            description: block.description || undefined,
            objectFit: block.objectFit || 'fit',
            alignment: block.alignment || 'center',
            crop: block.crop || undefined,
          }
        }
        // Ensure html blocks are fully serialized
        if (block.type === 'html') {
          return {
            type: 'html' as const,
            content: block.content || '',
          }
        }
        // Return other blocks as-is
        return block
      })

      // Create the idea object
      const newIdea: Omit<Idea, 'id'> = {
        title: data.title,
        description: description,
        author: author,
        score: 0, // New ideas start with 0 score
        votes: 0, // New ideas start with 0 votes
        votesByType: {
          dislike: 0,
          use: 0,
          pay: 0,
        },
        commentCount: 0, // New ideas start with 0 comments
        tags: selectedTags,
        createdAt: createdAt, // Today's date
        image: heroImage || undefined,
        video: heroVideo || undefined,
        content: serializedContentBlocks, // Only include user-added content blocks, hero media is stored separately in image/video fields
        status_flag: 'new', // New ideas have 'new' status
        anonymous: isAnonymous, // Anonymous flag
      }

      setSubmitProgress('Uploading to Supabase...')

      let resultIdea: Idea

      if (ideaId) {
        // Update existing idea
        resultIdea = await ideaService.updateIdea(ideaId, {
          title: newIdea.title,
          description: newIdea.description,
          content: newIdea.content,
          image: newIdea.image,
          video: newIdea.video,
          tags: newIdea.tags,
          anonymous: newIdea.anonymous,
          status_flag: newIdea.status_flag,
        })
      } else {
        // Create new idea
        resultIdea = await ideaService.createIdea(newIdea, data.space_id)
      }

      setSubmitProgress('Finalizing...')

      // Clear saved form data from localStorage after successful submission
      if (typeof window !== 'undefined') {
        try {
          localStorage.removeItem(FORM_STORAGE_KEY)
        } catch (error) {
          console.error('Error clearing saved form data:', error)
        }
      }

      // Reset all form fields after successful creation (only if not editing)
      if (!ideaId) {
        setValue('title', '')
        setValue('space_id', defaultSpaceId || '')
        setValue('tags', '')
        setSelectedTags([])
        setContentBlocks([])
        setHeroImage(null)
        setHeroVideo(null)
        setHeroCrop(null)
        setIsAnonymous(false)
        setShowImageUpload(false)
        setShowVideoUpload(false)
        setShowHeroCrop(false)
      }

      // Call onSuccess callback if provided, otherwise redirect
      if (onSuccess) {
        onSuccess()
      } else {
        router.push(`/${locale}/ideas/${resultIdea.id}`)
      }
    } catch (error) {
      console.error('Error creating idea:', error)
      setSubmitProgress('')
      alert(t('validation.idea_creation_error'))
    } finally {
      setIsSubmitting(false)
      setSubmitProgress('')
    }
  }

  // Preview Mode - Show final result
  if (isPreviewMode) {
    const selectedSpace = spaces.find(s => s.id === selectedSpaceId)

    return (
      <div className="min-h-screen bg-background">
        {/* Preview Mode Header */}
        <div className="sticky top-0 z-50 bg-background border-b border-border-color px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary truncate flex-1 min-w-0 mr-4">
            {t('actions.preview')}
          </h2>
          <button
            type="button"
            onClick={() => setIsPreviewMode(false)}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-accent text-text-primary rounded-lg hover:bg-accent/90 transition-colors flex-shrink-0"
          >
            <Edit className="w-4 h-4" />
            <span className="hidden sm:inline">{t('actions.edit')}</span>
          </button>
        </div>

        {/* Hero Section */}
        <div className="relative w-full bg-black overflow-hidden">
          {heroVideo ? (
            <div className="relative w-full aspect-video overflow-hidden">
              <video
                src={heroVideo}
                className="w-full h-full object-cover"
                style={
                  heroCrop
                    ? {
                        objectPosition: `${heroCrop.x}% ${heroCrop.y}%`,
                        transform: `scale(${heroCrop.scale || 1})`,
                        transformOrigin: `${heroCrop.x}% ${heroCrop.y}%`,
                      }
                    : undefined
                }
                controls={false}
                muted
                playsInline
                autoPlay
                loop
              />
            </div>
          ) : heroImage ? (
            <div className="relative w-full aspect-video overflow-hidden">
              <Image
                src={heroImage}
                alt={titleValue || 'Idea hero image'}
                fill
                className="object-cover"
                priority
                style={
                  heroCrop
                    ? {
                        objectPosition: `${heroCrop.x}% ${heroCrop.y}%`,
                        transform: `scale(${heroCrop.scale || 1})`,
                        transformOrigin: `${heroCrop.x}% ${heroCrop.y}%`,
                      }
                    : undefined
                }
              />
            </div>
          ) : (
            <div className="relative w-full aspect-video bg-gradient-to-br from-accent/20 via-background to-accent/10" />
          )}

          {/* Overlay Content - Title and Tags */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 md:p-6 lg:p-12">
            <div className="max-w-4xl mx-auto">
              {/* Tags */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
                  {selectedTags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 text-xs font-medium text-white bg-white/20 backdrop-blur-sm rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              {/* Title */}
              {titleValue && (
                <h1
                  className="text-2xl md:text-3xl lg:text-5xl font-bold text-white mb-3 md:mb-4 drop-shadow-lg break-words"
                  style={{
                    overflowWrap: 'break-word',
                    wordBreak: 'break-word',
                    maxWidth: '100%',
                  }}
                >
                  {titleValue}
                </h1>
              )}
              {/* Space */}
              {selectedSpace && (
                <div className="text-white/80 text-sm md:text-base">
                  {selectedSpace.name}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Article Content */}
        <article className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
          {contentBlocks.length > 0 ? (
            <ContentRenderer content={contentBlocks} />
          ) : (
            <div className="text-center text-text-secondary py-12">
              <p>{t('form.no_content')}</p>
            </div>
          )}
        </article>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Edit Mode Header */}
      <div className="sticky top-0 z-50 bg-background border-b border-border-color px-4 py-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary truncate flex-1 min-w-0 mr-4">
          {ideaId ? t('form.edit_idea') : t('form.create_idea')}
        </h2>
        <button
          type="button"
          onClick={() => setIsPreviewMode(true)}
          className="flex items-center gap-2 px-3 md:px-4 py-2 bg-accent text-text-primary rounded-lg hover:bg-accent/90 transition-colors flex-shrink-0"
        >
          <Eye className="w-4 h-4" />
          <span className="hidden sm:inline">{t('actions.preview')}</span>
        </button>
      </div>

      {/* Hero Section - Main content at the top */}
      <div className="relative w-full bg-black overflow-hidden">
        {/* Media Section */}
        {heroVideo ? (
          <div className="relative w-full aspect-video overflow-hidden">
            <video
              src={heroVideo}
              className="w-full h-full object-cover pointer-events-none"
              style={
                heroCrop
                  ? {
                      objectPosition: `${heroCrop.x}% ${heroCrop.y}%`,
                      transform: `scale(${heroCrop.scale || 1})`,
                      transformOrigin: `${heroCrop.x}% ${heroCrop.y}%`,
                    }
                  : undefined
              }
              controls={false}
              muted
              playsInline
              autoPlay
              loop
            />
          </div>
        ) : heroImage ? (
          <div className="relative w-full aspect-video overflow-hidden">
            <Image
              src={heroImage}
              alt={titleValue || 'Idea hero image'}
              fill
              className="object-cover"
              priority
              style={
                heroCrop
                  ? {
                      objectPosition: `${heroCrop.x}% ${heroCrop.y}%`,
                      transform: `scale(${heroCrop.scale || 1})`,
                      transformOrigin: `${heroCrop.x}% ${heroCrop.y}%`,
                    }
                  : undefined
              }
            />
          </div>
        ) : (
          <div className="relative w-full aspect-video bg-gradient-to-br from-accent/20 via-background to-accent/10 flex items-center justify-center pb-32 md:pb-40">
            <div className="text-center px-6 max-w-2xl z-10">
              {showImageUpload ? (
                <div className="space-y-4">
                  <label className={`flex flex-col items-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-white transition-colors ${isUploadingHeroImage ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                    {isUploadingHeroImage ? (
                      <Loader2 className="w-8 h-8 animate-spin" />
                    ) : (
                    <Upload className="w-8 h-8" />
                    )}
                    <span>{isUploadingHeroImage ? t('status.loading') : `${t('form.upload_image')} (max 50MB)`}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isUploadingHeroImage}
                    />
                  </label>
                  <div className="flex gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        const url = prompt('Enter image URL:')
                        if (url && url.trim()) {
                          setHeroImage(url.trim())
                          setHeroVideo(null)
                          setShowImageUpload(false)
                        }
                      }}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-white transition-colors text-sm"
                    >
                      Paste URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowImageUpload(false)}
                      className="text-white/80 hover:text-white text-sm"
                    >
                      {t('actions.cancel')}
                    </button>
                  </div>
                </div>
              ) : showVideoUpload ? (
                <div className="space-y-4">
                  <label className={`flex flex-col items-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-white transition-colors ${isUploadingHeroVideo ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                    {isUploadingHeroVideo ? (
                      <Loader2 className="w-8 h-8 animate-spin" />
                    ) : (
                    <Upload className="w-8 h-8" />
                    )}
                    <span>{isUploadingHeroVideo ? t('status.loading') : `${t('form.upload_video')} (max 50MB)`}</span>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoUpload}
                      className="hidden"
                      disabled={isUploadingHeroVideo}
                    />
                  </label>
                  <div className="flex gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => {
                        const url = prompt('Enter video URL:')
                        if (url && url.trim()) {
                          setHeroVideo(url.trim())
                          setHeroImage(null)
                          setShowVideoUpload(false)
                        }
                      }}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-white transition-colors text-sm"
                    >
                      Paste URL
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowVideoUpload(false)}
                      className="text-white/80 hover:text-white text-sm"
                    >
                      {t('actions.cancel')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-4 justify-center">
                  <button
                    type="button"
                    onClick={() => setShowImageUpload(true)}
                    className="flex flex-col items-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-white transition-colors"
                  >
                    <ImageIcon className="w-8 h-8" />
                    <span>{t('form.add_image')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowVideoUpload(true)}
                    className="flex flex-col items-center gap-2 px-6 py-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-lg text-white transition-colors"
                  >
                    <Video className="w-8 h-8" />
                    <span>{t('form.add_video')}</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Controls for hero media */}
        {(heroImage || heroVideo) && (
          <div className="absolute top-4 right-4 flex gap-2 z-10">
            <button
              type="button"
              onClick={() => setShowHeroCrop(!showHeroCrop)}
              className="px-4 py-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-lg text-white transition-colors flex items-center gap-2"
            >
              <Crop className="w-4 h-4" />
              <span className="text-sm">{t('form.crop_adjust')}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setHeroImage(null)
                setHeroVideo(null)
                setHeroCrop(null)
              }}
              className="px-4 py-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm rounded-lg text-white transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              <span className="text-sm">{t('form.remove')}</span>
            </button>
          </div>
        )}

        {/* Crop Editor for Hero */}
        {showHeroCrop && (heroImage || heroVideo) && (
          <div className="absolute top-20 right-4 bg-background border border-border-color rounded-lg p-4 shadow-lg z-20 max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-text-primary">
                {t('form.crop_adjust_media')}
              </h4>
              <button
                type="button"
                onClick={() => setShowHeroCrop(false)}
                className="text-text-secondary hover:text-text-primary"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <HeroCropEditor
              src={heroImage || heroVideo}
              isVideo={!!heroVideo}
              crop={heroCrop}
              onSave={crop => {
                setHeroCrop(crop)
                setShowHeroCrop(false)
              }}
              onCancel={() => setShowHeroCrop(false)}
              t={t}
            />
          </div>
        )}

        {/* Overlay Content - Title and Tags */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 md:p-6 lg:p-12 z-20">
          <div className="max-w-4xl mx-auto">
            {/* Tags */}
            {selectedTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3 md:mb-4">
                {selectedTags.map(tag => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs font-medium text-white bg-white/20 backdrop-blur-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            {/* Title Input */}
            <input
              {...register('title')}
              type="text"
              className="w-full bg-transparent border-none outline-none text-2xl md:text-3xl lg:text-5xl font-bold text-white mb-3 md:mb-4 drop-shadow-lg placeholder:text-white/50"
              placeholder={t('form.enter_title')}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                }
              }}
            />
            {errors.title && (
              <p className="text-red-300 text-sm mt-1 md:mt-2">
                {errors.title.message}
              </p>
            )}
            {/* Tags Input Placeholder */}
            {selectedTags.length === 0 && (
              <div className="text-white/60 text-xs md:text-sm">
                {t('form.add_tags_hint')}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={handleVideoUpload}
        className="hidden"
      />

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          onSubmit={e => {
            e.preventDefault()
            handleSubmit(onSubmit)(e)
          }}
        >
          {/* Space Selection */}
          <div className="mb-8" ref={spaceDropdownRef}>
            <label
              htmlFor="space_id"
              className="text-sm font-medium text-text-secondary mb-2 block"
            >
              {t('form.space_label')} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              {/* Hidden input for form validation */}
              <input
                type="hidden"
              {...register('space_id')}
              id="space_id"
              />
              
              {/* Custom Dropdown Button */}
              <button
                type="button"
                onClick={() => setIsSpaceDropdownOpen(!isSpaceDropdownOpen)}
                className="w-full px-4 py-2 bg-background border border-border-color rounded-lg text-text-primary text-left flex items-center justify-between hover:border-accent/30 transition-colors"
            >
                <span className="truncate">
                  {selectedSpaceId
                    ? spaces.find(s => s.id === selectedSpaceId)?.name ||
                      t('form.select_space')
                    : t('form.select_space')}
                </span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    isSpaceDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isSpaceDropdownOpen && (
                <div className="absolute z-50 w-full mt-2 bg-background border border-border-color rounded-lg shadow-lg max-h-96 overflow-hidden flex flex-col">
                  {/* Search Bar */}
                  <div className="p-3 border-b border-border-color">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-secondary" />
                      <input
                        type="text"
                        placeholder={t('form.search_spaces') || 'Search spaces...'}
                        value={spaceSearchQuery}
                        onChange={e => setSpaceSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-background border border-border-color rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
                        onClick={e => e.stopPropagation()}
                      />
                    </div>
                  </div>

                  {/* Spaces List */}
                  <div className="overflow-y-auto max-h-64 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {spaces
                      .filter(space =>
                        space.name
                          .toLowerCase()
                          .includes(spaceSearchQuery.toLowerCase())
                      )
                      .map(space => {
                        const VisibilityIcon =
                          space.visibility === 'public' ? Globe : Lock
                        const isSelected = selectedSpaceId === space.id

                        return (
                          <button
                            key={space.id}
                            type="button"
                            onClick={() => {
                              setValue('space_id', space.id)
                              setIsSpaceDropdownOpen(false)
                              setSpaceSearchQuery('')
                            }}
                            className={`w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-accent/10 transition-colors ${
                              isSelected ? 'bg-accent/20' : ''
                            }`}
                          >
                            <VisibilityIcon
                              className={`w-4 h-4 flex-shrink-0 ${
                                space.visibility === 'public'
                                  ? 'text-green-500'
                                  : 'text-gray-500'
                              }`}
                            />
                            <span className="flex-1 truncate text-text-primary">
                  {space.name}
                            </span>
                            {isSelected && (
                              <Check className="w-4 h-4 text-accent flex-shrink-0" />
                            )}
                          </button>
                        )
                      })}
                    {spaces.filter(space =>
                      space.name
                        .toLowerCase()
                        .includes(spaceSearchQuery.toLowerCase())
                    ).length === 0 && (
                      <div className="px-4 py-8 text-center text-text-secondary">
                        {t('form.no_spaces_found') || 'No spaces found'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {errors.space_id && (
              <p className="mt-1 text-sm text-red-500">
                {errors.space_id.message}
              </p>
            )}
          </div>

          {/* Tags Section */}
          <div className="mb-8 pb-8 border-b border-border-color">
            <button
              type="button"
              onClick={() => setIsTagsExpanded(!isTagsExpanded)}
              className="flex items-center justify-between w-full mb-3"
            >
              <label className="text-sm font-medium text-text-secondary cursor-pointer">
                {t('form.tags')}
              </label>
              {isTagsExpanded ? (
                <ChevronUp className="w-4 h-4 text-text-secondary" />
              ) : (
                <ChevronDown className="w-4 h-4 text-text-secondary" />
              )}
            </button>
            {isTagsExpanded && (
              <div>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addTag()
                      }
                    }}
                    placeholder={t('form.type_tag_placeholder')}
                    className="flex-1 px-3 py-2 bg-background border border-border-color rounded-lg text-text-primary text-sm"
                  />
                  <Button
                    type="button"
                    onClick={addTag}
                    variant="outline"
                    size="sm"
                  >
                    {t('actions.add')}
                  </Button>
                </div>
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedTags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-accent/10 text-accent rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Rich Content Editor */}
          <div className="mb-8">
            <RichContentEditor
              value={contentBlocks}
              onChange={setContentBlocks}
            />
          </div>

          {/* Anonymous Option */}
          <div className="mb-6 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 transition-colors hover:border-accent/30 hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <motion.label
              className="flex items-start gap-4 cursor-pointer group"
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.995 }}
            >
              {/* Custom Styled Toggle Switch */}
              <div className="relative flex-shrink-0 mt-0.5">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={e => setIsAnonymous(e.target.checked)}
                  className="sr-only"
                />
                <motion.div
                  className={`relative w-12 h-6 rounded-full transition-colors duration-250 ease-in-out ${
                    isAnonymous ? 'bg-accent' : 'bg-gray-300'
                  }`}
                >
                  <motion.div
                    className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center"
                    animate={{
                      x: isAnonymous ? 24 : 0,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 30,
                    }}
                  >
                    {isAnonymous ? (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', stiffness: 500 }}
                      >
                        <UserX className="w-3 h-3 text-accent" />
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 500 }}
                      >
                        <Check className="w-3 h-3 text-gray-400" />
                      </motion.div>
                    )}
                  </motion.div>
                </motion.div>
              </div>

              {/* Label Content */}
              <div className="flex-1 pt-0.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <UserX
                    className={`w-4 h-4 transition-colors duration-250 ${
                      isAnonymous
                        ? 'text-accent'
                        : 'text-text-secondary group-hover:text-accent'
                    }`}
                  />
                  <div
                    className={`text-sm font-semibold transition-colors duration-250 ${
                      isAnonymous
                        ? 'text-accent'
                        : 'text-text-primary group-hover:text-accent'
                    }`}
                  >
                    {t('form.post_anonymously')}
                  </div>
                </div>
                <div className="text-xs text-text-secondary leading-relaxed pl-6">
                  {t('form.post_anonymously_description')}
                </div>
              </div>
            </motion.label>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{submitProgress || t('form.creating_idea')}</span>
                </div>
              ) : (
                t('actions.submit_idea')
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                // Clear draft from localStorage and reset form
                if (typeof window !== 'undefined') {
                  try {
                    localStorage.removeItem(FORM_STORAGE_KEY)
                  } catch (error) {
                    console.error('Error clearing draft:', error)
                  }
                }
                // Reset form values
                setValue('title', '')
                setValue('space_id', '')
                setValue('tags', '')
                // Reset state
                setContentBlocks([])
                setSelectedTags([])
                setHeroImage(null)
                setHeroVideo(null)
                setHeroCrop(null)
                setIsAnonymous(false)
              }}
              disabled={isSubmitting}
            >
              Clear Draft
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              {t('actions.cancel')}
            </Button>
          </div>
        </motion.form>
      </article>
    </div>
  )
}

function HeroCropEditor({
  src,
  isVideo,
  crop,
  onSave,
  onCancel,
  t,
}: {
  src: string | null
  isVideo?: boolean
  crop: {
    x: number
    y: number
    width: number
    height: number
    scale?: number
  } | null
  onSave: (crop: {
    x: number
    y: number
    width: number
    height: number
    scale?: number
  }) => void
  onCancel: () => void
  t: (key: string) => string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [cropState, setCropState] = useState({
    x: crop?.x || 50,
    y: crop?.y || 50,
    scale: crop?.scale || 1,
  })

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setCropState({
      ...cropState,
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleZoomIn = () => {
    setCropState({
      ...cropState,
      scale: Math.min(3, cropState.scale + 0.1),
    })
  }

  const handleZoomOut = () => {
    setCropState({
      ...cropState,
      scale: Math.max(0.5, cropState.scale - 0.1),
    })
  }

  if (!src) return null

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className="relative w-full h-48 bg-black rounded-lg overflow-hidden cursor-move"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {isVideo ? (
          <video
            ref={videoRef}
            src={src}
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{
              objectPosition: `${cropState.x}% ${cropState.y}%`,
              transform: `scale(${cropState.scale})`,
              transformOrigin: `${cropState.x}% ${cropState.y}%`,
            }}
            draggable={false}
            muted
            playsInline
            autoPlay
            loop
            controls={false}
            onLoadedMetadata={e => {
              const video = e.currentTarget
              video.currentTime = 0.1 // Set to a small time to show first frame
            }}
          />
        ) : (
          <img
            ref={imageRef}
            src={src}
            alt="Crop preview"
            className="absolute inset-0 w-full h-full object-cover"
            style={{
              objectPosition: `${cropState.x}% ${cropState.y}%`,
              transform: `scale(${cropState.scale})`,
              transformOrigin: `${cropState.x}% ${cropState.y}%`,
            }}
            draggable={false}
          />
        )}
      </div>
      <div className="flex items-center justify-between text-xs text-text-secondary">
        <span>{t('form.drag_position')}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-1 border border-border-color rounded hover:bg-gray-50"
            disabled={cropState.scale <= 0.5}
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span>
            {t('form.zoom')}: {Math.round(cropState.scale * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-1 border border-border-color rounded hover:bg-gray-50"
            disabled={cropState.scale >= 3}
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-3 py-1 text-xs border border-border-color rounded hover:bg-gray-50"
        >
          {t('actions.cancel')}
        </button>
        <button
          type="button"
          onClick={() => onSave({ ...cropState, width: 100, height: 100 })}
          className="px-3 py-1 text-xs bg-accent text-white rounded hover:bg-accent/90"
        >
          {t('actions.save')}
        </button>
      </div>
    </div>
  )
}
