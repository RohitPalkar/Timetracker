import { Flag } from 'lucide-react'
import { StatusBadge } from '@/components/common/status-badge'
import { formatDate } from '@/lib/formats'
import { cn } from '@/lib/utils'
import type { Milestone } from '@/types'

const MILESTONE_STYLE: Record<Milestone['status'], { dot: string; badge: 'success' | 'info' | 'neutral'; label: string }> = {
  completed: { dot: 'bg-success', badge: 'success', label: 'Completed' },
  in_progress: { dot: 'bg-info ring-4 ring-info/20', badge: 'info', label: 'In progress' },
  planned: { dot: 'bg-border-strong ring-4 ring-surface-muted', badge: 'neutral', label: 'Planned' },
}

export interface ProjectTimelineProps {
  milestones: Milestone[]
  /** Show at most this many items (used for the Overview preview). */
  limit?: number
}

/** Simple milestone timeline — Gantt arrives in a later phase. */
export function ProjectTimeline({ milestones, limit }: ProjectTimelineProps) {
  const items = limit ? milestones.slice(0, limit) : milestones
  const hidden = milestones.length - items.length

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <Flag className="size-5 text-muted-foreground/60" aria-hidden="true" />
        <p className="text-[13px] text-muted-foreground">No milestones yet.</p>
      </div>
    )
  }

  return (
    <ol className="relative space-y-5 border-l border-border pl-5">
      {items.map((milestone) => {
        const style = MILESTONE_STYLE[milestone.status]
        return (
          <li key={milestone.id} className="relative">
            <span
              className={cn('absolute -left-[26px] top-1 size-2.5 rounded-full', style.dot)}
              aria-hidden="true"
            />
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
              <p className="text-sm font-medium text-foreground">{milestone.title}</p>
              <StatusBadge tone={style.badge}>{style.label}</StatusBadge>
            </div>
            <p className="mt-0.5 text-[13px] text-muted-foreground">{formatDate(milestone.date)}</p>
          </li>
        )
      })}
      {hidden > 0 && (
        <li className="text-[13px] font-medium text-muted-foreground">
          +{hidden} more milestone{hidden > 1 ? 's' : ''}
        </li>
      )}
    </ol>
  )
}
