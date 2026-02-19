'use client'

import { GitBranch } from 'lucide-react'
import { useTranslations } from '@/shared/components/providers/I18nProvider'

interface VersionIndicatorProps {
  versionNumber: number
  isActiveVersion: boolean
  totalVersions?: number
  onClick?: () => void
  size?: 'sm' | 'md'
}

export function VersionIndicator({
  versionNumber,
  isActiveVersion,
  totalVersions,
  onClick,
  size = 'sm',
}: VersionIndicatorProps) {
  const t = useTranslations()

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
  }

  const iconSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
  }

  const content = (
    <div
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${sizeClasses[size]}
        ${
          isActiveVersion
            ? 'bg-success/10 text-success'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
        }
        ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
      `}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      <GitBranch className={iconSize[size]} />
      <span>
        {t('versioning.version_number').replace(
          '{number}',
          versionNumber.toString()
        )}
      </span>
      {isActiveVersion && (
        <span className="ml-1 text-success">
          ({t('versioning.active_version').split(' ')[0]})
        </span>
      )}
      {totalVersions && totalVersions > 1 && (
        <span className="text-gray-500 dark:text-gray-500">
          /{totalVersions}
        </span>
      )}
    </div>
  )

  return content
}
