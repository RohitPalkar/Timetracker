/**
 * Planning module shared types.
 * Single import surface for the Planning feature (Backlog, Board, Sprints,
 * Stories, Bugs, Epics, Releases). Re-exports the agile + collaboration
 * primitives and adds the module-level Issue, Release and TimeLog shapes.
 */
export type {
  Attachment,
  Comment,
} from './collaboration'
export type {
  Bug,
  BugWorkflowStatus,
  Epic,
  Sprint,
  SprintStatus,
  Story,
  StoryPriority,
  StoryStatus,
} from './agile'
import type { BugWorkflowStatus, StoryPriority, StoryStatus } from './agile'

export type IssueType = 'story' | 'task' | 'subtask' | 'bug' | 'epic'

export type IssueStatus = StoryStatus | BugWorkflowStatus

/**
 * Normalized issue shape used by board and list views.
 * Stories and bugs are rendered through this surface; field values map
 * 1:1 onto the underlying domain records.
 */
export interface Issue {
  id: string
  key: string
  projectId: string
  subProjectId?: string
  type: IssueType
  title: string
  status: IssueStatus
  priority: StoryPriority
  points?: number
  assigneeId?: string
  reporterId?: string
  sprintId?: string
  epicId?: string
  tags: string[]
  updatedAt: string
}

export type ReleaseStatus = 'planned' | 'in_progress' | 'released' | 'deferred'

export interface Release {
  id: string
  key: string
  projectId: string
  subProjectId?: string
  name: string
  version: string
  description?: string
  status: ReleaseStatus
  startDate: string
  releaseDate?: string
  scope: {
    stories: number
    points: number
  }
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface TimeLog {
  id: string
  entityType: 'story' | 'bug' | 'task' | 'epic'
  entityId: string
  userId: string
  date: string
  hours: number
  description?: string
  billable: boolean
  createdAt: string
  updatedAt: string
}
