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
import { aiPersonasFeedbackStorage } from '@/core/lib/services/aiPersonasFeedbackStorage'
import { Idea } from '@/core/types/idea'
import { Comment } from '@/core/types/comment'
import {
  useTranslations,
  useLocale,
} from '@/shared/components/providers/I18nProvider'
import { AIPersonasRenderer } from '@/features/ai/components/AIPersonasRenderer'
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

  useEffect(() => {
    const cachedFeedback = aiPersonasFeedbackStorage.getLatestFeedback(
      idea.id,
      idea.title,
      idea.votes,
      comments.length
    )

    if (cachedFeedback) {
      setFeedback(cachedFeedback)
      const history = aiPersonasFeedbackStorage.getFeedbackHistory({
        ideaId: idea.id,
        title: idea.title,
        votes: idea.votes,
        commentCount: comments.length,
      })
      setTotalVersions(history.versions.length)
      setCurrentVersion(history.currentVersion)
    }
  }, [idea.id, idea.title, idea.votes, comments.length])

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

      aiPersonasFeedbackStorage.saveFeedback(
        result,
        idea.id,
        idea.title,
        idea.votes,
        comments.length
      )

      setFeedback(result)
      setIsExpanded(true)

      const history = aiPersonasFeedbackStorage.getFeedbackHistory({
        ideaId: idea.id,
        title: idea.title,
        votes: idea.votes,
        commentCount: comments.length,
      })
      setTotalVersions(history.versions.length)
      setCurrentVersion(history.currentVersion)
    } catch (err) {
      console.error('AI personas feedback error:', err)
      setError(err instanceof Error ? err.message : 'Failed to analyze')
    } finally {
      setLoading(false)
    }
  }

  const changeVersion = (newVersion: number) => {
    const history = aiPersonasFeedbackStorage.getFeedbackHistory({
      ideaId: idea.id,
      title: idea.title,
      votes: idea.votes,
      commentCount: comments.length,
    })

    const versionData = history.versions.find(v => v.version === newVersion)
    if (versionData) {
      setFeedback(versionData.feedback)
      setCurrentVersion(newVersion)
      aiPersonasFeedbackStorage.setCurrentVersion(
        versionData.ideaHash,
        newVersion
      )
    }
  }

  const clearAllFeedback = () => {
    if (confirm(t('ai_personas_evaluation.clear_history_confirm'))) {
      aiPersonasFeedbackStorage.clearAllFeedback()
      setFeedback(null)
      setTotalVersions(0)
      setCurrentVersion(1)
      setIsExpanded(false)
    }
  }

  return (
    <div className="mb-6">
      <div className="relative">
        <button
          onClick={() => {
            if (!feedback) {
              requestFeedback()
            } else {
              setIsExpanded(!isExpanded)
            }
          }}
          disabled={loading}
          className="w-full h-16 relative bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed overflow-visible"
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
              {t('ai_personas_evaluation.try_again')}
            </button>
          </motion.div>
        )}

        {feedback && isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 space-y-4 p-6 bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-purple-400"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-500" />
                <h4 className="font-semibold text-text-primary">
                  {t('ai_personas_evaluation.evaluation_title')}
                </h4>
              </div>
              {totalVersions > 1 && (
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <History className="w-4 h-4" />
                  <span>
                    {t('ai_personas_evaluation.version')} {currentVersion}{' '}
                    {t('ai_personas_evaluation.of')} {totalVersions}
                  </span>
                </div>
              )}
            </div>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
              <AIPersonasRenderer
                content={feedback.conversation}
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
                    {t('ai_personas_evaluation.previous')}
                  </button>
                  <button
                    onClick={() =>
                      changeVersion(Math.min(totalVersions, currentVersion + 1))
                    }
                    disabled={currentVersion === totalVersions}
                    className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-text-primary rounded hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('ai_personas_evaluation.next')}
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2 ml-auto">
                <button
                  onClick={requestFeedback}
                  disabled={loading}
                  className="px-4 py-2 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
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
                  className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('ai_personas_evaluation.clear_all')}
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {t('ai_personas_evaluation.advisory_note')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
