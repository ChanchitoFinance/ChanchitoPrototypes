'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { XCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Sidebar } from '@/shared/components/layout/Sidebar'
import { Footer } from '@/shared/components/layout/Footer'

export default function PaymentCancelPage() {
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-16 md:ml-0">
        <main className="flex-1 flex items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="mb-6 flex justify-center"
          >
            <XCircle className="w-16 h-16 text-red-500" />
          </motion.div>
          <h1 className="text-3xl font-semibold text-text-primary mb-4">
            Payment Cancelled
          </h1>
          <p className="text-base text-text-secondary mb-8">
            Your payment was cancelled. No charges were made to your account.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button variant="primary">Return Home</Button>
            </Link>
            <Link href="/#pricing">
              <Button variant="outline">View Pricing</Button>
            </Link>
          </div>
        </motion.div>
      </main>
      <Footer />
      </div>
    </div>
  )
}

