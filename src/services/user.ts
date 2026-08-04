/**
 * User repository — in-memory mock implementation.
 */
import type { Organization, User, UserStatus } from '@/types'
import type { PageParams, QueryFilter, SortSpec } from '@/types/api'
import { userStore } from './stores'
import { DEMO_ORGANIZATION } from '@/mocks/data'
import { mockDelay } from './http'

export interface CreateUserInput {
  name: string
  email: string
  roleId: string
  designation: string
  department: string
}

export interface UpdateUserInput extends Partial<CreateUserInput> {
  status?: UserStatus
}

export interface UserListParams extends PageParams {
  filters?: QueryFilter
  sort?: SortSpec
  search?: string
}


export const userService = {
  async list(params?: UserListParams): Promise<{ items: User[]; total: number }> {
    await mockDelay(300)
    const result = userStore.query({
      search: params?.search,
      searchFields: ['name', 'email', 'designation', 'department'],
      filters: params?.filters,
      sort: params?.sort ?? { field: 'name', direction: 'asc' },
      pageParams: params ? { page: params.page ?? 1, pageSize: params.pageSize ?? 20 } : undefined,
    })
    return { items: result.items, total: result.total }
  },

  async get(id: string): Promise<User> {
    await mockDelay(200)
    const user = userStore.get(id)
    if (!user) throw new Error('User not found')
    return user
  },

  async create(input: CreateUserInput): Promise<User> {
    await mockDelay(400)
    return userStore.create({
      ...input,
      id: undefined as never,
      status: 'invited',
      utilization: 0,
      joinedAt: new Date().toISOString(),
      location: '',
    } as unknown as User)
  },

  async update(id: string, input: UpdateUserInput): Promise<User> {
    await mockDelay(300)
    const updated = userStore.update(id, input)
    if (!updated) throw new Error('User not found')
    return updated
  },

  async setStatus(id: string, status: UserStatus): Promise<User> {
    await mockDelay(250)
    const updated = userStore.update(id, { status })
    if (!updated) throw new Error('User not found')
    return updated
  },

  async organization(): Promise<Organization> {
    await mockDelay(150)
    return structuredClone(DEMO_ORGANIZATION)
  },
}