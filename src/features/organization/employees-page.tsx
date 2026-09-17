import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Building2, Mail, MoreHorizontal, Plus, Shield, UserPlus } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { PageLayout } from '@/components/common/page-layout'
import { DataTable, type DataTableColumn } from '@/components/tables/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ErrorState } from '@/components/feedback/error-state'
import { userService } from '@/services/user'
import type { User, UserStatus } from '@/types'
import { toast } from 'sonner'

const STATUS_TONE: Record<UserStatus, 'success' | 'warning' | 'neutral'> = { active: 'success', invited: 'warning', suspended: 'neutral' }

export function EmployeesPage() {
  const qc = useQueryClient()
  const [search, setSearch] = React.useState('')
  const [inviteOpen, setInviteOpen] = React.useState(false)
  const [form, setForm] = React.useState({ name: '', email: '', designation: '', department: 'Engineering', roleId: 'role-employee' })

  const query = useQuery({
    queryKey: ['employees', search],
    queryFn: () => userService.list({ page: 1, pageSize: 100, search: search || undefined }),
  })

  const createMut = useMutation({
    mutationFn: () => userService.create({ name: form.name, email: form.email, designation: form.designation || 'Employee', department: form.department, roleId: form.roleId }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['employees'] }); setInviteOpen(false); toast.success('Invitation sent'); setForm({ name: '', email: '', designation: '', department: 'Engineering', roleId: 'role-employee' }) },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not invite'),
  })

  const statusMut = useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) => userService.setStatus(id, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['employees'] }); toast.success('Status updated') },
  })

  const users = query.data?.items ?? []

  const columns = React.useMemo<DataTableColumn<User>[]>(() => [
    {
      id: 'user',
      header: 'Employee',
      cell: (row) => (
        <span className="flex items-center gap-2.5">
          <Avatar className="size-8"><AvatarFallback className="bg-primary-soft text-brand-700 text-xs">{row.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
          <span className="min-w-0">
            <p className="truncate text-[13px] font-medium text-foreground">{row.name}</p>
            <p className="flex items-center gap-1 truncate text-[11px] text-muted-foreground"><Mail className="size-3" />{row.email}</p>
          </span>
        </span>
      ),
      sortable: true, sortValue: (r) => r.name, searchValue: (r) => [r.name, r.email], hideable: false,
    },
    { id: 'role', header: 'Role', cell: (r) => <Badge variant="neutral" className="capitalize text-[11px]">{r.roleId.replace('role-', '').replace('_', ' ')}</Badge>, sortable: true, sortValue: (r) => r.roleId },
    { id: 'dept', header: 'Department', cell: (r) => <span className="inline-flex items-center gap-1.5 text-[13px] text-foreground"><Building2 className="size-3.5 text-muted-foreground" />{r.department}</span>, sortable: true, sortValue: (r) => r.department, searchValue: (r) => r.department },
    { id: 'designation', header: 'Designation', cell: (r) => <span className="text-[13px] text-foreground">{r.designation}</span>, sortable: true, sortValue: (r) => r.designation },
    { id: 'util', header: 'Utilization', cell: (r) => <span className="text-[13px] font-medium text-foreground">{r.utilization}%</span>, sortable: true, sortValue: (r) => r.utilization, align: 'right' },
    { id: 'status', header: 'Status', cell: (r) => <Badge variant={STATUS_TONE[r.status]}>{r.status}</Badge>, sortable: true, sortValue: (r) => r.status },
    {
      id: 'actions', header: '', cell: (row) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm" onClick={(e) => e.stopPropagation()}><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onSelect={() => toast.info('Profile for ' + row.name)}>View profile</DropdownMenuItem>
            {row.status !== 'active' && <DropdownMenuItem onSelect={() => statusMut.mutate({ id: row.id, status: 'active' })}>Activate</DropdownMenuItem>}
            {row.status === 'active' && <DropdownMenuItem onSelect={() => statusMut.mutate({ id: row.id, status: 'suspended' })} className="text-danger focus:text-danger">Suspend</DropdownMenuItem>}
            {row.status === 'invited' && <DropdownMenuItem onSelect={() => toast.info('Resent invite to ' + row.email)}>Resend invite</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
      ), align: 'right', hideable: false,
    },
  ], [statusMut])

  return (
    <PageLayout
      header={<PageHeader title="Employees" description="Manage employee profiles, status and org assignments. Invite, activate and organize your workforce." breadcrumb={[{ label: 'Employees' }]} actions={<Button onClick={() => setInviteOpen(true)}><UserPlus className="size-4" /> Invite employee</Button>} />}
    >
      {query.isError ? (
        <ErrorState title="Could not load employees" description={query.error instanceof Error ? query.error.message : 'Something went wrong.'} onRetry={() => query.refetch()} />
      ) : (
        <DataTable<User>
          data={users}
          columns={columns}
          keyField={(r) => r.id}
          loading={query.isLoading}
          toolbar={{ search: { value: search, onValueChange: setSearch, placeholder: 'Search employees…' }, actions: <span className="text-[13px] text-muted-foreground">{query.data?.total ?? 0} employees</span> }}
          pagination={{ pageSize: 12 }}
          empty={{ title: 'No employees found', description: 'Try adjusting search or invite your first teammate.', action: { label: 'Invite employee', onClick: () => setInviteOpen(true), icon: Plus } }}
        />
      )}

      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Invite employee</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Alex Morgan" /></div>
            <div className="grid gap-1.5"><Label>Email</Label><Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="alex@acme.com" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5"><Label>Department</Label><Select value={form.department} onValueChange={(v) => setForm({ ...form, department: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Engineering">Engineering</SelectItem><SelectItem value="Design">Design</SelectItem><SelectItem value="Quality">Quality</SelectItem><SelectItem value="Delivery">Delivery</SelectItem><SelectItem value="People">People</SelectItem><SelectItem value="Finance">Finance</SelectItem></SelectContent></Select></div>
              <div className="grid gap-1.5"><Label>Role</Label><Select value={form.roleId} onValueChange={(v) => setForm({ ...form, roleId: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="role-employee">Employee</SelectItem><SelectItem value="role-team_lead">Team Lead</SelectItem><SelectItem value="role-project_manager">Project Manager</SelectItem><SelectItem value="role-org_admin">Org Admin</SelectItem></SelectContent></Select></div>
            </div>
            <div className="grid gap-1.5"><Label>Designation</Label><Input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="Senior Engineer" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button><Button onClick={() => createMut.mutate()} loading={createMut.isPending} disabled={!form.name || !form.email}><Shield className="size-4" /> Send invite</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  )
}
