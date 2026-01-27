import { MarketValidationResult } from '@/core/types/ai'

interface StoredResearch {
  research: MarketValidationResult
  ideaHash: string
  version: number
  timestamp: number
}

interface ResearchHistory {
  versions: StoredResearch[]
  currentVersion: number
}

class DeepResearchStorage {
  private getStorageKey(ideaHash: string): string {
    return `deep_research_${ideaHash}`
  }

  private generateIdeaHash(
    title: string,
    description: string,
    contentLength: number,
    tags: string[]
  ): string {
    const data = `${title}|${description}|${contentLength}|${[...tags].sort().join(',')}`
    let hash = 0
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(36)
  }

  saveResearch(
    research: MarketValidationResult,
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

    const existingData = this.getResearchHistory(ideaHash)

    const newVersion: StoredResearch = {
      research,
      ideaHash,
      version: existingData.versions.length + 1,
      timestamp: Date.now(),
    }

    const updatedHistory: ResearchHistory = {
      versions: [...existingData.versions, newVersion],
      currentVersion: newVersion.version,
    }

    localStorage.setItem(storageKey, JSON.stringify(updatedHistory))
  }

  getResearchHistory(
    ideaHashOrData:
      | string
      | {
          title: string
          description: string
          contentLength: number
          tags: string[]
        }
  ): ResearchHistory {
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

  getLatestResearch(
    title: string,
    description: string,
    contentLength: number,
    tags: string[]
  ): MarketValidationResult | null {
    const history = this.getResearchHistory({
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
      currentVersion?.research ||
      history.versions[history.versions.length - 1].research
    )
  }

  setCurrentVersion(ideaHash: string, version: number): void {
    const storageKey = this.getStorageKey(ideaHash)
    const history = this.getResearchHistory(ideaHash)

    if (history.versions.some(v => v.version === version)) {
      history.currentVersion = version
      localStorage.setItem(storageKey, JSON.stringify(history))
    }
  }

  clearResearch(ideaHash: string): void {
    const storageKey = this.getStorageKey(ideaHash)
    localStorage.removeItem(storageKey)
  }

  clearAllResearch(): void {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith('deep_research_')) {
        localStorage.removeItem(key)
      }
    })
  }

  getAllResearchKeys(): string[] {
    const keys = Object.keys(localStorage)
    return keys
      .filter(key => key.startsWith('deep_research_'))
      .map(key => key.replace('deep_research_', ''))
  }
}

export const deepResearchStorage = new DeepResearchStorage()
