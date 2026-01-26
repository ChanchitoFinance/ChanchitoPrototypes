'use client'

import {
  Users,
  Globe,
  Briefcase,
  Clock,
  Target,
  Building2,
  MapPin,
  Sparkles,
} from 'lucide-react'
import { MarketSnapshot } from '@/core/types/ai'
import { useTranslations } from '@/shared/components/providers/I18nProvider'

interface MarketSnapshotSectionProps {
  snapshot: MarketSnapshot
}

export function MarketSnapshotSection({ snapshot }: MarketSnapshotSectionProps) {
  const t = useTranslations()

  const getMarketTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      'B2C': 'B2C (Business to Consumer)',
      'B2B': 'B2B (Business to Business)',
      'B2B2C': 'B2B2C (Business to Business to Consumer)',
    }
    return labels[type] || type
  }

  const getScopeLabel = (scope: string): string => {
    return scope === 'horizontal'
      ? t('market_validation.snapshot.horizontal')
      : t('market_validation.snapshot.vertical')
  }

  const getCategoryLabel = (category: string): string => {
    return category === 'new_category'
      ? t('market_validation.snapshot.new_category')
      : t('market_validation.snapshot.existing_category')
  }

  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {t('market_validation.snapshot.intro')}
          </p>
        </div>
      </div>

      {/* Customer Segment Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {t('market_validation.snapshot.customer_segment')}
            </h3>
          </div>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              <Target className="w-3.5 h-3.5" />
              {t('market_validation.snapshot.primary_user')}
            </div>
            <p className="text-sm text-gray-800 dark:text-gray-200">
              {snapshot.customerSegment.primaryUser}
            </p>
          </div>

          {snapshot.customerSegment.buyer && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                <Briefcase className="w-3.5 h-3.5" />
                {t('market_validation.snapshot.buyer')}
              </div>
              <p className="text-sm text-gray-800 dark:text-gray-200">
                {snapshot.customerSegment.buyer}
              </p>
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              <Clock className="w-3.5 h-3.5" />
              {t('market_validation.snapshot.context_of_use')}
            </div>
            <p className="text-sm text-gray-800 dark:text-gray-200">
              {snapshot.customerSegment.contextOfUse}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
              <Building2 className="w-3.5 h-3.5" />
              {t('market_validation.snapshot.environment')}
            </div>
            <p className="text-sm text-gray-800 dark:text-gray-200 capitalize">
              {snapshot.customerSegment.environment}
            </p>
          </div>
        </div>
      </div>

      {/* Market Context Card */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {t('market_validation.snapshot.market_context')}
            </h3>
          </div>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-sm font-medium">
              {getMarketTypeLabel(snapshot.marketContext.type)}
            </div>
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium">
              {getScopeLabel(snapshot.marketContext.scope)}
            </div>
            <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-sm font-medium">
              {getCategoryLabel(snapshot.marketContext.categoryType)}
            </div>
          </div>
        </div>
      </div>

      {/* Geography & Timing Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Geography Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4 text-red-500" />
            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
              {t('market_validation.snapshot.geography')}
            </h4>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {snapshot.geography}
          </p>
        </div>

        {/* Timing Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-orange-500" />
            <h4 className="font-medium text-gray-900 dark:text-white text-sm">
              {t('market_validation.snapshot.timing_context')}
            </h4>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {snapshot.timingContext}
          </p>
        </div>
      </div>
    </div>
  )
}
