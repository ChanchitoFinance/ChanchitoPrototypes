'use client'

import { motion } from 'framer-motion'

const steps = [
  {
    number: '01',
    title: 'Submit Your Idea',
    description: 'Fill out a simple form with your business idea details.',
  },
  {
    number: '02',
    title: 'AI Analysis',
    description: 'Our system analyzes your idea using market data and validation frameworks.',
  },
  {
    number: '03',
    title: 'Get Results',
    description: 'Receive a comprehensive validation report within 48 hours.',
  },
]

export function Process() {
  return (
    <section className="bg-white py-24">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-semibold text-text-primary mb-4">
            How It Works
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            A simple three-step process to validate your business idea
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="text-center"
            >
              <div className="text-6xl font-semibold text-accent mb-4">
                {step.number}
              </div>
              <h3 className="text-xl font-medium text-text-primary mb-3">
                {step.title}
              </h3>
              <p className="text-base text-text-secondary leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

