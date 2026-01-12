import { Idea } from '@/core/types/idea'
import {
  FilterCondition,
  IdeaFilters,
  SortOption,
  FilterOperator,
} from '../types/filter.types'

export class IdeaFilterService {
  static applyFilters(ideas: Idea[], filters: IdeaFilters): Idea[] {
    let filteredIdeas = [...ideas]

    // Apply search query filter
    if (filters.searchQuery) {
      const searchTerm = filters.searchQuery.toLowerCase()
      filteredIdeas = filteredIdeas.filter(
        idea =>
          idea.title.toLowerCase().includes(searchTerm) ||
          idea.description.toLowerCase().includes(searchTerm) ||
          idea.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      )
    }

    // Apply filter conditions
    if (filters.filterConditions && filters.filterConditions.length > 0) {
      filteredIdeas = filteredIdeas.filter(idea =>
        this.applyFilterConditions(idea, filters.filterConditions!)
      )
    }

    // Apply sorting
    if (filters.sortOption) {
      filteredIdeas = this.applySorting(filteredIdeas, filters.sortOption)
    }

    // Apply pagination
    if (filters.limit !== undefined && filters.offset !== undefined) {
      return filteredIdeas.slice(filters.offset, filters.offset + filters.limit)
    }

    return filteredIdeas
  }

  private static applyFilterConditions(
    idea: Idea,
    conditions: FilterCondition[]
  ): boolean {
    return conditions.every(condition => {
      const fieldValue = this.getFieldValue(idea, condition.field)
      return this.compareValues(fieldValue, condition.operator, condition.value)
    })
  }

  private static getFieldValue(idea: Idea, field: string): number {
    // Handle nested fields like 'votesByType.use'
    if (field.startsWith('votesByType.')) {
      const voteType = field.split('.')[1] as keyof typeof idea.votesByType
      return idea.votesByType[voteType] || 0
    }

    // Handle regular fields
    switch (field) {
      case 'score':
        return idea.score
      case 'votes':
        return idea.votes
      case 'commentCount':
        return idea.commentCount
      default:
        return 0
    }
  }

  private static compareValues(
    value: number,
    operator: FilterOperator,
    target: number
  ): boolean {
    switch (operator) {
      case '>':
        return value > target
      case '<':
        return value < target
      case '=':
        return value === target
      case '>=':
        return value >= target
      case '<=':
        return value <= target
      default:
        return true
    }
  }

  private static applySorting(ideas: Idea[], sortOption: SortOption): Idea[] {
    return [...ideas].sort((a, b) => {
      // Handle different field types appropriately
      switch (sortOption.field) {
        case 'title':
          const titleA = a.title.toLowerCase()
          const titleB = b.title.toLowerCase()
          return sortOption.direction === 'asc'
            ? titleA.localeCompare(titleB)
            : titleB.localeCompare(titleA)

        case 'createdAt':
          const dateA = new Date(a.createdAt).getTime()
          const dateB = new Date(b.createdAt).getTime()
          return sortOption.direction === 'asc' ? dateA - dateB : dateB - dateA

        default:
          // Numeric fields
          const fieldA = this.getFieldValue(a, sortOption.field)
          const fieldB = this.getFieldValue(b, sortOption.field)
          return sortOption.direction === 'asc'
            ? fieldA - fieldB
            : fieldB - fieldA
      }
    })
  }

  static async getFilteredIdeasFromService(
    ideaService: any,
    filters: IdeaFilters
  ): Promise<{ ideas: Idea[]; total: number }> {
    // First get all ideas (or use existing method if available)
    let allIdeas: Idea[] = []
    let offset = 0
    const batchSize = 100
    let hasMore = true

    // Fetch ideas in batches to handle large datasets
    while (hasMore) {
      const batch = await ideaService.getIdeas(batchSize, offset)
      if (batch.length === 0) {
        hasMore = false
      } else {
        allIdeas = [...allIdeas, ...batch]
        offset += batchSize
        hasMore = batch.length === batchSize
      }
    }

    // Apply filters
    const filteredIdeas = this.applyFilters(allIdeas, {
      ...filters,
      limit: undefined,
      offset: undefined,
    })

    // Apply pagination
    const paginatedIdeas = filteredIdeas.slice(
      filters.offset || 0,
      (filters.offset || 0) + (filters.limit || filteredIdeas.length)
    )

    return {
      ideas: paginatedIdeas,
      total: filteredIdeas.length,
    }
  }
}
