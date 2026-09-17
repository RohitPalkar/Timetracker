import * as React from 'react'
import { Lock, Search } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { PageLayout } from '@/components/common/page-layout'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import type { PermissionKey } from '@/types/permission'

type Group = { module: string; items: Array<{ key: PermissionKey; label: string; desc: string }> }

const GROUPS: Group[] = [
  { module: 'Projects', items: [{ key: 'projects.view', label: 'View projects', desc: 'List and view project details' }, { key: 'projects.create', label: 'Create projects', desc: 'Create new projects' }, { key: 'projects.edit', label: 'Edit projects', desc: 'Update project metadata' }, { key: 'projects.archive', label: 'Archive', desc: 'Archive/restore projects' }, { key: 'projects.delete', label: 'Delete', desc: 'Hard-delete projects (danger)' }] },
  { module: 'Planning', items: [{ key: 'sprints.view', label: 'View sprints', desc: 'View sprint planning' }, { key: 'sprints.manage', label: 'Manage sprints', desc: 'Create/edit sprints' }, { key: 'stories.view', label: 'View stories', desc: 'View backlog and board' }, { key: 'stories.create', label: 'Create stories', desc: 'Create stories/tasks' }, { key: 'bugs.view', label: 'View bugs', desc: 'View defects' }, { key: 'bugs.create', label: 'Create bugs', desc: 'Report defects' }] },
  { module: 'Timesheets', items: [{ key: 'timesheets.view_own', label: 'View own', desc: 'View own timesheets' }, { key: 'timesheets.view_all', label: 'View all', desc: 'View team timesheets' }, { key: 'timesheets.submit', label: 'Submit', desc: 'Submit weekly timesheets' }, { key: 'timesheets.approve', label: 'Approve', desc: 'Approve/reject submissions' }] },
  { module: 'Organization', items: [{ key: 'users.view', label: 'View users', desc: 'View employee directory' }, { key: 'users.manage', label: 'Manage users', desc: 'Invite/manage users' }, { key: 'roles.manage', label: 'Manage roles', desc: 'Manage role definitions' }, { key: 'admin.all', label: 'Super admin', desc: 'Full platform access' }] },
  { module: 'Reports', items: [{ key: 'reports.view', label: 'View reports', desc: 'View analytics and reports' }, { key: 'reports.export', label: 'Export', desc: 'Export report data' }] },
]

export function PermissionsPage() {
  const [search, setSearch] = React.useState('')

  const filtered = React.useMemo(() => {
    const term = search.toLowerCase().trim()
    if (!term) return GROUPS
    return GROUPS.map((g) => ({ ...g, items: g.items.filter((i) => i.key.toLowerCase().includes(term) || i.label.toLowerCase().includes(term)) })).filter((g) => g.items.length > 0)
  }, [search])

  return (
    <PageLayout header={<PageHeader title="Permissions" description="Configure role-based access control. Permissions are grouped by module and assigned to roles." breadcrumb={[{ label: 'Permissions' }]} />}>
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface p-3">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search permissions…" className="pl-9" />
        </div>
        <span className="ml-auto text-[13px] text-muted-foreground">{GROUPS.reduce((a, g) => a + g.items.length, 0)} permissions</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((group) => (
          <Card key={group.module}>
            <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Lock className="size-4 text-muted-foreground" />{group.module}<Badge variant="neutral" className="ml-auto">{group.items.length}</Badge></CardTitle></CardHeader>
            <CardContent className="grid gap-2">
              {group.items.map((p) => (
                <div key={p.key} className="rounded-xl border border-border bg-surface-subtle px-3 py-2.5">
                  <p className="text-[13px] font-medium text-foreground">{p.label}</p>
                  <p className="text-[11px] text-muted-foreground">{p.key}</p>
                  <p className="mt-1 text-[12px] text-muted-foreground">{p.desc}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border-strong bg-surface/60 p-10 text-center text-sm text-muted-foreground">No permissions match “{search}”.</div>
      )}
    </PageLayout>
  )
}
