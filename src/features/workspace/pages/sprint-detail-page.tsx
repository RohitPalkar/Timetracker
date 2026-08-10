import { Link, useParams } from 'react-router'
import { ArrowLeft, CalendarClock } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { sprintRepository } from '@/services'
import { PageHeader } from '@/components/common/page-header'
import { PageLayout } from '@/components/common/page-layout'
import { ErrorState } from '@/components/feedback/error-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { formatDate } from '@/lib/formats'

const STATUS_BADGE: Record<string, { tone: 'info' | 'success' | 'neutral'; label: string }> = {
  planned: { tone: 'info', label: 'Planned' },
  active: { tone: 'success', label: 'Active' },
  completed: { tone: 'neutral', label: 'Completed' },
}

export function SprintDetailPage() {
  const { projectId, sprintId } = useParams()
  const query = useQuery({
    queryKey: ['workspace', 'sprint', sprintId],
    queryFn: () => sprintRepository.get(sprintId as string),
    enabled: Boolean(sprintId),
  })

  if (query.isLoading) {
    return (
      <PageLayout header={<PageHeader title="Sprint" description="Loading sprint…" />}>
        <Skeleton className="h-40 w-full rounded-2xl" />
      </PageLayout>
    )
  }

  const sprint = query.data
  if (query.isError || !sprint) {
    return (
      <PageLayout
        header={
          <PageHeader
            title="Sprint"
            description="Could not load this sprint."
            actions={
              <Button variant="outline" asChild>
                <Link to={`/projects/${projectId}/sprints`}>
                  <ArrowLeft className="size-4" aria-hidden="true" /> Back to sprints
                </Link>
              </Button>
            }
          />
        }
      >
        <ErrorState title="Could not load sprint" description={query.error instanceof Error ? query.error.message : 'Something went wrong.'} onRetry={() => query.refetch()} />
      </PageLayout>
    )
  }

  const badge = STATUS_BADGE[sprint.status] ?? { tone: 'neutral' as const, label: sprint.status }
  const capacityPct = sprint.capacityHours > 0 ? Math.round((sprint.hoursLogged / sprint.capacityHours) * 100) : 0

  return (
    <PageLayout
      header={
        <PageHeader
          title={sprint.name}
          description={sprint.goal}
          breadcrumb={[
            { label: 'Sprints', to: `/projects/${projectId}/sprints` },
            { label: sprint.name },
          ]}
          eyebrow={
            <Badge variant={badge.tone} className="capitalize">
              {badge.label}
            </Badge>
          }
          actions={
            <Button variant="outline" asChild>
              <Link to={`/projects/${projectId}/sprints`}>
                <ArrowLeft className="size-4" aria-hidden="true" /> Back to sprints
              </Link>
            </Button>
          }
        />
      }
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Summary label="Start date" value={formatDate(sprint.startDate)} />
        <Summary label="End date" value={formatDate(sprint.endDate)} />
        <Summary label="Velocity" value={`${sprint.velocity} pts`} />
        <Summary label="Confidence" value={`${sprint.confidence}%`} />
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
        <div className="mb-2 flex items-center justify-between text-[13px]">
          <span className="text-muted-foreground">Capacity</span>
          <span className="font-medium text-foreground">
            {sprint.hoursLogged}h / {sprint.capacityHours}h ({capacityPct}%)
          </span>
        </div>
        <Progress value={capacityPct} className="h-2" />
      </div>

      <div className="flex items-center gap-2 rounded-2xl border border-dashed border-border-strong bg-surface/60 p-6 text-[13px] text-muted-foreground">
        <CalendarClock className="size-4" aria-hidden="true" />
        Sprint backlog and board scoped to this sprint will be connected here in a later screen pass.
      </div>
    </PageLayout>
  )
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4 shadow-xs">
      <p className="text-[12px] text-muted-foreground">{label}</p>
      <p className="mt-1 text-[15px] font-semibold text-foreground">{value}</p>
    </div>
  )
}