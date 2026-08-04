import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Bug, CheckCircle2, Clock, Target } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { PageLayout } from '@/components/common/page-layout'
import { MetricCard } from '@/components/common/metric-card'
import { ChartCard, ChartTooltip, chartAxisProps } from '@/components/charts/chart-card'
import { DataTable, type DataTableColumn } from '@/components/tables/data-table'
import { StatusBadge, type StatusTone } from '@/components/common/status-badge'
import { PriorityBadge } from '@/components/common/priority-badge'
import { UserAvatar } from '@/components/common/user-avatar'
import { ErrorState } from '@/components/feedback/error-state'
import { Skeleton } from '@/components/ui/skeleton'
import { dashboardService } from '@/services'
import { userService } from '@/services'
import type { Story, StoryStatus } from '@/types/agile'
import type { User } from '@/types'
import { useAuth } from '@/store/auth'
import { formatRelative, formatDay } from '@/lib/formats'
import { CHART_PALETTE } from '@/config/colors'
import { toast } from 'sonner'

const STORY_STATUS_TONE: Record<StoryStatus, { tone: StatusTone; label: string }> = {
  todo: { tone: 'neutral', label: 'Todo' },
  in_progress: { tone: 'info', label: 'In progress' },
  in_review: { tone: 'warning', label: 'In review' },
  qa: { tone: 'warning', label: 'QA' },
  done: { tone: 'success', label: 'Done' },
}

const METRIC_ICONS = [Target, Bug, CheckCircle2, Clock]

type StoryRow = Story & { assigneeName: string }

