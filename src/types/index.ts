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
export type ProjectType =
  | 'platform'
  | 'product'
  | 'client_delivery'
  | 'internal'
  | 'data'
  | 'design'
/** Which projects the current actor may access — enforced at the service layer. */
export type ProjectScope = 'organization' | 'managed' | 'assigned'

export interface Project {
  id: string
  key: string
  name: string
  description: string
  status: ProjectStatus
  health: ProjectHealth
  progress: number
  /** Project category in the new MyTracker model (platform/product/client delivery/etc.). */
  type?: ProjectType
  /** Multiple project managers — replaces single ownerId for manager relationships. */
  managerIds: string[]
  /** @deprecated Use managerIds instead. Kept for backward compatibility with existing code. */
  ownerId: string
  businessAnalystId?: string
  client?: string
  startDate: string
  endDate: string
  budget: number
  spent: number
  tags: string[]
  updatedAt: string
  /** Whether this project has Sub Projects. Determines workspace navigation mode. */
  hasSubProjects: boolean
}

export interface SubProject {
  id: string
  projectId: string
  key: string
  name: string
  description: string
  status: ProjectStatus
  health: ProjectHealth
  progress: number
  /** Owners/managers of this Sub Project. */
  ownerIds: string[]
  businessAnalystId?: string
  startDate: string
  endDate: string
  budget: number
  spent: number
  tags: string[]
  updatedAt: string
}

export interface Team {
  id: string
  projectId: string
  name: string
  description: string
  /** Type of team for filtering/grouping. */
  type: 'development' | 'qa' | 'design' | 'business_analysis' | 'devops' | 'cross_functional'
  /** Members of this team (user IDs). */
  memberIds: string[]
  /** Sub Projects this team is assigned to (empty = project-wide). */
  subProjectIds: string[]
  createdAt: string
  updatedAt: string
}

/**
 * Project Membership — the core relationship model.
 * A user can have multiple memberships in the same project with different roles/contexts.
 */
export interface ProjectMembership {
  id: string
  userId: string
  projectId: string
  /** Optional: membership scoped to a Sub Project. */
  subProjectId?: string
  /** Optional: team membership. */
  teamId?: string
  /** Role in this context. */
  role: ProjectMemberRole
  capacity: number
  /** When this membership started. */
  startedAt: string
  /** When this membership ended (if applicable). */
  endedAt?: string
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

/**
 * Legacy ProjectMember — kept for backward compatibility.
 * @deprecated Use ProjectMembership instead.
 */
export interface ProjectMember {
  projectId: string
  userId: string
  role: ProjectMemberRole
  capacity: number
  joinedAt: string
}

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
  subProjectId?: string
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