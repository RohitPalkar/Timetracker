import { StatusBadge, type StatusTone } from '@/components/common/status-badge'
import type { StoryStatus } from '@/types/agile'

export const STORY_STATUS_CONFIG: Record<StoryStatus, { tone: StatusTone; label: string }> = {
  todo: { tone: 'neutral', label: 'Todo' },
  in_progress: { tone: 'info', label: 'In progress' },
  in_review: { tone: 'warning', label: 'In review' },
  qa: { tone: 'warning', label: 'QA' },
  done: { tone: 'success', label: 'Done' },
}

export function StoryStatusBadge({ status, className }: { status: StoryStatus; className?: string }) {
  const config = STORY_STATUS_CONFIG[status]
  return (
    <StatusBadge tone={config.tone} dot className={className}>
      {config.label}
    </StatusBadge>
  )
}
