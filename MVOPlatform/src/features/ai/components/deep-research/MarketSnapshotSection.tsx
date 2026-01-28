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

export function MarketSnapshotSection({
  snapshot,
}: MarketSnapshotSectionProps) {
  const t = useTranslations()

  const getMarketTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      B2C: 'B2C (Business to Consumer)',
      B2B: 'B2B (Business to Business)',
      B2B2C: 'B2B2C (Business to Business to Consumer)',
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
      <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(160, 123, 207, 0.1)', border: '1px solid var(--primary-accent)' }}>
        <div className="flex items-start gap-3">
          <Sparkles className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'var(--primary-accent)' }} />
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {t('market_validation.snapshot.intro')}
          </p>
        </div>
      </div>

      {/* Customer Segment Card */}
      <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--gray-100)', border: '1px solid var(--border-color)' }}>
        <div className="px-4 py-3" style={{ backgroundColor: 'rgba(160, 123, 207, 0.15)', borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" style={{ color: 'var(--primary-accent)' }} />
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {t('market_validation.snapshot.customer_segment')}
            </h3>
          </div>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium uppercase" style={{ color: 'var(--text-secondary)' }}>
              <Target className="w-3.5 h-3.5" />
              {t('market_validation.snapshot.primary_user')}
            </div>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
              {snapshot.customerSegment.primaryUser}
            </p>
          </div>

          {snapshot.customerSegment.buyer && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-medium uppercase" style={{ color: 'var(--text-secondary)' }}>
                <Briefcase className="w-3.5 h-3.5" />
                {t('market_validation.snapshot.buyer')}
              </div>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
                {snapshot.customerSegment.buyer}
              </p>
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium uppercase" style={{ color: 'var(--text-secondary)' }}>
              <Clock className="w-3.5 h-3.5" />
              {t('market_validation.snapshot.context_of_use')}
            </div>
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>
              {snapshot.customerSegment.contextOfUse}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-medium uppercase" style={{ color: 'var(--text-secondary)' }}>
              <Building2 className="w-3.5 h-3.5" />
              {t('market_validation.snapshot.environment')}
            </div>
            <p className="text-sm capitalize" style={{ color: 'var(--text-primary)' }}>
              {snapshot.customerSegment.environment}
            </p>
          </div>
        </div>
      </div>

      {/* Market Context Card */}
      <div className="rounded-lg overflow-hidden" style={{ backgroundColor: 'var(--gray-100)', border: '1px solid var(--border-color)' }}>
        <div className="px-4 py-3" style={{ backgroundColor: 'rgba(160, 123, 207, 0.15)', borderBottom: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5" style={{ color: 'var(--primary-accent)' }} />
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>
              {t('market_validation.snapshot.market_context')}
            </h3>
          </div>
        </div>
        <div className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium" style={{ backgroundColor: 'rgba(160, 123, 207, 0.2)', color: 'var(--primary-accent)' }}>
              {getMarketTypeLabel(snapshot.marketContext.type)}
            </div>
            <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium" style={{ backgroundColor: 'rgba(160, 123, 207, 0.2)', color: 'var(--primary-accent)' }}>
              {getScopeLabel(snapshot.marketContext.scope)}
            </div>
            <div className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium" style={{ backgroundColor: 'rgba(160, 123, 207, 0.2)', color: 'var(--primary-accent)' }}>
              {getCategoryLabel(snapshot.marketContext.categoryType)}
            </div>
          </div>
        </div>
      </div>

      {/* Geography & Timing Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Geography Card */}
        <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--gray-100)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-4 h-4" style={{ color: 'var(--primary-accent)' }} />
            <h4 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
              {t('market_validation.snapshot.geography')}
            </h4>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {snapshot.geography}
          </p>
        </div>

        {/* Timing Card */}
        <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--gray-100)', border: '1px solid var(--border-color)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4" style={{ color: 'var(--primary-accent)' }} />
            <h4 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>
              {t('market_validation.snapshot.timing_context')}
            </h4>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {snapshot.timingContext}
          </p>
        </div>
      </div>
    </div>
  )
}
