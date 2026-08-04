import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatRelative } from '@/lib/formats'
import { useBugMutations, usePlanningUsers } from '../../planning-queries'
import type { Bug, BugWorkflowStatus } from '@/types/agile'
import { toast } from 'sonner'

export interface BugDetailDrawerProps {
  bug: Bug | null
  open: boolean
  onClose: () => void
}

const BUG_STATUS_CONFIG: Record<BugWorkflowStatus, { label: string; tone: 'default' | 'info' | 'warning' | 'success' | 'danger' | 'neutral' }> = {
  open: { label: 'Open', tone: 'warning' },
  assigned: { label: 'Assigned', tone: 'info' },
  fixing: { label: 'Fixing', tone: 'info' },
  ready_for_qa: { label: 'Ready for QA', tone: 'warning' },
  verified: { label: 'Verified', tone: 'success' },
  closed: { label: 'Closed', tone: 'neutral' },
}

const SEVERITY_CONFIG: Record<Bug['severity'], { label: string; tone: 'danger' | 'warning' | 'info' | 'neutral' }> = {
  blocker: { label: 'Blocker', tone: 'danger' },
  critical: { label: 'Critical', tone: 'danger' },
  major: { label: 'Major', tone: 'warning' },
  minor: { label: 'Minor', tone: 'info' },
  trivial: { label: 'Trivial', tone: 'neutral' },
}

export function BugDetailDrawer({ bug, open, onClose }: BugDetailDrawerProps) {
  const usersQuery = usePlanningUsers()
  const mutations = useBugMutations()

  if (!open || !bug) return null

  const assignee = usersQuery.data?.find((u) => u.id === bug.assigneeId)
  const reporter = usersQuery.data?.find((u) => u.id === bug.reporterId)
  const statusConfig = BUG_STATUS_CONFIG[bug.status]
  const severityConfig = SEVERITY_CONFIG[bug.severity]

  const handleStatusChange = (status: BugWorkflowStatus) => {
    mutations.update.mutate(
      { id: bug.id, input: { status } },
      {
        onSuccess: () => toast.success(`Bug moved to ${statusConfig.label}`),
        onError: () => toast.error('Failed to update bug'),
      },
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex h-full w-full max-w-lg flex-col border-l border-border bg-surface shadow-xl">
        <div className="flex items-start justify-between border-b border-border p-4">
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="font-mono text-[12px] font-medium text-muted-foreground">{bug.key}</span>
              <Badge variant="danger">Bug</Badge>
            </div>
            <h2 className="text-[15px] font-semibold text-foreground">{bug.title}</h2>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge variant={statusConfig.tone}>{statusConfig.label}</Badge>
            <Badge variant={severityConfig.tone}>{severityConfig.label}</Badge>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-3 text-[13px]">
            <div>
              <span className="text-muted-foreground">Assignee</span>
              <p className="mt-0.5 text-foreground">{assignee?.name ?? '—'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Reporter</span>
              <p className="mt-0.5 text-foreground">{reporter?.name ?? '—'}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Created</span>
              <p className="mt-0.5 text-foreground">{formatDate(bug.createdAt)}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Updated</span>
              <p className="mt-0.5 text-foreground">{formatRelative(bug.updatedAt)}</p>
            </div>
          </div>

          {bug.description && (
            <div className="mb-6">
              <h3 className="mb-1 text-[13px] font-medium text-foreground">Description</h3>
              <p className="text-[13px] leading-relaxed text-muted-foreground">{bug.description}</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2 border-t border-border p-4">
          {(Object.keys(BUG_STATUS_CONFIG) as BugWorkflowStatus[]).map((status) => (
            <Button
              key={status}
              variant={bug.status === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusChange(status)}
              disabled={bug.status === status}
            >
              {BUG_STATUS_CONFIG[status].label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}
