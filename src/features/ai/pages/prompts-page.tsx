import * as React from 'react'
import { Sparkles, Plus } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { PageLayout } from '@/components/common/page-layout'
import { DataTable, type DataTableColumn } from '@/components/tables/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type Prompt = { id: string; title: string; category: string; updatedAt: string; usage: number }

const PROMPTS: Prompt[] = [
  { id: 'p1', title: 'Standup summary', category: 'Delivery', updatedAt: new Date().toISOString(), usage: 142 },
  { id: 'p2', title: 'Bug triage', category: 'QA', updatedAt: new Date(Date.now()-2*86_400_000).toISOString(), usage: 89 },
  { id: 'p3', title: 'Sprint retro', category: 'Delivery', updatedAt: new Date(Date.now()-5*86_400_000).toISOString(), usage: 34 },
]

export function AIPromptsPage() {
  const [search, setSearch] = React.useState('')
  const columns = React.useMemo<DataTableColumn<Prompt>[]>(() => [
    { id: 'title', header: 'Prompt', cell: (r) => <span className="flex items-center gap-2"><Sparkles className="size-4 text-brand-500" /><span className="text-[13px] font-medium text-foreground">{r.title}</span></span>, sortable: true, sortValue: (r)=>r.title, searchValue: (r)=>r.title, hideable: false },
    { id: 'category', header: 'Category', cell: (r) => <Badge variant="neutral">{r.category}</Badge>, sortable: true, sortValue: (r)=>r.category },
    { id: 'usage', header: 'Uses', cell: (r) => <span className="text-[13px] font-medium text-foreground">{r.usage}</span>, sortable: true, sortValue: (r)=>r.usage, align: 'right' },
    { id: 'updated', header: 'Updated', cell: (r) => <span className="text-[13px] text-muted-foreground">{new Date(r.updatedAt).toLocaleDateString()}</span>, sortable: true, sortValue: (r)=>r.updatedAt, align: 'right' },
  ], [])

  return (
    <PageLayout header={<PageHeader title="Prompt Library" description="Saved and shared prompt templates. Prompts are versioned and scoped to org/project/agent." breadcrumb={[{ label: 'AI Workspace' }, { label: 'Prompt Library' }]} actions={<Button onClick={()=>toast.info('Prompt editor — coming with AI BE.')}><Plus className="size-4" /> New prompt</Button>} />}>
      <DataTable<Prompt> data={PROMPTS} columns={columns} keyField={(r)=>r.id} toolbar={{ search: { value: search, onValueChange: setSearch, placeholder: 'Search prompts…' }}} pagination={{ pageSize: 10 }} empty={{ icon: Sparkles, title: 'No prompts yet', description: 'Create reusable prompts for your agents.', action: { label: 'New prompt', onClick: ()=>toast.info('Create prompt'), icon: Plus } }} />
    </PageLayout>
  )
}
