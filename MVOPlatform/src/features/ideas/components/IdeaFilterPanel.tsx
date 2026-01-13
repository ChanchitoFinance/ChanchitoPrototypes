'use client'

import { useState } from 'react'
import { Filter, X, Plus, Minus, ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslations } from '@/shared/components/providers/I18nProvider'
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary dark:text-white flex items-center gap-2">
          <Filter className="w-5 h-5" />
          {t('browse.dashboard.advanced_filters_sorting')}
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-text-secondary dark:text-gray-300 transition-colors"
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
          {/* Filter Conditions */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-text-primary dark:text-white">
                {t('browse.dashboard.filter_conditions')}
              </h4>
              <div className="flex gap-2">
                <button
                  onClick={addFilter}
                  className="px-3 py-1 bg-accent text-black rounded-md hover:bg-accent-dark transition-colors flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  {t('browse.dashboard.add_filter')}
                </button>
                {filters.length > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="px-3 py-1 bg-gray-100 text-text-secondary rounded-md hover:bg-gray-200 transition-colors flex items-center gap-1"
                  >
                    <X className="w-4 h-4" />
                    {t('browse.dashboard.clear_all')}
                  </button>
                )}
              </div>
            </div>

            {filters.length === 0 ? (
              <p className="text-text-secondary dark:text-gray-300 text-sm italic">
                {t('browse.dashboard.no_filters_applied')}
              </p>
            ) : (
              <div className="space-y-3">
                {filters.map((filter, index) => (
                  <div
                    key={index}
                    className="flex items-end gap-3 p-3 border border-gray-100 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600"
                  >
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-text-secondary dark:text-white mb-1">
                        {t('browse.dashboard.field')}
                      </label>
                      <select
                        value={filter.field}
                        onChange={e =>
                          updateFilter(index, { field: e.target.value as any })
                        }
                        className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent text-black"
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
                      <label className="block text-sm font-medium text-text-secondary dark:text-white mb-1">
                        {t('browse.dashboard.condition')}
                      </label>
                      <select
                        value={filter.operator}
                        onChange={e =>
                          updateFilter(index, {
                            operator: e.target.value as FilterOperator,
                          })
                        }
                        className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent text-black"
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
                      <label className="block text-sm font-medium text-text-secondary dark:text-white mb-1">
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
                        className="w-full p-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-accent focus:border-transparent text-black"
                      />
                    </div>

                    <button
                      onClick={() => removeFilter(index)}
                      className="p-2 text-text-secondary hover:text-red-500 transition-colors mb-2"
                      title="Remove filter"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sorting Options */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-text-primary dark:text-white">
                {t('browse.dashboard.sorting')}
              </h4>
              <button
                onClick={clearSort}
                className="px-3 py-1 bg-gray-100 text-text-secondary rounded-md hover:bg-gray-200 transition-colors flex items-center gap-1"
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
                      ? 'bg-accent text-black border-accent'
                      : 'bg-white text-black border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-black'
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
              <div className="mt-4 text-sm text-text-secondary dark:text-gray-300">
                {t('browse.dashboard.sorting_by')}:{' '}
                <strong>
                  {sortConfigs.find(c => c.field === sortOption.field)?.label}
                </strong>
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
