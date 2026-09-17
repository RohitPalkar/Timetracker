import * as React from 'react'
import { Clock, Plus, Trash2 } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { PageLayout } from '@/components/common/page-layout'
import { DataTable, type DataTableColumn } from '@/components/tables/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { TimesheetEntry } from '@/types/timesheet'
import { DEMO_TIMESHEET_ENTRIES } from '../timesheet-data'
import { useAuth } from '@/store/auth'
import { projectStore } from '@/services/stores'
import { toast } from 'sonner'
import { uid } from '@/lib/utils'

export function MyTimesheetPage() {
  const { authUser } = useAuth()
  const projects = projectStore.all()
  const currentUserId = authUser?.userId ?? 'user-sara'
  const [entries, setEntries] = React.useState<TimesheetEntry[]>(() => DEMO_TIMESHEET_ENTRIES.filter((e) => e.userId === currentUserId))
  const [search, setSearch] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const [form, setForm] = React.useState({ date: new Date().toISOString().slice(0,10), projectId: projects[0]?.id ?? 'prj-core', hours: '8', activity: '' })
  const weekHours = entries.reduce((a, b) => a + b.hours, 0)

  const add = () => {
    if (!form.activity) { toast.error('Activity required'); return }
    const row: TimesheetEntry = { id: uid('tse'), userId: currentUserId, projectId: form.projectId, date: form.date, hours: Number(form.hours) || 0, activity: form.activity, isIdle: false }
    setEntries((prev) => [row, ...prev]); setOpen(false); toast.success('Entry logged')
    setForm({ date: new Date().toISOString().slice(0,10), projectId: projects[0]?.id ?? 'prj-core', hours: '8', activity: '' })
  }

  const columns = React.useMemo<DataTableColumn<TimesheetEntry>[]>(() => [
    { id: 'date', header: 'Date', cell: (r) => <span className="text-[13px] text-foreground">{r.date}</span>, sortable: true, sortValue: (r) => r.date },
    { id: 'project', header: 'Project', cell: (r) => <Badge variant="neutral" className="text-[11px]">{projects.find((p) => p.id === r.projectId)?.name ?? r.projectId}</Badge>, sortable: true, sortValue: (r) => projects.find((p) => p.id === r.projectId)?.name ?? r.projectId, searchValue: (r) => projects.find((p) => p.id === r.projectId)?.name },
    { id: 'activity', header: 'Activity', cell: (r) => <span className="text-[13px] text-foreground">{r.activity}</span>, sortable: true, sortValue: (r) => r.activity, searchValue: (r) => r.activity, hideable: false },
    { id: 'hours', header: 'Hours', cell: (r) => <span className="text-[13px] font-medium text-foreground">{r.hours}h</span>, sortable: true, sortValue: (r) => r.hours, align: 'right' },
    { id: 'idle', header: 'Billable', cell: (r) => r.isIdle ? <Badge variant="neutral">Non-billable</Badge> : <Badge variant="success">Billable</Badge> },
    { id: 'actions', header: '', cell: (row) => <Button variant="ghost" size="icon-sm" onClick={() => { setEntries((prev) => prev.filter((x) => x.id !== row.id)); toast.success('Entry removed') }}><Trash2 className="size-4" /></Button>, align: 'right', hideable: false },
  ], [projects])

  return (
    <PageLayout header={<PageHeader title="My Timesheet" description={`Log and view your weekly time entries. Week total: ${weekHours}h. User → Weekly Timesheet → Daily Entries → Project → Sub-project → Work Item.`} breadcrumb={[{ label: 'Timesheets' }, { label: 'My Timesheet' }]} actions={<><Button variant="outline" onClick={() => toast.info('Timer capture ships with TIMESHEET-01+ backend — mock entry is ready.')}><Clock className="size-4" /> Timer</Button><Button onClick={() => setOpen(true)}><Plus className="size-4" /> Log time</Button></>} />}>
      <div className="rounded-2xl border border-border bg-surface p-3 flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Week {new Date().toISOString().slice(0,10)} — {weekHours}h logged • {entries.length} entries</span>
        <span className="ml-auto text-xs text-muted-foreground">Draft → Submitted → Approved/Rejected</span>
      </div>
      <DataTable<TimesheetEntry> data={entries} columns={columns} keyField={(r) => r.id} toolbar={{ search: { value: search, onValueChange: setSearch, placeholder: 'Search entries…' }, actions: <span className="text-[13px] text-muted-foreground">{entries.length} entries</span> }} pagination={{ pageSize: 10 }} empty={{ icon: Clock, title: 'No time logged this week', description: 'Log your first entry to start tracking.', action: { label: 'Log time', onClick: () => setOpen(true), icon: Plus } }} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Log time</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5"><Label>Date</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
              <div className="grid gap-1.5"><Label>Hours</Label><Input type="number" min={0.5} max={24} step={0.5} value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} /></div>
            </div>
            <div className="grid gap-1.5"><Label>Project</Label><Select value={form.projectId} onValueChange={(v) => setForm({ ...form, projectId: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{projects.slice(0,6).map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid gap-1.5"><Label>Activity</Label><Input value={form.activity} onChange={(e) => setForm({ ...form, activity: e.target.value })} placeholder="What did you work on?" /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={add}>Save entry</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  )
}
