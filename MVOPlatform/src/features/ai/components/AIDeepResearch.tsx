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
  Lightbulb,
  Users,
  FileSearch,
} from 'lucide-react'
import {
  DeepResearchResult,
  EnhancedDeepResearchResult,
  DeepResearchMainTab,
} from '@/core/types/ai'
import { deepResearchStorage } from '@/core/lib/services/deepResearchStorage'
import { ContentBlock } from '@/core/types/content'
import {
  useTranslations,
  useLocale,
} from '@/shared/components/providers/I18nProvider'
import { useAppSelector } from '@/core/lib/hooks'
import { CreditConfirmationModal } from '@/shared/components/ui/CreditConfirmationModal'
import {
  HypothesesTab,
  EarlyAdoptersTab,
  DeepResearchSubTabs,
} from './deep-research'

interface AIDeepResearchProps {
  title: string
  description: string
  content: ContentBlock[]
  tags: string[]
  onRequestResearch?: () => Promise<void>
}

// Type guard to check if result is enhanced
function isEnhancedResult(
  result: DeepResearchResult | EnhancedDeepResearchResult
): result is EnhancedDeepResearchResult {
  return 'enhanced' in result && result.enhanced === true
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
  const [research, setResearch] = useState<
    DeepResearchResult | EnhancedDeepResearchResult | null
  >(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentVersion, setCurrentVersion] = useState(1)
  const [totalVersions, setTotalVersions] = useState(0)
  const [showCreditConfirm, setShowCreditConfirm] = useState(false)
  const [mainTab, setMainTab] = useState<DeepResearchMainTab>('hypotheses')

  const { plan, dailyCredits, usedCredits } = useAppSelector(
    state => state.credits
  )
  const remainingCredits =
    plan === 'innovator' ? Infinity : dailyCredits - usedCredits
  // Enhanced research costs 8 credits
  const creditCost = 8
  const hasCredits = remainingCredits >= creditCost
  const isLastCredits = remainingCredits >= creditCost && remainingCredits < creditCost + 5

  useEffect(() => {
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
  }, [title, description, content.length, tags])

  const requestResearch = async () => {
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
          enhanced: true, // Always request enhanced mode
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
      setMainTab('hypotheses')

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

  const isEnhanced = research && isEnhancedResult(research)

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
        creditCost={creditCost}
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

            {/* Main Tab Navigation - 3 tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
              <button
                type="button"
                onClick={() => setMainTab('hypotheses')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  mainTab === 'hypotheses'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Lightbulb className="w-4 h-4" />
                {t('deep_research.tabs.hypotheses')}
              </button>
              <button
                type="button"
                onClick={() => setMainTab('earlyAdopters')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  mainTab === 'earlyAdopters'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <Users className="w-4 h-4" />
                {t('deep_research.tabs.early_adopters')}
              </button>
              <button
                type="button"
                onClick={() => setMainTab('deepResearch')}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  mainTab === 'deepResearch'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                <FileSearch className="w-4 h-4" />
                {t('deep_research.tabs.deep_research')}
              </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px]">
              {mainTab === 'hypotheses' && (
                <HypothesesTab
                  hypotheses={isEnhanced ? research.hypotheses : []}
                />
              )}

              {mainTab === 'earlyAdopters' && (
                <EarlyAdoptersTab
                  earlyAdopters={isEnhanced ? research.earlyAdopters : []}
                />
              )}

              {mainTab === 'deepResearch' && (
                <DeepResearchSubTabs
                  googleResults={research.googleResults}
                  googleTrends={research.googleTrends}
                  bingResults={research.bingResults}
                  aiSummary={research.aiSummary}
                />
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
