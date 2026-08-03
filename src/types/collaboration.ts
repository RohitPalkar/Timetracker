export type CommentType = 'comment' | 'mention' | 'status_change' | 'assignment' | 'attachment' | 'activity'

export interface Comment {
  id: string
  entityType: 'story' | 'bug' | 'project'
  entityId: string
  authorId: string
  body: string
  mentions: string[]
  createdAt: string
  updatedAt?: string
  edited: boolean
  parentId?: string
  type: CommentType
}

export interface Attachment {
  id: string
  entityType: 'story' | 'bug' | 'project'
  entityId: string
  name: string
  size: number
  mimeType: string
  url: string
  uploadedById: string
  createdAt: string
}

export type ActivityKind =
  | 'status_change'
  | 'assignment'
  | 'comment'
  | 'attachment'
  | 'created'
  | 'updated'
  | 'timesheet'
  | 'system'

export interface ActivityEntry {
  id: string
  kind: ActivityKind
  actorId: string
  entityType: 'story' | 'bug' | 'project' | 'timesheet' | 'sprint'
  entityId: string
  message: string
  meta?: Record<string, string>
  createdAt: string
}

export interface AppNotification {
  id: string
  type: 'mention' | 'assignment' | 'approval' | 'system' | 'comment'
  title: string
  body: string
  read: boolean
  createdAt: string
  actionPath?: string
  actorId?: string
}