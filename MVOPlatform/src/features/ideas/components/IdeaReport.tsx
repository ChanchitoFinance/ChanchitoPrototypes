'use client'

import { ReportDashboard } from '@/features/report/components/ReportDashboard'
import { Footer } from '@/shared/components/layout/Footer'
import { motion } from 'framer-motion'
import { Sidebar } from 'lucide-react'

interface IdeaReportProps {
  ideaId: string
}

export function IdeaReport({ ideaId }: IdeaReportProps) {
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-16 md:ml-64">
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
    </div>
  )
}

