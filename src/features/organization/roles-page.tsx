import * as React from 'react'
import { MoreHorizontal, Plus, Shield } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { PageLayout } from '@/components/common/page-layout'
import { DataTable, type DataTableColumn } from '@/components/tables/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import type { Role } from '@/types/permission'
import { toast } from 'sonner'

const ROLES: Role[] = [
  { id: 'role-org_admin', key: 'org_admin', name: 'Org Admin', description: 'Organization-wide administration', permissions: ['admin.all', 'users.manage', 'roles.manage', 'settings.manage'], isSystem: true },
  { id: 'role-delivery_manager', key: 'delivery_manager', name: 'Delivery Manager', description: 'Manages delivery across projects', permissions: ['projects.view', 'projects.create', 'projects.edit', 'teams.manage', 'reports.view'], isSystem: true },
  { id: 'role-project_manager', key: 'project_manager', name: 'Project Manager', description: 'Owns project delivery and planning', permissions: ['projects.view', 'projects.edit', 'sprints.manage', 'stories.view', 'timesheets.view_all'], isSystem: true },
  { id: 'role-team_lead', key: 'team_lead', name: 'Team Lead', description: 'Leads team execution', permissions: ['projects.view', 'sprints.view', 'stories.view', 'bugs.view', 'timesheets.view_all'], isSystem: true },
  { id: 'role-employee', key: 'employee', name: 'Employee', description: 'Individual contributor', permissions: ['dashboard.view', 'projects.view', 'stories.view', 'timesheets.view_own', 'timesheets.submit'], isSystem: true },
  { id: 'role-hr', key: 'hr', name: 'HR', description: 'People operations', permissions: ['users.view', 'users.manage', 'reports.view'], isSystem: false },
  { id: 'role-finance', key: 'finance', name: 'Finance', description: 'Finance and billing', permissions: ['reports.view', 'reports.export', 'settings.view'], isSystem: false },
]

export function RolesPage() {
  const [search, setSearch] = React.useState('')

  const columns = React.useMemo<DataTableColumn<Role>[]>(() => [
    { id: 'role', header: 'Role', cell: (r) => <span className="flex items-center gap-2.5"><span className="flex size-8 items-center justify-center rounded-xl bg-warning-soft text-warning-foreground"><Shield className="size-4" /></span><span><p className="text-[13px] font-medium text-foreground">{r.name}</p><p className="text-[11px] text-muted-foreground">{r.key}</p></span></span>, sortable: true, sortValue: (r) => r.name, searchValue: (r) => [r.name, r.key, r.description], hideable: false },
    { id: 'desc', header: 'Description', cell: (r) => <span className="text-[13px] text-muted-foreground line-clamp-1">{r.description}</span>, sortable: true, sortValue: (r) => r.description },
    { id: 'perms', header: 'Permissions', cell: (r) => <span className="flex flex-wrap gap-1">{r.permissions.slice(0, 3).map((p) => <Badge key={p} variant="neutral" className="text-[10px]">{p}</Badge>)}{r.permissions.length > 3 && <Badge variant="outline" className="text-[10px]">+{r.permissions.length - 3}</Badge>}</span>, hideable: false },
    { id: 'type', header: 'Type', cell: (r) => r.isSystem ? <Badge variant="info">System</Badge> : <Badge variant="neutral">Custom</Badge>, sortable: true, sortValue: (r) => r.isSystem ? 1 : 0 },
    { id: 'actions', header: '', cell: (row) => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => toast.info(`View ${row.name} permissions`)}>View permissions</DropdownMenuItem><DropdownMenuItem onSelect={() => toast.info(`Edit ${row.name}`)}>Edit role</DropdownMenuItem><DropdownMenuItem onSelect={() => toast.info('Clone role')}>Duplicate</DropdownMenuItem></DropdownMenuContent></DropdownMenu>, align: 'right', hideable: false },
  ], [])

  return (
    <PageLayout header={<PageHeader title="Roles" description="Define roles and responsibility scopes. System roles are protected; custom roles extend them." breadcrumb={[{ label: 'Roles' }]} actions={<Button onClick={() => toast.info('Role builder ships with RBAC APIs — static config is live.')}><Plus className="size-4" /> New role</Button>} />}>
      <DataTable<Role> data={ROLES} columns={columns} keyField={(r) => r.id} toolbar={{ search: { value: search, onValueChange: setSearch, placeholder: 'Search roles…' }, actions: <span className="text-[13px] text-muted-foreground">{ROLES.length} roles</span> }} pagination={{ pageSize: 10 }} />
    </PageLayout>
  )
}
