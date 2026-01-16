'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Coins } from 'lucide-react'
import {
  useTranslations,
  useLocale,
} from '@/shared/components/providers/I18nProvider'
import { useRouter } from 'next/navigation'

interface CreditConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  onNo?: () => void
  creditCost: number
  featureName: string
  hasCredits: boolean
  isLastCredit: boolean
  showNoButton?: boolean
}

export function CreditConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  onNo,
  creditCost,
  featureName,
  hasCredits,
  isLastCredit,
  showNoButton = false,
}: CreditConfirmationModalProps) {
  const t = useTranslations()
  const { locale } = useLocale()
  const router = useRouter()

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-background p-6 rounded-lg shadow-xl max-w-md mx-4"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-text-primary mb-4">
              {t('credits.confirmation_title')}
            </h3>

            <div className="mb-4">
              <p className="text-sm text-text-secondary mb-2">
                {t('credits.confirmation_message')
                  .replace('{cost}', creditCost.toString())
                  .replace('{feature}', featureName)}
              </p>
              <div className="flex items-center gap-2 text-sm text-text-primary">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span>
                  {t('credits.cost_display').replace(
                    '{cost}',
                    creditCost.toString()
                  )}
                </span>
              </div>
            </div>

            {!hasCredits && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">
                  {t('credits.insufficient_title')}
                </h4>
                <p className="text-sm text-red-600 dark:text-red-300">
                  {t('credits.insufficient_message')}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      router.push(`/${locale}/premium`)
                    }}
                    className="text-red-700 dark:text-red-400 underline hover:text-red-800 dark:hover:text-red-300"
                  >
                    {t('credits.upgrade_plan')}
                  </button>
                </p>
              </div>
            )}

            {hasCredits && isLastCredit && (
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <h4 className="text-sm font-semibold text-yellow-700 dark:text-yellow-400 mb-2">
                  {t('credits.last_credit_title')}
                </h4>
                <p className="text-sm text-yellow-600 dark:text-yellow-300">
                  {t('credits.last_credit_message')}
                </p>
              </div>
            )}

            <div className="flex gap-3 justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm border border-border-color rounded-lg hover:bg-gray-50"
              >
                {t('actions.cancel')}
              </button>
              <div className="flex gap-3">
                {showNoButton && (
                  <button
                    type="button"
                    onClick={onNo || onClose}
                    className="px-4 py-2 text-sm border border-border-color rounded-lg hover:bg-gray-50"
                  >
                    {t('actions.no')}
                  </button>
                )}
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={!hasCredits}
                  className="px-4 py-2 text-sm bg-yellow-500 text-gray-900 rounded-lg hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('actions.yes')}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
