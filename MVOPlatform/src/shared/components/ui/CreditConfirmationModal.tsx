'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Coins } from 'lucide-react'
import { useTranslations, useLocale } from '@/shared/components/providers/I18nProvider'
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
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md mx-4 card-white"
            onClick={e => e.stopPropagation()}
            style={{
              backgroundColor: 'var(--gray-100)',
              borderColor: 'var(--border-color)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div className="spacing-card">
              <h3 className="text-heading-3" style={{ fontSize: 'var(--font-size-xl)' }}>
                {t('credits.confirmation_title_coins')}
              </h3>
            </div>

            <div className="spacing-card">
              <p className="text-body" style={{ fontSize: 'var(--font-size-sm)' }}>
                {t('credits.confirmation_message_coins')
                  .replace('{cost}', creditCost.toString())
                  .replace('{feature}', featureName)}
              </p>

              <div
                className="flex items-center gap-2 mt-3"
                style={{ color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)' }}
              >
                <Coins className="w-4 h-4" style={{ color: 'var(--error)' }} />
                <span className="text-label" style={{ fontSize: 'var(--font-size-sm)' }}>
                  {t('credits.cost_display_coins').replace('{cost}', creditCost.toString())}
                </span>
              </div>
            </div>

            {!hasCredits && (
              <div
                className="spacing-card"
                style={{
                  backgroundColor: 'rgba(255, 148, 76, 0.10)',
                  border: '2px solid var(--error)',
                  borderRadius: 'var(--border-radius-md)',
                  padding: 'var(--spacing-lg)',
                }}
              >
                <h4 className="text-label" style={{ color: 'var(--text-primary)', marginBottom: 'var(--spacing-sm)' }}>
                  {t('credits.insufficient_title')}
                </h4>

                <p className="text-body" style={{ fontSize: 'var(--font-size-sm)' }}>
                  {t('credits.insufficient_message')}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      onClose()
                      router.push(`/${locale}/premium`)
                    }}
                    className="font-medium hover:opacity-80"
                    style={{
                      color: 'var(--error)',
                      textDecoration: 'underline',
                      transition: 'opacity var(--transition-fast)',
                    }}
                  >
                    {t('credits.get_more_coins')}
                  </button>
                </p>
              </div>
            )}

            {hasCredits && isLastCredit && (
              <div
                className="spacing-card"
                style={{
                  backgroundColor: 'rgba(160, 123, 207, 0.12)',
                  border: '2px solid var(--primary-accent)',
                  borderRadius: 'var(--border-radius-md)',
                  padding: 'var(--spacing-lg)',
                }}
              >
                <h4 className="text-label" style={{ color: 'var(--text-primary)', marginBottom: 'var(--spacing-sm)' }}>
                  {t('credits.last_credit_title')}
                </h4>
                <p className="text-body" style={{ fontSize: 'var(--font-size-sm)' }}>
                  {t('credits.last_coin_message')}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="interactive-base"
                style={{
                  backgroundColor: 'var(--gray-100)',
                  border: '2px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 'var(--font-weight-medium)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = 'var(--gray-50)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = 'var(--gray-100)'
                }}
              >
                {t('actions.cancel')}
              </button>

              <div className="flex items-center gap-3">
                {showNoButton && (
                  <button
                    type="button"
                    onClick={onNo || onClose}
                    className="interactive-base"
                    style={{
                      backgroundColor: 'var(--gray-100)',
                      border: '2px solid var(--border-color)',
                      color: 'var(--text-primary)',
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 'var(--font-weight-medium)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.backgroundColor = 'var(--gray-50)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.backgroundColor = 'var(--gray-100)'
                    }}
                  >
                    {t('actions.no')}
                  </button>
                )}

                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={!hasCredits}
                  className="interactive-base disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: 'var(--premium-cta)',
                    color: 'var(--white)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 'var(--font-weight-semibold)',
                    border: '2px solid transparent',
                  }}
                  onMouseEnter={e => {
                    if (!e.currentTarget.disabled) e.currentTarget.style.opacity = '0.9'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.opacity = '1'
                  }}
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