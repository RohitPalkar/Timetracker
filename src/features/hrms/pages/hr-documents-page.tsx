import { PageHeader } from '@/components/common/page-header'
import { PageLayout } from '@/components/common/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useDashboard } from '@/features/dashboard/dashboard-queries'
import { useAuth } from '@/store/auth'
import { personaForRole } from '@/config/dashboard-config'
import { useDashboardFilters } from '@/store/dashboard'
import { useNavigate } from 'react-router'

export function HRDocumentsPage() {
  const navigate = useNavigate()
  const { authUser } = useAuth()
  const persona = personaForRole(authUser?.roleId)
  const { filters } = useDashboardFilters()
  const query = useDashboard(persona, filters)
  const docs = query.data?.myHRMS.documents
  return (
    <PageLayout header={<PageHeader title="HR Documents" description="Documents requiring attention, expiring and recent. Click navigates to canonical Documents." breadcrumb={[{ label: 'HRMS' }, { label: 'Documents' }]} actions={<Button size="sm" variant="outline" onClick={() => navigate('/documents')}>Open Documents</Button>} />}>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-sm">Attention</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{docs?.requiringAttention ?? 0}</p><p className="text-xs text-muted-foreground">requiring attention</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Expiring soon</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{docs?.expiringSoon ?? 0}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Recent</CardTitle></CardHeader><CardContent className="grid gap-2">{docs?.recent.map((d) => <div key={d.id} className="flex justify-between rounded-xl border border-border bg-surface-subtle px-3 py-2"><span className="text-sm text-foreground">{d.name}</span><span className="text-xs text-muted-foreground">{new Date(d.updatedAt).toLocaleDateString()}</span></div>)}</CardContent></Card>
      </div>
    </PageLayout>
  )
}
