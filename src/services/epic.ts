/**
 * Epic repository — in-memory mock implementation.
 * Wire to REST later behind the same interface.
 */
import type { Epic } from '@/types/agile'
import type { PageParams, SortSpec } from '@/types/api'
import { epicStore } from './stores'
import { mockDelay } from './http'

export interface EpicListParams {
  projectId?: string
  pageParams?: PageParams
  sort?: SortSpec
  search?: string
}

export const epicRepository = {
  async list(params?: EpicListParams): Promise<{ items: Epic[]; total: number }> {
    await mockDelay(300)
    const result = epicStore.query({
      search: params?.search,
      searchFields: ['key', 'name', 'summary'],
      filters: params?.projectId ? { projectId: params.projectId } : undefined,
      sort: params?.sort ?? { field: 'pointsTotal', direction: 'desc' },
      pageParams: params?.pageParams,
    })
    return { items: result.items, total: result.total }
  },

  async get(id: string): Promise<Epic> {
    await mockDelay(200)
    const epic = epicStore.get(id)
    if (!epic) throw new Error('Epic not found')
    return epic
  },

  async getByKey(key: string): Promise<Epic> {
    await mockDelay(200)
    const epic = epicStore.find((candidate) => candidate.key === key)
    if (!epic) throw new Error('Epic not found')
    return epic
  },
}
