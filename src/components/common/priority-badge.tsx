import { Badge, type BadgeProps } from '@/components/ui/badge'
import type { StoryPriority } from '@/types/agile'

const PRIORITY_MAP: Record<StoryPriority, { tone: BadgeProps['variant']; label: string }> = {
  highest: { tone: 'danger', label: 'Highest' },
  high: { tone: 'warning', label: 'High' },
  medium: { tone: 'info', label: 'Medium' },
  low: { tone: 'neutral', label: 'Low' },
  lowest: { tone: 'surface', label: 'Lowest' },
}

export function PriorityBadge({ priority, className }: { priority: StoryPriority; className?: string }) {
  const config = PRIORITY_MAP[priority]
  return (
    <Badge variant={config.tone} className={className}>
      {config.label}
    </Badge>
  )
}

export function priorityTone(priority: StoryPriority): BadgeProps['variant'] {
  return PRIORITY_MAP[priority].tone
}