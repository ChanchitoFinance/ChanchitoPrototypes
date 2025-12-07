'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { IdeaCard } from '@/components/ideas/IdeaCard'
import { motion } from 'framer-motion'

interface Idea {
  id: string
  title: string
  description: string
  author: string
  score: number
  votes: number
  tags: string[]
  createdAt: string
}

const mockIdeas: Idea[] = [
  {
    id: '1',
    title: 'AI-Powered Meal Planning App',
    description:
      'An app that uses AI to create personalized meal plans based on dietary restrictions, budget, and preferences.',
    author: 'Sarah Chen',
    score: 82,
    votes: 45,
    tags: ['AI', 'Health', 'Food'],
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    title: 'Sustainable Fashion Marketplace',
    description:
      'A platform connecting eco-conscious consumers with sustainable fashion brands.',
    author: 'Michael Rodriguez',
    score: 75,
    votes: 32,
    tags: ['Fashion', 'Sustainability', 'E-commerce'],
    createdAt: '2024-01-14',
  },
  {
    id: '3',
    title: 'Remote Team Building Platform',
    description:
      'Virtual team building activities and games for distributed teams.',
    author: 'Emily Johnson',
    score: 88,
    votes: 67,
    tags: ['SaaS', 'Remote Work', 'HR'],
    createdAt: '2024-01-13',
  },
]

export function IdeasFeed() {
  const [ideas, setIdeas] = useState<Idea[]>(mockIdeas)
  const [loading, setLoading] = useState(false)

  const handleLoadMore = async () => {
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-semibold text-text-primary mb-4">
            Browse Ideas
          </h1>
          <p className="text-lg text-text-secondary">
            Discover and vote on validated business ideas
          </p>
        </motion.div>

        <div className="space-y-6">
          {ideas.map((idea, index) => (
            <motion.div
              key={idea.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <IdeaCard idea={idea} />
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={handleLoadMore}
            disabled={loading}
            className="px-6 py-3 text-base font-medium text-text-secondary border-2 border-gray-100 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      </main>
      <Footer />
    </div>
  )
}

