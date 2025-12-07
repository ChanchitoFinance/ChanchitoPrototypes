'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export function CTA() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl font-semibold text-text-primary mb-4">
            Ready to Validate Your Idea?
          </h2>
          <p className="text-lg text-text-secondary mb-8 max-w-2xl mx-auto">
            Join hundreds of entrepreneurs who have validated their business
            ideas with our platform.
          </p>
          <Link href="/submit">
            <Button size="lg" variant="primary">
              Submit Your Idea Now
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

