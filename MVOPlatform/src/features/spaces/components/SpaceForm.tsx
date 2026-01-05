'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import {
  X,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Loader2,
  Plus,
  Crop,
  ZoomIn,
  ZoomOut,
  Crown,
  HelpCircle,
} from 'lucide-react'
import Image from 'next/image'
import {
  useLocale,
  useTranslations,
} from '@/shared/components/providers/I18nProvider'
import { usePremiumRedirect } from '@/core/hooks/usePremiumRedirect'
import { useAppSelector } from '@/core/lib/hooks'
import { Team } from '@/core/types/team'
import { teamService } from '@/core/lib/services/teamService'
import { adminService } from '@/core/lib/services/adminService'
import { Button } from '@/shared/components/ui/Button'
import { SpaceWithTeam, EnterpriseSpace } from '@/core/types/space'

type SpaceFormData = {
  space_name: string
  team_id: string
  visibility: 'public' | 'private'
  create_new_team: boolean
  new_team_name?: string
  new_team_description?: string
}

interface SpaceFormProps {
  space?: SpaceWithTeam // Optional: if provided, form is in edit mode
  onSuccess?: () => void
  onCancel?: () => void
}

// Help Tooltip Component
function HelpTooltip({
  content,
  className = '',
}: {
  content: string
  className?: string
}) {
  const [isHovered, setIsHovered] = useState(false)
  const t = useTranslations()
  
  // Translate content if it's a translation key
  let displayContent = content
  if (content.startsWith('editor.help.')) {
    const translated = t(content)
    // If translation returns the key itself, it means translation doesn't exist
    displayContent = translated !== content ? translated : ''
  }
  
  if (!displayContent) return null
  
  return (
    <div className={`relative inline-flex items-center ${className}`}>
      <HelpCircle
        className="w-3.5 h-3.5 text-text-secondary/60 hover:text-text-secondary cursor-help transition-colors flex-shrink-0"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      {isHovered && (
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 z-[100] w-64 p-2 bg-background border border-border-color rounded-lg shadow-xl text-xs text-text-primary whitespace-normal pointer-events-none">
          {displayContent}
        </div>
      )}
    </div>
  )
}

