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
} from 'lucide-react'
import { AIFeedback } from '@/core/types/ai'
import { aiFeedbackStorage } from '@/core/lib/services/aiFeedbackStorage'
import { ContentBlock } from '@/core/types/content'
import {
  useTranslations,
  useLocale,
} from '@/shared/components/providers/I18nProvider'
import { MarkdownRenderer } from '@/shared/components/ui/MarkdownRenderer'
import { useAppSelector } from '@/core/lib/hooks'
import Image from 'next/image'

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
  const [showLastCreditConfirm, setShowLastCreditConfirm] = useState(false)

  const { plan, dailyCredits, usedCredits } = useAppSelector(
    state => state.credits
  )
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
          onClick={async () => {
            if (!hasCredits) {
              router.push(`/${locale}/premium`)
              return
            }

            if (!feedback) {
              if (isLastCredit) {
                setShowLastCreditConfirm(true)
                return
              }

              if (onRequestFeedback) {
                await onRequestFeedback()
                // After credits are deducted, request feedback
                requestFeedback()
              } else {
                requestFeedback()
              }
            } else {
              setIsExpanded(!isExpanded)
            }
          }}
          disabled={loading}
          className="w-full h-16 relative bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-gray-900 font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed overflow-visible"
        >
          <div className="flex items-center justify-center gap-3 px-6">
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t('ai_risk_feedback.analyzing')}</span>
              </>
            ) : (
              <>
                <span className="text-2xl">⚠️</span>
                <div className="flex flex-col items-center">
                  <span>
                    {feedback
                      ? t('ai_risk_feedback.view_analysis')
                      : t('ai_risk_feedback.receive_feedback')}
                  </span>
                  {!feedback && (
                    <span className="text-xs flex items-center gap-1">
                      <Coins className="w-3 h-3" />1 credit
                    </span>
                  )}
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
            src="/ai-personas/risk-highlighter.png"
            alt="Risk Highlighter AI"
            width={80}
            height={80}
            className="absolute -top-5 right-4 w-25 h-25"
          />
          {/* <div className=" bg-white rounded-full shadow-xl border-4 border-yellow-400 overflow-hidden">
           
          </div> */}
        </button>
      </div>

      {/* Last Credit Confirmation Dialog */}
      <AnimatePresence>
        {showLastCreditConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowLastCreditConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background p-6 rounded-lg shadow-xl max-w-md mx-4"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-semibold text-text-primary mb-2">
                Last Credit Warning
              </h3>
              <p className="text-sm text-text-secondary mb-4">
                This is your last daily credit. Are you sure you want to spend
                it on AI Risk Analysis?
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowLastCreditConfirm(false)}
                  className="px-4 py-2 text-sm border border-border-color rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    setShowLastCreditConfirm(false)
                    if (onRequestFeedback) {
                      await onRequestFeedback()
                      requestFeedback()
                    } else {
                      requestFeedback()
                    }
                  }}
                  className="px-4 py-2 text-sm bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-600"
                >
                  Use Last Credit
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
          >
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            <button
              onClick={requestFeedback}
              className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
            >
              {t('ai_risk_feedback.try_again')}
            </button>
          </motion.div>
        )}

        {feedback && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 space-y-4 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-yellow-400"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🛡️</span>
                <h4 className="font-semibold text-text-primary">
                  {t('ai_risk_feedback.risk_analysis')}
                </h4>
              </div>
              {totalVersions > 1 && (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <History className="w-4 h-4" />
                  <span>
                    {t('ai_risk_feedback.version')} {currentVersion}{' '}
                    {t('ai_risk_feedback.of')} {totalVersions}
                  </span>
                </div>
              )}
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
              <MarkdownRenderer
                content={feedback.feedback}
                className="text-gray-700 dark:text-gray-300"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              {totalVersions > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      changeVersion(Math.max(1, currentVersion - 1))
                    }
                    disabled={currentVersion === 1}
                    className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-text-primary rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('ai_risk_feedback.previous')}
                  </button>
                  <button
                    onClick={() =>
                      changeVersion(Math.min(totalVersions, currentVersion + 1))
                    }
                    disabled={currentVersion === totalVersions}
                    className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-text-primary rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('ai_risk_feedback.next')}
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={requestFeedback}
                  disabled={loading}
                  className="px-4 py-2 text-sm bg-yellow-400 text-gray-900 rounded-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4" />
                  )}
                  {t('ai_risk_feedback.re_analyze')}
                </button>
                <button
                  onClick={clearAllFeedback}
                  className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('ai_risk_feedback.clear_all')}
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {t('ai_risk_feedback.advisory_note')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
