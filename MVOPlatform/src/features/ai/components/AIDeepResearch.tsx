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
import { MarketValidationResult, MarketValidationTab } from '@/core/types/ai'
import { ideaService } from '@/core/lib/services/ideaService'
import { ContentBlock } from '@/core/types/content'
import {
  useTranslations,
  useLocale,
} from '@/shared/components/providers/I18nProvider'
import { useAppSelector, useAppDispatch } from '@/core/lib/hooks'
import { deductCredits } from '@/core/lib/slices/creditsSlice'
import { DEEP_RESEARCH, RE_RUN } from '@/core/constants/coinCosts'
import { CreditConfirmationModal } from '@/shared/components/ui/CreditConfirmationModal'
import {
  MarketSnapshotSection,
  BehavioralHypothesesSection,
  MarketSignalsSection,
  ConflictsGapsSection,
  SynthesisNextStepsSection,
} from './deep-research'

interface AIDeepResearchProps {
  ideaId: string
  ideaVersionNumber: number
  title: string
  description: string
  content: ContentBlock[]
  tags: string[]
  onRequestResearch?: () => Promise<void>
}

export function AIDeepResearch({
  ideaId,
  ideaVersionNumber,
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
  const [confirmCost, setConfirmCost] = useState(DEEP_RESEARCH)
  const [activeTab, setActiveTab] =
    useState<MarketValidationTab>('market_snapshot')

  const dispatch = useAppDispatch()
  const { user } = useAppSelector(state => state.auth)
  const { coinsBalance } = useAppSelector(state => state.credits)
  const creditCostInitial = DEEP_RESEARCH
  const creditCostReRun = RE_RUN
  const hasCreditsInitial = coinsBalance >= creditCostInitial
  const hasCreditsReRun = coinsBalance >= creditCostReRun
  const isLastCreditsInitial =
    coinsBalance > 0 && coinsBalance <= creditCostInitial
  const isLastCreditsReRun =
    coinsBalance > 0 && coinsBalance <= creditCostReRun

  useEffect(() => {
    const loadResearch = async () => {
      try {
        const marketValidationResults =
          await ideaService.getMarketValidationByIdeaId(
            ideaId,
            ideaVersionNumber
          )
        if (marketValidationResults.length > 0) {
          setTotalVersions(marketValidationResults.length)
          const latestValidation = marketValidationResults[0]
          if (
            latestValidation.market_snapshot &&
            latestValidation.behavioral_hypotheses &&
            latestValidation.market_signals &&
            latestValidation.conflicts_and_gaps &&
            latestValidation.synthesis_and_next_steps
          ) {
            setResearch({
              marketSnapshot: latestValidation.market_snapshot,
              behavioralHypotheses: latestValidation.behavioral_hypotheses,
              marketSignals: latestValidation.market_signals,
              conflictsAndGaps: latestValidation.conflicts_and_gaps,
              synthesisAndNextSteps: latestValidation.synthesis_and_next_steps,
              searchData: latestValidation.search_data,
              timestamp: new Date(latestValidation.created_at),
              version: latestValidation.version,
            })
            setCurrentVersion(latestValidation.version)
          }
        }
      } catch (error) {
        console.error('Failed to load market validation:', error)
      }
    }

    loadResearch()
  }, [ideaId, ideaVersionNumber])

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
        throw new Error('Failed to perform market validation')
      }

      const result = await response.json()

      await ideaService.saveMarketValidation(ideaId, ideaVersionNumber, {
        marketSnapshot: result.marketSnapshot,
        behavioralHypotheses: result.behavioralHypotheses,
        marketSignals: result.marketSignals,
        conflictsAndGaps: result.conflictsAndGaps,
        synthesisAndNextSteps: result.synthesisAndNextSteps,
        searchData: result.searchData,
        language: locale,
      })

      setResearch(result)
      setIsExpanded(true)
      setActiveTab('market_snapshot')

      const marketValidationResults =
        await ideaService.getMarketValidationByIdeaId(ideaId, ideaVersionNumber)
      setTotalVersions(marketValidationResults.length)
      const latestValidation = marketValidationResults[0]
      setCurrentVersion(latestValidation.version)
    } catch (err) {
      console.error('Market validation error:', err)
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to perform market validation'
      )
    } finally {
      setLoading(false)
    }
  }

  const changeVersion = async (newVersion: number) => {
    try {
      const marketValidationResult =
        await ideaService.getMarketValidationVersion(
          ideaId,
          ideaVersionNumber,
          newVersion
        )
      if (
        marketValidationResult &&
        marketValidationResult.market_snapshot &&
        marketValidationResult.behavioral_hypotheses &&
        marketValidationResult.market_signals &&
        marketValidationResult.conflicts_and_gaps &&
        marketValidationResult.synthesis_and_next_steps
      ) {
        setResearch({
          marketSnapshot: marketValidationResult.market_snapshot,
          behavioralHypotheses: marketValidationResult.behavioral_hypotheses,
          marketSignals: marketValidationResult.market_signals,
          conflictsAndGaps: marketValidationResult.conflicts_and_gaps,
          synthesisAndNextSteps:
            marketValidationResult.synthesis_and_next_steps,
          searchData: marketValidationResult.search_data,
          timestamp: new Date(marketValidationResult.created_at),
          version: marketValidationResult.version,
        })
        setCurrentVersion(newVersion)
      }
    } catch (error) {
      console.error('Failed to load market validation version:', error)
    }
  }

  const clearAllResearch = async () => {
    if (confirm(t('ai_deep_research.clear_history_confirm'))) {
      try {
        await ideaService.deleteMarketValidation(ideaId, ideaVersionNumber)
        setResearch(null)
        setTotalVersions(0)
        setCurrentVersion(1)
        setIsExpanded(false)
      } catch (error) {
        console.error('Failed to clear market validation:', error)
      }
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
              setConfirmCost(creditCostInitial)
              setShowCreditConfirm(true)
            } else {
              setIsExpanded(!isExpanded)
            }
          }}
          disabled={loading}
          className="w-full h-16 relative bg-primary-accent hover:opacity-90 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed overflow-visible"
          style={{
            background:
              loading || research ? undefined : 'var(--primary-accent)',
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
          try {
            await dispatch(
              deductCredits({ userId: user?.id ?? '', amount: confirmCost })
            ).unwrap()
            if (onRequestResearch) onRequestResearch()
            requestResearch()
          } catch (error) {
            console.error('Error deducting coins:', error)
          }
        }}
        creditCost={confirmCost}
        featureName={t('market_validation.feature_name')}
        hasCredits={
          confirmCost === creditCostInitial ? hasCreditsInitial : hasCreditsReRun
        }
        isLastCredit={
          confirmCost === creditCostInitial
            ? isLastCreditsInitial
            : isLastCreditsReRun
        }
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
                <BarChart3
                  className="w-6 h-6"
                  style={{ color: 'var(--primary-accent)' }}
                />
                <h4
                  className="font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t('market_validation.title')}
                </h4>
              </div>
              {totalVersions > 1 && (
                <div
                  className="flex items-center gap-2 text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <History
                    className="w-4 h-4"
                    style={{ color: 'var(--primary-accent)' }}
                  />
                  <span>
                    {t('ai_deep_research.version')} {currentVersion}{' '}
                    {t('ai_deep_research.of')} {totalVersions}
                  </span>
                </div>
              )}
            </div>

            {/* 5 Section Tab Navigation */}
            <div
              className="flex flex-wrap gap-2 pb-2"
              style={{ borderBottom: '1px solid var(--border-color)' }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('market_snapshot')}
                className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-all"
                style={{
                  backgroundColor:
                    activeTab === 'market_snapshot'
                      ? 'var(--primary-accent)'
                      : 'var(--gray-100)',
                  color:
                    activeTab === 'market_snapshot'
                      ? 'var(--white)'
                      : 'var(--text-secondary)',
                }}
                onMouseEnter={e => {
                  if (activeTab !== 'market_snapshot') {
                    e.currentTarget.style.backgroundColor =
                      'var(--hover-accent)'
                    e.currentTarget.style.color = 'var(--white)'
                  }
                }}
                onMouseLeave={e => {
                  if (activeTab !== 'market_snapshot') {
                    e.currentTarget.style.backgroundColor = 'var(--gray-100)'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }
                }}
              >
                {getTabIcon('market_snapshot')}
                <span className="hidden sm:inline">
                  {t('market_validation.tabs.market_snapshot')}
                </span>
                <span className="sm:hidden">Snapshot</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('behavioral_hypotheses')}
                className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-all"
                style={{
                  backgroundColor:
                    activeTab === 'behavioral_hypotheses'
                      ? 'var(--primary-accent)'
                      : 'var(--gray-100)',
                  color:
                    activeTab === 'behavioral_hypotheses'
                      ? 'var(--white)'
                      : 'var(--text-secondary)',
                }}
                onMouseEnter={e => {
                  if (activeTab !== 'behavioral_hypotheses') {
                    e.currentTarget.style.backgroundColor =
                      'var(--hover-accent)'
                    e.currentTarget.style.color = 'var(--white)'
                  }
                }}
                onMouseLeave={e => {
                  if (activeTab !== 'behavioral_hypotheses') {
                    e.currentTarget.style.backgroundColor = 'var(--gray-100)'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }
                }}
              >
                {getTabIcon('behavioral_hypotheses')}
                <span className="hidden sm:inline">
                  {t('market_validation.tabs.behavioral_hypotheses')}
                </span>
                <span className="sm:hidden">Hypotheses</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('market_signals')}
                className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-all"
                style={{
                  backgroundColor:
                    activeTab === 'market_signals'
                      ? 'var(--primary-accent)'
                      : 'var(--gray-100)',
                  color:
                    activeTab === 'market_signals'
                      ? 'var(--white)'
                      : 'var(--text-secondary)',
                }}
                onMouseEnter={e => {
                  if (activeTab !== 'market_signals') {
                    e.currentTarget.style.backgroundColor =
                      'var(--hover-accent)'
                    e.currentTarget.style.color = 'var(--white)'
                  }
                }}
                onMouseLeave={e => {
                  if (activeTab !== 'market_signals') {
                    e.currentTarget.style.backgroundColor = 'var(--gray-100)'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }
                }}
              >
                {getTabIcon('market_signals')}
                <span className="hidden sm:inline">
                  {t('market_validation.tabs.market_signals')}
                </span>
                <span className="sm:hidden">Signals</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('conflicts_gaps')}
                className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-all"
                style={{
                  backgroundColor:
                    activeTab === 'conflicts_gaps'
                      ? 'var(--primary-accent)'
                      : 'var(--gray-100)',
                  color:
                    activeTab === 'conflicts_gaps'
                      ? 'var(--white)'
                      : 'var(--text-secondary)',
                }}
                onMouseEnter={e => {
                  if (activeTab !== 'conflicts_gaps') {
                    e.currentTarget.style.backgroundColor =
                      'var(--hover-accent)'
                    e.currentTarget.style.color = 'var(--white)'
                  }
                }}
                onMouseLeave={e => {
                  if (activeTab !== 'conflicts_gaps') {
                    e.currentTarget.style.backgroundColor = 'var(--gray-100)'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }
                }}
              >
                {getTabIcon('conflicts_gaps')}
                <span className="hidden sm:inline">
                  {t('market_validation.tabs.conflicts_gaps')}
                </span>
                <span className="sm:hidden">Issues</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('synthesis')}
                className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-all"
                style={{
                  backgroundColor:
                    activeTab === 'synthesis'
                      ? 'var(--primary-accent)'
                      : 'var(--gray-100)',
                  color:
                    activeTab === 'synthesis'
                      ? 'var(--white)'
                      : 'var(--text-secondary)',
                }}
                onMouseEnter={e => {
                  if (activeTab !== 'synthesis') {
                    e.currentTarget.style.backgroundColor =
                      'var(--hover-accent)'
                    e.currentTarget.style.color = 'var(--white)'
                  }
                }}
                onMouseLeave={e => {
                  if (activeTab !== 'synthesis') {
                    e.currentTarget.style.backgroundColor = 'var(--gray-100)'
                    e.currentTarget.style.color = 'var(--text-secondary)'
                  }
                }}
              >
                {getTabIcon('synthesis')}
                <span className="hidden sm:inline">
                  {t('market_validation.tabs.synthesis')}
                </span>
                <span className="sm:hidden">Summary</span>
              </button>
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px]">
              {activeTab === 'market_snapshot' && (
                <MarketSnapshotSection snapshot={research.marketSnapshot} />
              )}

              {activeTab === 'behavioral_hypotheses' && (
                <BehavioralHypothesesSection
                  hypotheses={research.behavioralHypotheses}
                />
              )}

              {activeTab === 'market_signals' && (
                <MarketSignalsSection signals={research.marketSignals} />
              )}

              {activeTab === 'conflicts_gaps' && (
                <ConflictsGapsSection
                  conflictsAndGaps={research.conflictsAndGaps}
                />
              )}

              {activeTab === 'synthesis' && (
                <SynthesisNextStepsSection
                  synthesis={research.synthesisAndNextSteps}
                />
              )}
            </div>

            <div
              className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4"
              style={{ borderTop: '1px solid var(--border-color)' }}
            >
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
                    onMouseEnter={e => {
                      if (currentVersion !== 1) {
                        e.currentTarget.style.backgroundColor =
                          'var(--hover-accent)'
                        e.currentTarget.style.color = 'var(--white)'
                      }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = 'var(--gray-100)'
                      e.currentTarget.style.color = 'var(--text-secondary)'
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
                    onMouseEnter={e => {
                      if (currentVersion !== totalVersions) {
                        e.currentTarget.style.backgroundColor =
                          'var(--hover-accent)'
                        e.currentTarget.style.color = 'var(--white)'
                      }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = 'var(--gray-100)'
                      e.currentTarget.style.color = 'var(--text-secondary)'
                    }}
                  >
                    {t('ai_deep_research.next')}
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmCost(creditCostReRun)
                    setShowCreditConfirm(true)
                  }}
                  disabled={loading}
                  className="px-4 py-2 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2"
                  style={{
                    backgroundColor: 'var(--primary-accent)',
                    color: 'var(--white)',
                  }}
                  onMouseEnter={e => {
                    if (!loading) {
                      e.currentTarget.style.opacity = '0.85'
                    }
                  }}
                  onMouseLeave={e => {
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
                  onMouseEnter={e => {
                    e.currentTarget.style.opacity = '0.85'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.opacity = '1'
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  {t('ai_deep_research.clear_all')}
                </button>
              </div>
            </div>

            <p
              className="text-xs text-center"
              style={{ color: 'var(--text-secondary)' }}
            >
              {t('market_validation.disclaimer')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
