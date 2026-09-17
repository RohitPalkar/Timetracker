import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Layers, MoreHorizontal, Plus, Users } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { PageLayout } from '@/components/common/page-layout'
import { DataTable, type DataTableColumn } from '@/components/tables/data-table'
import { AvatarStack } from '@/components/common/user-avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { teamStore, userStore } from '@/services/stores'
import { mockDelay } from '@/services/http'
import { uid } from '@/lib/utils'
import type { Team } from '@/types'
import { toast } from 'sonner'

export function TeamsOrgPage() {
  const qc = useQueryClient()
  const [search, setSearch] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState({ name: '', type: 'development' as Team['type'], projectId: 'prj-core' })

  const users = userStore.all()
  const teamsQuery = useQuery({
    queryKey: ['org-teams', search],
    queryFn: async () => {
      await mockDelay(200)
      const result = teamStore.query({ search, searchFields: ['name', 'description'], sort: { field: 'name', direction: 'asc' } })
      return { items: result.items as Team[], total: result.total }
    },
  })

  const createMut = useMutation({
    mutationFn: async () => {
      await mockDelay(300)
      return teamStore.create({ name: form.name, description: `${form.name} team`, type: form.type, projectId: form.projectId, memberIds: [], subProjectIds: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), id: uid('team') } as Team)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['org-teams'] }); setOpen(false); toast.success('Team created') },
    onError: (e) => toast.error(e instanceof Error ? e.message : 'Could not create team'),
  })

  const columns = React.useMemo<DataTableColumn<Team>[]>(() => [
    { id: 'team', header: 'Team', cell: (r) => <span className="flex items-center gap-2.5"><span className="flex size-8 items-center justify-center rounded-xl bg-primary-soft text-brand-700"><Users className="size-4" /></span><span><p className="text-[13px] font-medium text-foreground">{r.name}</p><p className="text-[11px] text-muted-foreground">{r.description}</p></span></span>, sortable: true, sortValue: (r) => r.name, searchValue: (r) => [r.name, r.description], hideable: false },
    { id: 'type', header: 'Type', cell: (r) => <Badge variant="neutral" className="capitalize text-[11px]">{r.type.replace('_', ' ')}</Badge>, sortable: true, sortValue: (r) => r.type },
    { id: 'project', header: 'Project', cell: (r) => <span className="inline-flex items-center gap-1.5 text-[13px] text-foreground"><Layers className="size-3.5 text-muted-foreground" />{r.projectId}</span>, sortable: true, sortValue: (r) => r.projectId },
    { id: 'members', header: 'Members', cell: (r) => <AvatarStack people={r.memberIds.map((id) => { const u = users.find((x) => x.id === id); return { id, name: u?.name ?? id, avatarUrl: u?.avatarUrl } })} size="xs" max={4} />, sortable: true, sortValue: (r) => r.memberIds.length },
    { id: 'subProjects', header: 'Sub-projects', cell: (r) => r.subProjectIds.length > 0 ? <span className="text-[12px] text-foreground">{r.subProjectIds.length} linked</span> : <span className="text-[12px] text-muted-foreground">Project-wide</span> },
    { id: 'actions', header: '', cell: (row) => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={() => toast.info(`Manage ${row.name} members`)}>Manage members</DropdownMenuItem><DropdownMenuItem onSelect={() => toast.info(`Edit ${row.name}`)}>Edit team</DropdownMenuItem><DropdownMenuItem onSelect={() => toast.info('Configure sub-project associations')}>Sub-projects</DropdownMenuItem></DropdownMenuContent></DropdownMenu>, align: 'right', hideable: false },
  ], [users])

  return (
    <PageLayout header={<PageHeader title="Teams" description="Create and manage teams across the organization. Teams are independent and may span multiple sub-projects." breadcrumb={[{ label: 'Teams' }]} actions={<Button onClick={() => setOpen(true)}><Plus className="size-4" /> New team</Button>} />}>
      <DataTable<Team> data={teamsQuery.data?.items ?? []} columns={columns} keyField={(r) => r.id} loading={teamsQuery.isLoading} toolbar={{ search: { value: search, onValueChange: setSearch, placeholder: 'Search teams…' }, actions: <span className="text-[13px] text-muted-foreground">{teamsQuery.data?.total ?? 0} teams</span> }} pagination={{ pageSize: 10 }} empty={{ icon: Users, title: 'No teams yet', description: 'Create your first team to organize delivery.', action: { label: 'New team', onClick: () => setOpen(true), icon: Plus } }} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New team</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="grid gap-1.5"><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Platform team" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5"><Label>Type</Label><Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Team['type'] })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="development">Development</SelectItem><SelectItem value="qa">QA</SelectItem><SelectItem value="design">Design</SelectItem><SelectItem value="cross_functional">Cross-functional</SelectItem></SelectContent></Select></div>
              <div className="grid gap-1.5"><Label>Project</Label><Select value={form.projectId} onValueChange={(v) => setForm({ ...form, projectId: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="prj-core">Core Platform</SelectItem><SelectItem value="prj-utec">UTEC</SelectItem><SelectItem value="prj-portal">Portal</SelectItem></SelectContent></Select></div>
            </div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => createMut.mutate()} loading={createMut.isPending} disabled={!form.name}>Create team</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  )
}
