'use client'

import { useState } from 'react'
import { Search, TrendingUp, Globe, Sparkles, ExternalLink } from 'lucide-react'
import {
  GoogleSearchResult,
  GoogleTrendsData,
  BingSearchResult,
  DeepResearchSubTab,
} from '@/core/types/ai'
import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { MarkdownRenderer } from '@/shared/components/ui/MarkdownRenderer'

interface DeepResearchSubTabsProps {
  googleResults: GoogleSearchResult[]
  googleTrends: GoogleTrendsData[]
  bingResults: BingSearchResult[]
  aiSummary: string
}

export function DeepResearchSubTabs({
  googleResults,
  googleTrends,
  bingResults,
  aiSummary,
}: DeepResearchSubTabsProps) {
  const t = useTranslations()
  const [activeSubTab, setActiveSubTab] = useState<DeepResearchSubTab>('summary')

  const renderSearchResult = (
    result: GoogleSearchResult | BingSearchResult,
    index: number
  ) => (
    <div
      key={index}
      className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-colors shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <a
            href={result.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline line-clamp-1 flex items-center gap-1"
          >
            {result.title}
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
          </a>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
            {result.displayedLink || result.link}
          </p>
          <p className="text-xs text-gray-700 dark:text-gray-300 mt-1 line-clamp-2">
            {result.snippet}
          </p>
        </div>
        <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0 font-medium">
          #{result.position}
        </span>
      </div>
    </div>
  )

  const renderTrendData = (data: GoogleTrendsData, index: number) => (
    <div
      key={index}
      className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
    >
      <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
        {data.date}
      </span>
      <div className="flex items-center gap-3">
        <div
          className="h-2.5 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
          style={{ width: `${data.value}px`, maxWidth: '100px' }}
        />
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 w-8 text-right">
          {data.value}
        </span>
      </div>
    </div>
  )

  return (
    <div>
      {/* SubTab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
        <button
          type="button"
          onClick={() => setActiveSubTab('summary')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-t-lg transition-colors ${
            activeSubTab === 'summary'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          {t('ai_deep_research.ai_summary')}
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('google')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-t-lg transition-colors ${
            activeSubTab === 'google'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <Search className="w-4 h-4" />
          {t('ai_deep_research.google_search')}
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('trends')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-t-lg transition-colors ${
            activeSubTab === 'trends'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          {t('ai_deep_research.google_trends')}
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('bing')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-t-lg transition-colors ${
            activeSubTab === 'bing'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          <Globe className="w-4 h-4" />
          {t('ai_deep_research.bing_search')}
        </button>
      </div>

      {/* SubTab Content */}
      <div className="min-h-[200px]">
        {activeSubTab === 'summary' && (
          <div className="p-4 bg-blue-50 dark:bg-gray-900 rounded-lg border border-blue-200 dark:border-gray-700">
            <MarkdownRenderer
              content={aiSummary}
              className="text-gray-800 dark:text-gray-200"
            />
          </div>
        )}

        {activeSubTab === 'google' && (
          <div className="space-y-2">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 font-medium">
              {t('ai_deep_research.top_5_results')}
            </p>
            {googleResults.length > 0 ? (
              googleResults.map((result, index) =>
                renderSearchResult(result, index)
              )
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                {t('ai_deep_research.no_results')}
              </p>
            )}
          </div>
        )}

        {activeSubTab === 'trends' && (
          <div className="space-y-2">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 font-medium">
              {t('ai_deep_research.interest_over_time')}
            </p>
            {googleTrends.length > 0 ? (
              <div className="space-y-2">
                {googleTrends.map((data, index) =>
                  renderTrendData(data, index)
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                {t('ai_deep_research.no_trends_data')}
              </p>
            )}
          </div>
        )}

        {activeSubTab === 'bing' && (
          <div className="space-y-2">
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 font-medium">
              {t('ai_deep_research.top_5_results')}
            </p>
            {bingResults.length > 0 ? (
              bingResults.map((result, index) =>
                renderSearchResult(result, index)
              )
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                {t('ai_deep_research.no_results')}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
