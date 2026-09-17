import { PageHeader } from '@/components/common/page-header'
import { PageLayout } from '@/components/common/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable, type DataTableColumn } from '@/components/tables/data-table'
import { useDashboard } from '@/features/dashboard/dashboard-queries'
import { useAuth } from '@/store/auth'
import { personaForRole } from '@/config/dashboard-config'
import { useDashboardFilters } from '@/store/dashboard'
import type { LeaveRequestSummary } from '@/types/dashboard'
import { useNavigate } from 'react-router'

export function LeavePage() {
  const navigate = useNavigate()
  const { authUser } = useAuth()
  const persona = personaForRole(authUser?.roleId)
  const { filters } = useDashboardFilters()
  const query = useDashboard(persona, filters)
  const leave = query.data?.myHRMS.leave

  const cols = [
    { id: 'type', header: 'Type', cell: (r: LeaveRequestSummary) => <Badge variant="neutral">{r.type}</Badge> },
    { id: 'dates', header: 'Dates', cell: (r: LeaveRequestSummary) => <span className="text-[13px] text-foreground">{r.from} → {r.to} ({r.days}d)</span> },
    { id: 'status', header: 'Status', cell: (r: LeaveRequestSummary) => <Badge variant={r.status === 'approved' ? 'success' : r.status === 'pending' ? 'warning' : 'danger'} className="capitalize">{r.status}</Badge> },
  ] as DataTableColumn<LeaveRequestSummary>[]

  return (
    <PageLayout header={<PageHeader title="Leave" description="Leave balances, pending requests, upcoming approved leave and history. Balances are policy-calculated, not manual." breadcrumb={[{ label: 'HRMS' }, { label: 'Leave' }]} actions={<Button size="sm" onClick={() => navigate('/hrms')}>Apply Leave</Button>} />}>
      <div className="grid gap-4 md:grid-cols-4">
        {leave?.balances.map((b) => (
          <Card key={b.type}><CardHeader className="pb-1"><CardTitle className="text-sm">{b.type}</CardTitle></CardHeader><CardContent><p className="text-xl font-semibold">{b.balance}d</p><p className="text-xs text-muted-foreground">{b.pending} pending</p></CardContent></Card>
        )) ?? <Card><CardContent className="pt-6 text-sm text-muted-foreground">Loading balances…</CardContent></Card>}
      </div>
      <Card><CardHeader><CardTitle className="text-sm">Pending</CardTitle></CardHeader><CardContent>{leave?.pending.length ? <DataTable<LeaveRequestSummary> data={leave.pending} columns={cols} keyField={(r) => r.id} /> : <p className="text-sm text-muted-foreground">No pending requests.</p>}</CardContent></Card>
      <Card><CardHeader><CardTitle className="text-sm">Upcoming approved</CardTitle></CardHeader><CardContent>{leave?.upcoming.length ? <DataTable<LeaveRequestSummary> data={leave.upcoming} columns={cols} keyField={(r) => r.id} /> : <p className="text-sm text-muted-foreground">No upcoming leave.</p>}</CardContent></Card>
    </PageLayout>
  )
}
