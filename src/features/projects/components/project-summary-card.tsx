import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ProjectHealthBadge, ProjectStatusBadge } from '@/components/common/status-badge'
import { formatCurrency, formatDate } from '@/lib/formats'
import type { Project } from '@/types'

export interface ProjectSummaryCardProps {
  project: Project
  managerName: string
  businessAnalystName?: string
  memberCount: number
}

function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-1.5">
      <dt className="shrink-0 text-[13px] text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-right text-[13px] font-medium text-foreground">{children}</dd>
    </div>
  )
}

/** Key facts about a project — status, ownership, dates, progress. */
export function ProjectSummaryCard({ project, managerName, businessAnalystName, memberCount }: ProjectSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Summary</CardTitle>
      </CardHeader>
      <CardContent className="pt-1">
        <dl className="divide-y divide-border/60">
          <SummaryRow label="Status">
            <ProjectStatusBadge status={project.status} />
          </SummaryRow>
          <SummaryRow label="Health">
            <ProjectHealthBadge health={project.health} />
          </SummaryRow>
          <SummaryRow label="Client">{project.client ?? '—'}</SummaryRow>
          <SummaryRow label="Project manager">{managerName}</SummaryRow>
          <SummaryRow label="Business analyst">{businessAnalystName ?? '—'}</SummaryRow>
          <SummaryRow label="Timeline">
            {formatDate(project.startDate)} – {formatDate(project.endDate)}
          </SummaryRow>
          <SummaryRow label="Team">{memberCount} members</SummaryRow>
        </dl>
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[13px]">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold text-foreground">{project.progress}%</span>
          </div>
          <Progress value={project.progress} />
        </div>
      </CardContent>
    </Card>
  )
}

export const budgetTone = (budget: number, spent: number): 'success' | 'warning' | 'danger' => {
  const ratio = budget > 0 ? spent / budget : 1
  if (ratio >= 0.9) return 'danger'
  if (ratio >= 0.7) return 'warning'
  return 'success'
}

const TONE_CLASS: Record<'success' | 'warning' | 'danger', string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
}

export function BudgetCard({ project }: { project: Project }) {
  const remaining = Math.max(0, project.budget - project.spent)
  const usedPercent = project.budget > 0 ? Math.min(100, Math.round((project.spent / project.budget) * 100)) : 0
  const tone = budgetTone(project.budget, project.spent)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">Budget</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-1">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[13px] text-muted-foreground">Spent</p>
            <p className="mt-0.5 text-2xl font-semibold tracking-tight text-foreground">{formatCurrency(project.spent)}</p>
          </div>
          <div className="text-right">
            <p className="text-[13px] text-muted-foreground">Remaining</p>
            <p className="mt-0.5 text-lg font-medium text-foreground">{formatCurrency(remaining)}</p>
          </div>
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between text-[13px]">
            <span className="text-muted-foreground">Budget</span>
            <span className="font-medium text-foreground">
              {formatCurrency(project.budget)} · {usedPercent}% used
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-muted">
            <div
              className={`h-full rounded-full transition-all ${TONE_CLASS[tone]}`}
              style={{ width: `${usedPercent}%` }}
              role="progressbar"
              aria-valuenow={usedPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
