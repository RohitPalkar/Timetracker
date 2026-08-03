/**
 * User service — architecture only for Phase 1.
 * Implemented in Phase 2 (User Management).
 */
import type { Organization, User, UserStatus } from '@/types'
import type { PageParams, QueryFilter, SortSpec } from '@/types/api'
import { notImplemented } from './http'

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
  async list(_params?: UserListParams): Promise<{ items: User[]; total: number }> {
    return notImplemented('User')
  },
  async get(_id: string): Promise<User> {
    return notImplemented('User')
  },
  async create(_input: CreateUserInput): Promise<User> {
    return notImplemented('User')
  },
  async update(_id: string, _input: UpdateUserInput): Promise<User> {
    return notImplemented('User')
  },
  async setStatus(_id: string, _status: UserStatus): Promise<User> {
    return notImplemented('User')
  },
  async organization(): Promise<Organization> {
    return notImplemented('User')
  },
}