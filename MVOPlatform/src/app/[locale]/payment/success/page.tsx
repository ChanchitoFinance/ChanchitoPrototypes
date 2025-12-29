'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { Sidebar } from '@/shared/components/layout/Sidebar'
import { Footer } from '@/shared/components/layout/Footer'

function PaymentSuccessContent() {
  const searchParams = useSearchParams()
  const [sessionId, setSessionId] = useState<string | null>(null)

  useEffect(() => {
    const id = searchParams.get('session_id')
    setSessionId(id)
  }, [searchParams])

  return (
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
        <Link href="/upload">
          <Button variant="primary">Submit Your Idea</Button>
        </Link>
        <Link href="/ideas">
          <Button variant="outline">Browse Ideas</Button>
        </Link>
      </div>
    </motion.div>
  )
}

export default function PaymentSuccessPage() {
  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-16 md:ml-0">
        <main className="flex-1 flex items-center justify-center px-6 py-12">
          <Suspense fallback={
            <div className="max-w-md w-full text-center">
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin" />
              </div>
              <h1 className="text-3xl font-semibold text-text-primary mb-4">
                Loading...
              </h1>
            </div>
          }>
            <PaymentSuccessContent />
          </Suspense>
        </main>
        <Footer />
      </div>
    </div>
  )
}

