import { Idea } from '@/core/types/idea'

export type FilterOperator = '>' | '<' | '=' | '>=' | '<='

export type FilterCondition = {
  field:
    | keyof Idea
    | 'votesByType.use'
    | 'votesByType.dislike'
    | 'votesByType.pay'
  operator: FilterOperator
  value: number
}

export type SortField =
  | 'title'
  | 'score'
  | 'votes'
  | 'commentCount'
  | 'votesByType.use'
  | 'votesByType.dislike'
  | 'votesByType.pay'
  | 'createdAt'

export type SortDirection = 'asc' | 'desc'

export type SortOption = {
  field: SortField
  direction: SortDirection
}

export type IdeaFilters = {
  searchQuery?: string
  filterConditions?: FilterCondition[]
  sortOption?: SortOption
  limit?: number
  offset?: number
}

export type FilterConfig = {
  id: string
  label: string
  field:
    | keyof Idea
    | 'votesByType.use'
    | 'votesByType.dislike'
    | 'votesByType.pay'
  operators: readonly FilterOperator[]
  minValue?: number
  maxValue?: number
  step?: number
}

export type SortConfig = {
  id: string
  label: string
  field: SortField
}
