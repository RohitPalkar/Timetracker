import * as React from 'react'
import { Bug, CircleDot, FolderKanban, ListTodo, Target } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { IssueType } from '@/types/planning'

export const ISSUE_TYPE_CONFIG: Record<
  IssueType,
  { label: string; tone: 'default' | 'neutral' | 'info' | 'warning' | 'danger' | 'surface'; icon: React.ComponentType<{ className?: string }> }
> = {
  story: { label: 'Story', tone: 'default', icon: Target },
  task: { label: 'Task', tone: 'info', icon: CircleDot },
  subtask: { label: 'Sub-task', tone: 'neutral', icon: ListTodo },
  bug: { label: 'Bug', tone: 'danger', icon: Bug },
  epic: { label: 'Epic', tone: 'warning', icon: FolderKanban },
}

export function IssueTypeBadge({ type, className }: { type: IssueType; className?: string }) {
  const config = ISSUE_TYPE_CONFIG[type]
  const Icon = config.icon
  return (
    <Badge variant={config.tone} className={className}>
      <Icon className="size-3" aria-hidden="true" />
      {config.label}
    </Badge>
  )
}