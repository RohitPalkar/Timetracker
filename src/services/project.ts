/**
 * Project service — architecture only for Phase 1.
 * Implemented in Phase 3 (Project Management).
 */
import type { Project, ProjectMember } from '@/types'
import type { PageParams, QueryFilter, SortSpec } from '@/types/api'
import { notImplemented } from './http'

export interface CreateProjectInput {
  name: string
  key?: string
  description?: string
  ownerId?: string
  startDate?: string
  endDate?: string
  client?: string
}

export interface UpdateProjectInput extends Partial<CreateProjectInput> {
  status?: Project['status']
  health?: Project['health']
  budget?: number
}

export interface ProjectListParams extends PageParams {
  filters?: QueryFilter
  sort?: SortSpec
  search?: string
}

export const projectService = {
  async list(_params: ProjectListParams): Promise<{ items: Project[]; total: number }> {
    return notImplemented('Project')
  },
  async get(_id: string): Promise<Project> {
    return notImplemented('Project')
  },
  async create(_input: CreateProjectInput): Promise<Project> {
    return notImplemented('Project')
  },
  async update(_id: string, _input: UpdateProjectInput): Promise<Project> {
    return notImplemented('Project')
  },
  async archive(_id: string): Promise<void> {
    return notImplemented('Project')
  },
  async members(_projectId: string): Promise<ProjectMember[]> {
    return notImplemented('Project')
  },
}