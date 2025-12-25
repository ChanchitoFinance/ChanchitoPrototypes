'use client'

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ContentBlock, VideoContent } from '@/lib/types/content'

interface ContentRendererProps {
  content: ContentBlock[]
}

export function ContentRenderer({ content }: ContentRendererProps) {
  return (
    <div className="space-y-8">
      {content.map((block, index) => (
        <ContentBlockRenderer key={index} block={block} index={index} />
      ))}
    </div>
  )
}

function ContentBlockRenderer({ block, index }: { block: ContentBlock; index: number }) {
  switch (block.type) {
    case 'text':
      const textSize = block.size || 'medium'
      const textSizeClasses = {
        small: 'text-sm',
        medium: 'text-base',
        large: 'text-lg',
      }
      return (
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className={`${textSizeClasses[textSize]} text-text-secondary leading-relaxed whitespace-pre-line break-words`}
          style={{
            fontFamily: block.fontFamily || undefined,
            color: block.color || undefined,
            overflowWrap: 'break-word',
            wordBreak: 'break-word',
            maxWidth: '100%',
          }}
        >
          {block.content}
        </motion.p>
      )

    case 'heading':
      const HeadingTag = `h${block.level}` as keyof JSX.IntrinsicElements
      const headingClasses = {
        1: 'text-4xl md:text-5xl font-bold',
        2: 'text-3xl md:text-4xl font-bold',
        3: 'text-2xl md:text-3xl font-semibold',
        4: 'text-xl md:text-2xl font-semibold',
      }
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <HeadingTag 
            className={`${headingClasses[block.level]} text-text-primary mb-4 break-words`}
            style={{
              fontFamily: block.fontFamily || undefined,
              color: block.color || undefined,
              overflowWrap: 'break-word',
              wordBreak: 'break-word',
              maxWidth: '100%',
            }}
          >
            {block.text}
          </HeadingTag>
        </motion.div>
      )

    case 'image':
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-100"
        >
          <Image
            src={block.src}
            alt=""
            fill
            className="object-cover"
            style={block.crop ? {
              objectPosition: `${block.crop.x}% ${block.crop.y}%`,
              transform: `scale(${block.crop.scale || 1})`,
              transformOrigin: `${block.crop.x}% ${block.crop.y}%`,
            } : undefined}
          />
          {block.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-4 text-sm">
              {block.caption}
            </div>
          )}
        </motion.div>
      )

    case 'video':
      return <VideoBlock video={block} index={index} />

    case 'carousel':
      return <CarouselBlock carousel={block} index={index} />

    case 'button':
      return <ButtonBlock button={block} index={index} />

    case 'html':
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="w-full html-embed-container"
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
                    min-height: 800px !important;
                  }
                }
                video {
                  max-width: 100% !important;
                  width: 100% !important;
                  height: auto !important;
                }
              </style>${block.content}` 
            }}
          />
        </motion.div>
      )

    case 'spacer':
      return <div style={{ height: `${block.height}px` }} />

    default:
      return null
  }
}

function VideoBlock({ video, index }: { video: VideoContent; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="space-y-4"
    >
      {video.title && (
        <h3 className="text-2xl font-semibold text-text-primary break-words" style={{
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
          maxWidth: '100%',
        }}>{video.title}</h3>
      )}
      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
        <video
          src={video.src}
          className="w-full h-full object-contain"
          style={{
            ...(video.crop ? {
              objectPosition: `${video.crop.x}% ${video.crop.y}%`,
              transform: `scale(${video.crop.scale || 1})`,
              transformOrigin: `${video.crop.x}% ${video.crop.y}%`,
            } : {}),
            zIndex: 1,
          }}
          controls
          playsInline
          preload="metadata"
        />
      </div>
      {video.description && (
        <p className="text-text-secondary text-sm break-words" style={{
          overflowWrap: 'break-word',
          wordBreak: 'break-word',
          maxWidth: '100%',
        }}>{video.description}</p>
      )}
    </motion.div>
  )
}

function CarouselBlock({ carousel, index }: { carousel: { type: 'carousel'; slides: Array<{ image?: string; video?: string; title?: string; description: string }> }; index: number }) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carousel.slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carousel.slides.length) % carousel.slides.length)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative w-full"
    >
      <div ref={containerRef} className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
        <AnimatePresence mode="wait">
          {carousel.slides.map((slide, slideIndex) => {
            if (slideIndex !== currentSlide) return null

            return (
              <motion.div
                key={slideIndex}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                {slide.video ? (
                  <VideoSlide src={slide.video} />
                ) : slide.image ? (
                  <Image
                    src={slide.image}
                    alt={slide.title || `Slide ${slideIndex + 1}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-accent/20 via-background to-accent/10 flex items-center justify-center">
                    <div className="text-center px-6 max-w-2xl">
                      <h3 className="text-3xl font-bold text-text-primary mb-4 break-words" style={{
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                        maxWidth: '100%',
                      }}>{slide.title}</h3>
                      <p className="text-lg text-text-secondary break-words" style={{
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                        maxWidth: '100%',
                      }}>{slide.description}</p>
                    </div>
                  </div>
                )}
                {/* Overlay with description - only show if not video (videos have their own controls) */}
                {!slide.video && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6">
                    <h3 className="text-xl font-bold text-white mb-2 break-words" style={{
                      overflowWrap: 'break-word',
                      wordBreak: 'break-word',
                      maxWidth: '100%',
                    }}>{slide.title}</h3>
                    <p className="text-white/90 break-words" style={{
                      overflowWrap: 'break-word',
                      wordBreak: 'break-word',
                      maxWidth: '100%',
                    }}>{slide.description}</p>
                  </div>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>

        {/* Navigation buttons */}
        {carousel.slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors z-10"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors z-10"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Slide indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {carousel.slides.map((_, slideIndex) => (
                <button
                  key={slideIndex}
                  onClick={() => setCurrentSlide(slideIndex)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    slideIndex === currentSlide
                      ? 'bg-accent w-8'
                      : 'w-2 h-2 bg-[#FFFFFF]/30 rounded-full hover:bg-[#66D3FF]/50'
                  }`}
                  aria-label={`Go to slide ${slideIndex + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}

function VideoSlide({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null)

  return (
    <div className="w-full h-full relative" style={{ zIndex: 2 }}>
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain"
        controls
        loop
        playsInline
        preload="metadata"
        style={{ zIndex: 2 }}
      />
    </div>
  )
}

function ButtonBlock({ button, index }: { button: { type: 'button'; text: string; href?: string; onClick?: string; variant?: 'primary' | 'secondary' | 'outline' }; index: number }) {
  const variantClasses = {
    primary: 'bg-accent text-text-primary hover:bg-accent/90',
    secondary: 'bg-gray-100 text-text-secondary hover:bg-gray-200',
    outline: 'border-2 border-accent text-accent hover:bg-accent/10',
  }

  const className = `inline-block px-6 py-3 rounded-lg font-semibold transition-colors ${variantClasses[button.variant || 'primary']}`

  const handleClick = () => {
    if (button.onClick) {
      // Execute JavaScript if provided (for demo purposes)
      try {
        eval(button.onClick)
      } catch (error) {
        console.error('Error executing button onClick:', error)
      }
    }
  }

  if (button.href) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
      >
        <Link href={button.href} className={className}>
          {button.text}
        </Link>
      </motion.div>
    )
  }

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onClick={handleClick}
      className={className}
    >
      {button.text}
    </motion.button>
  )
}

