import { ChartCard } from '@/components/charts/chart-card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { ProjectHealthSummary } from '@/types/dashboard'

export interface ProjectHealthProps {
  data: ProjectHealthSummary[]
  loading?: boolean
}

const TONE_BAR = {
  success: 'bg-success',
  info: 'bg-info',
  warning: 'bg-warning',
  danger: 'bg-danger',
} as const

export function ProjectHealthWidget({ data, loading }: ProjectHealthProps) {
  return (
    <ChartCard title="Project Health" description="Distribution of project health statuses" loading={loading}>
      {loading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <div className="flex flex-col justify-center gap-5 py-2">
          <div className="flex h-3 w-full gap-1 overflow-hidden rounded-full bg-surface-muted">
            {data.map((item) => (
              <div key={item.label} className={cn('h-full', TONE_BAR[item.tone])} style={{ width: `${item.value}%` }} />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {data.map((item) => (
              <div key={item.label} className="flex items-center gap-2 rounded-xl border border-border bg-surface-muted/50 px-3 py-2">
                <span className={cn('size-2 shrink-0 rounded-full', TONE_BAR[item.tone])} aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate text-[13px] text-muted-foreground">{item.label}</span>
                <span className="text-[13px] font-semibold text-foreground">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </ChartCard>
  )
}
