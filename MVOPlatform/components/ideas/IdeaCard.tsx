'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUp, MessageSquare } from 'lucide-react'

interface IdeaCardProps {
  idea: {
    id: string
    title: string
    description: string
    author: string
    score: number
    votes: number
    tags: string[]
    createdAt: string
  }
}

export function IdeaCard({ idea }: IdeaCardProps) {
  const [voted, setVoted] = useState(false)
  const [voteCount, setVoteCount] = useState(idea.votes)

  const handleVote = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!voted) {
      setVoted(true)
      setVoteCount(voteCount + 1)
    }
  }

  return (
    <Link href={`/ideas/${idea.id}`}>
      <motion.article
        whileHover={{ y: -2 }}
        className="bg-background border-2 border-border-color rounded-md p-6 shadow-sm hover:shadow-md transition-all duration-250"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              {idea.title}
            </h2>
            <p className="text-base text-text-secondary leading-relaxed mb-4">
              {idea.description}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-semibold text-accent mb-1">
              {idea.score}
            </div>
            <div className="text-xs text-text-secondary">Score</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleVote}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-250 ${
                voted
                  ? 'bg-accent text-text-primary'
                  : 'bg-gray-50 text-text-secondary hover:bg-gray-100'
              }`}
            >
              <motion.div
                animate={voted ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <ArrowUp className="w-4 h-4" />
              </motion.div>
              <span className="text-sm font-medium">{voteCount}</span>
            </button>
            <div className="flex items-center gap-2 text-text-secondary">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm">12</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {idea.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 text-xs font-medium text-text-secondary bg-gray-50 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border-color flex items-center justify-between text-sm text-text-secondary">
          <span>By {idea.author}</span>
          <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
        </div>
      </motion.article>
    </Link>
  )
}

