import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { formatDate } from '@/lib/formats'
import { useSprintMutations } from '../../planning-queries'
import type { Sprint } from '@/types/agile'
import { toast } from 'sonner'

export interface SprintDetailDrawerProps {
  sprint: Sprint | null
  open: boolean
  onClose: () => void
}

const SPRINT_STATUS_BADGE: Record<string, { tone: 'default' | 'info' | 'success' | 'warning' | 'neutral' }> = {
  planned: { tone: 'info' },
  active: { tone: 'success' },
  completed: { tone: 'neutral' },
}

export function SprintDetailDrawer({ sprint, open, onClose }: SprintDetailDrawerProps) {
  const mutations = useSprintMutations()

  if (!open || !sprint) return null

  const capacityUsed = sprint.capacityHours > 0 ? Math.round((sprint.hoursLogged / sprint.capacityHours) * 100) : 0
  const badge = SPRINT_STATUS_BADGE[sprint.status] ?? { tone: 'neutral' as const }

  const handleStatusChange = (status: Sprint['status']) => {
    mutations.update.mutate(
      { id: sprint.id, input: { status } },
      {
        onSuccess: () => toast.success(`Sprint ${status}`),
        onError: () => toast.error('Failed to update sprint'),
      },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-lg flex-col border-l border-border bg-surface shadow-xl">
        <div className="flex items-center justify-between border-b border-border p-4">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <h2 className="text-[15px] font-semibold text-foreground">{sprint.name}</h2>
              <Badge variant={badge.tone}>{sprint.status}</Badge>
            </div>
            {sprint.goal && <p className="text-[13px] text-muted-foreground">{sprint.goal}</p>}
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {/* Dates */}
          <div className="mb-6 grid grid-cols-2 gap-3 text-[13px]">
            <div>
              <span className="text-muted-foreground">Start date</span>
              <p className="mt-0.5 text-foreground">{formatDate(sprint.startDate)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">End date</span>
              <p className="mt-0.5 text-foreground">{formatDate(sprint.endDate)}</p>
            </div>
          </div>

          {/* Capacity */}
          <div className="mb-6">
            <div className="mb-1 flex items-center justify-between text-[13px]">
              <span className="text-muted-foreground">Capacity</span>
              <span className="text-foreground">
                {sprint.hoursLogged}h / {sprint.capacityHours}h ({capacityUsed}%)
              </span>
            </div>
            <Progress value={capacityUsed} className="h-2" />
          </div>

          {/* Velocity + confidence */}
          <div className="mb-6 grid grid-cols-2 gap-3 text-[13px]">
            <div>
              <span className="text-muted-foreground">Velocity</span>
              <p className="mt-0.5 text-foreground">{sprint.velocity} pts</p>
            </div>
            <div>
              <span className="text-muted-foreground">Confidence</span>
              <p className="mt-0.5 text-foreground">{sprint.confidence}%</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 border-t border-border p-4">
          {sprint.status === 'planned' && (
            <Button size="sm" onClick={() => handleStatusChange('active')}>
              Start sprint
            </Button>
          )}
          {sprint.status === 'active' && (
            <Button size="sm" onClick={() => handleStatusChange('completed')}>
              Complete sprint
            </Button>
          )}
          {sprint.status === 'completed' && (
            <Button variant="outline" size="sm" onClick={() => handleStatusChange('planned')}>
              Reopen sprint
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
