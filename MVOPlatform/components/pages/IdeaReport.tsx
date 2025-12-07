'use client'

import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ReportDashboard } from '@/components/report/ReportDashboard'
import { motion } from 'framer-motion'

interface IdeaReportProps {
  ideaId: string
}

export function IdeaReport({ ideaId }: IdeaReportProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <ReportDashboard ideaId={ideaId} />
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}

