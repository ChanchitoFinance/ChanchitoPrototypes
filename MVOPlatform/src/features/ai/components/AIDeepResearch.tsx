'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Loader2,
  ChevronDown,
  Trash2,
  History,
  RefreshCw,
  Search,
  TrendingUp,
  Globe,
  Sparkles,
  ExternalLink,
} from 'lucide-react'
import {
  DeepResearchResult,
  GoogleSearchResult,
  GoogleTrendsData,
  BingSearchResult,
} from '@/core/types/ai'
import { deepResearchStorage } from '@/core/lib/services/deepResearchStorage'
import { ContentBlock } from '@/core/types/content'
import {
  useTranslations,
  useLocale,
} from '@/shared/components/providers/I18nProvider'
import { MarkdownRenderer } from '@/shared/components/ui/MarkdownRenderer'
import { useAppSelector } from '@/core/lib/hooks'
import { CreditConfirmationModal } from '@/shared/components/ui/CreditConfirmationModal'

interface AIDeepResearchProps {
  title: string
  description: string
  content: ContentBlock[]
  tags: string[]
  onRequestResearch?: () => Promise<void>
}

export function AIDeepResearch({
  title,
  description,
  content,
  tags,
  onRequestResearch,
}: AIDeepResearchProps) {
  const t = useTranslations()
  const { locale } = useLocale()
  const [research, setResearch] = useState<DeepResearchResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentVersion, setCurrentVersion] = useState(1)
  const [totalVersions, setTotalVersions] = useState(0)
  const [showCreditConfirm, setShowCreditConfirm] = useState(false)
  const [activeTab, setActiveTab] = useState<
    'google' | 'trends' | 'bing' | 'summary'
  >('summary')

  const { plan, dailyCredits, usedCredits } = useAppSelector(
    state => state.credits
  )
  const remainingCredits =
    plan === 'innovator' ? Infinity : dailyCredits - usedCredits
  const hasCredits = remainingCredits >= 5
  const isLastCredits = remainingCredits >= 5 && remainingCredits < 10

  const shouldShow = title.length >= 10 && tags.length > 0

  useEffect(() => {
    if (!shouldShow) return

    const cachedResearch = deepResearchStorage.getLatestResearch(
      title,
      description || '',
      content.length,
      tags
    )

    if (cachedResearch) {
      setResearch(cachedResearch)
      const history = deepResearchStorage.getResearchHistory({
        title,
        description: description || '',
        contentLength: content.length,
        tags,
      })
      setTotalVersions(history.versions.length)
      setCurrentVersion(history.currentVersion)
    }
  }, [title, description, content.length, tags, shouldShow])

  const requestResearch = async () => {
    if (!shouldShow) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/deep-research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          tags,
          language: locale as 'en' | 'es',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (
          response.status === 429 &&
          errorData.error === 'AI_DAILY_LIMIT_EXCEEDED'
        ) {
          throw new Error('AI_DAILY_LIMIT_EXCEEDED')
        }
        throw new Error(errorData.error || 'Failed to perform research')
      }

      const result = await response.json()

      deepResearchStorage.saveResearch(
        result,
        title,
        description || '',
        content.length,
        tags
      )

      setResearch(result)
      setIsExpanded(true)
      setActiveTab('summary')

      const history = deepResearchStorage.getResearchHistory({
        title,
        description: description || '',
        contentLength: content.length,
        tags,
      })
      setTotalVersions(history.versions.length)
      setCurrentVersion(history.currentVersion)
    } catch (err) {
      console.error('Deep research error:', err)
      setError(
        err instanceof Error ? err.message : 'Failed to perform research'
      )
    } finally {
      setLoading(false)
    }
  }

  const changeVersion = (newVersion: number) => {
    const history = deepResearchStorage.getResearchHistory({
      title,
      description: description || '',
      contentLength: content.length,
      tags,
    })

    const versionData = history.versions.find(v => v.version === newVersion)
    if (versionData) {
      setResearch(versionData.research)
      setCurrentVersion(newVersion)
      deepResearchStorage.setCurrentVersion(versionData.ideaHash, newVersion)
    }
  }

  const clearAllResearch = () => {
    if (confirm(t('ai_deep_research.clear_history_confirm'))) {
      deepResearchStorage.clearAllResearch()
      setResearch(null)
      setTotalVersions(0)
      setCurrentVersion(1)
      setIsExpanded(false)
    }
  }

  const renderSearchResult = (
    result: GoogleSearchResult | BingSearchResult,
    index: number
  ) => (
    <div
      key={index}
      className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <a
            href={result.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline line-clamp-1 flex items-center gap-1"
          >
            {result.title}
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
            {result.displayedLink || result.link}
          </p>
          <p className="text-xs text-gray-700 dark:text-gray-300 mt-1 line-clamp-2">
            {result.snippet}
          </p>
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 font-medium">
          #{result.position}
        </span>
      </div>
    </div>
  )

  const renderTrendData = (data: GoogleTrendsData, index: number) => (
    <div
      key={index}
      className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
    >
      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
        {data.date}
      </span>
      <div className="flex items-center gap-3">
        <div
          className="h-2.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
          style={{ width: `${data.value}px`, maxWidth: '100px' }}
        />
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 w-8 text-right">
          {data.value}
        </span>
      </div>
    </div>
  )

  if (!shouldShow) {
    return null
  }

  return (
    <div className="mb-6">
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            if (!research) {
              setShowCreditConfirm(true)
            } else {
              setIsExpanded(!isExpanded)
            }
          }}
          disabled={loading}
          className="w-full h-16 relative bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed overflow-visible"
        >
          <div className="flex items-center justify-center gap-3 px-6">
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t('ai_deep_research.researching')}</span>
              </>
            ) : (
              <>
                <Search className="w-6 h-6" />
                <div className="flex flex-col items-center">
                  <span>
                    {research
                      ? t('ai_deep_research.view_research')
                      : t('ai_deep_research.get_research')}
                  </span>
                </div>
                {research && (
                  <motion.div
                    animate={{ rotate: isExpanded ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                )}
              </>
            )}
          </div>
        </button>
      </div>

      {/* Credit Confirmation Modal */}
      <CreditConfirmationModal
        isOpen={showCreditConfirm}
        onClose={() => setShowCreditConfirm(false)}
        onConfirm={async () => {
          setShowCreditConfirm(false)
          if (onRequestResearch) {
            await onRequestResearch()
            requestResearch()
          } else {
            requestResearch()
          }
        }}
        creditCost={5}
        featureName={t('ai_deep_research.feature_name')}
        hasCredits={hasCredits}
        isLastCredit={isLastCredits}
        showNoButton={false}
      />

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-800 rounded-lg"
          >
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            <button
              type="button"
              onClick={requestResearch}
              className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline font-medium"
            >
              {t('ai_deep_research.try_again')}
            </button>
          </motion.div>
        )}

        {research && isExpanded && (
          <motion.div
            key="research"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 space-y-4 p-6 bg-white dark:bg-gray-800 rounded-lg border-2 border-blue-400 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔬</span>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {t('ai_deep_research.title')}
                </h4>
              </div>
              {totalVersions > 1 && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <History className="w-4 h-4" />
                  <span>
                    {t('ai_deep_research.version')} {currentVersion}{' '}
                    {t('ai_deep_research.of')} {totalVersions}
                  </span>
                </div>
              )}
            </div>

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('summary')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-t-lg transition-colors ${
                  activeTab === 'summary'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                {t('ai_deep_research.ai_summary')}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('google')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-t-lg transition-colors ${
                  activeTab === 'google'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Search className="w-4 h-4" />
                {t('ai_deep_research.google_search')}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('trends')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-t-lg transition-colors ${
                  activeTab === 'trends'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                {t('ai_deep_research.google_trends')}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('bing')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-t-lg transition-colors ${
                  activeTab === 'bing'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Globe className="w-4 h-4" />
                {t('ai_deep_research.bing_search')}
              </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[200px]">
              {activeTab === 'summary' && (
                <div className="p-4 bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700">
                  <MarkdownRenderer
                    content={research.aiSummary}
                    className="text-gray-800 dark:text-gray-200"
                  />
                </div>
              )}

              {activeTab === 'google' && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 font-medium">
                    {t('ai_deep_research.top_5_results')}
                  </p>
                  {research.googleResults.length > 0 ? (
                    research.googleResults.map((result, index) =>
                      renderSearchResult(result, index)
                    )
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      {t('ai_deep_research.no_results')}
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'trends' && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 font-medium">
                    {t('ai_deep_research.interest_over_time')}
                  </p>
                  {research.googleTrends.length > 0 ? (
                    <div className="space-y-2">
                      {research.googleTrends.map((data, index) =>
                        renderTrendData(data, index)
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      {t('ai_deep_research.no_trends_data')}
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'bing' && (
                <div className="space-y-2">
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 font-medium">
                    {t('ai_deep_research.top_5_results')}
                  </p>
                  {research.bingResults.length > 0 ? (
                    research.bingResults.map((result, index) =>
                      renderSearchResult(result, index)
                    )
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                      {t('ai_deep_research.no_results')}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              {totalVersions > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      changeVersion(Math.max(1, currentVersion - 1))
                    }
                    disabled={currentVersion === 1}
                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {t('ai_deep_research.previous')}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      changeVersion(Math.min(totalVersions, currentVersion + 1))
                    }
                    disabled={currentVersion === totalVersions}
                    className="px-3 py-1.5 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {t('ai_deep_research.next')}
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => setShowCreditConfirm(true)}
                  disabled={loading}
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {t('ai_deep_research.regenerate')}
                </button>
                <button
                  type="button"
                  onClick={clearAllResearch}
                  className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('ai_deep_research.clear_all')}
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {t('ai_deep_research.advisory_note')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
