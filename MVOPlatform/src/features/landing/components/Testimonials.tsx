'use client'

import { motion } from 'framer-motion'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Founder, TechStart',
    content:
      'The validation report helped me pivot before wasting months on the wrong idea. Highly recommended!',
    score: 82,
  },
  {
    name: 'Michael Rodriguez',
    role: 'Entrepreneur',
    content:
      'Got insights I never would have thought of. The market analysis was spot-on.',
    score: 75,
  },
  {
    name: 'Emily Johnson',
    role: 'Product Manager',
    content:
      'Fast turnaround and detailed feedback. Worth every penny for the peace of mind.',
    score: 88,
  },
]

export function Testimonials() {
  return (
    <section className="bg-background py-24">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-heading-1 mb-4">
            What Our Users Say
          </h2>
          <p className="text-body-large max-w-2xl mx-auto">
            Real feedback from entrepreneurs who validated their ideas
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="card-white"
            >
              <div className="text-3xl font-semibold text-accent mb-4">
                {testimonial.score}
              </div>
              <p className="text-base text-text-secondary mb-6 leading-relaxed">
                &quot;{testimonial.content}&quot;
              </p>
              <div>
                <div className="text-sm font-medium text-text-primary">
                  {testimonial.name}
                </div>
                <div className="text-xs text-text-secondary">
                  {testimonial.role}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

