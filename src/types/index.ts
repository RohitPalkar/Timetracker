export type UserStatus = 'active' | 'invited' | 'suspended'

export interface User {
  id: string
  name: string
  email: string
  roleId: string
  designation: string
  department: string
  status: UserStatus
  avatarUrl?: string
  utilization: number
  joinedAt: string
  location: string
}

export interface Organization {
  id: string
  name: string
  logoUrl?: string
  plan: 'starter' | 'growth' | 'enterprise'
  seatsUsed: number
  seatsTotal: number
  timezone: string
  weekStartsOn: number
  domain: string
  createdAt: string
}

export type ProjectStatus = 'active' | 'planned' | 'completed' | 'archived' | 'on_hold'
export type ProjectHealth = 'healthy' | 'on_track' | 'at_risk' | 'critical'

export interface Project {
  id: string
  key: string
  name: string
  description: string
  status: ProjectStatus
  health: ProjectHealth
  progress: number
  ownerId: string
  businessAnalystId?: string
  client?: string
  startDate: string
  endDate: string
  budget: number
  spent: number
  tags: string[]
  updatedAt: string
}

export interface ProjectMember {
  projectId: string
  userId: string
  role: ProjectMemberRole
  capacity: number
  joinedAt: string
}

export type ProjectMemberRole =
  | 'owner'
  | 'manager'
  | 'lead'
  | 'developer'
  | 'qa'
  | 'designer'
  | 'business_analyst'
  | 'consultant'

export type ProjectActivityType = 'member' | 'milestone' | 'status' | 'budget' | 'settings' | 'comment'

export interface ProjectActivity {
  id: string
  projectId: string
  type: ProjectActivityType
  actorId?: string
  action: string
  target?: string
  createdAt: string
}

export interface Milestone {
  id: string
  projectId: string
  title: string
  date: string
  status: 'planned' | 'in_progress' | 'completed'
}

export interface Release {
  id: string
  projectId: string
  name: string
  version: string
  releaseDate: string
  status: 'planned' | 'in_progress' | 'released' | 'deferred'
  description?: string
}

export interface Checklist {
  id: string
  projectId: string
  title: string
  templateId?: string
  items: ChecklistItem[]
  status: 'pending' | 'in_progress' | 'completed'
  approval?: {
    required: boolean
    status: 'pending' | 'approved' | 'rejected'
    approverId?: string
    approvedAt?: string
  }
}

export interface ChecklistItem {
  id: string
  text: string
  done: boolean
  assigneeId?: string
  dueDate?: string
}

export interface ChecklistTemplate {
  id: string
  name: string
  category: string
  items: string[]
  default: boolean
}

export type RagStatus = 'green' | 'amber' | 'red'

export interface WeeklyStatus {
  id: string
  projectId: string
  weekStart: string
  rag: RagStatus
  summary: string
  completed: string[]
  planned: string[]
  blockers: string[]
  risks: Risk[]
  dependencies: Dependency[]
  authorId: string
  submittedAt: string
}

export interface Risk {
  id: string
  projectId: string
  title: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  likelihood: 'low' | 'medium' | 'high'
  mitigation?: string
  ownerId?: string
  status: 'open' | 'monitoring' | 'mitigated' | 'closed'
}

export interface Dependency {
  id: string
  projectId: string
  title: string
  dependencyType: 'blocking' | 'blocked_by'
  targetId?: string
  status: 'pending' | 'resolved'
}