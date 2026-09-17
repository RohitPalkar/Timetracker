import { PageHeader } from '@/components/common/page-header'
import { PageLayout } from '@/components/common/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useDashboard } from '@/features/dashboard/dashboard-queries'
import { useAuth } from '@/store/auth'
import { personaForRole } from '@/config/dashboard-config'
import { useDashboardFilters } from '@/store/dashboard'

export function HRRequestsPage() {
  const { authUser } = useAuth()
  const persona = personaForRole(authUser?.roleId)
  const { filters } = useDashboardFilters()
  const query = useDashboard(persona, filters)
  const req = query.data?.myHRMS.hrRequests
  return (
    <PageLayout header={<PageHeader title="HR Requests" description="Pending, approved and rejected requests requiring employee action." breadcrumb={[{ label: 'HRMS' }, { label: 'Requests' }]} />}>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-sm">Pending</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{req?.pending ?? 0}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Approved</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{req?.approved ?? 0}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Rejected</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{req?.rejected ?? 0}</p></CardContent></Card>
      </div>
      <Card><CardHeader><CardTitle className="text-sm">Recent</CardTitle></CardHeader><CardContent className="grid gap-2">{req?.items.map((r) => <div key={r.id} className="flex items-center justify-between rounded-xl border border-border bg-surface-subtle px-3 py-2"><span className="text-sm text-foreground">{r.title}</span><Badge variant="info" className="capitalize text-[11px]">{r.status}</Badge></div>)}</CardContent></Card>
    </PageLayout>
  )
}
