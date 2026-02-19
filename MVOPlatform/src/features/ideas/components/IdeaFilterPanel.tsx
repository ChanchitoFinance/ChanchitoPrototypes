'use client'

import { useState } from 'react'
import { Filter, X, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { useAppSelector } from '@/core/lib/hooks'
import {
  FilterConfig,
  FilterCondition,
  SortConfig,
  SortOption,
  FilterOperator,
  SortDirection,
  SortField,
  FILTER_OPERATORS,
} from '../types/filter.types'

export function IdeaFilterPanel({
  filterConfigs,
  sortConfigs,
  onFilterChange,
  onSortChange,
  initialFilters = [],
  initialSort,
}: {
  filterConfigs: FilterConfig[]
  sortConfigs: SortConfig[]
  onFilterChange: (filters: FilterCondition[]) => void
  onSortChange: (sort: SortOption) => void
  initialFilters?: FilterCondition[]
  initialSort?: SortOption
}) {
  const t = useTranslations()
  const { theme } = useAppSelector(state => state.theme)
  const isDark = theme === 'dark'
  const [filters, setFilters] = useState<FilterCondition[]>(initialFilters)
  const [sortOption, setSortOption] = useState<SortOption | undefined>(
    initialSort
  )
  const [isExpanded, setIsExpanded] = useState(false)

  const addFilter = () => {
    const newFilter: FilterCondition = {
      field: filterConfigs[0].field,
      operator: '>',
      value: 0,
    }
    const updatedFilters = [...filters, newFilter]
    setFilters(updatedFilters)
    onFilterChange(updatedFilters)
  }

  const removeFilter = (index: number) => {
    const updatedFilters = filters.filter((_, i) => i !== index)
    setFilters(updatedFilters)
    onFilterChange(updatedFilters)
  }

  const updateFilter = (index: number, updates: Partial<FilterCondition>) => {
    const updatedFilters = filters.map((filter, i) =>
      i === index ? { ...filter, ...updates } : filter
    )
    setFilters(updatedFilters)
    onFilterChange(updatedFilters)
  }

  const handleSortChange = (field: string) => {
    let direction: SortDirection = 'asc'
    if (sortOption?.field === field) {
      direction = sortOption.direction === 'asc' ? 'desc' : 'asc'
    }
    const newSort = { field: field as SortField, direction }
    setSortOption(newSort)
    onSortChange(newSort)
  }

  const clearAllFilters = () => {
    setFilters([])
    onFilterChange([])
  }

  const clearSort = () => {
    setSortOption(undefined)
    onSortChange({ field: 'createdAt', direction: 'desc' })
  }

  return (
    <div
      className={`rounded-lg shadow-sm border p-4 mb-6 ${
        isDark ? 'bg-black border-white/10' : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3
          className={`text-lg font-semibold flex items-center gap-2 ${
            isDark ? 'text-white' : 'text-text-primary'
          }`}
        >
          <Filter className="w-5 h-5" />
          {t('browse.dashboard.advanced_filters_sorting')}
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`transition-colors ${
            isDark
              ? 'text-white/60 hover:text-white'
              : 'text-text-secondary hover:text-text-primary'
          }`}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-5 h-5 inline-block mr-1" />
              {t('browse.dashboard.collapse')}
            </>
          ) : (
            <>
              <ChevronDown className="w-5 h-5 inline-block mr-1" />
              {t('browse.dashboard.expand')}
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4
                className={`font-medium ${
                  isDark ? 'text-white' : 'text-text-primary'
                }`}
              >
                {t('browse.dashboard.filter_conditions')}
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={addFilter}
                  className="px-3 py-1 bg-accent text-text-primary rounded-md hover:bg-accent/90 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  {t('browse.dashboard.add_filter')}
                </button>
                {filters.length > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1 ${
                      isDark
                        ? 'bg-white/10 text-white/60 hover:bg-white/20'
                        : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                    }`}
                  >
                    <X className="w-4 h-4" />
                    {t('browse.dashboard.clear_all')}
                  </button>
                )}
              </div>
            </div>

            {filters.length === 0 ? (
              <p
                className={`text-sm italic ${
                  isDark ? 'text-white/60' : 'text-text-secondary'
                }`}
              >
                {t('browse.dashboard.no_filters_applied')}
              </p>
            ) : (
              <div className="space-y-3">
                {filters.map((filter, index) => (
                  <div
                    key={index}
                    className={`flex items-end gap-3 p-3 border rounded-md ${
                      isDark
                        ? 'bg-white/5 border-white/10'
                        : 'bg-gray-50 border-gray-100'
                    }`}
                  >
                    <div className="flex-1">
                      <label
                        className={`block text-sm font-medium mb-1 ${
                          isDark ? 'text-white' : 'text-text-secondary'
                        }`}
                      >
                        {t('browse.dashboard.field')}
                      </label>
                      <select
                        value={filter.field}
                        onChange={e =>
                          updateFilter(index, { field: e.target.value as any })
                        }
                        className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-accent focus:border-transparent text-black ${
                          isDark
                            ? 'bg-white/10 border-white/20'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        {filterConfigs.map(config => (
                          <option
                            key={config.id}
                            value={config.field}
                            className="text-black"
                          >
                            {config.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-40">
                      <label
                        className={`block text-sm font-medium mb-1 ${
                          isDark ? 'text-white' : 'text-text-secondary'
                        }`}
                      >
                        {t('browse.dashboard.condition')}
                      </label>
                      <select
                        value={filter.operator}
                        onChange={e =>
                          updateFilter(index, {
                            operator: e.target.value as FilterOperator,
                          })
                        }
                        className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-accent focus:border-transparent text-black ${
                          isDark
                            ? 'bg-white/10 border-white/20'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        {FILTER_OPERATORS.map(op => (
                          <option
                            key={op.value}
                            value={op.value}
                            className="text-black"
                          >
                            {t(op.label)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-24">
                      <label
                        className={`block text-sm font-medium mb-1 ${
                          isDark ? 'text-white' : 'text-text-secondary'
                        }`}
                      >
                        {t('browse.dashboard.value')}
                      </label>
                      <input
                        type="number"
                        value={filter.value}
                        onChange={e =>
                          updateFilter(index, {
                            value: parseFloat(e.target.value) || 0,
                          })
                        }
                        min={
                          filterConfigs.find(c => c.field === filter.field)
                            ?.minValue || 0
                        }
                        max={
                          filterConfigs.find(c => c.field === filter.field)
                            ?.maxValue
                        }
                        step={
                          filterConfigs.find(c => c.field === filter.field)
                            ?.step || 1
                        }
                        className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-accent focus:border-transparent text-black ${
                          isDark
                            ? 'bg-white/10 border-white/20'
                            : 'bg-white border-gray-200'
                        }`}
                      />
                    </div>

                    <button
                      onClick={() => removeFilter(index)}
                      className={`p-2 transition-colors mb-2 ${
                        isDark
                          ? 'text-white/60 hover:text-error'
                          : 'text-text-secondary hover:text-error'
                      }`}
                      title="Remove filter"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h4
                className={`font-medium ${
                  isDark ? 'text-white' : 'text-text-primary'
                }`}
              >
                {t('browse.dashboard.sorting')}
              </h4>
              <button
                onClick={clearSort}
                className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1 ${
                  isDark
                    ? 'bg-white/10 text-white/60 hover:bg-white/20'
                    : 'bg-gray-100 text-text-secondary hover:bg-gray-200'
                }`}
                disabled={!sortOption}
              >
                <X className="w-4 h-4" />
                {t('browse.dashboard.clear_sort')}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {sortConfigs.map(config => (
                <button
                  key={config.id}
                  onClick={() => handleSortChange(config.field)}
                  className={`px-3 py-2 rounded-md text-sm transition-colors border flex items-center justify-between ${
                    sortOption?.field === config.field
                      ? 'bg-accent text-text-primary border-accent'
                      : isDark
                        ? 'bg-white/5 text-white border-white/10 hover:bg-white/10'
                        : 'bg-white text-text-primary border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <span>{config.label}</span>
                  {sortOption?.field === config.field && (
                    <span className="text-xs ml-1">
                      {sortOption.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {sortOption && (
              <div
                className={`mt-4 text-sm ${
                  isDark ? 'text-white/60' : 'text-text-secondary'
                }`}
              >
                {t('browse.dashboard.sorting_by')}:{' '}
                <strong>
                  {sortConfigs.find(c => c.field === sortOption.field)?.label}
                </strong>{' '}
                (
                {sortOption.direction === 'asc'
                  ? t('browse.dashboard.ascending')
                  : t('browse.dashboard.descending')}
                )
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
