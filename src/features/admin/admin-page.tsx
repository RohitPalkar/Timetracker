import { Cog, Shield, Users, Lock } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { PageLayout } from '@/components/common/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { userStore, projectStore } from '@/services/stores'
import { toast } from 'sonner'

export function AdministrationPage() {
  const users = userStore.all()
  const projects = projectStore.all()

  return (
    <PageLayout header={<PageHeader title="Administration" description="Global system administration and configuration. Privileged access — gated by admin.all." breadcrumb={[{ label: 'Administration' }]} />}>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Users className="size-4" /> Users</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{users.length}</p><p className="text-xs text-muted-foreground">{users.filter((u)=>u.status==='active').length} active • {users.filter((u)=>u.status==='invited').length} invited</p><Button variant="outline" size="sm" className="mt-3" onClick={()=>toast.info('Users → /employees')}>Manage users</Button></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Cog className="size-4" /> Projects</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{projects.length}</p><p className="text-xs text-muted-foreground">{projects.filter((p)=>p.status==='active').length} active</p><Button variant="outline" size="sm" className="mt-3" onClick={()=>toast.info('Projects → /projects')}>Manage projects</Button></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Shield className="size-4" /> Roles & permissions</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">7 roles</p><p className="text-xs text-muted-foreground">30 permissions • RBAC matrix</p><Button variant="outline" size="sm" className="mt-3" onClick={()=>toast.info('Roles → /roles')}>Configure RBAC</Button></CardContent></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Lock className="size-4" /> Security</CardTitle></CardHeader><CardContent className="space-y-2 text-sm text-muted-foreground"><p>Supabase Auth is authoritative • JWT is not trusted for authorization • Backend is isolation gate.</p><Badge variant="success">Enforced</Badge></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Governance</CardTitle></CardHeader><CardContent className="space-y-2"><div className="flex justify-between rounded-xl border border-border bg-surface-subtle px-3 py-2 text-sm"><span>Integrations</span><Badge variant="neutral">API keys • webhooks</Badge></div><div className="flex justify-between rounded-xl border border-border bg-surface-subtle px-3 py-2 text-sm"><span>Audit logs</span><Badge variant="neutral">append-only</Badge></div><Button variant="outline" size="sm" className="w-full" onClick={()=>toast.info('Governance panels wire to /admin/* sub-routes.')}>Open governance</Button></CardContent></Card>
      </div>
    </PageLayout>
  )
}
