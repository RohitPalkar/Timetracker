import * as React from 'react'
import { ThumbsUp, Plus, MoreHorizontal } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { PageLayout } from '@/components/common/page-layout'
import { DataTable, type DataTableColumn } from '@/components/tables/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

type SurveyRow = { id: string; title: string; status: 'draft' | 'open' | 'closed'; responses: number; createdAt: string }

const ROWS: SurveyRow[] = [
  { id: 'sv-1', title: 'Q3 Engagement Survey', status: 'open', responses: 42, createdAt: new Date(Date.now()-5*86400000).toISOString() },
  { id: 'sv-2', title: 'Sprint Retro — Sprint 14', status: 'closed', responses: 18, createdAt: new Date(Date.now()-12*86400000).toISOString() },
  { id: 'sv-3', title: 'Onboarding Feedback', status: 'draft', responses: 0, createdAt: new Date().toISOString() },
]

export function SurveyPage() {
  const [search, setSearch] = React.useState('')
  const columns = React.useMemo<DataTableColumn<SurveyRow>[]>(() => [
    { id: 'title', header: 'Survey', cell: (r) => <span className="flex items-center gap-2"><ThumbsUp className="size-4 text-muted-foreground" /><span className="text-[13px] font-medium text-foreground">{r.title}</span></span>, sortable: true, sortValue: (r)=>r.title, searchValue: (r)=>r.title, hideable: false },
    { id: 'status', header: 'Status', cell: (r) => <Badge variant={r.status==='open'?'success':r.status==='draft'?'warning':'neutral'}>{r.status}</Badge>, sortable: true, sortValue: (r)=>r.status },
    { id: 'responses', header: 'Responses', cell: (r) => <span className="text-[13px] font-medium text-foreground">{r.responses}</span>, sortable: true, sortValue: (r)=>r.responses, align: 'right' },
    { id: 'created', header: 'Created', cell: (r) => <span className="text-[13px] text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</span>, sortable: true, sortValue: (r)=>r.createdAt, align: 'right' },
    { id: 'actions', header: '', cell: (row) => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={()=>toast.info(`View ${row.title}`)}>View responses</DropdownMenuItem><DropdownMenuItem onSelect={()=>toast.info('Edit survey')}>Edit</DropdownMenuItem><DropdownMenuItem onSelect={()=>toast.info('Close survey')}>Close</DropdownMenuItem></DropdownMenuContent></DropdownMenu>, align: 'right', hideable: false },
  ], [])

  return (
    <PageLayout header={<PageHeader title="Survey Management" description="Create surveys, build questions (NPS/scale/text/choice), collect responses and report." breadcrumb={[{ label: 'Survey' }]} actions={<Button onClick={()=>toast.info('Survey builder — question editor + preview.')}><Plus className="size-4" /> New survey</Button>} />}>
      <div className="grid gap-3 md:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-sm">Open</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{ROWS.filter((r)=>r.status==='open').length}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Total responses</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{ROWS.reduce((a,b)=>a+b.responses,0)}</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Drafts</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{ROWS.filter((r)=>r.status==='draft').length}</p></CardContent></Card>
      </div>
      <DataTable<SurveyRow> data={ROWS} columns={columns} keyField={(r)=>r.id} toolbar={{ search: { value: search, onValueChange: setSearch, placeholder: 'Search surveys…' }}} pagination={{ pageSize: 10 }} empty={{ icon: ThumbsUp, title: 'No surveys', description: 'Create your first survey.', action: { label: 'New survey', onClick: ()=>toast.info('New survey'), icon: Plus } }} />
    </PageLayout>
  )
}
