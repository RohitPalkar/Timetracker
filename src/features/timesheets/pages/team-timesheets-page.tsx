import * as React from 'react'
import { Users } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { PageLayout } from '@/components/common/page-layout'
import { DataTable, type DataTableColumn } from '@/components/tables/data-table'
import { Badge } from '@/components/ui/badge'
import { UserAvatar } from '@/components/common/user-avatar'
import type { Timesheet } from '@/types/timesheet'
import { DEMO_TIMESHEETS } from '../timesheet-data'
import { userStore } from '@/services/stores'
import { toast } from 'sonner'

const TONE: Record<Timesheet['status'], 'success' | 'info' | 'warning' | 'danger' | 'neutral'> = { draft: 'neutral', submitted: 'info', approved: 'success', rejected: 'danger' }

export function TeamTimesheetsPage() {
  const [search, setSearch] = React.useState('')
  const users = userStore.all()

  const columns = React.useMemo<DataTableColumn<Timesheet>[]>(() => [
    { id: 'user', header: 'Member', cell: (r) => { const u = users.find((x) => x.id === r.userId); return <span className="flex items-center gap-2"><UserAvatar name={u?.name ?? r.userId} size="xs" /><span className="text-[13px] font-medium text-foreground">{u?.name ?? r.userId}</span></span> }, sortable: true, sortValue: (r) => users.find((x) => x.id === r.userId)?.name ?? r.userId, searchValue: (r) => users.find((x) => x.id === r.userId)?.name, hideable: false },
    { id: 'week', header: 'Week', cell: (r) => <span className="text-[13px] text-foreground">{r.weekStart} → {r.weekEnd}</span>, sortable: true, sortValue: (r) => r.weekStart },
    { id: 'hours', header: 'Hours', cell: (r) => <span className="text-[13px] font-medium text-foreground">{r.totalHours}h <span className="text-muted-foreground">/ {r.billableHours}h billable</span></span>, sortable: true, sortValue: (r) => r.totalHours, align: 'right' },
    { id: 'status', header: 'Status', cell: (r) => <Badge variant={TONE[r.status]}>{r.status}</Badge>, sortable: true, sortValue: (r) => r.status },
    { id: 'entries', header: 'Entries', cell: (r) => <span className="text-[13px] text-muted-foreground">{r.entries.length}</span>, sortable: true, sortValue: (r) => r.entries.length },
  ], [users])

  return (
    <PageLayout header={<PageHeader title="Team Timesheets" description="Review time entries for your team members. Filter by week, project and approval status." breadcrumb={[{ label: 'Timesheets' }, { label: 'Team Timesheets' }]} />}>
      <DataTable<Timesheet> data={DEMO_TIMESHEETS} columns={columns} keyField={(r) => r.id} onRowClick={(r) => toast.info(`${users.find((u) => u.id === r.userId)?.name ?? r.userId} • ${r.totalHours}h • ${r.status}`)} toolbar={{ search: { value: search, onValueChange: setSearch, placeholder: 'Search team timesheets…' }, actions: <span className="text-[13px] text-muted-foreground">{DEMO_TIMESHEETS.length} timesheets</span> }} pagination={{ pageSize: 10 }} empty={{ icon: Users, title: 'No team timesheets', description: 'Timesheets from your team appear here once logged.' }} />
    </PageLayout>
  )
}
