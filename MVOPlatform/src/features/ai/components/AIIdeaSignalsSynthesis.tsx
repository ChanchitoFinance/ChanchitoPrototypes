'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Loader2,
  ChevronDown,
  RefreshCw,
  FileText,
  BarChart3,
  MessageSquare,
  AlertTriangle,
  Target,
  Heart,
  Trash2,
  History,
} from 'lucide-react'
import type { IdeaSignalsSynthesisResult, IdeaSignalsSynthesisTab } from '@/core/types/ai'
import type { ContentBlock } from '@/core/types/content'
import { ideaService } from '@/core/lib/services/ideaService'
import { analyticsService } from '@/core/lib/services/analyticsService'
import { useTranslations, useLocale } from '@/shared/components/providers/I18nProvider'
import { useAppSelector, useAppDispatch } from '@/core/lib/hooks'
import { deductCredits } from '@/core/lib/slices/creditsSlice'
import { FULL_SYNTHESIS, RE_RUN } from '@/core/constants/coinCosts'
import { CreditConfirmationModal } from '@/shared/components/ui/CreditConfirmationModal'
import { useAnalytics } from '@/core/hooks/useAnalytics'
import {
  parseLabeledBlocks,
  SynthesisCardSection,
  SynthesisBulletListCard,
  SynthesisRisksSection,
  SynthesisSuggestedStepsCard,
  SynthesisDecisionFramingSection,
} from './synthesis'

function mapMarketValidationRow(row: any): any {
  if (!row) return null
  return {
    marketSnapshot: row.market_snapshot ?? row.marketSnapshot,
    behavioralHypotheses: row.behavioral_hypotheses ?? row.behavioralHypotheses,
    marketSignals: row.market_signals ?? row.marketSignals,
    conflictsAndGaps: row.conflicts_and_gaps ?? row.conflictsAndGaps,
    synthesisAndNextSteps: row.synthesis_and_next_steps ?? row.synthesisAndNextSteps,
    searchData: row.search_data ?? row.searchData ?? {},
  }
}

interface AIIdeaSignalsSynthesisProps {
  ideaId: string
  ideaVersionNumber: number
  title: string
  decision_making: string
  content: ContentBlock[]
}

const TAB_KEYS: IdeaSignalsSynthesisTab[] = [
  'decision_framing',
  'signal_summary',
  'what_signals_say',
  'key_risks',
  'recommendation',
  'founder_safe_summary',
]

// Map UI tab keys (snake_case) to IdeaSignalsSynthesisResult keys (camelCase)
const TAB_KEY_TO_RESULT_KEY: Record<
  IdeaSignalsSynthesisTab,
  keyof IdeaSignalsSynthesisResult
> = {
  decision_framing: 'decisionFraming',
  signal_summary: 'signalSummary',
  what_signals_say: 'whatSignalsSay',
  key_risks: 'keyRisksAndAssumptions',
  recommendation: 'recommendation',
  founder_safe_summary: 'founderSafeSummary',
}

/** Convert any value to a displayable string; never return "[object Object]". */
function valueToDisplayString(v: unknown): string {
  if (v == null) return ''
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  if (Array.isArray(v)) {
    const parts = v.map(item => valueToDisplayString(item)).filter(Boolean)
    return parts.join('\n\n')
  }
  if (typeof v === 'object') {
    const obj = v as Record<string, unknown>
    const text =
      obj.text ?? obj.content ?? obj.summary ?? obj.message ?? obj.value
    if (text != null) return valueToDisplayString(text)
    const values = Object.values(obj).map(valueToDisplayString).filter(Boolean)
    return values.join('\n\n')
  }
  return String(v)
}

function ensureSynthesisResult(raw: any): IdeaSignalsSynthesisResult | null {
  if (!raw || typeof raw !== 'object') return null
  const getStr = (camel: keyof IdeaSignalsSynthesisResult, snake?: string): string => {
    const v = raw[camel] ?? (snake ? raw[snake] : undefined)
    return valueToDisplayString(v)
  }
  return {
    decisionFraming: getStr('decisionFraming'),
    signalSummary: getStr('signalSummary'),
    whatSignalsSay: getStr('whatSignalsSay'),
    keyRisksAndAssumptions: getStr('keyRisksAndAssumptions'),
    recommendation: getStr('recommendation'),
    founderSafeSummary: getStr('founderSafeSummary'),
  }
}