export function DashboardPage() {
  const { authUser } = useAuth()

  const overviewQuery = useQuery({ queryKey: ['dashboard', 'overview'], queryFn: dashboardService.overview })
  const usersQuery = useQuery({
    queryKey: ['users', 'directory'],
    queryFn: async () => {
      const result = await userService.list({ page: 1, pageSize: 100 })
      return result.items
    },
  })

  const userMap = React.useMemo(() => {
    const map = new Map<string, User>()
    for (const user of usersQuery.data ?? []) map.set(user.id, user)
    return map
  }, [usersQuery.data])

  const rows: StoryRow[] = React.useMemo(
    () =>
      (overviewQuery.data?.recentStories ?? []).map((story) => ({
        ...story,
        assigneeName: story.assigneeId ? (userMap.get(story.assigneeId)?.name ?? 'Unassigned') : 'Unassigned',
      })),
    [overviewQuery.data, userMap],
  )

  const columns = React.useMemo<DataTableColumn<StoryRow>[]>(
    () => [
      {
        id: 'key',
        header: 'ID',
        cell: (row) => <span className="font-mono text-xs text-muted-foreground">{row.key}</span>,
        sortable: true,
        sortValue: (row) => row.key,
        searchValue: (row) => row.key,
        hideable: false,
      },
      {
        id: 'title',
        header: 'Story',
        cell: (row) => <span className="font-medium text-foreground">{row.title}</span>,
        sortable: true,
        sortValue: (row) => row.title,
        searchValue: (row) => row.title,
      },
      {
        id: 'status',
        header: 'Status',
        cell: (row) => {
          const config = STORY_STATUS_TONE[row.status]
          return (
            <StatusBadge tone={config.tone} dot>
              {config.label}
            </StatusBadge>
          )
        },
        sortable: true,
        sortValue: (row) => row.status,
      },
      { id: 'priority', header: 'Priority', cell: (row) => <PriorityBadge priority={row.priority} />, sortable: true, sortValue: (row) => row.priority },
      {
        id: 'assignee',
        header: 'Assignee',
        cell: (row) => (
          <span className="flex items-center gap-2">
            <UserAvatar name={row.assigneeName} size="xs" />
            <span className="text-[13px] text-foreground">{row.assigneeName}</span>
          </span>
        ),
        sortable: true,
        sortValue: (row) => row.assigneeName,
        searchValue: (row) => row.assigneeName,
      },
      {
        id: 'updated',
        header: 'Updated',
        cell: (row) => <span className="text-[13px] text-muted-foreground">{formatRelative(row.updatedAt)}</span>,
        sortable: true,
        sortValue: (row) => row.updatedAt,
        align: 'right',
      },
    ],
    [],
  )

  return (
    <PageLayout
      header={
        <PageHeader
          title={`Welcome back, ${authUser?.name?.split(' ')[0] ?? 'there'}`}
          description="Here's what's happening across your projects this week."
          breadcrumb={[{ label: 'Dashboard' }]}
        />
      }
    >
      {overviewQuery.isLoading ? (
        <DashboardSkeleton />
      ) : overviewQuery.isError || !overviewQuery.data ? (
        <ErrorState
          title="Could not load your dashboard"
          description={overviewQuery.error instanceof Error ? overviewQuery.error.message : 'Something went wrong.'}
          onRetry={() => overviewQuery.refetch()}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {overviewQuery.data.metrics.map((metric, index) => (
              <MetricCard key={metric.title} icon={METRIC_ICONS[index]} {...metric} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 2xl:grid-cols-3">
            <ChartCard
              title="Velocity"
              description="Completed vs planned story points — last 8 weeks"
              legend={[
                { label: 'Completed', color: CHART_PALETTE[0] },
                { label: 'Planned', color: CHART_PALETTE[1] },
              ]}
              className="2xl:col-span-2"
            >
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={overviewQuery.data.velocity} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="completedFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_PALETTE[0]} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={CHART_PALETTE[0]} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="plannedFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={CHART_PALETTE[1]} stopOpacity={0.18} />
                        <stop offset="95%" stopColor={CHART_PALETTE[1]} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="week" {...chartAxisProps} />
                    <YAxis {...chartAxisProps} />
                    <RechartsTooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--color-border-strong)' }} />
                    <Area type="monotone" dataKey="completed" name="Completed" stroke={CHART_PALETTE[0]} strokeWidth={2} fill="url(#completedFill)" />
                    <Area type="monotone" dataKey="planned" name="Planned" stroke={CHART_PALETTE[1]} strokeWidth={2} strokeDasharray="4 4" fill="url(#plannedFill)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <ChartCard title="Health" description="Project status at a glance">
              <div className="flex h-[280px] flex-col justify-center gap-3">
                {overviewQuery.data.health.map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="w-16 shrink-0 text-[13px] text-muted-foreground">{item.label}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                      <div className={`h-full rounded-full ${item.tone}`} style={{ width: `${item.value}%` }} />
                    </div>
                    <span className="w-10 shrink-0 text-right text-[13px] font-semibold text-foreground">{item.value}%</span>
                  </div>
                ))}
                <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-surface-muted/60 p-3 text-[13px]">
                  <Clock className="size-4 text-muted-foreground" aria-hidden="true" />
                  <span className="text-muted-foreground">
                    {overviewQuery.data.nextRelease.name} · {formatDay(overviewQuery.data.nextRelease.date)}
                  </span>
                  <span className="ml-auto font-medium text-foreground">
                    {overviewQuery.data.nextRelease.scope} items
                  </span>
                </div>
              </div>
            </ChartCard>
          </div>

          <DataTable<StoryRow>
            data={rows}
            columns={columns}
            keyField={(row) => row.id}
            enableSelection
            toolbar={{
              search: { value: '', onValueChange: () => {}, placeholder: 'Search stories…' },
              actions: (
                <button
                  type="button"
                  className="text-[13px] font-medium text-brand-600 transition-colors hover:text-brand-700"
                  onClick={() => toast.info('Full backlog arrives in Phase 2.')}
                >
                  View all →
                </button>
              ),
            }}
            pagination={{ pageSize: 5 }}
            stickyHeader
            onRowClick={(row) => toast.info(`${row.key} · detail drawer arrives in Phase 2.`)}
          />
        </>
      )}
    </PageLayout>
  )
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-border bg-surface p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-8 rounded-lg" />
            </div>
            <Skeleton className="mt-4 h-8 w-20" />
            <Skeleton className="mt-2 h-3.5 w-32" />
          </div>
        ))}
      </div>
      <Skeleton className="h-[280px] w-full rounded-2xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  )
}