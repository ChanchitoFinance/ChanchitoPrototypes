'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Users, Lock, Globe } from 'lucide-react'
import { SpaceWithTeam } from '@/lib/services/teamService'
import { useTranslations, useLocale } from '@/components/providers/I18nProvider'
import Image from 'next/image'
import { formatDate } from '@/lib/utils/date'

interface SpaceCardProps {
  space: SpaceWithTeam
}

export function SpaceCard({ space }: SpaceCardProps) {
  const t = useTranslations()
  const { locale } = useLocale()
  const [imageError, setImageError] = useState(false)

  const visibilityIcons = {
    public: Globe,
    private: Lock,
  }

  const VisibilityIcon = visibilityIcons[space.visibility] || Globe

  const visibilityLabels = {
    public: t('spaces.public'),
    private: t('spaces.private'),
  }

  // Get space image/video from settings if available
  const spaceMedia =
    space.settings?.space_image || space.settings?.space_video

  return (
    <Link href={`/${locale}/spaces/${space.id}`}>
      <motion.article
        whileHover={{ y: -2 }}
        className="flex flex-col bg-background rounded-lg border border-border-color hover:border-accent/30 transition-colors overflow-hidden"
      >
        {/* Space Media - Vertical aspect ratio */}
        {spaceMedia && (
          <div className="relative w-full aspect-[3/4] mb-0 overflow-hidden bg-gradient-to-br from-accent/20 via-background to-accent/10">
            {space.settings?.space_video ? (
              <video
                src={space.settings.space_video}
                className="w-full h-full object-cover"
                style={{
                  objectPosition: space.settings?.header_crop
                    ? `${space.settings.header_crop.x}% ${space.settings.header_crop.y}%`
                    : 'center',
                  transform: space.settings?.header_crop
                    ? `scale(${space.settings.header_crop.scale || 1})`
                    : 'scale(1)',
                  transformOrigin: space.settings?.header_crop
                    ? `${space.settings.header_crop.x}% ${space.settings.header_crop.y}%`
                    : 'center',
                }}
                loop
                muted
                playsInline
                autoPlay
                preload="auto"
              />
            ) : space.settings?.space_image ? (
              <Image
                src={space.settings.space_image}
                alt={space.name}
                fill
                className="object-cover"
                style={{
                  objectPosition: space.settings?.header_crop
                    ? `${space.settings.header_crop.x}% ${space.settings.header_crop.y}%`
                    : 'center',
                  transform: space.settings?.header_crop
                    ? `scale(${space.settings.header_crop.scale || 1})`
                    : 'scale(1)',
                  transformOrigin: space.settings?.header_crop
                    ? `${space.settings.header_crop.x}% ${space.settings.header_crop.y}%`
                    : 'center',
                }}
                onError={() => setImageError(true)}
              />
            ) : null}
          </div>
        )}

        {/* Content */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-semibold text-text-primary line-clamp-2 break-words">
                  {space.name}
                </h2>
                <div title={visibilityLabels[space.visibility]}>
                  <VisibilityIcon
                    className={`w-4 h-4 flex-shrink-0 ${
                      space.visibility === 'public'
                        ? 'text-green-500'
                        : space.visibility === 'private'
                          ? 'text-gray-500'
                          : 'text-blue-500'
                    }`}
                  />
                </div>
              </div>
              {space.team && (
                <p className="text-sm text-text-secondary mb-3 line-clamp-1">
                  {space.team.name}
                </p>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-xs text-text-secondary pt-3 border-t border-border-color mt-auto">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-accent" />
              <span>
                {space.member_count || 0} {t('spaces.members')}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-text-secondary/50">•</span>
              <span>
                {space.idea_count || 0} {t('spaces.ideas')}
              </span>
            </div>
          </div>
        </div>
      </motion.article>
    </Link>
  )
}

