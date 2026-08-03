/**
 * Story service — architecture only for Phase 1.
 * Implemented in Phase 4 (Agile Workspace).
 */
import type { Story, StoryStatus } from '@/types/agile'
import type { PageParams, QueryFilter, SortSpec } from '@/types/api'
import { notImplemented } from './http'

export interface CreateStoryInput {
  projectId: string
  title: string
  description?: string
  epicId?: string
  sprintId?: string
  priority?: Story['priority']
  points?: number
  assigneeId?: string
  qaId?: string
  tags?: string[]
}

export interface UpdateStoryInput extends Partial<CreateStoryInput> {
  id?: string
  status?: StoryStatus
  acceptanceCriteria?: string[]
}

export interface StoryListParams {
  projectId?: string
  sprintId?: string
  epicId?: string
  pageParams?: PageParams
  filters?: QueryFilter
  sort?: SortSpec
  search?: string
}

export const storyService = {
  async list(_params?: StoryListParams): Promise<{ items: Story[]; total: number }> {
    return notImplemented('Story')
  },

  async get(_key: string): Promise<Story> {
    return notImplemented('Story')
  },

  async create(_input: CreateStoryInput): Promise<Story> {
    return notImplemented('Story')
  },

  async update(_id: string, _input: UpdateStoryInput): Promise<Story> {
    return notImplemented('Story')
  },

  /** Move a story between board columns (optimistic in the UI layer). */
  async move(_id: string, _status: StoryStatus, _afterId?: string): Promise<Story> {
    return notImplemented('Story')
  },

  async remove(_id: string): Promise<void> {
    return notImplemented('Story')
  },
}

export type StoryboardId = StoryStatus