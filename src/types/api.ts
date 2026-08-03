export interface PageParams {
  page: number
  pageSize: number
}

export interface PageResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export interface SortSpec {
  field: string
  direction: 'asc' | 'desc'
}

export type QueryFilter = Record<string, string | number | boolean | string[] | undefined>

export interface ApiErrorShape {
  message: string
  status: number
  code?: string
}

export interface ApiResponse<T> {
  data: T
  meta?: {
    requestId: string
    timestamp: string
  }
}
