export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message: string
}

export interface ApiError {
  success: false
  data: null
  message: string
  errors: Record<string, string[]>
}

export type SortOrder = 'asc' | 'desc'

export interface TableParams {
  page: number
  page_size: number
  search?: string
  ordering?: string
}
