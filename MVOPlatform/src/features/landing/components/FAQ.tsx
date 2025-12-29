'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    question: 'How long does validation take?',
    answer:
      'Most validations are completed within 48 hours. Pro plans get 24-hour turnaround, and Enterprise plans get 12-hour turnaround.',
  },
  {
    question: 'What information do I need to provide?',
    answer:
      'You need to provide a description of your business idea, target market, and any initial research you have. The more detail, the better the validation.',
  },
  {
    question: 'Can I validate multiple ideas?',
    answer:
      'Yes! Basic plans include one idea, Pro plans include up to 5 ideas, and Enterprise plans include unlimited ideas.',
  },
  {
    question: 'What if my idea scores low?',
    answer:
      'Low scores help you identify areas for improvement. Our reports include actionable recommendations to strengthen your idea.',
  },
  {
    question: 'Is my idea kept confidential?',
    answer:
      'Yes, all submissions are kept confidential. We never share your ideas with third parties without your explicit consent.',
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section className="bg-background py-24">
      <div className="max-w-3xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-heading-1 mb-4">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="card-white overflow-hidden border-2 border-border-color"
            >
              <button
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                className="w-full px-6 py-4 flex items-center justify-between text-left interactive-hover"
              >
                <span className="text-base font-medium text-text-primary">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-text-secondary transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 py-4 text-sm text-text-secondary leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

