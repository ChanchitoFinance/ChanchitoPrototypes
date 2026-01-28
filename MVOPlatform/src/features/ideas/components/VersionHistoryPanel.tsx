'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  GitBranch,
  ChevronDown,
  Check,
  Eye,
  Pencil,
  MessageSquare,
  ThumbsUp,
  Loader2,
} from 'lucide-react'
import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { IdeaVersionInfo } from '@/core/types/idea'
import { formatDate } from '@/core/lib/utils/date'

interface VersionHistoryPanelProps {
  versions: IdeaVersionInfo[]
  currentVersionId: string
  onSetActive: (versionId: string) => Promise<void>
  onViewVersion: (versionId: string) => void
  onEditVersion: (versionId: string) => void
  isLoading?: boolean
}

export function VersionHistoryPanel({
  versions,
  currentVersionId,
  onSetActive,
  onViewVersion,
  onEditVersion,
  isLoading = false,
}: VersionHistoryPanelProps) {
  const t = useTranslations()
  const [isExpanded, setIsExpanded] = useState(false)
  const [settingActiveId, setSettingActiveId] = useState<string | null>(null)

  const activeVersion = versions.find(v => v.isActiveVersion)
  const currentVersion = versions.find(v => v.id === currentVersionId)

  const handleSetActive = async (versionId: string) => {
    setSettingActiveId(versionId)
    try {
      await onSetActive(versionId)
    } finally {
      setSettingActiveId(null)
    }
  }

  if (versions.length <= 1) {
    return null
  }

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 rounded-lg transition-colors"
        style={{
          backgroundColor: 'var(--gray-50)',
          border: '1px solid var(--border-color)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--gray-100)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--gray-50)'
        }}
      >
        <div className="flex items-center gap-3">
          <GitBranch className="w-5 h-5 text-accent" />
          <span className="font-medium text-text-primary">
            {t('versioning.version_history')}
          </span>
          <span className="text-sm text-text-secondary">
            {t('versioning.versions_count').replace(
              '{count}',
              versions.length.toString()
            )}
          </span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-5 h-5 text-text-secondary" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 space-y-2">
              {versions.map(version => (
                <div
                  key={version.id}
                  className={`
                    p-4 rounded-lg border-2 transition-colors
                    ${
                      version.id === currentVersionId
                        ? 'border-accent bg-accent/5'
                        : version.isActiveVersion
                          ? 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/10'
                          : 'border-border-color bg-background'
                    }
                  `}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-text-primary">
                          {t('versioning.version_number').replace(
                            '{number}',
                            version.versionNumber.toString()
                          )}
                        </span>
                        {version.isActiveVersion && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                            <Check className="w-3 h-3" />
                            {t('versioning.active_version')}
                          </span>
                        )}
                        {version.id === currentVersionId &&
                          !version.isActiveVersion && (
                            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-accent/20 text-accent">
                              {t('versioning.current_version')}
                            </span>
                          )}
                      </div>

                      <p className="text-sm text-text-secondary mb-2 line-clamp-1">
                        {version.title}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-text-secondary">
                        <span>
                          {t('versioning.created_on').replace(
                            '{date}',
                            formatDate(version.createdAt)
                          )}
                        </span>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" />
                          <span>{version.votes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>{version.commentCount}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        type="button"
                        onClick={() => onViewVersion(version.id)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--text-primary)'
                          e.currentTarget.style.backgroundColor = 'var(--gray-100)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--text-secondary)'
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                        title={t('versioning.view_version')}
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => onEditVersion(version.id)}
                        className="p-2 rounded-lg transition-colors"
                        style={{ color: 'var(--text-secondary)' }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--text-primary)'
                          e.currentTarget.style.backgroundColor = 'var(--gray-100)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'var(--text-secondary)'
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }}
                        title={t('versioning.edit_version')}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      {!version.isActiveVersion && (
                        <button
                          type="button"
                          onClick={() => handleSetActive(version.id)}
                          disabled={
                            isLoading || settingActiveId === version.id
                          }
                          className="px-3 py-1.5 text-xs font-medium bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                        >
                          {settingActiveId === version.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )}
                          {t('versioning.set_as_active')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
