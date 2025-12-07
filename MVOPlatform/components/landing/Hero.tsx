'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export function Hero() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24 md:py-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-4xl mx-auto"
      >
        <h1 className="text-5xl md:text-6xl font-semibold text-text-primary mb-6 leading-tight">
          Validate your business idea in{' '}
          <span className="text-accent">48 hours</span>
        </h1>
        <p className="text-xl text-text-secondary mb-12 leading-relaxed">
          Get data-driven insights and validation scores for your business idea.
          Make informed decisions before investing time and resources.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/submit">
            <Button size="lg" variant="primary">
              Submit Your Idea
            </Button>
          </Link>
          <Link href="/ideas">
            <Button size="lg" variant="outline">
              Browse Ideas
            </Button>
          </Link>
        </div>
      </motion.div>
    </section>
  )
}

