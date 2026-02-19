'use client'

import { useState, ReactNode } from 'react'
import { Info, TrendingUp, TrendingDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface TooltipProps {
  content: string
  children?: ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
}

export function Tooltip({ content, children, position = 'top' }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  // Theme-aware arrow classes using CSS that inverts for light mode
  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-[var(--tooltip-bg)] border-x-transparent border-b-transparent',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-[var(--tooltip-bg)] border-x-transparent border-t-transparent',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-[var(--tooltip-bg)] border-y-transparent border-r-transparent',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-[var(--tooltip-bg)] border-y-transparent border-l-transparent',
  }

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children || (
          <Info className="w-4 h-4 text-text-secondary hover:text-accent transition-colors" />
        )}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={`absolute ${positionClasses[position]} z-50 pointer-events-none`}
          >
            {/* Tooltip content - theme aware: dark bg in dark mode, light bg in light mode */}
            <div className="tooltip-container text-xs rounded-lg px-3 py-2 max-w-xs shadow-lg">
              {content}
              {/* Arrow */}
              <div
                className={`absolute ${arrowClasses[position]} w-0 h-0 border-4`}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string | number
  icon: ReactNode
  tooltip?: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

export function MetricCard({ title, value, icon, tooltip, trend }: MetricCardProps) {
  return (
    <div className="bg-card-bg border border-border-color rounded-xl p-6 hover:border-accent/30 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-sm text-text-secondary font-medium">{title}</h3>
          {tooltip && <Tooltip content={tooltip} />}
        </div>
        <div className="text-accent opacity-80">{icon}</div>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-bold text-text-primary">{value}</p>
        {trend && (
          <div
            className={`flex items-center gap-1 text-xs font-medium ${
              trend.isPositive ? 'text-success' : 'text-error'
            }`}
          >
            {trend.isPositive ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            {Math.abs(trend.value)}%
          </div>
        )}
      </div>
    </div>
  )
}
