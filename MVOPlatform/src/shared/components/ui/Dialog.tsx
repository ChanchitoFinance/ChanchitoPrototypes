'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from './Button'
import { X } from 'lucide-react'

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  message: string
  type?: 'alert' | 'confirm'
  onConfirm?: () => void
  confirmText?: string
  cancelText?: string
  confirmVariant?: 'primary' | 'secondary' | 'outline'
}

export function Dialog({
  isOpen,
  onClose,
  title,
  message,
  type = 'alert',
  onConfirm,
  confirmText,
  cancelText,
  confirmVariant = 'primary',
}: DialogProps) {
  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when dialog is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm()
    }
    onClose()
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
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-background border border-border-color rounded-t-xl sm:rounded-lg shadow-xl w-full sm:max-w-md max-h-[85vh] sm:h-auto flex flex-col overflow-hidden">
              {/* Header */}
              {title && (
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border-color">
                  <h3 className="text-lg font-semibold text-text-primary">
                    {title}
                  </h3>
                  <button
                    onClick={onClose}
                    className="text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6">
                <p className="text-text-secondary mb-6 text-sm sm:text-base">
                  {message}
                </p>
              </div>

              {/* Actions */}
              <div className="p-4 sm:p-6 border-t border-border-color bg-gray-50 sm:bg-transparent">
                <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                  {type === 'confirm' && (
                    <Button
                      onClick={onClose}
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      {cancelText || 'Cancel'}
                    </Button>
                  )}
                  <Button
                    onClick={handleConfirm}
                    variant={confirmVariant}
                    size="sm"
                    className={`w-full sm:w-auto ${
                      type === 'confirm'
                        ? '!bg-error hover:!opacity-90 !text-white !border-error'
                        : ''
                    }`}
                  >
                    {confirmText || (type === 'confirm' ? 'Confirm' : 'OK')}
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
