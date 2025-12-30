'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  Layout,
  Code,
  Upload,
  Crop,
  X,
  ChevronDown,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import { ContentBlock } from '@/core/types/content'
import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { Button } from '@/shared/components/ui/Button'
import { isUrlValid } from '@/core/lib/utils/media'
import { toast } from 'sonner'

interface RichContentEditorProps {
  value: ContentBlock[]
  onChange: (blocks: ContentBlock[]) => void
}

export function RichContentEditor({ value, onChange }: RichContentEditorProps) {
  const t = useTranslations()
  const [selectedBlockIndex, setSelectedBlockIndex] = useState<number | null>(
    null
  )
  const [editingText, setEditingText] = useState<string>('')
  const [showInsertMenu, setShowInsertMenu] = useState<number | null>(null)

  // Reset selection when value changes externally (e.g., form reset)
  useEffect(() => {
    // Only reset if we have blocks but none should be selected
    if (
      value.length > 0 &&
      selectedBlockIndex !== null &&
      selectedBlockIndex >= value.length
    ) {
      setSelectedBlockIndex(null)
    }
  }, [value, selectedBlockIndex])

  const addBlock = useCallback(
    (index: number, type: ContentBlock['type'], initialData?: any) => {
      const newBlocks = [...value]
      let newBlock: ContentBlock

      switch (type) {
        case 'heading':
          newBlock = {
            type: 'heading',
            level: initialData?.level || 2,
            text: initialData?.text || '',
          } as ContentBlock
          break
        case 'text':
          newBlock = {
            type: 'text',
            content: initialData?.content || '',
            size: initialData?.size || 'medium',
          } as ContentBlock
          break
        case 'image':
          newBlock = {
            type: 'image',
            src: initialData?.src || '',
            caption: initialData?.caption,
            objectFit: initialData?.objectFit || 'fit',
            alignment: initialData?.alignment || 'center',
          } as ContentBlock
          break
        case 'video':
          newBlock = {
            type: 'video',
            src: initialData?.src || '',
            title: initialData?.title,
            description: initialData?.description,
            objectFit: initialData?.objectFit || 'fit',
            alignment: initialData?.alignment || 'center',
          } as ContentBlock
          break
        case 'carousel':
          newBlock = {
            type: 'carousel',
            slides: initialData?.slides || [
              {
                description: '',
              },
            ],
          } as ContentBlock
          break
        case 'html':
          newBlock = {
            type: 'html',
            content: initialData?.content || '',
          } as ContentBlock
          break
        default:
          return
      }

      newBlocks.splice(index + 1, 0, newBlock)
      onChange(newBlocks)
      // Don't auto-select - let user click to select
      setSelectedBlockIndex(null)
      setShowInsertMenu(null)
    },
    [value, onChange]
  )

  const updateBlock = useCallback(
    (index: number, updates: Partial<ContentBlock>) => {
      const newBlocks = [...value]
      newBlocks[index] = { ...newBlocks[index], ...updates } as ContentBlock
      onChange(newBlocks)
    },
    [value, onChange]
  )

  const deleteBlock = useCallback(
    (index: number) => {
      const newBlocks = value.filter((_, i) => i !== index)
      onChange(newBlocks)
      setSelectedBlockIndex(null)
    },
    [value, onChange]
  )

  const moveBlock = useCallback(
    (index: number, direction: 'up' | 'down') => {
      const newBlocks = [...value]
      const newIndex = direction === 'up' ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= newBlocks.length) return
      ;[newBlocks[index], newBlocks[newIndex]] = [
        newBlocks[newIndex],
        newBlocks[index],
      ]
      onChange(newBlocks)
      // Don't auto-select - let user click to select
      setSelectedBlockIndex(null)
    },
    [value, onChange]
  )

  // Initialize with 1 placeholder block if empty
  const displayBlocks =
    value.length === 0
      ? [{ type: 'heading' as const, level: 1 as const, text: '' }]
      : value

  const changeBlockType = useCallback(
    (index: number, newType: ContentBlock['type'], initialData?: any) => {
      const newBlocks = [...value]
      const currentBlock = newBlocks[index]

      // Preserve content when possible, especially between text types
      let preservedContent: any = {}

      // Text <-> Heading conversions
      if (currentBlock.type === 'text' && newType === 'heading') {
        preservedContent = { text: currentBlock.content || '' }
      } else if (currentBlock.type === 'heading' && newType === 'text') {
        preservedContent = { content: currentBlock.text || '', size: 'medium' }
      }
      // Heading level changes - preserve text
      else if (currentBlock.type === 'heading' && newType === 'heading') {
        preservedContent = {
          text: currentBlock.text || '',
          level: initialData?.level || currentBlock.level,
        }
      }
      // Text to Text - preserve content and size
      else if (currentBlock.type === 'text' && newType === 'text') {
        preservedContent = {
          content: currentBlock.content || '',
          size: currentBlock.size || 'medium',
        }
      }
      // HTML preserves content
      else if (currentBlock.type === 'html' && newType === 'html') {
        preservedContent = { content: currentBlock.content || '' }
      }
      // Image preserves src, caption, objectFit, alignment
      else if (currentBlock.type === 'image' && newType === 'image') {
        preservedContent = {
          src: currentBlock.src || '',
          caption: currentBlock.caption,
          objectFit: currentBlock.objectFit || 'fit',
          alignment: currentBlock.alignment || 'center',
        }
      }
      // Video preserves src, title, description
      else if (currentBlock.type === 'video' && newType === 'video') {
        preservedContent = {
          src: currentBlock.src || '',
          title: currentBlock.title,
          description: currentBlock.description,
        }
      }
      // Carousel preserves slides
      else if (currentBlock.type === 'carousel' && newType === 'carousel') {
        preservedContent = {
          slides: currentBlock.slides || [{ description: '' }],
        }
      }

      const newBlock = createBlock(newType, {
        ...preservedContent,
        ...initialData,
      })
      newBlocks[index] = newBlock
      onChange(newBlocks)
      setSelectedBlockIndex(null)
    },
    [value, onChange]
  )

  return (
    <div className="space-y-2 pb-24 md:pb-12">
      {displayBlocks.map((block, index) => {
        const isPlaceholder = value.length === 0 && index === 0
        const actualIndex = value.length === 0 ? -1 : index

        return (
          <BlockEditor
            key={index}
            block={block as ContentBlock}
            index={actualIndex}
            isPlaceholder={isPlaceholder}
            isSelected={selectedBlockIndex === (isPlaceholder ? null : index)}
            onSelect={() => {
              if (!isPlaceholder) {
                // Toggle selection: if already selected, deselect; otherwise select
                const willDeselect = selectedBlockIndex === index
                setSelectedBlockIndex(willDeselect ? null : index)
                // Close insert menu when deselecting or selecting a different block
                if (willDeselect || selectedBlockIndex !== index) {
                  setShowInsertMenu(null)
                }
              }
            }}
            onUpdate={updates => {
              if (!isPlaceholder) {
                updateBlock(index, updates)
              } else {
                // Convert this placeholder to real block - remove all placeholders and add this one
                const newBlock = { ...block, ...updates } as ContentBlock
                onChange([newBlock])
                // Don't auto-select - let user click to select
                setSelectedBlockIndex(null)
              }
            }}
            onDelete={() => {
              if (!isPlaceholder) {
                deleteBlock(index)
              }
            }}
            onMoveUp={() => {
              if (!isPlaceholder) {
                moveBlock(index, 'up')
              }
            }}
            onMoveDown={() => {
              if (!isPlaceholder) {
                moveBlock(index, 'down')
              }
            }}
            onAddBlock={(type, data) => {
              if (isPlaceholder) {
                // Replace placeholder with new block
                const newBlocks = [...value]
                const newBlock = createBlock(type, data)
                newBlocks.push(newBlock)
                onChange(newBlocks)
                // Don't auto-select - let user click to select
                setSelectedBlockIndex(null)
              } else {
                addBlock(index, type, data)
              }
            }}
            showInsertMenu={showInsertMenu === (isPlaceholder ? null : index)}
            onToggleInsertMenu={() => {
              if (!isPlaceholder) {
                setShowInsertMenu(showInsertMenu === index ? null : index)
              }
            }}
            onChangeBlockType={(type, data) => {
              if (!isPlaceholder) {
                changeBlockType(index, type, data)
              }
            }}
          />
        )
      })}
    </div>
  )

  function createBlock(
    type: ContentBlock['type'],
    initialData?: any
  ): ContentBlock {
    switch (type) {
      case 'heading':
        return {
          type: 'heading',
          level: initialData?.level || 2,
          text: initialData?.text || '',
        } as ContentBlock
      case 'text':
        return {
          type: 'text',
          content: initialData?.content || '',
          size: initialData?.size || 'medium',
        } as ContentBlock
      case 'image':
        return {
          type: 'image',
          src: initialData?.src || '',
          caption: initialData?.caption,
          objectFit: initialData?.objectFit || 'fit',
          alignment: initialData?.alignment || 'center',
        } as ContentBlock
      case 'video':
        return {
          type: 'video',
          src: initialData?.src || '',
          title: initialData?.title,
          description: initialData?.description,
          objectFit: initialData?.objectFit || 'fit',
          alignment: initialData?.alignment || 'center',
        } as ContentBlock
      case 'carousel':
        return {
          type: 'carousel',
          slides: initialData?.slides || [{ description: '' }],
        } as ContentBlock
      case 'html':
        return {
          type: 'html',
          content: initialData?.content || '',
        } as ContentBlock
      default:
        return { type: 'text', content: '', size: 'medium' } as ContentBlock
    }
  }
}

