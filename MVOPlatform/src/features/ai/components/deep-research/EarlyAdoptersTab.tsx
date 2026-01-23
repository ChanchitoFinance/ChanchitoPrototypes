'use client'

import { ExternalLink, Users, Twitter, MessageCircle } from 'lucide-react'
import { EarlyAdopter } from '@/core/types/ai'
import { useTranslations } from '@/shared/components/providers/I18nProvider'

interface EarlyAdoptersTabProps {
  earlyAdopters: EarlyAdopter[]
}

export function EarlyAdoptersTab({ earlyAdopters }: EarlyAdoptersTabProps) {
  const t = useTranslations()

  const twitterAdopters = earlyAdopters.filter(a => a.platform === 'twitter')
  const redditAdopters = earlyAdopters.filter(a => a.platform === 'reddit')

  const renderAdopterCard = (adopter: EarlyAdopter) => (
    <div
      key={adopter.id}
      className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {adopter.platform === 'twitter' ? (
              <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Twitter className="w-3.5 h-3.5 text-blue-500" />
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <MessageCircle className="w-3.5 h-3.5 text-orange-500" />
              </div>
            )}
            <a
              href={adopter.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline truncate"
            >
              {adopter.platform === 'twitter' ? '@' : 'u/'}
              {adopter.username}
            </a>
            {adopter.displayName && (
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                ({adopter.displayName})
              </span>
            )}
          </div>
          <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2 mb-2">
            {adopter.postContent}
          </p>
          <div className="flex items-center gap-3">
            <a
              href={adopter.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              {t('deep_research.early_adopters.view_post')}
            </a>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {new Date(adopter.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="flex-shrink-0">
          <div
            className={`px-2 py-1 rounded text-xs font-medium ${
              adopter.relevanceScore >= 0.7
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                : adopter.relevanceScore >= 0.4
                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            {Math.round(adopter.relevanceScore * 100)}%
          </div>
        </div>
      </div>
    </div>
  )

  const noDataAvailable = twitterAdopters.length === 0 && redditAdopters.length === 0

  return (
    <div className="space-y-6">
      {/* Description */}
      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <div className="flex items-start gap-3">
          <Users className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t('deep_research.early_adopters.description')}
          </p>
        </div>
      </div>

      {noDataAvailable ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="font-medium mb-1">{t('deep_research.early_adopters.no_data')}</p>
          <p className="text-sm">{t('deep_research.early_adopters.no_data_hint')}</p>
        </div>
      ) : (
        <>
          {/* Twitter/X Section */}
          {twitterAdopters.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Twitter className="w-4 h-4 text-blue-500" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                  {t('deep_research.early_adopters.from_twitter')}
                </h4>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                  {twitterAdopters.length}
                </span>
              </div>
              <div className="space-y-2">
                {twitterAdopters.map(renderAdopterCard)}
              </div>
            </div>
          )}

          {/* Reddit Section */}
          {redditAdopters.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-orange-500" />
                </div>
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                  {t('deep_research.early_adopters.from_reddit')}
                </h4>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                  {redditAdopters.length}
                </span>
              </div>
              <div className="space-y-2">
                {redditAdopters.map(renderAdopterCard)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
