import * as React from 'react'
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
import { useAuth } from '@/app/providers/auth-provider'
import { formatRelative } from '@/lib/formats'
import { CHART_PALETTE } from '@/config/colors'
import { toast } from 'sonner'

const METRICS = [
  { title: 'Active stories', value: '128', trend: 12, trendLabel: 'vs last week', icon: Target, iconTone: 'brand' as const },
  { title: 'Open bugs', value: '24', trend: -8, trendLabel: 'vs last week', icon: Bug, iconTone: 'danger' as const },
  { title: 'Completed this week', value: '36', trend: 5, trendLabel: 'vs last week', icon: CheckCircle2, iconTone: 'success' as const },
  { title: 'Sprint 14 progress', value: '62%', hint: '3 days left', icon: Clock, iconTone: 'warning' as const },
]

const VELOCITY = [
  { week: 'W1', completed: 28, planned: 34 },
  { week: 'W2', completed: 32, planned: 30 },
  { week: 'W3', completed: 26, planned: 32 },
  { week: 'W4', completed: 38, planned: 36 },
  { week: 'W5', completed: 42, planned: 38 },
  { week: 'W6', completed: 36, planned: 40 },
  { week: 'W7', completed: 44, planned: 42 },
  { week: 'W8', completed: 40, planned: 44 },
]

interface StoryRow {
  key: string
  id: string
  title: string
  status: 'todo' | 'in_progress' | 'in_review' | 'done'
  priority: 'highest' | 'high' | 'medium' | 'low'
  assignee: string
  updatedAt: string
}

const STORIES: StoryRow[] = [
  { key: '1', id: 'ST-104', title: 'Empty state for boards', status: 'in_progress', priority: 'medium', assignee: 'Aditi Sharma', updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() },
  { key: '2', id: 'ST-102', title: 'Export timesheets to CSV', status: 'in_review', priority: 'high', assignee: 'Arjun Mehta', updatedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() },
  { key: '3', id: 'ST-101', title: 'Sprint burndown chart', status: 'done', priority: 'high', assignee: 'Priya Nair', updatedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() },
  { key: '4', id: 'ST-099', title: 'Project health scoring', status: 'todo', priority: 'highest', assignee: 'Rohit Verma', updatedAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString() },
  { key: '5', id: 'ST-095', title: 'Role-based access control', status: 'in_progress', priority: 'highest', assignee: 'Rohit Verma', updatedAt: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString() },
]

const STORY_STATUS_TONE: Record<StoryRow['status'], { tone: StatusTone; label: string }> = {
  todo: { tone: 'neutral', label: 'Todo' },
  in_progress: { tone: 'info', label: 'In progress' },
  in_review: { tone: 'warning', label: 'In review' },
  done: { tone: 'success', label: 'Done' },
}

const STORY_COLUMNS: DataTableColumn<StoryRow>[] = [
  { id: 'id', header: 'ID', cell: (row) => <span className="font-mono text-xs text-muted-foreground">{row.id}</span>, sortable: true, sortValue: (row) => row.id },
  { id: 'title', header: 'Story', cell: (row) => <span className="font-medium text-foreground">{row.title}</span>, sortable: true, sortValue: (row) => row.title },
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
        <UserAvatar name={row.assignee} size="xs" />
        <span className="text-[13px] text-foreground">{row.assignee}</span>
      </span>
    ),
    sortable: true,
    sortValue: (row) => row.assignee,
  },
  {
    id: 'updated',
    header: 'Updated',
    cell: (row) => <span className="text-[13px] text-muted-foreground">{formatRelative(row.updatedAt)}</span>,
    sortable: true,
    sortValue: (row) => row.updatedAt,
    align: 'right',
  },
]

export function DashboardPage() {
  const { authUser } = useAuth()
  const [search, setSearch] = React.useState('')

  const filtered = React.useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return STORIES
    return STORIES.filter(
      (row) =>
        row.title.toLowerCase().includes(query) ||
        row.id.toLowerCase().includes(query) ||
        row.assignee.toLowerCase().includes(query),
    )
  }, [search])

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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {METRICS.map((metric) => (
          <MetricCard key={metric.title} {...metric} />
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
              <AreaChart data={VELOCITY} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
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
            {[
              { label: 'On track', value: 62, tone: 'bg-success' },
              { label: 'At risk', value: 26, tone: 'bg-warning' },
              { label: 'Delayed', value: 12, tone: 'bg-danger' },
            ].map((item) => (
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
              <span className="text-muted-foreground">Next release</span>
              <span className="ml-auto font-medium text-foreground">Aug 14</span>
            </div>
          </div>
        </ChartCard>
      </div>

      <DataTable<StoryRow>
        data={filtered}
        columns={STORY_COLUMNS}
        keyField={(row) => row.key}
        enableSelection
        toolbar={{
          search: { value: search, onValueChange: setSearch, placeholder: 'Search stories…' },
          actions: (
            <button
              type="button"
              className="text-[13px] font-medium text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-300"
              onClick={() => toast.info('Full backlog arrives in Phase 2.')}
            >
              View all →
            </button>
          ),
        }}
        pagination={{ pageSize: 5 }}
        stickyHeader
        onRowClick={(row) => toast.info(`${row.id} · detail drawer arrives in Phase 2.`)}
      />
    </PageLayout>
  )
}