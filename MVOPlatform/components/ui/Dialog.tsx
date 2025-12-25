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
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-background border border-border-color rounded-lg shadow-xl max-w-md w-full p-6">
              {/* Header */}
              {title && (
                <div className="flex items-center justify-between mb-4">
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

              {/* Message */}
              <p className="text-text-secondary mb-6">{message}</p>

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                {type === 'confirm' && (
                  <Button
                    onClick={onClose}
                    variant="outline"
                  >
                    {cancelText || 'Cancel'}
                  </Button>
                )}
                <Button
                  onClick={handleConfirm}
                  variant={confirmVariant}
                  className={
                    type === 'confirm'
                      ? '!bg-red-500 hover:!bg-red-600 !text-white !border-red-500 hover:!border-red-600'
                      : ''
                  }
                >
                  {confirmText || (type === 'confirm' ? 'Confirm' : 'OK')}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

