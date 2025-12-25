'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, X } from 'lucide-react'

interface ToastProps {
  isOpen: boolean
  message: string
  onClose: () => void
  duration?: number
}

export function Toast({ isOpen, message, onClose, duration = 3000 }: ToastProps) {
  // Auto-close after duration
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [isOpen, duration, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed top-4 right-4 z-50 bg-background border border-border-color rounded-lg shadow-xl p-4 min-w-[300px] max-w-md flex items-center gap-3"
        >
          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
          <p className="text-text-primary flex-1 text-sm">{message}</p>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

