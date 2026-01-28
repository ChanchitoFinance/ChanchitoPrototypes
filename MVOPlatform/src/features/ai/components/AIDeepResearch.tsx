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
  TrendingUp,
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
          className="w-full h-16 relative bg-primary-accent hover:opacity-90 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed overflow-visible"
          style={{
            background: loading || research ? undefined : 'var(--primary-accent)',
          }}
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
            className="mt-4 p-4 rounded-lg"
            style={{
              backgroundColor: 'rgba(255, 148, 76, 0.1)',
              border: '1px solid var(--error)',
            }}
          >
            <p className="text-sm" style={{ color: 'var(--error)' }}>
              {error}
            </p>
            <button
              type="button"
              onClick={requestResearch}
              className="mt-2 text-sm hover:underline font-medium"
              style={{ color: 'var(--error)' }}
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
            className="mt-4 space-y-4 p-6 rounded-lg shadow-lg"
            style={{
              backgroundColor: 'var(--gray-50)',
              border: '2px solid var(--primary-accent)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-6 h-6" style={{ color: 'var(--primary-accent)' }} />
                <h4 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {t('market_validation.title')}
                </h4>
              </div>
              {totalVersions > 1 && (
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <History className="w-4 h-4" style={{ color: 'var(--primary-accent)' }} />
                  <span>
                    {t('ai_deep_research.version')} {currentVersion}{' '}
                    {t('ai_deep_research.of')} {totalVersions}
                  </span>
                </div>
              )}
            </div>

            {/* 5 Section Tab Navigation */}
            <div className="flex flex-wrap gap-2 pb-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <button
                type="button"
                onClick={() => setActiveTab('market_snapshot')}
                className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-all"
                style={{
                  backgroundColor: activeTab === 'market_snapshot' ? 'var(--primary-accent)' : 'var(--gray-100)',
                  color: activeTab === 'market_snapshot' ? 'var(--white)' : 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'market_snapshot') {
                    e.currentTarget.style.backgroundColor = 'var(--hover-accent)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'market_snapshot') {
                    e.currentTarget.style.backgroundColor = 'var(--gray-100)'
                  }
                }}
              >
                {getTabIcon('market_snapshot')}
                <span className="hidden sm:inline">{t('market_validation.tabs.market_snapshot')}</span>
                <span className="sm:hidden">Snapshot</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('behavioral_hypotheses')}
                className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-all"
                style={{
                  backgroundColor: activeTab === 'behavioral_hypotheses' ? 'var(--primary-accent)' : 'var(--gray-100)',
                  color: activeTab === 'behavioral_hypotheses' ? 'var(--white)' : 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'behavioral_hypotheses') {
                    e.currentTarget.style.backgroundColor = 'var(--hover-accent)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'behavioral_hypotheses') {
                    e.currentTarget.style.backgroundColor = 'var(--gray-100)'
                  }
                }}
              >
                {getTabIcon('behavioral_hypotheses')}
                <span className="hidden sm:inline">{t('market_validation.tabs.behavioral_hypotheses')}</span>
                <span className="sm:hidden">Hypotheses</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('market_signals')}
                className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-all"
                style={{
                  backgroundColor: activeTab === 'market_signals' ? 'var(--primary-accent)' : 'var(--gray-100)',
                  color: activeTab === 'market_signals' ? 'var(--white)' : 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'market_signals') {
                    e.currentTarget.style.backgroundColor = 'var(--hover-accent)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'market_signals') {
                    e.currentTarget.style.backgroundColor = 'var(--gray-100)'
                  }
                }}
              >
                {getTabIcon('market_signals')}
                <span className="hidden sm:inline">{t('market_validation.tabs.market_signals')}</span>
                <span className="sm:hidden">Signals</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('conflicts_gaps')}
                className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-all"
                style={{
                  backgroundColor: activeTab === 'conflicts_gaps' ? 'var(--primary-accent)' : 'var(--gray-100)',
                  color: activeTab === 'conflicts_gaps' ? 'var(--white)' : 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'conflicts_gaps') {
                    e.currentTarget.style.backgroundColor = 'var(--hover-accent)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'conflicts_gaps') {
                    e.currentTarget.style.backgroundColor = 'var(--gray-100)'
                  }
                }}
              >
                {getTabIcon('conflicts_gaps')}
                <span className="hidden sm:inline">{t('market_validation.tabs.conflicts_gaps')}</span>
                <span className="sm:hidden">Issues</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('synthesis')}
                className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-all"
                style={{
                  backgroundColor: activeTab === 'synthesis' ? 'var(--primary-accent)' : 'var(--gray-100)',
                  color: activeTab === 'synthesis' ? 'var(--white)' : 'var(--text-secondary)',
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== 'synthesis') {
                    e.currentTarget.style.backgroundColor = 'var(--hover-accent)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeTab !== 'synthesis') {
                    e.currentTarget.style.backgroundColor = 'var(--gray-100)'
                  }
                }}
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

            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4" style={{ borderTop: '1px solid var(--border-color)' }}>
              {totalVersions > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      changeVersion(Math.max(1, currentVersion - 1))
                    }
                    disabled={currentVersion === 1}
                    className="px-3 py-1.5 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
                    style={{
                      backgroundColor: 'var(--gray-100)',
                      color: 'var(--text-secondary)',
                    }}
                    onMouseEnter={(e) => {
                      if (currentVersion !== 1) {
                        e.currentTarget.style.backgroundColor = 'var(--hover-accent)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--gray-100)'
                    }}
                  >
                    {t('ai_deep_research.previous')}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      changeVersion(Math.min(totalVersions, currentVersion + 1))
                    }
                    disabled={currentVersion === totalVersions}
                    className="px-3 py-1.5 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
                    style={{
                      backgroundColor: 'var(--gray-100)',
                      color: 'var(--text-secondary)',
                    }}
                    onMouseEnter={(e) => {
                      if (currentVersion !== totalVersions) {
                        e.currentTarget.style.backgroundColor = 'var(--hover-accent)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--gray-100)'
                    }}
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
                  className="px-4 py-2 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2"
                  style={{
                    backgroundColor: 'var(--primary-accent)',
                    color: 'var(--white)',
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.opacity = '0.85'
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1'
                  }}
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
                  className="px-4 py-2 text-sm rounded-lg transition-all font-medium flex items-center gap-2"
                  style={{
                    backgroundColor: 'var(--error)',
                    color: 'var(--white)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.85'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1'
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  {t('ai_deep_research.clear_all')}
                </button>
              </div>
            </div>

            <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
              {t('market_validation.disclaimer')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