export function AIIdeaSignalsSynthesis({
  ideaId,
  ideaVersionNumber,
  title,
  decision_making,
  content,
}: AIIdeaSignalsSynthesisProps) {
  const t = useTranslations()
  const { locale } = useLocale()
  const [synthesis, setSynthesis] = useState<IdeaSignalsSynthesisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [totalVersions, setTotalVersions] = useState(0)
  const [currentVersion, setCurrentVersion] = useState(1)
  const [showCreditConfirm, setShowCreditConfirm] = useState(false)
  const [confirmCost, setConfirmCost] = useState(FULL_SYNTHESIS)
  const [activeTab, setActiveTab] =
    useState<IdeaSignalsSynthesisTab>('decision_framing')

  const dispatch = useAppDispatch()
  const { user } = useAppSelector(state => state.auth)
  const { coinsBalance } = useAppSelector(state => state.credits)
  const { trackAIFeature } = useAnalytics()

  const creditCostInitial = FULL_SYNTHESIS
  const creditCostReRun = RE_RUN
  const hasCreditsInitial = coinsBalance >= creditCostInitial
  const hasCreditsReRun = coinsBalance >= creditCostReRun
  const isLastCreditsInitial = coinsBalance > 0 && coinsBalance <= creditCostInitial
  const isLastCreditsReRun = coinsBalance > 0 && coinsBalance <= creditCostReRun

  useEffect(() => {
    const loadSynthesis = async () => {
      try {
        const rows = await ideaService.getIdeaSignalsSynthesisByIdeaId(
          ideaId,
          ideaVersionNumber
        )
        if (rows.length > 0) {
          setTotalVersions(rows.length)
          const latest = rows[0]
          const normalized = ensureSynthesisResult(latest.synthesis_result)
          if (normalized) {
            setSynthesis(normalized)
            setCurrentVersion(latest.version ?? 1)
          }
        }
      } catch (err) {
        console.error('Failed to load idea signals synthesis:', err)
      }
    }
    loadSynthesis()
  }, [ideaId, ideaVersionNumber])

  const requestSynthesis = async () => {
    setLoading(true)
    setError(null)
    try {
      const [decisionEvidence, marketValidationRow] = await Promise.all([
        analyticsService.getIdeaDecisionEvidence(ideaId),
        ideaService.getLatestMarketValidation(ideaId, ideaVersionNumber),
      ])
      const marketValidation = mapMarketValidationRow(marketValidationRow)

      const response = await fetch('/api/ai/idea-signals-synthesis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaId,
          ideaVersionNumber,
          title,
          decision_making,
          content: content ?? [],
          decisionEvidence,
          marketValidation,
          language: locale as 'en' | 'es',
        }),
      })

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}))
        if (
          response.status === 429 &&
          (errData.error === 'AI_RATE_LIMIT_EXCEEDED' || response.status === 429)
        ) {
          throw new Error('AI_RATE_LIMIT_EXCEEDED')
        }
        throw new Error(errData.error || 'Synthesis failed')
      }

      const { synthesis: result } = await response.json()

      await ideaService.saveIdeaSignalsSynthesis(ideaId, ideaVersionNumber, {
        synthesisResult: result,
        language: locale,
      })

      const normalized = ensureSynthesisResult(result)
      setSynthesis(normalized ?? result)
      setIsExpanded(true)
      trackAIFeature(ideaId, 'idea_signals_synthesis', confirmCost, {
        versionNumber: ideaVersionNumber,
      })

      const rows = await ideaService.getIdeaSignalsSynthesisByIdeaId(
        ideaId,
        ideaVersionNumber
      )
      setTotalVersions(rows.length)
      const latest = rows[0]
      setCurrentVersion(latest?.version ?? 1)
    } catch (err) {
      console.error('Idea signals synthesis error:', err)
      setError(
        err instanceof Error ? err.message : t('idea_signals_synthesis.error_default')
      )
    } finally {
      setLoading(false)
    }
  }

  const getTabIcon = (tab: IdeaSignalsSynthesisTab) => {
    const icons: Record<IdeaSignalsSynthesisTab, React.ReactNode> = {
      decision_framing: <FileText className="w-4 h-4" />,
      signal_summary: <BarChart3 className="w-4 h-4" />,
      what_signals_say: <MessageSquare className="w-4 h-4" />,
      key_risks: <AlertTriangle className="w-4 h-4" />,
      recommendation: <Target className="w-4 h-4" />,
      founder_safe_summary: <Heart className="w-4 h-4" />,
    }
    return icons[tab]
  }

  const getTabLabel = (tab: IdeaSignalsSynthesisTab) =>
    t(`idea_signals_synthesis.tabs.${tab}`)
  const getTabLabelShort = (tab: IdeaSignalsSynthesisTab) =>
    t(`idea_signals_synthesis.tabs_short.${tab}`)

  const tabContent = synthesis
    ? TAB_KEYS.map(tabKey => {
        const resultKey = TAB_KEY_TO_RESULT_KEY[tabKey]
        const raw = synthesis[resultKey]
        const value = valueToDisplayString(raw)
        return { key: tabKey, value } as { key: IdeaSignalsSynthesisTab; value: string }
      })
    : []

  const changeVersion = async (version: number) => {
    try {
      const row = await ideaService.getIdeaSignalsSynthesisVersion(
        ideaId,
        ideaVersionNumber,
        version
      )
      if (row?.synthesis_result) {
        const normalized = ensureSynthesisResult(row.synthesis_result)
        if (normalized) {
          setSynthesis(normalized)
          setCurrentVersion(version)
        }
      }
    } catch (err) {
      console.error('Failed to load synthesis version:', err)
    }
  }

  const clearAllSynthesis = async () => {
    if (!window.confirm(t('idea_signals_synthesis.clear_confirm'))) return
    try {
      await ideaService.deleteIdeaSignalsSynthesis(ideaId, ideaVersionNumber)
      setSynthesis(null)
      setTotalVersions(0)
      setCurrentVersion(1)
      setIsExpanded(false)
    } catch (err) {
      console.error('Failed to clear synthesis:', err)
    }
  }

  return (
    <div className="mb-6">
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            if (!synthesis) {
              setConfirmCost(creditCostInitial)
              setShowCreditConfirm(true)
            } else {
              setIsExpanded(!isExpanded)
            }
          }}
          disabled={loading}
          className="w-full h-16 relative bg-primary-accent hover:opacity-90 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed overflow-visible"
          style={{
            background: loading || synthesis ? undefined : 'var(--primary-accent)',
          }}
        >
          <div className="flex items-center justify-center gap-3 px-6">
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t('idea_signals_synthesis.researching')}</span>
              </>
            ) : (
              <>
                <FileText className="w-6 h-6" />
                <div className="flex flex-col items-center">
                  <span>
                    {synthesis
                      ? t('idea_signals_synthesis.view_synthesis')
                      : t('idea_signals_synthesis.get_synthesis')}
                  </span>
                </div>
                {synthesis && (
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

      <CreditConfirmationModal
        isOpen={showCreditConfirm}
        onClose={() => setShowCreditConfirm(false)}
        onConfirm={async () => {
          setShowCreditConfirm(false)
          try {
            await dispatch(
              deductCredits({ userId: user?.id ?? '', amount: confirmCost })
            ).unwrap()
            requestSynthesis()
          } catch (err) {
            console.error('Error deducting coins:', err)
          }
        }}
        creditCost={confirmCost}
        featureName={t('idea_signals_synthesis.feature_name')}
        hasCredits={
          confirmCost === creditCostInitial ? hasCreditsInitial : hasCreditsReRun
        }
        isLastCredit={
          confirmCost === creditCostInitial ? isLastCreditsInitial : isLastCreditsReRun
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
              onClick={() => {
                setError(null)
                setConfirmCost(synthesis ? creditCostReRun : creditCostInitial)
                setShowCreditConfirm(true)
              }}
              className="mt-2 text-sm hover:underline font-medium"
              style={{ color: 'var(--error)' }}
            >
              {t('idea_signals_synthesis.try_again')}
            </button>
          </motion.div>
        )}

        {synthesis && isExpanded && (
          <motion.div
            key="synthesis"
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
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <FileText
                  className="w-6 h-6"
                  style={{ color: 'var(--primary-accent)' }}
                />
                <h4
                  className="font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t('idea_signals_synthesis.title')}
                </h4>
              </div>
              {totalVersions > 1 && (
                <div
                  className="flex items-center gap-2 text-sm ml-auto"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <History
                    className="w-4 h-4 flex-shrink-0"
                    style={{ color: 'var(--primary-accent)' }}
                  />
                  <span>
                    {t('idea_signals_synthesis.version_of')
                      .replace('{current}', String(currentVersion))
                      .replace('{total}', String(totalVersions))}
                  </span>
                </div>
              )}
            </div>

            <div
              className="flex flex-wrap gap-2 pb-2"
              style={{ borderBottom: '1px solid var(--border-color)' }}
            >
              {TAB_KEYS.map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-all"
                  style={{
                    backgroundColor:
                      activeTab === tab
                        ? 'var(--primary-accent)'
                        : 'var(--gray-100)',
                    color:
                      activeTab === tab
                        ? 'var(--white)'
                        : 'var(--text-secondary)',
                  }}
                >
                  {getTabIcon(tab)}
                  <span className="hidden sm:inline">{getTabLabel(tab)}</span>
                  <span className="sm:hidden">{getTabLabelShort(tab)}</span>
                </button>
              ))}
            </div>

            <div className="min-h-[200px] pt-4 space-y-4">
              {(() => {
                const value = tabContent.find(t => t.key === activeTab)?.value ?? ''
                if (!value.trim()) {
                  return (
                    <p style={{ color: 'var(--text-secondary)' }}>
                      {t('idea_signals_synthesis.no_content')}
                    </p>
                  )
                }
                switch (activeTab) {
                  case 'decision_framing':
                    return (
                      <SynthesisDecisionFramingSection content={value} />
                    )
                  case 'signal_summary':
                    return (
                      <SynthesisCardSection
                        title={t('idea_signals_synthesis.tabs.signal_summary')}
                        icon={<BarChart3 className="w-5 h-5" style={{ color: 'var(--primary-accent)' }} />}
                        blocks={parseLabeledBlocks(value)}
                        rawContent={value}
                      />
                    )
                  case 'what_signals_say':
                    return (
                      <SynthesisBulletListCard
                        title={t('idea_signals_synthesis.strong_validation_points')}
                        icon={<MessageSquare className="w-5 h-5" style={{ color: 'var(--primary-accent)' }} />}
                        content={value}
                      />
                    )
                  case 'key_risks':
                    return <SynthesisRisksSection content={value} />
                  case 'recommendation':
                    return (
                      <SynthesisSuggestedStepsCard
                        title={t('idea_signals_synthesis.suggested_next_steps')}
                        content={value}
                        icon={<Target className="w-5 h-5" style={{ color: 'var(--premium-cta)' }} />}
                      />
                    )
                  case 'founder_safe_summary':
                    return (
                      <SynthesisCardSection
                        title={t('idea_signals_synthesis.tabs.founder_safe_summary')}
                        icon={<Heart className="w-5 h-5" style={{ color: 'var(--primary-accent)' }} />}
                        blocks={parseLabeledBlocks(value)}
                        rawContent={value}
                      />
                    )
                  default:
                    return (
                      <SynthesisCardSection title={getTabLabel(activeTab)} rawContent={value} />
                    )
                }
              })()}
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
                    disabled={currentVersion <= 1}
                    className="px-3 py-1.5 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
                    style={{
                      backgroundColor: 'var(--gray-100)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {t('idea_signals_synthesis.previous_short')}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      changeVersion(Math.min(totalVersions, currentVersion + 1))
                    }
                    disabled={currentVersion >= totalVersions}
                    className="px-3 py-1.5 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
                    style={{
                      backgroundColor: 'var(--gray-100)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {t('idea_signals_synthesis.next_short')}
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
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {t('idea_signals_synthesis.regenerate')}
                </button>
                <button
                  type="button"
                  onClick={clearAllSynthesis}
                  disabled={loading}
                  className="px-4 py-2 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2"
                  style={{
                    backgroundColor: 'var(--error)',
                    color: 'var(--white)',
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                  {t('idea_signals_synthesis.clear_all')}
                </button>
              </div>
            </div>

            <p
              className="text-xs text-center"
              style={{ color: 'var(--text-secondary)' }}
            >
              {t('idea_signals_synthesis.disclaimer')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
