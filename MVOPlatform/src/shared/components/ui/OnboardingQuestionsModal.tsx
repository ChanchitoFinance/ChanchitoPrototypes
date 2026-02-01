'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './Button'
import { useTranslations } from '@/shared/components/providers/I18nProvider'

export interface OnboardingAnswer {
  questionId: string
  selectedOption?: string | null
  customText?: string | null
}

export interface OnboardingData {
  decision?: string | null
  evidence?: string | null
  completedAt?: string
}

interface OnboardingQuestionsModalProps {
  isOpen: boolean
  onClose?: () => void
  onComplete: (answers: OnboardingData) => void
}

type QuestionId = 'decision' | 'evidence'

interface QuestionState {
  selectedOption: string | null
  customText: string
}

export function OnboardingQuestionsModal({
  isOpen,
  onClose,
  onComplete,
}: OnboardingQuestionsModalProps) {
  const t = useTranslations()

  const [answers, setAnswers] = useState<Record<QuestionId, QuestionState>>({
    decision: { selectedOption: null, customText: '' },
    evidence: { selectedOption: null, customText: '' },
  })

  // Prevent closing with ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setAnswers({
        decision: { selectedOption: null, customText: '' },
        evidence: { selectedOption: null, customText: '' },
      })
    }
  }, [isOpen])

  const handleOptionSelect = (questionId: QuestionId, option: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        selectedOption: option,
        // Clear custom text if not selecting "other"
        customText: option === 'other' ? prev[questionId].customText : '',
      },
    }))
  }

  const handleCustomTextChange = (questionId: QuestionId, text: string) => {
    // Limit to 500 characters
    const limitedText = text.slice(0, 500)
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        customText: limitedText,
      },
    }))
  }

  const handleSkip = () => {
    // Submit empty answers (all questions are optional)
    onComplete({
      decision: null,
      evidence: null,
      completedAt: new Date().toISOString(),
    })
  }

  const handleContinue = () => {
    const prepareAnswer = (questionState: QuestionState): string | null => {
      if (!questionState.selectedOption) return null
      if (questionState.selectedOption === 'other') {
        return questionState.customText.trim() || null
      }
      return questionState.selectedOption
    }

    const onboardingData: OnboardingData = {
      decision: prepareAnswer(answers.decision),
      evidence: prepareAnswer(answers.evidence),
      completedAt: new Date().toISOString(),
    }

    onComplete(onboardingData)
  }

  const decisionOptions = [
    { value: 'build_at_all', label: t('onboarding.options.decision.build_at_all') },
    { value: 'pivot', label: t('onboarding.options.decision.pivot') },
    { value: 'people_pay', label: t('onboarding.options.decision.people_pay') },
    { value: 'other', label: t('onboarding.options.decision.other') },
  ]

  const evidenceOptions = [
    { value: 'recognize_problem', label: t('onboarding.options.evidence.recognize_problem') },
    { value: 'urgency', label: t('onboarding.options.evidence.urgency') },
    { value: 'market_saturated', label: t('onboarding.options.evidence.market_saturated') },
    { value: 'build_simply', label: t('onboarding.options.evidence.build_simply') },
    { value: 'personal_bias', label: t('onboarding.options.evidence.personal_bias') },
    { value: 'not_sure', label: t('onboarding.options.evidence.not_sure') },
    { value: 'other', label: t('onboarding.options.evidence.other') },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-background border border-border-color rounded-t-xl sm:rounded-lg shadow-xl w-full sm:max-w-2xl max-h-[90vh] sm:h-auto flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border-color">
                <div>
                  <h3 className="text-lg sm:text-xl font-semibold text-text-primary">
                    {t('onboarding.modal_title')}
                  </h3>
                  <p className="text-sm text-text-secondary mt-1">
                    {t('onboarding.modal_subtitle')}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                {/* Question 1: Decision */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-text-primary">
                    {t('onboarding.question_1')}
                    <span className="ml-2 text-xs text-text-secondary font-normal">
                      ({t('onboarding.optional')})
                    </span>
                  </label>
                  <div className="space-y-2">
                    {decisionOptions.map(option => (
                      <label
                        key={option.value}
                        className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          answers.decision.selectedOption === option.value
                            ? 'border-premium-cta bg-premium-cta/5'
                            : 'border-border-color hover:border-premium-cta/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="decision"
                          value={option.value}
                          checked={answers.decision.selectedOption === option.value}
                          onChange={() => handleOptionSelect('decision', option.value)}
                          className="mt-0.5 w-4 h-4 text-premium-cta focus:ring-premium-cta focus:ring-2"
                        />
                        <span className="text-sm text-text-primary flex-1">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  {answers.decision.selectedOption === 'other' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3"
                    >
                      <textarea
                        value={answers.decision.customText}
                        onChange={e => handleCustomTextChange('decision', e.target.value)}
                        placeholder={t('onboarding.other_placeholder')}
                        className="w-full p-3 text-sm border-2 border-border-color rounded-lg focus:border-premium-cta focus:ring-2 focus:ring-premium-cta focus:outline-none resize-none bg-background text-text-primary"
                        rows={3}
                      />
                      <p className="text-xs text-text-secondary mt-1">
                        {answers.decision.customText.length}/500
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Question 2: Evidence */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-text-primary">
                    {t('onboarding.question_2')}
                    <span className="ml-2 text-xs text-text-secondary font-normal">
                      ({t('onboarding.optional')})
                    </span>
                  </label>
                  <div className="space-y-2">
                    {evidenceOptions.map(option => (
                      <label
                        key={option.value}
                        className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                          answers.evidence.selectedOption === option.value
                            ? 'border-premium-cta bg-premium-cta/5'
                            : 'border-border-color hover:border-premium-cta/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="evidence"
                          value={option.value}
                          checked={answers.evidence.selectedOption === option.value}
                          onChange={() => handleOptionSelect('evidence', option.value)}
                          className="mt-0.5 w-4 h-4 text-premium-cta focus:ring-premium-cta focus:ring-2"
                        />
                        <span className="text-sm text-text-primary flex-1">
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                  {answers.evidence.selectedOption === 'other' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-3"
                    >
                      <textarea
                        value={answers.evidence.customText}
                        onChange={e => handleCustomTextChange('evidence', e.target.value)}
                        placeholder={t('onboarding.other_placeholder')}
                        className="w-full p-3 text-sm border-2 border-border-color rounded-lg focus:border-premium-cta focus:ring-2 focus:ring-premium-cta focus:outline-none resize-none bg-background text-text-primary"
                        rows={3}
                      />
                      <p className="text-xs text-text-secondary mt-1">
                        {answers.evidence.customText.length}/500
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 sm:p-6 border-t border-border-color bg-gray-50 dark:bg-transparent">
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                  <Button
                    onClick={handleSkip}
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    {t('onboarding.skip_button')}
                  </Button>
                  <Button
                    onClick={handleContinue}
                    variant="primary"
                    size="sm"
                    className="w-full sm:w-auto"
                  >
                    {t('onboarding.continue_button')}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
