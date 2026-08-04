/**
 * In-memory mock store used by repositories to simulate a database.
 * Seed data lives in `src/mocks/data` — components never see it directly.
 * Swap to a real REST repository behind the same service interfaces in the API phase.
 */
import type { PageParams, PageResult, QueryFilter, SortSpec } from '@/types/api'
import { uid } from '@/lib/utils'

export interface MockRecord {
  id: string
}

export interface MockQueryOptions<T extends MockRecord> {
  search?: string
  /** Fields or accessors matched by the search term (OR semantics). */
  searchFields?: Array<keyof T | ((row: T) => string | number | string[] | undefined)>
  filters?: QueryFilter
  sort?: SortSpec
  pageParams?: PageParams
  match?: (row: T) => boolean
}

function matchesFilter<T extends MockRecord>(row: T, filters: QueryFilter): boolean {
  return Object.entries(filters).every(([key, expected]) => {
    if (expected === undefined) return true
    const actual = (row as Record<string, unknown>)[key]
    if (Array.isArray(expected)) {
      return expected.length === 0 || expected.includes(String(actual))
    }
    return actual === expected
  })
}

function matchesSearch<T extends MockRecord>(row: T, search: string, fields: MockQueryOptions<T>['searchFields']): boolean {
  const term = search.trim().toLowerCase()
  if (!term) return true
  return (fields ?? []).some((field) => {
    const value = typeof field === 'function' ? field(row) : row[field]
    if (Array.isArray(value)) return value.some((part) => part?.toString().toLowerCase().includes(term))
    return value?.toString().toLowerCase().includes(term) ?? false
  })
}

export function createMockStore<T extends MockRecord>(seed: T[]) {
  const rows: T[] = structuredClone(seed)

  return {
    /** Query with the same shape a REST list endpoint would return. */
    query(options: MockQueryOptions<T> = {}): PageResult<T> {
      let result = rows.filter((row) => matchesFilter(row, options.filters ?? {}) && (options.match?.(row) ?? true))

      if (options.search && options.searchFields) {
        result = result.filter((row) => matchesSearch(row, options.search!, options.searchFields))
      }

      if (options.sort) {
        const { field, direction } = options.sort
        const factor = direction === 'asc' ? 1 : -1
        result = [...result].sort((a, b) => {
          const av = (a as Record<string, unknown>)[field]
          const bv = (b as Record<string, unknown>)[field]
          if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor
          return String(av ?? '').localeCompare(String(bv ?? '')) * factor
        })
      }

      const total = result.length
      if (options.pageParams) {
        const { page, pageSize } = options.pageParams
        result = result.slice((page - 1) * pageSize, page * pageSize)
      }
      return { items: structuredClone(result), total, page: options.pageParams?.page ?? 1, pageSize: options.pageParams?.pageSize ?? total }
    },

    get(id: string): T | undefined {
      const found = rows.find((row) => row.id === id)
      return found ? structuredClone(found) : undefined
    },

    find(predicate: (row: T) => boolean): T | undefined {
      const found = rows.find(predicate)
      return found ? structuredClone(found) : undefined
    },

    all(): T[] {
      return structuredClone(rows)
    },

    create(input: Omit<T, 'id'> & Partial<Pick<T, 'id'>>): T {
      const row = { ...input, id: input.id ?? uid('res') } as T
      rows.unshift(row)
      return structuredClone(row)
    },

    update(id: string, patch: Partial<T>): T | undefined {
      const index = rows.findIndex((row) => row.id === id)
      if (index === -1) return undefined
      rows[index] = { ...rows[index], ...patch, id }
      return structuredClone(rows[index])
    },

    remove(id: string): boolean {
      const index = rows.findIndex((row) => row.id === id)
      if (index === -1) return false
      rows.splice(index, 1)
      return true
    },

    /** Replace the whole collection (used by tests / reset). */
    replace(next: T[]) {
      rows.splice(0, rows.length, ...structuredClone(next))
    },
  }
}