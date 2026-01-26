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
  Sparkles,
  Lightbulb,
  BarChart3,
  AlertTriangle,
  Target,
} from 'lucide-react'
import {
  MarketValidationResult,
  MarketValidationTab,
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
  MarketSnapshotSection,
  BehavioralHypothesesSection,
  MarketSignalsSection,
  ConflictsGapsSection,
  SynthesisNextStepsSection,
} from './deep-research'

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
  const [research, setResearch] = useState<MarketValidationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentVersion, setCurrentVersion] = useState(1)
  const [totalVersions, setTotalVersions] = useState(0)
  const [showCreditConfirm, setShowCreditConfirm] = useState(false)
  const [activeTab, setActiveTab] = useState<MarketValidationTab>('market_snapshot')

  const { plan, dailyCredits, usedCredits } = useAppSelector(
    state => state.credits
  )
  const remainingCredits =
    plan === 'innovator' ? Infinity : dailyCredits - usedCredits
  // Market validation costs 10 credits (updated from 8)
  const creditCost = 10
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
      setResearch(cachedResearch as MarketValidationResult)
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
          description,
          tags,
          language: locale as 'en' | 'es',
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (
          response.status === 429 &&
          errorData.error === 'AI_RATE_LIMIT_EXCEEDED'
        ) {
          throw new Error('AI_RATE_LIMIT_EXCEEDED')
        }
        throw new Error(errorData.error || 'Failed to perform market validation')
      }

      const result: MarketValidationResult = await response.json()

      deepResearchStorage.saveResearch(
        result,
        title,
        description || '',
        content.length,
        tags
      )

      setResearch(result)
      setIsExpanded(true)
      setActiveTab('market_snapshot')

      const history = deepResearchStorage.getResearchHistory({
        title,
        description: description || '',
        contentLength: content.length,
        tags,
      })
      setTotalVersions(history.versions.length)
      setCurrentVersion(history.currentVersion)
    } catch (err) {
      console.error('Market validation error:', err)
      setError(
        err instanceof Error ? err.message : 'Failed to perform market validation'
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
      setResearch(versionData.research as MarketValidationResult)
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

  const getTabIcon = (tab: MarketValidationTab) => {
    const icons: Record<MarketValidationTab, React.ReactNode> = {
      market_snapshot: <Sparkles className="w-4 h-4" />,
      behavioral_hypotheses: <Lightbulb className="w-4 h-4" />,
      market_signals: <BarChart3 className="w-4 h-4" />,
      conflicts_gaps: <AlertTriangle className="w-4 h-4" />,
      synthesis: <Target className="w-4 h-4" />,
    }
    return icons[tab]
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
          className="w-full h-16 relative bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed overflow-visible"
        >
          <div className="flex items-center justify-center gap-3 px-6">
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t('market_validation.researching')}</span>
              </>
            ) : (
              <>
                <Search className="w-6 h-6" />
                <div className="flex flex-col items-center">
                  <span>
                    {research
                      ? t('market_validation.view_validation')
                      : t('market_validation.get_validation')}
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
        featureName={t('market_validation.feature_name')}
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
            className="mt-4 space-y-4 p-6 bg-white dark:bg-gray-800 rounded-lg border-2 border-purple-400 dark:border-purple-600 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {t('market_validation.title')}
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

            {/* 5 Section Tab Navigation */}
            <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
              <button
                type="button"
                onClick={() => setActiveTab('market_snapshot')}
                className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === 'market_snapshot'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {getTabIcon('market_snapshot')}
                <span className="hidden sm:inline">{t('market_validation.tabs.market_snapshot')}</span>
                <span className="sm:hidden">Snapshot</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('behavioral_hypotheses')}
                className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === 'behavioral_hypotheses'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {getTabIcon('behavioral_hypotheses')}
                <span className="hidden sm:inline">{t('market_validation.tabs.behavioral_hypotheses')}</span>
                <span className="sm:hidden">Hypotheses</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('market_signals')}
                className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === 'market_signals'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {getTabIcon('market_signals')}
                <span className="hidden sm:inline">{t('market_validation.tabs.market_signals')}</span>
                <span className="sm:hidden">Signals</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('conflicts_gaps')}
                className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === 'conflicts_gaps'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {getTabIcon('conflicts_gaps')}
                <span className="hidden sm:inline">{t('market_validation.tabs.conflicts_gaps')}</span>
                <span className="sm:hidden">Issues</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('synthesis')}
                className={`flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === 'synthesis'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {getTabIcon('synthesis')}
                <span className="hidden sm:inline">{t('market_validation.tabs.synthesis')}</span>
                <span className="sm:hidden">Summary</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px]">
              {activeTab === 'market_snapshot' && (
                <MarketSnapshotSection snapshot={research.marketSnapshot} />
              )}

              {activeTab === 'behavioral_hypotheses' && (
                <BehavioralHypothesesSection hypotheses={research.behavioralHypotheses} />
              )}

              {activeTab === 'market_signals' && (
                <MarketSignalsSection signals={research.marketSignals} />
              )}

              {activeTab === 'conflicts_gaps' && (
                <ConflictsGapsSection conflictsAndGaps={research.conflictsAndGaps} />
              )}

              {activeTab === 'synthesis' && (
                <SynthesisNextStepsSection synthesis={research.synthesisAndNextSteps} />
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700 gap-4">
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
                  className="px-4 py-2 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
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
              {t('market_validation.disclaimer')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
