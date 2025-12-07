'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { IdeaForm } from '@/components/forms/IdeaForm'
import { Button } from '@/components/ui/Button'
import { motion } from 'framer-motion'

export function IdeaSubmission() {
  const { data: session, status } = useSession()
  const router = useRouter()

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-secondary">Loading...</div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-md"
          >
            <h1 className="text-3xl font-semibold text-text-primary mb-4">
              Sign In Required
            </h1>
            <p className="text-base text-text-secondary mb-8">
              Please sign in with your Google account to submit an idea.
            </p>
            <Button onClick={() => router.push('/api/auth/signin')}>
              Sign In with Google
            </Button>
          </motion.div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-semibold text-text-primary mb-4">
            Submit Your Idea
          </h1>
          <p className="text-lg text-text-secondary">
            Fill out the form below to validate your business idea
          </p>
        </motion.div>

        <IdeaForm />
      </main>
      <Footer />
    </div>
  )
}

