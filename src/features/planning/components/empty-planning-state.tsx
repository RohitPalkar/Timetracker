import type { LucideIcon } from 'lucide-react'
import { Inbox } from 'lucide-react'
import { EmptyState, type EmptyStateProps } from '@/components/feedback/empty-state'

export interface EmptyPlanningStateProps {
  title: string
  description?: string
  icon?: LucideIcon
  action?: EmptyStateProps['action']
  secondaryAction?: EmptyStateProps['secondaryAction']
  className?: string
}

/** Empty state used across Planning pages (backlog, board, sprints, epics, releases). */
export function EmptyPlanningState({
  title,
  description,
  icon = Inbox,
  action,
  secondaryAction,
  className,
}: EmptyPlanningStateProps) {
  return <EmptyState icon={icon} title={title} description={description} action={action} secondaryAction={secondaryAction} className={className} />
}