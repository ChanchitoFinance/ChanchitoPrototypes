'use client'

import { motion } from 'framer-motion'
import { ArrowUp, ArrowDown, DollarSign, MessageSquare } from 'lucide-react'

export function AppShowcase() {
  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Decorative background effects */}
      <div className="absolute -top-12 -right-12 w-64 h-64 bg-accent/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-secondary/20 rounded-full blur-3xl" />

      {/* Mock Card */}
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="relative bg-white dark:bg-card rounded-xl shadow-2xl border border-border overflow-hidden"
      >
        {/* Header Image */}
        <div className="w-full aspect-video bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden group">
            <div className="absolute inset-0 flex items-center justify-center">
                 <div className="text-white text-opacity-90 font-bold text-xl">My Startup Idea</div>
            </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-bold text-text-primary mb-1">
                AI-Powered Plant Care Assistant
              </h3>
              <p className="text-sm text-text-secondary">
                An app that identifies plant diseases from photos and suggests treatments...
              </p>
            </div>
            <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-600 px-2 py-1 rounded-full text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              92% Score
            </div>
          </div>

          {/* Tags */}
          <div className="flex gap-2 mb-6">
            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-text-secondary">#AI</span>
            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-text-secondary">#Gardening</span>
            <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-text-secondary">#SaaS</span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 border border-green-200 dark:border-green-900">
              <ArrowUp className="w-5 h-5 mb-1" />
              <span className="font-bold">428</span>
              <span className="text-[10px] uppercase opacity-70">Use</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 border border-red-200 dark:border-red-900 opacity-50">
              <ArrowDown className="w-5 h-5 mb-1" />
              <span className="font-bold">12</span>
              <span className="text-[10px] uppercase opacity-70">Pass</span>
            </div>
            <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 border border-blue-200 dark:border-blue-900">
              <DollarSign className="w-5 h-5 mb-1" />
              <span className="font-bold">156</span>
              <span className="text-[10px] uppercase opacity-70">Pay</span>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-xs text-text-secondary">
             <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold">JD</div>
                <span>by John Doe</span>
             </div>
             <div className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                <span>24 comments</span>
             </div>
          </div>
        </div>
      </motion.div>

      {/* Floating Elements */}
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute -right-6 top-20 bg-white dark:bg-card p-3 rounded-lg shadow-xl border border-border z-10 hidden md:block"
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
            <DollarSign className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-text-primary">New Payment Pledge!</div>
            <div className="text-[10px] text-text-secondary">Just now</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
