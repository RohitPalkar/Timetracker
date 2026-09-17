import * as React from 'react'
import { Check, ClipboardCheck, X } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { PageLayout } from '@/components/common/page-layout'
import { DataTable, type DataTableColumn } from '@/components/tables/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/common/user-avatar'
import type { Timesheet } from '@/types/timesheet'
import { DEMO_TIMESHEETS } from '../timesheet-data'
import { userStore } from '@/services/stores'
import { toast } from 'sonner'

export function TimesheetApprovalsPage() {
  const [items, setItems] = React.useState<Timesheet[]>(() => DEMO_TIMESHEETS)
  const [search, setSearch] = React.useState('')
  const users = userStore.all()
  const pending = items.filter((t) => t.status === 'submitted')

  const approve = (id: string) => { setItems((prev) => prev.map((t) => t.id === id ? { ...t, status: 'approved' as const, approvedAt: new Date().toISOString() } : t)); toast.success('Approved') }
  const reject = (id: string) => { setItems((prev) => prev.map((t) => t.id === id ? { ...t, status: 'rejected' as const } : t)); toast.success('Rejected') }

  const columns = React.useMemo<DataTableColumn<Timesheet>[]>(() => [
    { id: 'user', header: 'Employee', cell: (r) => { const u = users.find((x) => x.id === r.userId); return <span className="flex items-center gap-2"><UserAvatar name={u?.name ?? r.userId} size="xs" /><span className="text-[13px] font-medium text-foreground">{u?.name ?? r.userId}</span></span> }, sortable: true, sortValue: (r) => users.find((x) => x.id === r.userId)?.name ?? r.userId, hideable: false },
    { id: 'week', header: 'Week', cell: (r) => <span className="text-[13px] text-foreground">{r.weekStart} → {r.weekEnd}</span>, sortable: true, sortValue: (r) => r.weekStart },
    { id: 'hours', header: 'Total', cell: (r) => <span className="text-[13px] font-medium text-foreground">{r.totalHours}h</span>, sortable: true, sortValue: (r) => r.totalHours, align: 'right' },
    { id: 'status', header: 'Status', cell: (r) => <Badge variant={r.status === 'submitted' ? 'info' : r.status === 'approved' ? 'success' : r.status === 'rejected' ? 'danger' : 'neutral'}>{r.status}</Badge>, sortable: true, sortValue: (r) => r.status },
    { id: 'actions', header: '', cell: (row) => row.status === 'submitted' ? <span className="flex items-center gap-1.5"><Button size="sm" className="h-7" onClick={() => approve(row.id)}><Check className="size-3.5" /> Approve</Button><Button size="sm" variant="outline" className="h-7" onClick={() => reject(row.id)}><X className="size-3.5" /> Reject</Button></span> : <span className="text-xs text-muted-foreground">{row.status === 'approved' ? 'Approved' : row.status === 'rejected' ? 'Rejected' : row.status}</span>, align: 'right', hideable: false },
  ], [users])

  return (
    <PageLayout header={<PageHeader title="Approvals" description={`Review and approve pending timesheet submissions. ${pending.length} pending approval.`} breadcrumb={[{ label: 'Timesheets' }, { label: 'Approvals' }]} />}>
      <DataTable<Timesheet> data={items} columns={columns} keyField={(r) => r.id} toolbar={{ search: { value: search, onValueChange: setSearch, placeholder: 'Search approvals…' }, actions: <span className="text-[13px] text-muted-foreground">{pending.length} pending • {items.length} total</span> }} pagination={{ pageSize: 10 }} empty={{ icon: ClipboardCheck, title: 'No approvals', description: 'Submitted timesheets appear here for review.' }} />
    </PageLayout>
  )
}
