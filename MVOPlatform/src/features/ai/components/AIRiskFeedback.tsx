'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Loader2,
  ChevronDown,
  ChevronUp,
  Trash2,
  History,
  RefreshCw,
  FileWarning,
  Coins,
  AlertTriangle,
  Shield,
} from 'lucide-react'
import { AIFeedback } from '@/core/types/ai'
import { aiFeedbackStorage } from '@/core/lib/services/aiFeedbackStorage'
import { ContentBlock } from '@/core/types/content'
import {
  useTranslations,
  useLocale,
} from '@/shared/components/providers/I18nProvider'
import { MarkdownRenderer } from '@/shared/components/ui/MarkdownRenderer'
import { useAppSelector, useAppDispatch } from '@/core/lib/hooks'
import { CreditConfirmationModal } from '@/shared/components/ui/CreditConfirmationModal'
import Image from 'next/image'
import { loadUserCredits } from '@/core/lib/slices/creditsSlice'

interface AIRiskFeedbackProps {
  title: string
  description: string
  content: ContentBlock[]
  tags: string[]
  isAnonymous: boolean
  onRequestFeedback?: () => Promise<void>
}

export function AIRiskFeedback({
  title,
  description,
  content,
  tags,
  isAnonymous,
  onRequestFeedback,
}: AIRiskFeedbackProps) {
  const t = useTranslations()
  const { locale } = useLocale()
  const router = useRouter()
  const [feedback, setFeedback] = useState<AIFeedback | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [currentVersion, setCurrentVersion] = useState(1)
  const [totalVersions, setTotalVersions] = useState(0)
  const [showCreditConfirm, setShowCreditConfirm] = useState(false)

  const { user } = useAppSelector(state => state.auth)
  const { plan, dailyCredits, usedCredits } = useAppSelector(
    state => state.credits
  )
  const dispatch = useAppDispatch()
  const remainingCredits =
    plan === 'innovator' ? Infinity : dailyCredits - usedCredits
  const hasCredits = remainingCredits > 0
  const isLastCredit = remainingCredits === 1

  const shouldShow = title.length >= 10 && content.length > 0

  useEffect(() => {
    if (!shouldShow) return

    const cachedFeedback = aiFeedbackStorage.getLatestFeedback(
      title,
      description || '',
      content.length,
      tags
    )

    if (cachedFeedback) {
      setFeedback(cachedFeedback)
      const history = aiFeedbackStorage.getFeedbackHistory({
        title,
        description: description || '',
        contentLength: content.length,
        tags,
      })
      setTotalVersions(history.versions.length)
      setCurrentVersion(history.currentVersion)
    }
  }, [title, description, content.length, tags, shouldShow])

  const requestFeedback = async () => {
    if (!shouldShow) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/analyze-risks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          description: description || '',
          content,
          tags,
          isAnonymous,
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
        throw new Error('Failed to analyze')
      }

      const result = await response.json()

      aiFeedbackStorage.saveFeedback(
        result,
        title,
        description || '',
        content.length,
        tags
      )

      setFeedback(result)
      setIsExpanded(true)

      const history = aiFeedbackStorage.getFeedbackHistory({
        title,
        description: description || '',
        contentLength: content.length,
        tags,
      })
      setTotalVersions(history.versions.length)
      setCurrentVersion(history.currentVersion)
    } catch (err) {
      console.error('AI feedback error:', err)
      setError(err instanceof Error ? err.message : 'Failed to analyze')
    } finally {
      setLoading(false)
    }
  }

  const changeVersion = (newVersion: number) => {
    const history = aiFeedbackStorage.getFeedbackHistory({
      title,
      description: description || '',
      contentLength: content.length,
      tags,
    })

    const versionData = history.versions.find(v => v.version === newVersion)
    if (versionData) {
      setFeedback(versionData.feedback)
      setCurrentVersion(newVersion)
      aiFeedbackStorage.setCurrentVersion(versionData.ideaHash, newVersion)
    }
  }

  const clearAllFeedback = () => {
    if (confirm(t('ai_risk_feedback.clear_history_confirm'))) {
      aiFeedbackStorage.clearAllFeedback()
      setFeedback(null)
      setTotalVersions(0)
      setCurrentVersion(1)
      setIsExpanded(false)
    }
  }

  if (!shouldShow) {
    return null
  }

  return (
    <div className="mb-6">
      <div className="relative">
        <button
          type="button"
          onClick={async () => {
            if (!feedback) {
              // Load latest credits before showing modal
              if (user?.id) {
                await dispatch(loadUserCredits(user.id))
              }
              setShowCreditConfirm(true)
            } else {
              setIsExpanded(!isExpanded)
            }
          }}
          disabled={loading}
          className="w-full h-16 relative font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed overflow-visible"
          style={{
            backgroundColor: 'var(--error)',
            color: 'var(--white)',
          }}
          onMouseEnter={e => {
            if (!loading) {
              e.currentTarget.style.opacity = '0.9'
            }
          }}
          onMouseLeave={e => {
            if (!loading) {
              e.currentTarget.style.opacity = '1'
            }
          }}
        >
          <div className="flex items-center justify-center gap-3 px-6">
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t('ai_risk_feedback.analyzing')}</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-6 h-6" />
                <div className="flex flex-col items-center">
                  <span>
                    {feedback
                      ? t('ai_risk_feedback.view_analysis')
                      : t('ai_risk_feedback.receive_feedback')}
                  </span>
                </div>
                {feedback && (
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
          <Image
            src="/ai-personas/v2/risk-highlighter.png"
            alt="Risk Highlighter AI"
            width={80}
            height={80}
            className="absolute -top-5 right-4 w-25 h-25"
          />
        </button>
      </div>

      {/* Credit Confirmation Modal */}
      <CreditConfirmationModal
        isOpen={showCreditConfirm}
        onClose={() => setShowCreditConfirm(false)}
        onConfirm={async () => {
          setShowCreditConfirm(false)
          if (onRequestFeedback) {
            await onRequestFeedback()
            requestFeedback()
          } else {
            requestFeedback()
          }
        }}
        creditCost={1}
        featureName={t('ai_risk_feedback.risk_analysis')}
        hasCredits={hasCredits}
        isLastCredit={isLastCredit}
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
              onClick={requestFeedback}
              className="mt-2 text-sm hover:underline font-medium"
              style={{ color: 'var(--error)' }}
            >
              {t('ai_risk_feedback.try_again')}
            </button>
          </motion.div>
        )}

        {feedback && isExpanded && (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 space-y-4 p-6 rounded-lg shadow-lg"
            style={{
              backgroundColor: 'var(--gray-50)',
              border: '2px solid var(--error)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6" style={{ color: 'var(--error)' }} />
                <h4
                  className="font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t('ai_risk_feedback.risk_analysis')}
                </h4>
              </div>
              {totalVersions > 1 && (
                <div
                  className="flex items-center gap-2 text-sm"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <History
                    className="w-4 h-4"
                    style={{ color: 'var(--error)' }}
                  />
                  <span>
                    {t('ai_risk_feedback.version')} {currentVersion}{' '}
                    {t('ai_risk_feedback.of')} {totalVersions}
                  </span>
                </div>
              )}
            </div>

            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: 'rgba(255, 148, 76, 0.1)',
                border: '1px solid var(--error)',
              }}
            >
              <MarkdownRenderer
                content={feedback.feedback}
                className="text-gray-800 dark:text-gray-200"
              />
            </div>

            <div
              className="flex items-center justify-between pt-4"
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
                      }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = 'var(--gray-100)'
                    }}
                  >
                    {t('ai_risk_feedback.previous')}
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
                      }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = 'var(--gray-100)'
                    }}
                  >
                    {t('ai_risk_feedback.next')}
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={async () => {
                    // Load latest credits before showing modal
                    if (user?.id) {
                      await dispatch(loadUserCredits(user.id))
                    }
                    setShowCreditConfirm(true)
                  }}
                  disabled={loading}
                  className="px-4 py-2 text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2"
                  style={{
                    backgroundColor: 'var(--error)',
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
                  {t('ai_risk_feedback.re_analyze')}
                </button>
                <button
                  type="button"
                  onClick={clearAllFeedback}
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
                  {t('ai_risk_feedback.clear_all')}
                </button>
              </div>
            </div>

            <p
              className="text-xs text-center"
              style={{ color: 'var(--text-secondary)' }}
            >
              {t('ai_risk_feedback.advisory_note')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
