import { AIFeedback } from '@/core/types/ai'

interface StoredFeedback {
  feedback: AIFeedback
  ideaHash: string
  version: number
  timestamp: number
}

interface FeedbackHistory {
  versions: StoredFeedback[]
  currentVersion: number
}

class AIFeedbackStorage {
  private getStorageKey(ideaHash: string): string {
    return `ai_feedback_${ideaHash}`
  }

  private generateIdeaHash(
    title: string,
    description: string,
    contentLength: number,
    tags: string[]
  ): string {
    const data = `${title}|${description}|${contentLength}|${tags.sort().join(',')}`
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(36)
  }

  saveFeedback(
    feedback: AIFeedback,
    title: string,
    description: string,
    contentLength: number,
    tags: string[]
  ): void {
    const ideaHash = this.generateIdeaHash(
      title,
      description,
      contentLength,
      tags
    )
    const storageKey = this.getStorageKey(ideaHash)

    const existingData = this.getFeedbackHistory(ideaHash)

    const newVersion: StoredFeedback = {
      feedback,
      ideaHash,
      version: existingData.versions.length + 1,
      timestamp: Date.now(),
    }

    const updatedHistory: FeedbackHistory = {
      versions: [...existingData.versions, newVersion],
      currentVersion: newVersion.version,
    }

    localStorage.setItem(storageKey, JSON.stringify(updatedHistory))
  }

  getFeedbackHistory(
    ideaHashOrData:
      | string
      | {
          title: string
          description: string
          contentLength: number
          tags: string[]
        }
  ): FeedbackHistory {
    const ideaHash =
      typeof ideaHashOrData === 'string'
        ? ideaHashOrData
        : this.generateIdeaHash(
            ideaHashOrData.title,
            ideaHashOrData.description,
            ideaHashOrData.contentLength,
            ideaHashOrData.tags
          )

    const storageKey = this.getStorageKey(ideaHash)
    const stored = localStorage.getItem(storageKey)

    if (!stored) {
      return { versions: [], currentVersion: 0 }
    }

    try {
      return JSON.parse(stored)
    } catch {
      return { versions: [], currentVersion: 0 }
    }
  }

  getLatestFeedback(
    title: string,
    description: string,
    contentLength: number,
    tags: string[]
  ): AIFeedback | null {
    const history = this.getFeedbackHistory({
      title,
      description,
      contentLength,
      tags,
    })

    if (history.versions.length === 0) {
      return null
    }

    const currentVersion = history.versions.find(
      v => v.version === history.currentVersion
    )
    return (
      currentVersion?.feedback ||
      history.versions[history.versions.length - 1].feedback
    )
  }

  setCurrentVersion(ideaHash: string, version: number): void {
    const storageKey = this.getStorageKey(ideaHash)
    const history = this.getFeedbackHistory(ideaHash)

    if (history.versions.some(v => v.version === version)) {
      history.currentVersion = version
      localStorage.setItem(storageKey, JSON.stringify(history))
    }
  }

  clearFeedback(ideaHash: string): void {
    const storageKey = this.getStorageKey(ideaHash)
    localStorage.removeItem(storageKey)
  }

  clearAllFeedback(): void {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('ai_feedback_')) {
        localStorage.removeItem(key)
      }
    })
  }

  getAllFeedbackKeys(): string[] {
    const keys = Object.keys(localStorage)
    return keys
      .filter(key => key.startsWith('ai_feedback_'))
      .map(key => key.replace('ai_feedback_', ''))
  }
}

export const aiFeedbackStorage = new AIFeedbackStorage()
