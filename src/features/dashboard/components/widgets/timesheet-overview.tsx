import { ClipboardCheck, Clock, Hourglass, Send, XCircle } from 'lucide-react'
import { ChartCard } from '@/components/charts/chart-card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatHours } from '@/lib/formats'
import type { TimesheetOverview } from '@/types/dashboard'

export interface TimesheetOverviewProps {
  data: TimesheetOverview
  loading?: boolean
}

const STATS = [
  { key: 'submitted', label: 'Submitted', icon: Send, tone: 'bg-info-soft text-info-foreground' },
  { key: 'approved', label: 'Approved', icon: ClipboardCheck, tone: 'bg-success-soft text-success-foreground' },
  { key: 'pending', label: 'Pending', icon: Hourglass, tone: 'bg-warning-soft text-warning-foreground' },
  { key: 'rejected', label: 'Rejected', icon: XCircle, tone: 'bg-danger-soft text-danger-foreground' },
] as const

export function TimesheetOverviewWidget({ data, loading }: TimesheetOverviewProps) {
  return (
    <ChartCard title="Timesheet Overview" description="Submission health and utilization" loading={loading}>
      {loading ? (
        <div className="grid grid-cols-2 gap-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            {STATS.map((stat) => (
              <div key={stat.key} className="flex items-center gap-3 rounded-xl border border-border bg-surface-muted/50 p-3">
                <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg ${stat.tone}`}>
                  <stat.icon className="size-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-lg font-semibold leading-6 text-foreground">{data[stat.key]}</p>
                  <p className="truncate text-[11px] text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface-muted/50 px-3 py-2.5">
            <span className="flex items-center gap-2 text-[13px] text-muted-foreground">
              <Clock className="size-4" aria-hidden="true" />
              {formatHours(data.totalHours)} logged
            </span>
            <span className="text-[13px] text-muted-foreground">
              <span className="font-semibold text-foreground">{formatHours(data.billableHours)}</span> billable
            </span>
            <span className="text-[13px] text-muted-foreground">
              <span className="font-semibold text-foreground">{data.completionRate}%</span> complete
            </span>
          </div>
        </div>
      )}
    </ChartCard>
  )
}
