'use client'

import { motion } from 'framer-motion'

export function LoadingSpinner({ size = 20, color = 'currentColor' }) {
  return (
    <motion.div
      className="flex items-center justify-center"
      style={{ width: size, height: size }}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="31.42"
          strokeDashoffset="25"
        />
      </svg>
    </motion.div>
  )
}
