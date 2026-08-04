/**
 * Release repository — in-memory mock implementation.
 * Wire to REST later behind the same interface.
 */
import type { Release, ReleaseStatus } from '@/types/planning'
import type { PageParams, SortSpec } from '@/types/api'
import { releaseStore } from './stores'
import { mockDelay } from './http'

export interface ReleaseListParams {
  projectId?: string
  status?: ReleaseStatus
  pageParams?: PageParams
  sort?: SortSpec
  search?: string
}

export const releaseRepository = {
  async list(params?: ReleaseListParams): Promise<{ items: Release[]; total: number }> {
    await mockDelay(300)
    const result = releaseStore.query({
      search: params?.search,
      searchFields: ['key', 'name', 'version', 'description'],
      filters: {
        ...(params?.projectId ? { projectId: params.projectId } : undefined),
        ...(params?.status ? { status: params.status } : undefined),
      },
      sort: params?.sort ?? { field: 'releaseDate', direction: 'desc' },
      pageParams: params?.pageParams,
    })
    return { items: result.items, total: result.total }
  },

  async get(id: string): Promise<Release> {
    await mockDelay(200)
    const release = releaseStore.get(id)
    if (!release) throw new Error('Release not found')
    return release
  },

  async getByKey(key: string): Promise<Release> {
    await mockDelay(200)
    const release = releaseStore.find((candidate) => candidate.key === key)
    if (!release) throw new Error('Release not found')
    return release
  },
}
