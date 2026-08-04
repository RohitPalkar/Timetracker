/**
 * Story repository — in-memory mock implementation.
 * Wire to REST later behind the same interface.
 */
import type { Story, StoryStatus } from '@/types/agile'
import type { PageParams, QueryFilter, SortSpec } from '@/types/api'
import { storyStore } from './stores'
import { DEMO_PROJECTS } from '@/mocks/data'
import { mockDelay } from './http'

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


function nextKey(projectId: string): string {
  const project = DEMO_PROJECTS.find((candidate) => candidate.id === projectId)
  const prefix = project?.key ?? 'PRJ'
  const max = storyStore
    .all()
    .filter((story) => story.key.startsWith(`${prefix}-`))
    .reduce((highest, story) => Math.max(highest, Number(story.key.split('-')[1]) || 0), 0)
  return `${prefix}-${max + 1}`
}

export const storyRepository = {
  async list(params?: StoryListParams): Promise<{ items: Story[]; total: number }> {
    await mockDelay(350)
    const result = storyStore.query({
      search: params?.search,
      searchFields: ['key', 'title', 'tags'],
      filters: { ...params?.filters, projectId: params?.projectId, sprintId: params?.sprintId, epicId: params?.epicId },
      sort: params?.sort ?? { field: 'updatedAt', direction: 'desc' },
      pageParams: params?.pageParams,
    })
    return { items: result.items, total: result.total }
  },

  async get(key: string): Promise<Story> {
    await mockDelay(200)
    const story = storyStore.find((candidate) => candidate.key === key)
    if (!story) throw new Error('Story not found')
    return story
  },

  async create(input: CreateStoryInput): Promise<Story> {
    await mockDelay(400)
    const now = new Date().toISOString()
    return storyStore.create({
      ...input,
      id: undefined as never,
      key: nextKey(input.projectId),
      description: input.description ?? '',
      status: 'todo',
      priority: input.priority ?? 'medium',
      points: input.points ?? 0,
      storyType: 'story',
      tags: input.tags ?? [],
      acceptanceCriteria: [],
      subtasks: [],
      attachments: [],
      createdAt: now,
      updatedAt: now,
    } as unknown as Story)
  },

  async update(id: string, input: UpdateStoryInput): Promise<Story> {
    await mockDelay(300)
    const updated = storyStore.update(id, { ...input, updatedAt: new Date().toISOString() })
    if (!updated) throw new Error('Story not found')
    return updated
  },

  /** Move a story between board columns (optimistic in the UI layer). */
  async move(id: string, status: StoryStatus): Promise<Story> {
    await mockDelay(150)
    const updated = storyStore.update(id, { status, updatedAt: new Date().toISOString() })
    if (!updated) throw new Error('Story not found')
    return updated
  },

  async remove(id: string): Promise<void> {
    await mockDelay(250)
    storyStore.remove(id)
  },
}