interface BlockEditorProps {
  block: ContentBlock
  index: number
  isPlaceholder?: boolean
  isSelected: boolean
  onSelect: () => void
  onUpdate: (updates: Partial<ContentBlock>) => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onAddBlock: (type: ContentBlock['type'], data?: Partial<ContentBlock>) => void
  showInsertMenu: boolean
  onToggleInsertMenu: () => void
  onChangeBlockType: (
    type: ContentBlock['type'],
    data?: Partial<ContentBlock>
  ) => void
}

function BlockEditor({
  block,
  index,
  isPlaceholder = false,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onAddBlock,
  showInsertMenu,
  onToggleInsertMenu,
  onChangeBlockType,
}: BlockEditorProps) {
  const t = useTranslations()
  const [localValue, setLocalValue] = useState<string>('')
  const [showChangeTypeMenu, setShowChangeTypeMenu] = useState(false)
  const [showCropEditor, setShowCropEditor] = useState(false)
  const [showUrlModal, setShowUrlModal] = useState<'image' | 'video' | null>(
    null
  )
  const [urlInputValue, setUrlInputValue] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isValidatingUrl, setIsValidatingUrl] = useState(false)
  const [urlValidationError, setUrlValidationError] = useState<string | null>(
    null
  )
  const blockRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const headingTextareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea for text blocks
  useEffect(() => {
    if (textareaRef.current && block.type === 'text') {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [
    block.type === 'text' ? block.content || '' : '',
    block.type === 'text' ? block.size || 'medium' : '',
    block.type,
  ])

  // Auto-resize textarea for heading blocks
  useEffect(() => {
    if (headingTextareaRef.current && block.type === 'heading') {
      headingTextareaRef.current.style.height = 'auto'
      headingTextareaRef.current.style.height = `${headingTextareaRef.current.scrollHeight}px`
    }
  }, [block.type === 'heading' ? block.text || '' : '', block.type])

  // Handle click outside to deselect
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement

      // Don't deselect if clicking on toolbar, insert menu, change type menu, or URL input
      if (
        target.closest('.toolbar-container') ||
        target.closest('.insert-menu-container') ||
        target.closest('.change-type-menu-container') ||
        target.closest('[class*="absolute top-full"]')
      ) {
        return
      }

      if (blockRef.current && !blockRef.current.contains(target)) {
        if (isSelected) {
          // Deselect by calling onSelect which toggles selection
          onSelect()
        }
      }
    }

    if (isSelected) {
      // Use a small delay to allow click events to process first
      setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutside)
      }, 0)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isSelected, onSelect])

  const handleTextChange = (text: string) => {
    if (block.type === 'text') {
      onUpdate({ content: text })
    } else if (block.type === 'heading') {
      onUpdate({ text })
    }
  }
  const uploadFile = async (
    file: File,
    folder: string = 'content'
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

  const validateAndSetUrl = async (url: string) => {
    if (!url || !url.trim()) return

    setIsValidatingUrl(true)
    setUrlValidationError(null)

    try {
      const isValid = await isUrlValid(url.trim(), true)
      if (isValid) {
        onUpdate({ src: url.trim() })
        setShowUrlModal(null)
        setUrlInputValue('')
      } else {
        setUrlValidationError(t('validation.invalid_media_url'))
      }
    } catch (error) {
      setUrlValidationError(t('validation.invalid_media_url'))
    } finally {
      setIsValidatingUrl(false)
    }
  }

  return (
    <motion.div
      ref={blockRef}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative group border-2 rounded-lg transition-all overflow-visible ${
        block.type === 'text' || block.type === 'heading' ? 'p-1' : 'p-2'
      } ${
        isPlaceholder
          ? 'border-dashed border-border-color/50 bg-background/50 opacity-60'
          : isSelected
            ? 'border-accent bg-accent/5'
            : 'border-transparent hover:border-border-color'
      }`}
      onClick={e => {
        // Only select if clicking on the block container itself, not on inputs/textareas inside
        if (
          e.target === e.currentTarget ||
          (e.target as HTMLElement).closest('.block-content')
        ) {
          onSelect()
        }
      }}
    >
      {/* Toolbar - positioned below the block */}
      {isSelected && !isPlaceholder && (
        <div className="toolbar-container absolute top-full left-0 right-0 mt-2 flex items-center justify-between bg-background border border-border-color rounded-lg p-2 shadow-lg z-10">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={e => {
                e.stopPropagation()
                setShowChangeTypeMenu(false)
                onToggleInsertMenu()
              }}
              className="p-2 hover:bg-gray-100 rounded"
              title="Insert block"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation()
                if (showInsertMenu) {
                  onToggleInsertMenu() // Close insert menu if open
                }
                setShowChangeTypeMenu(!showChangeTypeMenu)
              }}
              className="p-2 hover:bg-gray-100 rounded"
              title="Change block type"
            >
              <Type className="w-4 h-4" />
            </button>
            {(block.type === 'text' || block.type === 'heading') && (
              <>
                <FontFamilySelector
                  value={
                    block.type === 'text'
                      ? block.fontFamily || 'inherit'
                      : block.fontFamily || 'inherit'
                  }
                  onChange={fontFamily => onUpdate({ fontFamily })}
                  onClick={e => e.stopPropagation()}
                />
                <ColorPaletteSelector
                  value={
                    block.type === 'text'
                      ? block.color || '#ffffff'
                      : block.color || '#ffffff'
                  }
                  onChange={color =>
                    onUpdate({ color: color === '#ffffff' ? undefined : color })
                  }
                  onClick={e => e.stopPropagation()}
                />
              </>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={e => {
                e.stopPropagation()
                onMoveUp()
              }}
              disabled={index === 0}
              className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
              title="Move up"
            >
              <MoveUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation()
                onMoveDown()
              }}
              className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
              title="Move down"
            >
              <MoveDown className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={e => {
                e.stopPropagation()
                onDelete()
              }}
              className="p-2 hover:bg-red-100 text-red-600 rounded"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Change Type Menu */}
      <AnimatePresence>
        {showChangeTypeMenu && isSelected && !isPlaceholder && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="change-type-menu-container absolute top-full left-0 mt-8 bg-background border border-border-color rounded-lg p-2 shadow-lg z-20 grid grid-cols-2 gap-2 min-w-[300px]"
            onClick={e => e.stopPropagation()}
          >
            <InsertButton
              icon={<Heading1 className="w-4 h-4" />}
              label={t('editor.block_types.heading_1')}
              onClick={() => {
                onChangeBlockType('heading', { level: 1 })
                setShowChangeTypeMenu(false)
              }}
            />
            <InsertButton
              icon={<Heading2 className="w-4 h-4" />}
              label={t('editor.block_types.heading_2')}
              onClick={() => {
                onChangeBlockType('heading', { level: 2 })
                setShowChangeTypeMenu(false)
              }}
            />
            <InsertButton
              icon={<Heading3 className="w-4 h-4" />}
              label={t('editor.block_types.heading_3')}
              onClick={() => {
                onChangeBlockType('heading', { level: 3 })
                setShowChangeTypeMenu(false)
              }}
            />
            <InsertButton
              icon={<Type className="w-4 h-4" />}
              label={t('editor.block_types.text')}
              onClick={() => {
                onChangeBlockType('text')
                setShowChangeTypeMenu(false)
              }}
            />
            <InsertButton
              icon={<ImageIcon className="w-4 h-4" />}
              label={t('editor.block_types.image')}
              onClick={() => {
                onChangeBlockType('image')
                setShowChangeTypeMenu(false)
              }}
            />
            <InsertButton
              icon={<Video className="w-4 h-4" />}
              label={t('editor.block_types.video')}
              onClick={() => {
                onChangeBlockType('video')
                setShowChangeTypeMenu(false)
              }}
            />
            <InsertButton
              icon={<Layout className="w-4 h-4" />}
              label={t('editor.block_types.carousel')}
              onClick={() => {
                onChangeBlockType('carousel')
                setShowChangeTypeMenu(false)
              }}
            />
            <InsertButton
              icon={<Code className="w-4 h-4" />}
              label={t('editor.block_types.html')}
              onClick={() => {
                onChangeBlockType('html')
                setShowChangeTypeMenu(false)
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Insert Menu */}
      <AnimatePresence>
        {showInsertMenu && isSelected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="insert-menu-container absolute top-full left-0 mt-2 bg-background border border-border-color rounded-lg p-2 shadow-lg z-20 grid grid-cols-2 gap-2 min-w-[300px]"
            onClick={e => e.stopPropagation()}
          >
            <InsertButton
              icon={<Heading1 className="w-4 h-4" />}
              label={t('editor.block_types.heading_1')}
              onClick={() => onAddBlock('heading', { level: 1 })}
            />
            <InsertButton
              icon={<Heading2 className="w-4 h-4" />}
              label={t('editor.block_types.heading_2')}
              onClick={() => onAddBlock('heading', { level: 2 })}
            />
            <InsertButton
              icon={<Heading3 className="w-4 h-4" />}
              label={t('editor.block_types.heading_3')}
              onClick={() => onAddBlock('heading', { level: 3 })}
            />
            <InsertButton
              icon={<Type className="w-4 h-4" />}
              label={t('editor.block_types.text')}
              onClick={() => onAddBlock('text')}
            />
            <InsertButton
              icon={<ImageIcon className="w-4 h-4" />}
              label={t('editor.block_types.image')}
              onClick={() => onAddBlock('image')}
            />
            <InsertButton
              icon={<Video className="w-4 h-4" />}
              label={t('editor.block_types.video')}
              onClick={() => onAddBlock('video')}
            />
            <InsertButton
              icon={<Layout className="w-4 h-4" />}
              label={t('editor.block_types.carousel')}
              onClick={() => onAddBlock('carousel')}
            />
            <InsertButton
              icon={<Code className="w-4 h-4" />}
              label={t('editor.block_types.html')}
              onClick={() => onAddBlock('html')}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* URL Modal */}
      {showUrlModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[60]"
            onClick={() => {
              setShowUrlModal(null)
              setUrlInputValue('')
              setUrlValidationError(null)
            }}
          />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background border border-border-color rounded-lg p-6 shadow-2xl z-[70] min-w-[400px]">
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              {showUrlModal === 'image'
                ? t('editor.headers.enter_image_url')
                : t('editor.headers.enter_video_url')}
            </h3>
            <input
              type="text"
              value={urlInputValue}
              onChange={e => setUrlInputValue(e.target.value)}
              placeholder={`Paste ${showUrlModal === 'image' ? 'image' : 'video'} URL here`}
              className="w-full px-3 py-2 border border-border-color rounded bg-background text-text-primary mb-4"
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  if (urlInputValue.trim()) {
                    validateAndSetUrl(urlInputValue.trim())
                  }
                } else if (e.key === 'Escape') {
                  setShowUrlModal(null)
                  setUrlInputValue('')
                  setUrlValidationError(null)
                }
              }}
            />
            {urlValidationError && (
              <p className="text-red-500 text-sm mb-4">{urlValidationError}</p>
            )}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowUrlModal(null)
                  setUrlInputValue('')
                  setUrlValidationError(null)
                }}
                className="px-4 py-2 border border-border-color rounded hover:bg-gray-50 text-text-secondary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (urlInputValue.trim()) {
                    validateAndSetUrl(urlInputValue.trim())
                  }
                }}
                disabled={isValidatingUrl}
                className="px-4 py-2 bg-accent text-white rounded hover:bg-accent/90 disabled:opacity-50"
              >
                {isValidatingUrl ? t('validation.checking_url') : 'Add'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Block Content */}
      <div
        className="block-content"
        onClick={e => {
          e.stopPropagation()
          if (!isSelected) {
            onSelect()
          }
        }}
      >
        {block.type === 'heading' && (
          <textarea
            ref={headingTextareaRef}
            value={block.text}
            onChange={e => {
              onUpdate({ text: e.target.value })
              // Auto-resize on change
              if (headingTextareaRef.current) {
                headingTextareaRef.current.style.height = 'auto'
                headingTextareaRef.current.style.height = `${headingTextareaRef.current.scrollHeight}px`
              }
            }}
            placeholder={
              isPlaceholder
                ? t('editor.placeholders.add_heading')
                : t(`editor.placeholders.heading_${block.level}`)
            }
            className={`w-full bg-transparent border-none outline-none resize-none overflow-hidden leading-tight ${
              block.level === 1
                ? 'text-4xl font-bold'
                : block.level === 2
                  ? 'text-3xl font-bold'
                  : block.level === 3
                    ? 'text-2xl font-semibold'
                    : 'text-xl font-semibold'
            }`}
            style={{
              overflow: 'hidden',
              overflowY: 'hidden',
              minHeight: '1.2em',
              color: block.color || '#ffffff',
              fontFamily: block.fontFamily || 'inherit',
              caretColor: block.color || '#ffffff',
            }}
          />
        )}

        {block.type === 'text' && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <select
                value={block.size || 'medium'}
                onChange={e =>
                  onUpdate({
                    size: e.target.value as 'small' | 'medium' | 'large',
                  })
                }
                className="text-xs border border-border-color rounded px-2 py-1 bg-background"
              >
                <option value="small">{t('editor.sizes.small')}</option>
                <option value="medium">{t('editor.sizes.medium')}</option>
                <option value="large">{t('editor.sizes.large')}</option>
              </select>
            </div>
            <textarea
              ref={textareaRef}
              value={block.content}
              onChange={e => {
                onUpdate({ content: e.target.value })
                // Auto-resize on change
                if (textareaRef.current) {
                  textareaRef.current.style.height = 'auto'
                  textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
                }
              }}
              placeholder={
                isPlaceholder
                  ? t('editor.placeholders.start_typing')
                  : t('editor.placeholders.write_text')
              }
              className="w-full bg-transparent border-none outline-none resize-none overflow-hidden"
              style={{
                fontSize:
                  block.size === 'small'
                    ? '0.875rem'
                    : block.size === 'large'
                      ? '1.125rem'
                      : '1rem',
                overflow: 'hidden',
                overflowY: 'hidden',
                minHeight: '1.2em',
                lineHeight: '1.5',
                color: block.color || '#ffffff',
                fontFamily: block.fontFamily || 'inherit',
                caretColor: block.color || '#ffffff',
              }}
            />
          </div>
        )}

        {block.type === 'image' && (
          <div className="space-y-2">
            {!block.src ? (
              <div className="border-2 border-dashed border-border-color rounded-lg p-6">
                <div className="flex flex-col items-center gap-4">
                  <p className="text-sm text-text-secondary">
                    {t('editor.messages.add_image')}
                  </p>
                  <div className="flex gap-3">
                    <label className="flex flex-col items-center gap-2 px-4 py-2 bg-background border border-border-color rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <Upload className="w-5 h-5 text-text-secondary" />
                      <span className="text-xs text-text-secondary">
                        {t('editor.actions.upload')}
                        (max 50MB)
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        disabled={isUploading}
                        onChange={async e => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setIsUploading(true)
                            try {
                              const url = await uploadFile(file, 'images')
                              onUpdate({ src: url })
                            } catch (error) {
                              toast.error(
                                error instanceof Error
                                  ? error.message
                                  : 'Upload failed'
                              )
                            } finally {
                              setIsUploading(false)
                            }
                          }
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowUrlModal('image')
                        setUrlInputValue('')
                      }}
                      className="flex flex-col items-center gap-2 px-4 py-2 bg-background border border-border-color rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <LinkIcon className="w-5 h-5 text-text-secondary" />
                      <span className="text-xs text-text-secondary">
                        {t('editor.actions.paste_url')}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex gap-2 mb-2 flex-wrap">
                  <label className="text-xs px-3 py-1 bg-background border border-border-color rounded hover:bg-gray-50 text-text-secondary cursor-pointer">
                    Upload New
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploading}
                      onChange={async e => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setIsUploading(true)
                          try {
                            const url = await uploadFile(file, 'images')
                            onUpdate({ src: url })
                          } catch (error) {
                            toast.error(
                              error instanceof Error
                                ? error.message
                                : 'Upload failed'
                            )
                          } finally {
                            setIsUploading(false)
                          }
                        }
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUrlModal('image')
                      setUrlInputValue(block.src)
                    }}
                    className="text-xs px-3 py-1 bg-background border border-border-color rounded hover:bg-gray-50 text-text-secondary"
                  >
                    Change URL
                  </button>
                </div>
                <div className="mt-2 rounded-lg overflow-hidden w-full">
                  <img
                    src={block.src}
                    alt=""
                    className="w-full h-auto max-h-64 object-cover"
                    style={
                      block.crop
                        ? {
                            objectPosition: `${block.crop.x}% ${block.crop.y}%`,
                            transform: `scale(${block.crop.scale || 1})`,
                            transformOrigin: `${block.crop.x}% ${block.crop.y}%`,
                          }
                        : undefined
                    }
                  />
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCropEditor(!showCropEditor)
                    }}
                    className="text-xs px-3 py-1 bg-background border border-border-color rounded hover:bg-gray-50 text-text-secondary flex items-center gap-1"
                  >
                    <Crop className="w-3 h-3" />
                    {t('form.crop_adjust')}
                  </button>
                </div>
                {showCropEditor && (
                  <CropEditor
                    src={block.src}
                    crop={block.crop}
                    isVideo={false}
                    onSave={crop => {
                      onUpdate({ crop })
                      setShowCropEditor(false)
                    }}
                    onCancel={() => setShowCropEditor(false)}
                    t={t}
                  />
                )}
                <input
                  type="text"
                  value={block.caption || ''}
                  onChange={e => onUpdate({ caption: e.target.value })}
                  placeholder={t('editor.placeholders.caption_optional')}
                  className="w-full px-3 py-2 border border-border-color rounded bg-background text-text-primary text-sm"
                />
              </>
            )}
          </div>
        )}

        {block.type === 'video' && (
          <div className="space-y-2">
            {!block.src ? (
              <div className="border-2 border-dashed border-border-color rounded-lg p-6">
                <div className="flex flex-col items-center gap-4">
                  <p className="text-sm text-text-secondary">
                    {t('editor.messages.add_video')}
                  </p>
                  <div className="flex gap-3">
                    <label className="flex flex-col items-center gap-2 px-4 py-2 bg-background border border-border-color rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <Upload className="w-5 h-5 text-text-secondary" />
                      <span className="text-xs text-text-secondary">
                        Upload (max 50MB)
                      </span>
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        disabled={isUploading}
                        onChange={async e => {
                          const file = e.target.files?.[0]
                          if (file) {
                            setIsUploading(true)
                            try {
                              const url = await uploadFile(file, 'videos')
                              onUpdate({ src: url })
                            } catch (error) {
                              toast.error(
                                error instanceof Error
                                  ? error.message
                                  : 'Upload failed'
                              )
                            } finally {
                              setIsUploading(false)
                            }
                          }
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowUrlModal('video')
                        setUrlInputValue('')
                      }}
                      className="flex flex-col items-center gap-2 px-4 py-2 bg-background border border-border-color rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <LinkIcon className="w-5 h-5 text-text-secondary" />
                      <span className="text-xs text-text-secondary">
                        Paste URL
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="flex gap-2 mb-2 flex-wrap">
                  <label className="text-xs px-3 py-1 bg-background border border-border-color rounded hover:bg-gray-50 text-text-secondary cursor-pointer">
                    Upload New
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      disabled={isUploading}
                      onChange={async e => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setIsUploading(true)
                          try {
                            const url = await uploadFile(file, 'videos')
                            onUpdate({ src: url })
                          } catch (error) {
                            toast.error(
                              error instanceof Error
                                ? error.message
                                : 'Upload failed'
                            )
                          } finally {
                            setIsUploading(false)
                          }
                        }
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUrlModal('video')
                      setUrlInputValue(block.src)
                    }}
                    className="text-xs px-3 py-1 bg-background border border-border-color rounded hover:bg-gray-50 text-text-secondary"
                  >
                    Change URL
                  </button>
                </div>
                <div className="mt-2 rounded-lg overflow-hidden bg-black aspect-video w-full">
                  {block.src.includes('youtube.com/embed') ||
                  block.src.includes('youtu.be') ? (
                    <iframe
                      key={block.src}
                      src={block.src}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      key={block.src}
                      src={block.src}
                      className="w-full h-full object-contain"
                      style={
                        block.crop
                          ? {
                              objectPosition: `${block.crop.x}% ${block.crop.y}%`,
                              transform: `scale(${block.crop.scale || 1})`,
                              transformOrigin: `${block.crop.x}% ${block.crop.y}%`,
                            }
                          : undefined
                      }
                      controls
                      playsInline
                    />
                  )}
                </div>
                <div className="flex gap-2 items-center flex-wrap">
                  {!block.src.includes('youtube.com/embed') &&
                    !block.src.includes('youtu.be') && (
                      <button
                        type="button"
                        onClick={() => {
                          setShowCropEditor(!showCropEditor)
                        }}
                        className="text-xs px-3 py-1 bg-background border border-border-color rounded hover:bg-gray-50 text-text-secondary flex items-center gap-1"
                      >
                        <Crop className="w-3 h-3" />
                        {t('form.crop_adjust')}
                      </button>
                    )}
                </div>
                {showCropEditor &&
                  !block.src.includes('youtube.com/embed') &&
                  !block.src.includes('youtu.be') && (
                    <CropEditor
                      src={block.src}
                      crop={block.crop}
                      isVideo={true}
                      onSave={crop => {
                        onUpdate({ crop })
                        setShowCropEditor(false)
                      }}
                      onCancel={() => setShowCropEditor(false)}
                      t={t}
                    />
                  )}
                <input
                  type="text"
                  value={block.title || ''}
                  onChange={e => onUpdate({ title: e.target.value })}
                  placeholder={t('editor.placeholders.video_title_optional')}
                  className="w-full px-3 py-2 border border-border-color rounded bg-background text-text-primary text-sm"
                />
                <textarea
                  value={block.description || ''}
                  onChange={e => onUpdate({ description: e.target.value })}
                  placeholder={t('editor.placeholders.description_optional')}
                  className="w-full px-3 py-2 border border-border-color rounded bg-background text-text-primary min-h-[60px] text-sm"
                />
              </>
            )}
          </div>
        )}

        {block.type === 'carousel' && (
          <CarouselEditor
            block={block}
            onUpdate={onUpdate}
            uploadFile={uploadFile}
            isUploading={isUploading}
            setIsUploading={setIsUploading}
          />
        )}

        {block.type === 'html' && (
          <div className="space-y-2">
            <textarea
              value={block.content}
              onChange={e => onUpdate({ content: e.target.value })}
              placeholder={t('editor.placeholders.custom_html')}
              className="w-full min-h-[200px] px-3 py-2 border border-border-color rounded bg-background text-text-primary font-mono text-sm"
            />
            <div className="text-xs text-text-secondary">
              {t('editor.messages.preview_may_not_exact')}:
            </div>
            <div
              className="border border-border-color rounded p-4 bg-gray-50 max-w-full html-embed-container"
              style={{
                maxWidth: '100%',
                overflow: 'hidden',
                position: 'relative',
                zIndex: 1,
              }}
            >
              <div
                className="w-full html-embed-wrapper"
                style={{
                  maxWidth: '100%',
                }}
                dangerouslySetInnerHTML={{
                  __html: `<style>
                    /* Default styles for iframes - allow responsive containers to override */
                    iframe, embed, object {
                      max-width: 100% !important;
                    }
                    /* Only apply height: auto to iframes that are NOT absolutely positioned */
                    iframe:not([style*="absolute"]),
                    embed:not([style*="absolute"]),
                    object:not([style*="absolute"]) {
                      width: 100% !important;
                      min-height: 400px !important;
                      height: auto !important;
                    }
                    /* Allow responsive containers to work properly - iframe with absolute positioning */
                    iframe[style*="absolute"] {
                      width: 100% !important;
                      height: 100% !important;
                    }
                    /* For desktop screens, allow taller embeds */
                    @media (min-width: 768px) {
                      iframe:not([style*="absolute"]),
                      embed:not([style*="absolute"]),
                      object:not([style*="absolute"]) {
                        min-height: 600px !important;
                      }
                    }
                    @media (min-width: 1024px) {
                      iframe:not([style*="absolute"]),
                      embed:not([style*="absolute"]),
                      object:not([style*="absolute"]) {
                        min-height: 700px !important;
                      }
                    }
                    video {
                      max-width: 100% !important;
                      width: 100% !important;
                      height: auto !important;
                    }
                  </style>${block.content}`,
                }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function InsertButton({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded text-left text-sm transition-colors"
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

// Color palette - 15 colors friendly with dark theme (removed second row)
const COLOR_PALETTE = [
  '#ffffff',
  '#f0f0f0',
  '#e0e0e0',
  '#d0d0d0',
  '#c0c0c0',
  '#dda0dd',
  '#ffb6c1',
  '#98d8c8',
  '#f7dc6f',
  '#bb8fce',
  '#85c1e2',
  '#f8c471',
  '#82e0aa',
  '#f1948a',
  '#aed6f1',
]

function FontFamilySelector({
  value,
  onChange,
  onClick,
}: {
  value: string
  onChange: (fontFamily: string) => void
  onClick: (e: React.MouseEvent) => void
}) {
  const [isOpen, setIsOpen] = useState(false)
  const fonts = [
    { value: 'inherit', label: 'Default', preview: 'Default' },
    { value: 'Arial, sans-serif', label: 'Arial', preview: 'Arial' },
    { value: 'Georgia, serif', label: 'Georgia', preview: 'Georgia' },
    {
      value: "'Times New Roman', serif",
      label: 'Times New Roman',
      preview: 'Times New Roman',
    },
    {
      value: "'Courier New', monospace",
      label: 'Courier New',
      preview: 'Courier New',
    },
    { value: 'Verdana, sans-serif', label: 'Verdana', preview: 'Verdana' },
    {
      value: "'Trebuchet MS', sans-serif",
      label: 'Trebuchet MS',
      preview: 'Trebuchet MS',
    },
    {
      value: "'Comic Sans MS', cursive",
      label: 'Comic Sans MS',
      preview: 'Comic Sans MS',
    },
  ]

  const selectedFont = fonts.find(f => f.value === value) || fonts[0]

  return (
    <div className="relative">
      <button
        type="button"
        onClick={e => {
          onClick(e)
          setIsOpen(!isOpen)
        }}
        className="text-xs px-2 py-1 border border-border-color rounded bg-background text-text-primary flex items-center gap-1 min-w-[120px]"
      >
        <span style={{ fontFamily: selectedFont.value }}>
          {selectedFont.label}
        </span>
        <ChevronDown className="w-3 h-3" />
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={e => {
              onClick(e)
              setIsOpen(false)
            }}
          />
          <div className="absolute top-full left-0 mt-1 bg-background border border-border-color rounded-lg shadow-lg z-30 min-w-[200px] overflow-hidden">
            {fonts.map(font => (
              <button
                key={font.value}
                type="button"
                onClick={e => {
                  onClick(e)
                  onChange(font.value)
                  setIsOpen(false)
                }}
                className={`w-full text-left px-3 py-2 hover:bg-gray-100 text-sm transition-colors ${
                  value === font.value ? 'bg-accent/10' : ''
                }`}
                style={{ fontFamily: font.value }}
              >
                {font.preview}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function ColorPaletteSelector({
  value,
  onChange,
  onClick,
}: {
  value: string
  onChange: (color: string) => void
  onClick: (e: React.MouseEvent) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={e => {
          onClick(e)
          setIsOpen(!isOpen)
        }}
        className="w-8 h-8 border border-border-color rounded cursor-pointer flex items-center justify-center"
        style={{ backgroundColor: value }}
        title="Text color"
      >
        <div
          className="w-6 h-6 rounded"
          style={{
            backgroundColor: value,
            border: '1px solid rgba(255,255,255,0.3)',
          }}
        />
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-20"
            onClick={e => {
              onClick(e)
              setIsOpen(false)
            }}
          />
          <div
            className="absolute top-full left-0 mt-2 bg-black border border-border-color rounded-lg shadow-2xl z-30 p-6"
            style={{ minWidth: '400px' }}
          >
            <div className="grid grid-cols-6 gap-4">
              {COLOR_PALETTE.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={e => {
                    onClick(e)
                    onChange(color)
                    setIsOpen(false)
                  }}
                  className={`w-16 h-16 rounded-lg border-2 transition-all duration-200 ease-in-out ${
                    value === color
                      ? 'border-white scale-110 shadow-lg shadow-white/30 ring-2 ring-white/50'
                      : 'border-transparent hover:border-white hover:scale-110 hover:shadow-lg hover:shadow-white/20'
                  }`}
                  style={{ backgroundColor: color }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function CropEditor({
  src,
  crop,
  isVideo,
  onSave,
  onCancel,
  t,
}: {
  src: string
  crop?: { x: number; y: number; width: number; height: number; scale?: number }
  isVideo?: boolean
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

  return (
    <div className="mt-4 p-4 border border-border-color rounded-lg bg-background">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-sm font-semibold text-text-primary">
          {t('editor.headers.crop_adjust')}
        </h4>
        <button
          type="button"
          onClick={onCancel}
          className="text-text-secondary hover:text-text-primary"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-3">
        <div
          ref={containerRef}
          className="relative w-full h-64 bg-black rounded-lg overflow-hidden cursor-move"
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
    </div>
  )
}

function CarouselEditor({
  block,
  onUpdate,
  uploadFile,
  isUploading,
  setIsUploading,
}: {
  block: ContentBlock
  onUpdate: (updates: Partial<ContentBlock>) => void
  uploadFile: (file: File, folder?: string) => Promise<string>
  isUploading: boolean
  setIsUploading: React.Dispatch<React.SetStateAction<boolean>>
}) {
  const t = useTranslations()
  if (block.type !== 'carousel') return null

  const addSlide = () => {
    const newSlides = [...block.slides, { description: '' }]
    onUpdate({ slides: newSlides })
  }

  const updateSlide = (
    index: number,
    updates: Partial<(typeof block.slides)[0]>
  ) => {
    const newSlides = [...block.slides]
    console.log('Before update:', newSlides[index])
    newSlides[index] = { ...newSlides[index], ...updates }
    console.log('After update:', newSlides[index])
    console.log('Updates applied:', updates)
    onUpdate({ slides: newSlides })
  }

  const deleteSlide = (index: number) => {
    const newSlides = block.slides.filter((_, i) => i !== index)
    onUpdate({ slides: newSlides })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-text-primary">
          {t('editor.carousel.title').replace(
            '{count}',
            block.slides.length.toString()
          )}
        </h4>
        <Button
          type="button"
          onClick={addSlide}
          size="sm"
          variant="outline"
          className="hover:text-black"
        >
          <Plus className="w-4 h-4 mr-1" />
          {t('editor.carousel.add_slide')}
        </Button>
      </div>
      {block.slides.map((slide, index) => (
        <div
          key={index}
          className="border border-border-color rounded-lg p-4 space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-text-secondary">
              {t('editor.carousel.slide_number').replace(
                '{number}',
                (index + 1).toString()
              )}
            </span>
            {block.slides.length > 1 && (
              <button
                onClick={() => deleteSlide(index)}
                className="text-red-600 hover:text-red-700 text-sm"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
          <input
            type="text"
            value={slide.title || ''}
            onChange={e => updateSlide(index, { title: e.target.value })}
            placeholder="Title (optional)"
            className="w-full px-3 py-2 border border-border-color rounded bg-background text-text-primary text-sm"
          />
          {!slide.image && !slide.video ? (
            <div className="border-2 border-dashed border-border-color rounded-lg p-4">
              <div className="flex flex-col items-center gap-3">
                <p className="text-xs text-text-secondary">
                  {t('editor.carousel.add_image_or_video')}
                </p>
                <div className="flex gap-2">
                  <label className="flex flex-col items-center gap-1 px-3 py-2 bg-background border border-border-color rounded cursor-pointer hover:bg-gray-50 transition-colors">
                    <ImageIcon className="w-4 h-4 text-text-secondary" />
                    <span className="text-xs text-text-secondary">Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={isUploading}
                      onChange={async e => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setIsUploading(true)
                          try {
                            const url = await uploadFile(file, 'images')
                            updateSlide(index, {
                              image: url,
                              video: undefined,
                            })
                          } catch (error) {
                            toast.error(
                              error instanceof Error
                                ? error.message
                                : 'Upload failed'
                            )
                          } finally {
                            setIsUploading(false)
                          }
                        }
                      }}
                    />
                  </label>
                  <label className="flex flex-col items-center gap-1 px-3 py-2 bg-background border border-border-color rounded cursor-pointer hover:bg-gray-50 transition-colors">
                    <Video className="w-4 h-4 text-text-secondary" />
                    <span className="text-xs text-text-secondary">Video</span>
                    <input
                      type="file"
                      accept="video/*"
                      className="hidden"
                      disabled={isUploading}
                      onChange={async e => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setIsUploading(true)
                          try {
                            const url = await uploadFile(file, 'videos')
                            updateSlide(index, {
                              video: url,
                              image: undefined,
                            })
                          } catch (error) {
                            toast.error(
                              error instanceof Error
                                ? error.message
                                : 'Upload failed'
                            )
                          } finally {
                            setIsUploading(false)
                          }
                        }
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      const url = prompt(t('prompts.enter_url'))
                      if (url) {
                        // First, try to detect media type from URL pattern
                        const isImage =
                          /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i.test(
                            url
                          )
                        const isVideo =
                          /\.(mp4|webm|ogg|avi|mov|wmv|flv|m4v)(\?.*)?$/i.test(
                            url
                          )

                        console.log('URL detection:', { url, isImage, isVideo })

                        let mediaType: 'image' | 'video' = 'video' // Default to video

                        if (isImage) {
                          mediaType = 'image'
                        } else if (isVideo) {
                          mediaType = 'video'
                        } else {
                          // If we can't determine from URL, try to validate it
                          // Use permissive validation to avoid CORS issues
                          try {
                            const isValid = await isUrlValid(url, false) // Use permissive validation
                            if (isValid) {
                              // Try to determine content type from response
                              try {
                                const response = await fetch(url, {
                                  method: 'HEAD',
                                })
                                const contentType =
                                  response.headers.get('content-type') || ''
                                if (contentType.startsWith('image/')) {
                                  mediaType = 'image'
                                } else if (contentType.startsWith('video/')) {
                                  mediaType = 'video'
                                }
                              } catch (headError) {
                                console.warn(
                                  'Could not determine content type from HEAD request:',
                                  headError
                                )
                                // If HEAD fails, keep the default (video)
                              }
                            } else {
                              toast.error(t('validation.invalid_media_url'))
                              return
                            }
                          } catch (validationError) {
                            console.error('Validation error:', validationError)
                            toast.error(t('validation.invalid_media_url'))
                            return
                          }
                        }

                        // Update the slide with the detected media type
                        if (mediaType === 'image') {
                          updateSlide(index, { image: url, video: undefined })
                        } else {
                          updateSlide(index, { video: url, image: undefined })
                        }
                      }
                    }}
                    className="flex flex-col items-center gap-1 px-3 py-2 bg-background border border-border-color rounded hover:bg-gray-50 transition-colors"
                  >
                    <LinkIcon className="w-4 h-4 text-text-secondary" />
                    <span className="text-xs text-text-secondary">URL</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              <label className="text-xs px-2 py-1 bg-background border border-border-color rounded hover:bg-gray-50 text-text-secondary cursor-pointer">
                {t('editor.buttons.change_image')}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={isUploading}
                  onChange={async e => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setIsUploading(true)
                      try {
                        const url = await uploadFile(file, 'images')
                        updateSlide(index, {
                          image: url,
                          video: undefined,
                        })
                      } catch (error) {
                        toast.error(
                          error instanceof Error
                            ? error.message
                            : 'Upload failed'
                        )
                      } finally {
                        setIsUploading(false)
                      }
                    }
                  }}
                />
              </label>
              <label className="text-xs px-2 py-1 bg-background border border-border-color rounded hover:bg-gray-50 text-text-secondary cursor-pointer">
                {t('editor.buttons.change_video')}
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  disabled={isUploading}
                  onChange={async e => {
                    const file = e.target.files?.[0]
                    if (file) {
                      setIsUploading(true)
                      try {
                        const url = await uploadFile(file, 'videos')
                        updateSlide(index, {
                          video: url,
                          image: undefined,
                        })
                      } catch (error) {
                        toast.error(
                          error instanceof Error
                            ? error.message
                            : 'Upload failed'
                        )
                      } finally {
                        setIsUploading(false)
                      }
                    }
                  }}
                />
              </label>
              <button
                type="button"
                onClick={async () => {
                  const url = prompt(
                    t('prompts.enter_url'),
                    slide.image || slide.video
                  )
                  if (url) {
                    const isValid = await isUrlValid(url, true)
                    if (isValid) {
                      if (url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                        updateSlide(index, { image: url, video: undefined })
                      } else {
                        updateSlide(index, { video: url, image: undefined })
                      }
                    } else {
                      toast.error(t('validation.invalid_media_url'))
                    }
                  }
                }}
                className="text-xs px-2 py-1 bg-background border border-border-color rounded hover:bg-gray-50 text-text-secondary"
              >
                {t('editor.buttons.change_url')}
              </button>
            </div>
          )}
          <textarea
            value={slide.description}
            onChange={e => updateSlide(index, { description: e.target.value })}
            placeholder={t('editor.placeholders.description')}
            className="w-full px-3 py-2 border border-border-color rounded bg-background text-text-primary min-h-[60px]"
          />
          {(slide.image || slide.video) && (
            <div className="mt-2 rounded-lg overflow-hidden bg-black aspect-video">
              {slide.video ? (
                <video
                  key={slide.video}
                  src={slide.video}
                  className="w-full h-full object-cover pointer-events-none"
                  controls={false}
                  muted
                  playsInline
                  autoPlay
                  loop
                  poster=""
                  onLoadedData={e => {
                    const video = e.currentTarget
                    video.currentTime = 0.1
                    console.log('Video loaded:', slide.video)
                  }}
                  onError={e => {
                    console.error('Video error:', e, 'for URL:', slide.video)
                  }}
                  onCanPlay={e => {
                    const video = e.currentTarget
                    video.play().catch(error => {
                      console.warn(
                        'Autoplay prevented, trying to show first frame'
                      )
                      video.currentTime = 0.1
                    })
                  }}
                />
              ) : slide.image ? (
                <img
                  src={slide.image}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : null}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
