'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    const id = searchParams.get('session_id')
    setSessionId(id)
  }, [searchParams])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
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
            <CheckCircle className="w-16 h-16 text-accent" />
          </motion.div>
          <h1 className="text-3xl font-semibold text-text-primary mb-4">
            Payment Successful
          </h1>
          <p className="text-base text-text-secondary mb-8">
            Your payment has been processed successfully. You can now submit
            your idea for validation.
          </p>
          {sessionId && (
            <p className="text-sm text-text-secondary mb-8">
              Session ID: {sessionId}
            </p>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/submit">
              <Button variant="primary">Submit Your Idea</Button>
            </Link>
            <Link href="/ideas">
              <Button variant="outline">Browse Ideas</Button>
            </Link>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}

