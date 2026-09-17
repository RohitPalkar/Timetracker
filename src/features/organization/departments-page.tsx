import * as React from 'react'
import { Building2, MoreHorizontal, Plus } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { PageLayout } from '@/components/common/page-layout'
import { DataTable, type DataTableColumn } from '@/components/tables/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AvatarStack } from '@/components/common/user-avatar'
import { userStore } from '@/services/stores'
import { toast } from 'sonner'

type DepartmentRow = { id: string; name: string; leadId: string; memberCount: number; description: string }

const DEPTS: DepartmentRow[] = [
  { id: 'dept-eng', name: 'Engineering', leadId: 'user-arjun', memberCount: 6, description: 'Product and platform engineering' },
  { id: 'dept-design', name: 'Design', leadId: 'user-sara', memberCount: 2, description: 'Product design and research' },
  { id: 'dept-quality', name: 'Quality', leadId: 'user-priya', memberCount: 3, description: 'QA and test engineering' },
  { id: 'dept-delivery', name: 'Delivery', leadId: 'user-rohit', memberCount: 3, description: 'Project and program management' },
  { id: 'dept-people', name: 'People', leadId: 'user-vikram', memberCount: 2, description: 'HR and operations' },
  { id: 'dept-finance', name: 'Finance', leadId: 'user-aisha', memberCount: 1, description: 'Finance and administration' },
]

export function DepartmentsPage() {
  const [search, setSearch] = React.useState('')
  const users = userStore.all()

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return DEPTS
    return DEPTS.filter((d) => d.name.toLowerCase().includes(term) || d.description.toLowerCase().includes(term))
  }, [search])

  const columns = React.useMemo<DataTableColumn<DepartmentRow>[]>(() => [
    { id: 'dept', header: 'Department', cell: (r) => <span className="flex items-center gap-2.5"><span className="flex size-8 items-center justify-center rounded-xl bg-info-soft text-info-foreground"><Building2 className="size-4" /></span><span><p className="text-[13px] font-medium text-foreground">{r.name}</p><p className="text-[11px] text-muted-foreground">{r.description}</p></span></span>, sortable: true, sortValue: (r) => r.name, searchValue: (r) => [r.name, r.description], hideable: false },
    { id: 'lead', header: 'Lead', cell: (r) => { const u = users.find((x) => x.id === r.leadId); return <span className="text-[13px] text-foreground">{u?.name ?? '—'}</span> }, sortable: true, sortValue: (r) => users.find((x) => x.id === r.leadId)?.name ?? '' },
    { id: 'members', header: 'Members', cell: (r) => <span className="flex items-center gap-2"><AvatarStack people={users.filter((u) => u.department === r.name).slice(0, 4).map((u) => ({ id: u.id, name: u.name }))} size="xs" max={4} /><Badge variant="neutral">{r.memberCount}</Badge></span>, sortable: true, sortValue: (r) => r.memberCount },
    { id: 'status', header: 'Status', cell: () => <Badge variant="success">Active</Badge> },
    { id: 'actions', header: '', cell: (row) => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => toast.info(`Manage ${row.name}`)}>Manage members</DropdownMenuItem><DropdownMenuItem onSelect={() => toast.info(`Edit ${row.name}`)}>Edit department</DropdownMenuItem></DropdownMenuContent></DropdownMenu>, align: 'right', hideable: false },
  ], [users])

  return (
    <PageLayout header={<PageHeader title="Departments" description="Organize teams and employees into departments. Manage leads, members and hierarchy." breadcrumb={[{ label: 'Departments' }]} actions={<Button onClick={() => toast.info('Department creation arrives with the org-admin APIs — mock flow is ready.')}><Plus className="size-4" /> New department</Button>} />}>
      <DataTable<DepartmentRow> data={filtered} columns={columns} keyField={(r) => r.id} toolbar={{ search: { value: search, onValueChange: setSearch, placeholder: 'Search departments…' }, actions: <span className="text-[13px] text-muted-foreground">{filtered.length} departments</span> }} pagination={{ pageSize: 10 }} empty={{ icon: Building2, title: 'No departments', description: 'Departments group teams for reporting and ownership.', action: { label: 'New department', onClick: () => toast.info('Create department'), icon: Plus } }} />
    </PageLayout>
  )
}
