/**
 * Ingestion Service
 * Responsible for cleaning and chunking search results before AI processing
 */

import {
  GoogleSearchResult,
  BingSearchResult,
  GoogleTrendsData,
  ChunkedContent,
} from '@/core/types/ai'

/**
 * Clean and normalize text content
 */
function cleanText(text: string): string {
  if (!text) return ''

  return text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\x20-\x7E\u00C0-\u024F\u1E00-\u1EFF]/g, '') // Remove non-printable chars (keep Latin chars)
    .trim()
}

/**
 * Extract domain from URL for source identification
 */
function extractDomain(url: string): string {
  try {
    const domain = new URL(url).hostname.replace('www.', '')
    return domain
  } catch {
    return url
  }
}

/**
 * Process Google search results into chunked content
 */
function processGoogleResults(results: GoogleSearchResult[]): ChunkedContent[] {
  return results
    .filter(result => result.link && result.title)
    .map(result => ({
      url: result.link,
      title: cleanText(result.title),
      cleanedText: cleanText(
        `${result.title}. ${result.snippet || ''}`
      ),
      source: 'google' as const,
    }))
}

/**
 * Process Bing search results into chunked content
 */
function processBingResults(results: BingSearchResult[]): ChunkedContent[] {
  return results
    .filter(result => result.link && result.title)
    .map(result => ({
      url: result.link,
      title: cleanText(result.title),
      cleanedText: cleanText(
        `${result.title}. ${result.snippet || ''}`
      ),
      source: 'bing' as const,
    }))
}

/**
 * Process Google Trends data into a summary chunk
 */
function processTrendsData(trendsData: GoogleTrendsData[]): ChunkedContent | null {
  if (!trendsData || trendsData.length === 0) return null

  const trendSummary = trendsData
    .map(t => `${t.date}: interest level ${t.value}`)
    .join('; ')

  const avgInterest = Math.round(
    trendsData.reduce((sum, t) => sum + t.value, 0) / trendsData.length
  )

  const trend = trendsData.length >= 2
    ? trendsData[trendsData.length - 1].value > trendsData[0].value
      ? 'increasing'
      : trendsData[trendsData.length - 1].value < trendsData[0].value
        ? 'decreasing'
        : 'stable'
    : 'unknown'

  return {
    url: 'https://trends.google.com',
    title: `Google Trends Analysis: ${trendsData[0]?.query || 'Search Term'}`,
    cleanedText: `Search interest trend analysis: ${trendSummary}. Average interest: ${avgInterest}/100. Overall trend: ${trend}.`,
    source: 'trends' as const,
  }
}

/**
 * Remove duplicate URLs while preserving order
 */
function deduplicateByUrl(chunks: ChunkedContent[]): ChunkedContent[] {
  const seen = new Set<string>()
  return chunks.filter(chunk => {
    const normalized = chunk.url.toLowerCase().replace(/\/$/, '')
    if (seen.has(normalized)) return false
    seen.add(normalized)
    return true
  })
}

/**
 * Main ingestion function - processes all search results into chunked content
 */
export function ingestSearchResults(
  googleResults: GoogleSearchResult[],
  bingResults: BingSearchResult[],
  trendsData: GoogleTrendsData[]
): ChunkedContent[] {
  const chunks: ChunkedContent[] = []

  // Process Google results first (higher priority)
  chunks.push(...processGoogleResults(googleResults))

  // Process Bing results
  chunks.push(...processBingResults(bingResults))

  // Add trends data as a single summary chunk
  const trendsChunk = processTrendsData(trendsData)
  if (trendsChunk) {
    chunks.push(trendsChunk)
  }

  // Remove duplicates while preserving source priority
  return deduplicateByUrl(chunks)
}

/**
 * Format chunked content for AI prompt
 */
export function formatChunksForPrompt(chunks: ChunkedContent[]): string {
  return chunks
    .map((chunk, index) => {
      const domain = extractDomain(chunk.url)
      return `[${index + 1}] Source: ${domain}
Title: ${chunk.title}
Content: ${chunk.cleanedText}
URL: ${chunk.url}`
    })
    .join('\n\n')
}

/**
 * Get source citations from chunks
 */
export function getSourceCitations(
  chunks: ChunkedContent[]
): { index: number; title: string; url: string; source: string }[] {
  return chunks.map((chunk, index) => ({
    index: index + 1,
    title: chunk.title,
    url: chunk.url,
    source: chunk.source,
  }))
}
