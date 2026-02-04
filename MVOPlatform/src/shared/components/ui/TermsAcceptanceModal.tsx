'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './Button'
import { X, CheckCircle2 } from 'lucide-react'
import {
  useTranslations,
  useLocale,
} from '@/shared/components/providers/I18nProvider'
import Link from 'next/link'

interface TermsAcceptanceModalProps {
  isOpen: boolean
  onClose?: () => void // Make optional since we removed cancel button
  onAccept: () => void
  userEmail?: string // New optional property for user email
}

export function TermsAcceptanceModal({
  isOpen,
  onClose,
  onAccept,
  userEmail,
}: TermsAcceptanceModalProps) {
  const t = useTranslations()
  const { locale } = useLocale()
  const [isAccepted, setIsAccepted] = useState(false)
  const [showError, setShowError] = useState(false)

  // Prevent closing with ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
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
      setIsAccepted(false)
      setShowError(false)
    }
  }, [isOpen])

  const handleContinue = () => {
    console.log('🔘 Continue button clicked in TermsAcceptanceModal')
    if (!isAccepted) {
      console.log('❌ Checkbox not accepted')
      setShowError(true)
      return
    }
    console.log('✅ Calling onAccept callback')
    onAccept()
  }

  const handleCheckboxChange = () => {
    setIsAccepted(!isAccepted)
    if (showError) {
      setShowError(false)
    }
  }

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
            <div className="bg-background border border-border-color rounded-t-xl sm:rounded-lg shadow-xl w-full sm:max-w-lg max-h-[85vh] sm:h-auto flex flex-col overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border-color">
                <h3 className="text-lg sm:text-xl font-semibold text-text-primary">
                  {t('terms.modal_title')}
                </h3>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                {/* Summary */}
                <div className="mb-6">
                  <p className="text-text-secondary mb-4 leading-relaxed text-sm sm:text-base">
                    {t('terms.modal_intro')}
                  </p>

                  {/* Terms list with icons */}
                  <ul className="space-y-3 mb-4">
                    {t('terms.modal_items')
                      .split('\n')
                      .filter((item: string) => item.trim())
                      .map((item: string, index: number) => (
                        <li key={index} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--primary-accent)' }} />
                          <span className="text-text-secondary text-sm sm:text-base leading-relaxed">
                            {item.trim()}
                          </span>
                        </li>
                      ))}
                  </ul>

                  {/* Link to full terms */}
                  <Link
                    href={`/${locale}/terms`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-accent hover:text-accent-alt underline text-sm transition-colors"
                  >
                    {t('terms.read_full_terms')}
                  </Link>
                </div>

                {/* Checkbox */}
                <div className="mb-6">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center mt-1">
                      <input
                        type="checkbox"
                        checked={isAccepted}
                        onChange={handleCheckboxChange}
                        className="w-5 h-5 rounded border-2 border-border-color bg-transparent checked:bg-premium-cta checked:border-premium-cta focus:outline-none focus:ring-2 focus:ring-premium-cta focus:ring-offset-2 focus:ring-offset-background transition-all cursor-pointer appearance-none"
                      />
                      {isAccepted && (
                        <svg
                          className="absolute w-3 h-3 text-white pointer-events-none"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={3}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                    <span className="text-text-primary text-sm group-hover:text-primary-accent transition-colors">
                      {t('terms.accept_checkbox')}
                    </span>
                  </label>

                  {/* Error message */}
                  {showError && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-error text-sm mt-2 ml-8"
                    >
                      {t('terms.must_accept')}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 sm:p-6 border-t border-border-color bg-gray-50 sm:bg-transparent">
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                  <Button
                    onClick={handleContinue}
                    variant="primary"
                    disabled={!isAccepted}
                    size="sm"
                    className={`w-full sm:w-auto ${!isAccepted ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {t('terms.continue_button')}
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
