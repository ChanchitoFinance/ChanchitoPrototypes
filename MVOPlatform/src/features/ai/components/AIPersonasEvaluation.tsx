'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Loader2,
  ChevronDown,
  Trash2,
  History,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { AIPersonaFeedback } from '@/core/types/ai'
import { ideaService } from '@/core/lib/services/ideaService'
import { Idea } from '@/core/types/idea'
import { Comment } from '@/core/types/comment'
import {
  useTranslations,
  useLocale,
} from '@/shared/components/providers/I18nProvider'
import { AIPersonasRenderer } from '@/features/ai/components/AIPersonasRenderer'
import { useAppSelector, useAppDispatch } from '@/core/lib/hooks'
import { deductCredits } from '@/core/lib/slices/creditsSlice'
import { CreditConfirmationModal } from '@/shared/components/ui/CreditConfirmationModal'
import Image from 'next/image'

interface AIPersonasEvaluationProps {
  idea: Idea
  comments: Comment[]
}

export function AIPersonasEvaluation({
  idea,
  comments,
}: AIPersonasEvaluationProps) {
  const t = useTranslations()
  const { locale } = useLocale()
  const [feedback, setFeedback] = useState<AIPersonaFeedback | null>(null)
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

  useEffect(() => {
    const loadFeedback = async () => {
      try {
        const aiPersonasEvaluation =
          await ideaService.getAIPersonasEvaluationByIdeaId(
            idea.id,
            idea.versionNumber
          )
        if (aiPersonasEvaluation.length > 0) {
          setTotalVersions(aiPersonasEvaluation.length)
          const latestEvaluation = aiPersonasEvaluation[0]
          if (latestEvaluation.ai_personas_evaluation) {
            setFeedback(latestEvaluation.ai_personas_evaluation)
            setCurrentVersion(latestEvaluation.version)
          }
        }
      } catch (error) {
        console.error('Failed to load AI personas feedback:', error)
      }
    }

    loadFeedback()
  }, [idea.id, idea.versionNumber])

  const requestFeedback = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/evaluate-progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idea,
          comments,
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

      await ideaService.saveAIPersonasEvaluation(idea.id, idea.versionNumber, {
        aiPersonasEvaluation: result,
        language: locale,
      })

      setFeedback(result)
      setIsExpanded(true)

      const aiPersonasEvaluation =
        await ideaService.getAIPersonasEvaluationByIdeaId(
          idea.id,
          idea.versionNumber
        )
      setTotalVersions(aiPersonasEvaluation.length)
      const latestEvaluation = aiPersonasEvaluation[0]
      setCurrentVersion(latestEvaluation.version)
    } catch (err) {
      console.error('AI personas feedback error:', err)
      setError(err instanceof Error ? err.message : 'Failed to analyze')
    } finally {
      setLoading(false)
    }
  }

  const changeVersion = async (newVersion: number) => {
    try {
      const aiPersonasEvaluation =
        await ideaService.getAIPersonasEvaluationVersion(
          idea.id,
          idea.versionNumber,
          newVersion
        )
      if (aiPersonasEvaluation && aiPersonasEvaluation.ai_personas_evaluation) {
        setFeedback(aiPersonasEvaluation.ai_personas_evaluation)
        setCurrentVersion(newVersion)
      }
    } catch (error) {
      console.error('Failed to load AI personas feedback version:', error)
    }
  }

  const clearAllFeedback = async () => {
    if (confirm(t('ai_personas_evaluation.clear_history_confirm'))) {
      try {
        await ideaService.deleteAIPersonasEvaluation(
          idea.id,
          idea.versionNumber
        )
        setFeedback(null)
        setTotalVersions(0)
        setCurrentVersion(1)
        setIsExpanded(false)
      } catch (error) {
        console.error('Failed to clear AI personas feedback:', error)
      }
    }
  }

  return (
    <div className="mb-6">
      <div className="relative">
        <button
          onClick={() => {
            if (!feedback) {
              setShowCreditConfirm(true)
            } else {
              setIsExpanded(!isExpanded)
            }
          }}
          disabled={loading}
          className="w-full h-16 relative font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed overflow-visible"
          style={{
            backgroundColor: 'var(--primary-accent)',
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
                <span>{t('ai_personas_evaluation.analyzing')}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>
                  {feedback
                    ? t('ai_personas_evaluation.view_evaluation')
                    : t('ai_personas_evaluation.get_evaluation')}
                </span>
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
            src="/ai-personas/personas-group.png"
            alt="AI Personas"
            width={230}
            height={300}
            className="absolute -top-9 right-3 w-230 h-300 hidden md:block"
          />
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
              deductCredits({ userId: user?.id || '', amount: 1 })
            ).unwrap()
            requestFeedback()
          } catch (error) {
            console.error('Error deducting credits:', error)
          }
        }}
        creditCost={1}
        featureName={t('ai_personas_evaluation.evaluation_title')}
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
              onClick={() => setShowCreditConfirm(true)}
              className="mt-2 text-sm hover:underline font-medium"
              style={{ color: 'var(--error)' }}
            >
              {t('ai_personas_evaluation.try_again')}
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
              border: '2px solid var(--primary-accent)',
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles
                  className="w-6 h-6"
                  style={{ color: 'var(--primary-accent)' }}
                />
                <h4
                  className="font-semibold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {t('ai_personas_evaluation.evaluation_title')}
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
                    {t('ai_personas_evaluation.version')} {currentVersion}{' '}
                    {t('ai_personas_evaluation.of')} {totalVersions}
                  </span>
                </div>
              )}
            </div>

            <div
              className="p-4 rounded-lg"
              style={{
                backgroundColor: 'rgba(160, 123, 207, 0.1)',
                border: '1px solid var(--primary-accent)',
              }}
            >
              <AIPersonasRenderer
                content={feedback.conversation}
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
                    {t('ai_personas_evaluation.previous')}
                  </button>
                  <button
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
                    {t('ai_personas_evaluation.next')}
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={() => setShowCreditConfirm(true)}
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
                  {t('ai_personas_evaluation.re_evaluate')}
                </button>
                <button
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
                  {t('ai_personas_evaluation.clear_all')}
                </button>
              </div>
            </div>

            <p
              className="text-xs text-center"
              style={{ color: 'var(--text-secondary)' }}
            >
              {t('ai_personas_evaluation.advisory_note')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
