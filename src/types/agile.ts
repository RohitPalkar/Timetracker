import type { Attachment } from './collaboration'

export type SprintStatus = 'planned' | 'active' | 'completed'

export interface Sprint {
  id: string
  projectId: string
  /** Optional Sub Project scope — null/undefined means sprint belongs directly to the Project (CASE A/C). */
  subProjectId?: string
  name: string
  goal?: string
  status: SprintStatus
  startDate: string
  endDate: string
  capacityHours: number
  hoursLogged: number
  velocity: number
  confidence: number
}

export type StoryStatus = 'todo' | 'in_progress' | 'in_review' | 'qa' | 'done'
export type StoryPriority = 'highest' | 'high' | 'medium' | 'low' | 'lowest'

export interface StoryEstimate {
  optimistic: number
  likely: number
  pessimistic: number
}

export interface Story {
  id: string
  key: string
  projectId: string
  /** Optional Sub Project scope — required when parent Project has hasSubProjects === true. */
  subProjectId?: string
  epicId?: string
  sprintId?: string
  releaseId?: string
  title: string
  description: string
  acceptanceCriteria: string[]
  status: StoryStatus
  priority: StoryPriority
  points: number
  assigneeId?: string
  qaId?: string
  storyType: 'story' | 'task' | 'subtask'
  tags: string[]
  dueDate?: string
  estimates?: StoryEstimate
  aiConfidence?: number
  attachments: Attachment[]
  subtasks: Subtask[]
  createdAt: string
  updatedAt: string
}

export interface Subtask {
  id: string
  title: string
  done: boolean
  assigneeId?: string
}

export interface Bug {
  id: string
  key: string
  projectId: string
  subProjectId?: string
  storyId?: string
  title: string
  description: string
  severity: 'blocker' | 'critical' | 'major' | 'minor' | 'trivial'
  status: BugWorkflowStatus
  assigneeId?: string
  reporterId: string
  createdAt: string
  updatedAt: string
}

export type BugWorkflowStatus =
  | 'open'
  | 'assigned'
  | 'fixing'
  | 'ready_for_qa'
  | 'verified'
  | 'closed'

export interface Epic {
  id: string
  key: string
  projectId: string
  subProjectId?: string
  name: string
  summary: string
  color: string
  startDate?: string
  endDate?: string
  status: 'open' | 'in_progress' | 'done'
  pointsTotal: number
  pointsDone: number
  storyCount: number
}