export function SpaceForm({ space, onSuccess, onCancel }: SpaceFormProps) {
  const isEditMode = !!space
  const router = useRouter()
  const t = useTranslations()
  const { locale } = useLocale()
  const { user } = useAppSelector(state => state.auth)
  const { redirectToPremium } = usePremiumRedirect()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [tags, setTags] = useState<Array<{ id: string; name: string }>>([])
  const [topics, setTopics] = useState<
    Array<{ id: string; name: string; description?: string }>
  >([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [selectedTopics, setSelectedTopics] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [isTagsExpanded, setIsTagsExpanded] = useState(true)
  const [isTopicsExpanded, setIsTopicsExpanded] = useState(true)
  const [headerImage, setHeaderImage] = useState<string | null>(null)
  const [headerCrop, setHeaderCrop] = useState<{
    x: number
    y: number
    width: number
    height: number
    scale?: number
  } | null>(null)
  const [showImageUpload, setShowImageUpload] = useState(false)
  const [showHeaderCrop, setShowHeaderCrop] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const spaceSchema = z
    .object({
      space_name: z.string().min(3, t('validation.title_min_length')),
      team_id: z.string().optional(),
      visibility: z.enum(['public', 'private']),
      create_new_team: z.boolean(),
      new_team_name: z.string().optional(),
      new_team_description: z.string().optional(),
    })
    .refine(
      data => {
        // Skip team validation in edit mode
        if (isEditMode) return true
        if (!data.create_new_team) {
          return !!data.team_id && data.team_id.length > 0
        }
        return true
      },
      {
        message: 'Team is required',
        path: ['team_id'],
      }
    )
    .refine(
      data => {
        // Skip team name validation in edit mode
        if (isEditMode) return true
        if (data.create_new_team) {
          return !!data.new_team_name && data.new_team_name.trim().length > 0
        }
        return true
      },
      {
        message: 'Team name is required',
        path: ['new_team_name'],
      }
    )

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SpaceFormData>({
    resolver: zodResolver(spaceSchema),
    defaultValues: {
      space_name: space?.name || '',
      team_id: space?.team_id || '',
      visibility: space?.visibility || 'public',
      create_new_team: false,
    },
  })

  // Initialize form data when editing
  useEffect(() => {
    if (space) {
      setValue('space_name', space.name)
      setValue('team_id', space.team_id)
      setValue('visibility', space.visibility)
      setHeaderImage(space.settings?.space_image || null)
      setHeaderCrop(space.settings?.header_crop || null)
      setSelectedTags(space.settings?.tags || [])
      setSelectedTopics(space.settings?.topics || [])
    }
  }, [space, setValue])

  const onError = (errors: any) => {
    console.error('Form validation errors:', errors)

    // Find the first error with a message
    let errorMsg = null
    for (const [field, error] of Object.entries(errors)) {
      const err = error as any
      if (err?.message) {
        // Map field names to user-friendly labels
        const fieldLabels: Record<string, string> = {
          space_name: t('spaces.space_name'),
          team_id: t('spaces.select_team'),
          new_team_name: t('spaces.team_name'),
          visibility: t('spaces.visibility'),
          create_new_team: t('spaces.select_team'),
        }
        const fieldLabel = fieldLabels[field] || field
        errorMsg = `${fieldLabel}: ${err.message}`
        break
      }
    }

    if (!errorMsg) {
      errorMsg = t('validation.please_fill_required_fields')
    }

    setErrorMessage(errorMsg)
  }

  const createNewTeam = watch('create_new_team')
  const selectedTeamId = watch('team_id')

  // Load user teams
  useEffect(() => {
    const loadTeams = async () => {
      if (!user?.id) return
      try {
        const userTeams = await teamService.getUserTeams(user.id)
        setTeams(userTeams)
      } catch (error) {
        console.error('Error loading teams:', error)
      }
    }
    loadTeams()
  }, [user?.id])

  // Load tags and topics
  useEffect(() => {
    const loadData = async () => {
      try {
        const [tagsData, topicsData] = await Promise.all([
          adminService.getTags(),
          adminService.getTopics(),
        ])
        setTags(tagsData)
        setTopics(topicsData)
      } catch (error) {
        console.error('Error loading tags/topics:', error)
      }
    }
    loadData()
  }, [])

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
        setIsUploadingImage(true)
        const url = await uploadFile(file, 'images')
        setHeaderImage(url)
        setShowImageUpload(false)
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Upload failed')
      } finally {
        setIsUploadingImage(false)
      }
    }
  }

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !selectedTags.includes(tag)) {
      // Limit to 4 tags total (including Industry/niche)
      const totalTags = selectedTags.length + selectedTopics.length
      if (totalTags >= 4) {
        alert(t('spaces.max_tags_reached') || 'Maximum 4 tags allowed (including Industry/niche)')
        return
      }
      setSelectedTags([...selectedTags, tag])
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag))
  }

  const toggleTopic = (topicId: string) => {
    if (selectedTopics.includes(topicId)) {
      setSelectedTopics(selectedTopics.filter(t => t !== topicId))
    } else {
      // Limit to 2 Industry/niche selections
      if (selectedTopics.length >= 2) {
        alert(t('spaces.max_industry_niche_selected') || 'Maximum 2 Industry/niche selections allowed')
        return
      }
      setSelectedTopics([...selectedTopics, topicId])
    }
  }

  const onSubmit = async (data: SpaceFormData) => {
    if (!user?.id) {
      alert(isEditMode ? 'You must be logged in to edit a space' : 'You must be logged in to create a space')
      return
    }

    // Validate tag limits
    if (selectedTopics.length > 2) {
      alert(t('spaces.max_industry_niche_selected') || 'Maximum 2 Industry/niche selections allowed')
      return
    }

    const totalTags = selectedTags.length + selectedTopics.length
    if (totalTags > 4) {
      alert(t('spaces.max_tags_reached') || 'Maximum 4 tags allowed (including Industry/niche)')
      return
    }

    setIsSubmitting(true)
    try {
      if (isEditMode && space) {
        // Update existing space
        // Build update object with only changed fields
        const updateData: Partial<EnterpriseSpace> = {
          name: data.space_name,
          visibility: data.visibility,
        }
        
        // Prepare space settings - start with existing settings or empty object
        const spaceSettings: any = space.settings ? { ...space.settings } : {}
        
        // Update image if changed
        if (headerImage) {
          spaceSettings.space_image = headerImage
          if (headerCrop) {
            spaceSettings.header_crop = headerCrop
          }
        } else if (headerImage === null && space.settings?.space_image) {
          // If image was explicitly removed (set to null), clear it
          delete spaceSettings.space_image
          delete spaceSettings.header_crop
        }
        
        // Update tags and topics
        spaceSettings.tags = selectedTags.length > 0 ? selectedTags : []
        spaceSettings.topics = selectedTopics.length > 0 ? selectedTopics : []
        
        // Only include settings if there are actual settings to save
        // Check if settings has any meaningful content
        const hasSettings = 
          spaceSettings.space_image || 
          spaceSettings.header_crop ||
          (Array.isArray(spaceSettings.tags) && spaceSettings.tags.length > 0) ||
          (Array.isArray(spaceSettings.topics) && spaceSettings.topics.length > 0)
        
        if (hasSettings) {
          updateData.settings = spaceSettings
        } else {
          // If settings is empty, set it to null to clear it
          updateData.settings = null
        }
        
        await teamService.updateSpace(space.id, updateData)

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess()
        }
      } else {
        // Create new space
        // Validate team selection for new spaces
        if (!data.create_new_team && !data.team_id) {
          alert('Please select a team or create a new one')
          setIsSubmitting(false)
          return
        }

        if (
          data.create_new_team &&
          (!data.new_team_name || data.new_team_name.trim().length === 0)
        ) {
          alert('Please enter a team name')
          setIsSubmitting(false)
          return
        }

        let teamId = data.team_id

        // Create new team if needed
        if (data.create_new_team && data.new_team_name) {
          const newTeam = await teamService.createTeam(
            {
              name: data.new_team_name,
              description: data.new_team_description || '',
            },
            user.id
          )
          teamId = newTeam.id
        }

        // Prepare space settings for new space
        const newSpaceSettings: any = {}
        if (headerImage) {
          newSpaceSettings.space_image = headerImage
          if (headerCrop) {
            newSpaceSettings.header_crop = headerCrop
          }
        }
        if (selectedTags.length > 0) {
          newSpaceSettings.tags = selectedTags
        }
        if (selectedTopics.length > 0) {
          newSpaceSettings.topics = selectedTopics
        }

        const newSpace = await teamService.createSpace({
          team_id: teamId,
          name: data.space_name,
          visibility: data.visibility,
          settings:
            Object.keys(newSpaceSettings).length > 0 ? newSpaceSettings : undefined,
        })

        // Add creator as admin
        await teamService.addSpaceMember(newSpace.id, user.id, 'admin')

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess()
        }

        // Redirect to the space detail page
        router.push(`/${locale}/spaces/${newSpace.id}`)
      }
    } catch (error: any) {
      console.error(`Error ${isEditMode ? 'updating' : 'creating'} space:`, error)
      
      // Extract more detailed error message
      let errorMsg = ''
      if (error instanceof Error) {
        errorMsg = error.message
      } else if (error?.message) {
        errorMsg = error.message
      } else if (error?.error?.message) {
        errorMsg = error.error.message
      } else if (typeof error === 'string') {
        errorMsg = error
      } else {
        errorMsg = isEditMode
          ? t('spaces.space_update_error') || 'Error updating space'
          : t('spaces.space_creation_error')
      }
      
      // Handle specific Supabase errors
      if (error?.code === 'PGRST116' || error?.status === 406 || error?.code === '406') {
        errorMsg = t('spaces.space_update_rls_error') || 'Error updating space. The RLS policy for updating spaces may not be configured. Please run the SQL in sql/add_space_update_rls.sql in your Supabase SQL editor.'
      } else if (error?.message?.includes('Only space admins')) {
        errorMsg = error.message
      } else if (error?.message?.includes('not authenticated')) {
        errorMsg = t('auth.sign_in_required') || 'You must be signed in to update spaces.'
      }
      
      setErrorMessage(errorMsg)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-background">
      <article className="max-w-4xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          onSubmit={handleSubmit(onSubmit, onError)}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-text-primary mb-2">
              {isEditMode ? t('spaces.edit_space') : t('spaces.create_space')}
            </h1>
            <p className="text-text-secondary">
              {isEditMode 
                ? t('spaces.edit_space_description')
                : t('spaces.no_spaces_description')}
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  <svg
                    className="w-5 h-5 text-red-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-400 mb-1">
                    {t('validation.error')}
                  </p>
                  <p className="text-sm text-red-300">{errorMessage}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="flex-shrink-0 text-red-400 hover:text-red-300 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Team Selection - Only show when creating new space */}
          {!isEditMode && (
          <div className="mb-8 pb-8 border-b border-border-color">
            <label className="text-sm font-medium text-text-secondary mb-4 block">
              {t('spaces.select_team')} <span className="text-red-500">*</span>
            </label>
            <div className="space-y-4">
              {/* Select Existing Team */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="radio"
                    checked={!createNewTeam}
                    onChange={() => {
                      setValue('create_new_team', false, {
                        shouldValidate: true,
                      })
                      setErrorMessage(null)
                    }}
                    className="w-4 h-4 text-accent"
                  />
                  <span className="text-sm text-text-primary">
                    {t('spaces.select_team')}
                  </span>
                </label>
                {!createNewTeam && (
                  <select
                    {...register('team_id')}
                    className="w-full px-4 py-3 bg-background border border-border-color rounded-lg text-text-primary hover:border-accent/30 focus:border-accent focus:outline-none transition-colors ml-6"
                  >
                    <option value="">{t('spaces.select_team')}</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Create New Team */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer mb-2">
                  <input
                    type="radio"
                    checked={createNewTeam}
                    onChange={() => {
                      setValue('create_new_team', true, {
                        shouldValidate: true,
                      })
                      setErrorMessage(null)
                    }}
                    className="w-4 h-4 text-accent"
                  />
                  <span className="text-sm text-text-primary">
                    {t('spaces.create_new_team')}
                  </span>
                </label>
                {createNewTeam && (
                  <div className="space-y-4 ml-6">
                    <div>
                      <input
                        type="text"
                        {...register('new_team_name')}
                        placeholder={t('spaces.team_name')}
                        className="w-full px-4 py-3 bg-background border border-border-color rounded-lg text-text-primary hover:border-accent/30 focus:border-accent focus:outline-none transition-colors"
                      />
                      {errors.new_team_name && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.new_team_name.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <textarea
                        {...register('new_team_description')}
                        placeholder={t('spaces.team_description')}
                        rows={3}
                        className="w-full px-4 py-3 bg-background border border-border-color rounded-lg text-text-primary hover:border-accent/30 focus:border-accent focus:outline-none transition-colors resize-none"
                      />
                    </div>
                    {/* Premium Feature: Invite Users */}
                    <motion.div
                      className="p-4 bg-background border border-accent-alt/30 rounded-lg cursor-pointer hover:border-accent-alt/50 transition-colors"
                      onClick={redirectToPremium}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <div className="flex items-start gap-3">
                        <Crown className="w-5 h-5 text-accent-alt flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-text-primary mb-1">
                            {t('spaces.invite_members')}
                          </p>
                          <p className="text-xs text-text-secondary mb-3">
                            {t('spaces.invite_members_description')}
                          </p>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder={t('spaces.username_or_email')}
                              className="flex-1 px-4 py-2 bg-background border border-border-color rounded-lg text-text-primary text-sm cursor-pointer hover:border-accent/30 focus:border-accent focus:outline-none transition-colors"
                              onClick={e => {
                                e.stopPropagation()
                                redirectToPremium()
                              }}
                              readOnly
                            />
                            <Button
                              type="button"
                              variant="outline"
                              onClick={e => {
                                e.stopPropagation()
                                redirectToPremium()
                              }}
                              className="border-border-color hover:border-accent/30 hover:bg-accent/10 hover:text-text-primary"
                            >
                              {t('spaces.invite')}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>
            </div>
            {errors.team_id && !createNewTeam && (
              <p className="mt-1 text-sm text-red-500 ml-6">
                {errors.team_id.message}
              </p>
            )}
            {errors.new_team_name && createNewTeam && (
              <p className="mt-1 text-sm text-red-500 ml-6">
                {errors.new_team_name.message}
              </p>
            )}
          </div>
          )}

          {/* Space Name */}
          <div className="mb-8">
            <label className="text-sm font-medium text-text-secondary mb-2 block">
              {t('spaces.space_name')} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              {...register('space_name')}
              placeholder={t('spaces.space_name')}
              className="w-full px-4 py-2 bg-background border border-border-color rounded-lg text-text-primary"
            />
            {errors.space_name && (
              <p className="mt-1 text-sm text-red-500">
                {errors.space_name.message}
              </p>
            )}
          </div>

          {/* Visibility */}
          <div className="mb-8">
            <label className="text-sm font-medium text-text-secondary mb-2 block">
              {t('spaces.visibility')} <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-border-color hover:border-accent/20 transition-colors">
                <input
                  type="radio"
                  {...register('visibility')}
                  value="public"
                  className="w-4 h-4 text-accent"
                />
                <span className="text-sm text-text-primary">
                  {t('spaces.public')}
                </span>
              </label>
              <motion.label
                className="flex items-center gap-2 cursor-pointer p-3 rounded-lg border border-accent-alt/30 hover:border-accent-alt/50 transition-colors"
                onClick={redirectToPremium}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <input
                  type="radio"
                  {...register('visibility')}
                  value="private"
                  className="w-4 h-4 text-accent-alt"
                  disabled
                  onClick={e => {
                    e.stopPropagation()
                    redirectToPremium()
                  }}
                />
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-sm text-text-primary">
                    {t('spaces.private')}
                  </span>
                  <Crown className="w-4 h-4 text-accent-alt" />
                </div>
              </motion.label>
            </div>
          </div>

          {/* Space Media - Vertical aspect ratio */}
          <div className="mb-8">
            <label className="text-sm font-medium text-text-secondary mb-2 block">
              {t('spaces.space_image')}
            </label>
            <div className="space-y-4">
              {headerImage && (
                <div className="relative w-full max-w-md mx-auto aspect-[3/4] rounded-lg overflow-hidden border border-border-color">
                  <Image
                    src={headerImage}
                    alt="Space"
                    fill
                    className="object-cover"
                    style={{
                      objectPosition: headerCrop
                        ? `${headerCrop.x}% ${headerCrop.y}%`
                        : 'center',
                      transform: headerCrop
                        ? `scale(${headerCrop.scale || 1})`
                        : 'scale(1)',
                      transformOrigin: headerCrop
                        ? `${headerCrop.x}% ${headerCrop.y}%`
                        : 'center',
                    }}
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowHeaderCrop(!showHeaderCrop)}
                      className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                      title={t('form.crop_adjust')}
                    >
                      <Crop className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHeaderImage(null)
                        setHeaderCrop(null)
                      }}
                      className="p-2 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
              {!headerImage && (
                <div className="flex flex-col items-center gap-4">
                  <div className="flex gap-4 justify-center">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => imageInputRef.current?.click()}
                        disabled={isUploadingImage}
                        className="flex items-center gap-2 px-6 py-3 bg-background border border-border-color rounded-lg hover:bg-gray-50/10 hover:border-accent/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUploadingImage ? (
                          <Loader2 className="w-4 h-4 animate-spin text-accent" />
                        ) : (
                          <ImageIcon className="w-4 h-4 text-accent" />
                        )}
                        {t('form.upload_image')}
                      </button>
                      <HelpTooltip content={t('editor.help.image_upload')} />
                    </div>
                  </div>
                </div>
              )}
            </div>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {/* Crop Editor */}
            {showHeaderCrop && headerImage && (
              <div className="mt-4 p-4 border border-border-color rounded-lg bg-background">
                <SpaceCropEditor
                  src={headerImage}
                  isVideo={false}
                  crop={headerCrop}
                  onSave={crop => {
                    setHeaderCrop(crop)
                    setShowHeaderCrop(false)
                  }}
                  onCancel={() => setShowHeaderCrop(false)}
                  t={t}
                />
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="mb-8">
            <button
              type="button"
              onClick={() => setIsTagsExpanded(!isTagsExpanded)}
              className="flex items-center justify-between w-full mb-3"
            >
              <label className="text-sm font-medium text-text-secondary cursor-pointer">
                {t('spaces.tags')} {selectedTags.length > 0 && `(${selectedTags.length + selectedTopics.length}/4)`}
              </label>
              {isTagsExpanded ? (
                <ChevronUp className="w-4 h-4 text-text-secondary" />
              ) : (
                <ChevronDown className="w-4 h-4 text-text-secondary" />
              )}
            </button>
            {isTagsExpanded && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={e => setTagInput(e.target.value)}
                      onKeyPress={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addTag()
                        }
                      }}
                      placeholder={t('form.type_tag_placeholder')}
                      disabled={selectedTags.length + selectedTopics.length >= 4}
                      className="w-full px-4 py-2 bg-background border border-border-color rounded-lg text-text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    {selectedTags.length + selectedTopics.length > 0 && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-text-secondary">
                        {selectedTags.length + selectedTopics.length}/4
                      </span>
                    )}
                  </div>
                  <Button 
                    type="button" 
                    onClick={addTag} 
                    variant="outline"
                    disabled={selectedTags.length + selectedTopics.length >= 4 || !tagInput.trim()}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
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

          {/* Industry/niche */}
          <div className="mb-8">
            <button
              type="button"
              onClick={() => setIsTopicsExpanded(!isTopicsExpanded)}
              className="flex items-center justify-between w-full mb-3"
            >
              <label className="text-sm font-medium text-text-secondary cursor-pointer">
                {t('spaces.industry_niche')} {selectedTopics.length > 0 && `(${selectedTopics.length}/2)`}
              </label>
              {isTopicsExpanded ? (
                <ChevronUp className="w-4 h-4 text-text-secondary" />
              ) : (
                <ChevronDown className="w-4 h-4 text-text-secondary" />
              )}
            </button>
            {isTopicsExpanded && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {topics.map(topic => (
                  <label
                    key={topic.id}
                    className={`flex items-center gap-2 cursor-pointer p-3 rounded-lg border transition-colors ${
                      selectedTopics.includes(topic.id)
                        ? 'bg-accent/10 border-accent/30 text-accent'
                        : selectedTopics.length >= 2
                        ? 'bg-background border-border-color opacity-50 cursor-not-allowed'
                        : 'bg-background border-border-color hover:border-accent/20 hover:bg-gray-50/10'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTopics.includes(topic.id)}
                      onChange={() => toggleTopic(topic.id)}
                      disabled={selectedTopics.length >= 2 && !selectedTopics.includes(topic.id)}
                      className="w-4 h-4 text-accent focus:ring-accent focus:ring-2 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <span className="text-sm font-medium text-text-primary">
                      {topic.name}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isEditMode ? t('spaces.updating_space') : t('spaces.creating_space')}</span>
                </div>
              ) : (
                isEditMode ? t('spaces.save_changes') : t('spaces.create_space')
              )}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                {t('actions.cancel')}
              </Button>
            )}
          </div>
        </motion.form>
      </article>
    </div>
  )
}

function SpaceCropEditor({
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
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-text-primary">
          {t('form.crop_adjust_media')}
        </h4>
        <button
          type="button"
          onClick={onCancel}
          className="text-text-secondary hover:text-text-primary"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div
        ref={containerRef}
        className="relative w-full aspect-[3/4] bg-black rounded-lg overflow-hidden cursor-move"
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
              video.currentTime = 0.1
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
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={cropState.scale <= 0.5}
            className="p-1 hover:bg-gray-50/10 rounded disabled:opacity-50"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span>
            {t('form.zoom')}: {Math.round(cropState.scale * 100)}%
          </span>
          <button
            type="button"
            onClick={handleZoomIn}
            disabled={cropState.scale >= 3}
            className="p-1 hover:bg-gray-50/10 rounded disabled:opacity-50"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          {t('actions.cancel')}
        </Button>
        <Button
          type="button"
          variant="primary"
          onClick={() => onSave({ ...cropState, width: 100, height: 100 })}
          className="flex-1"
        >
          {t('actions.save')}
        </Button>
      </div>
    </div>
  )
}
