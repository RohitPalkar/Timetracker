import * as React from 'react'
import { PageHeader } from '@/components/common/page-header'
import { PageLayout } from '@/components/common/page-layout'
import { DataTable, type DataTableColumn } from '@/components/tables/data-table'
import { Badge } from '@/components/ui/badge'

type Interaction = { id: string; at: string; agent: string; prompt: string; tokens: number; status: 'success' | 'error' }

const ROWS: Interaction[] = Array.from({ length: 15 }).map((_, i) => ({
  id: `hi-${i}`, at: new Date(Date.now() - i*3600_000).toISOString(), agent: i%3===0 ? 'Standup Helper' : i%3===1 ? 'QA Bot' : 'Docs Search', prompt: i%2===0 ? 'Summarize sprint 14' : 'Triage bug BUG-07', tokens: 1200 + i*200, status: i===5 ? 'error' : 'success',
}))

export function AIHistoryPage() {
  const [search, setSearch] = React.useState('')
  const columns = React.useMemo<DataTableColumn<Interaction>[]>(() => [
    { id: 'at', header: 'Time', cell: (r) => <span className="text-[13px] text-foreground">{new Date(r.at).toLocaleString()}</span>, sortable: true, sortValue: (r)=>r.at },
    { id: 'agent', header: 'Agent', cell: (r) => <Badge variant="neutral">{r.agent}</Badge>, sortable: true, sortValue: (r)=>r.agent, searchValue: (r)=>r.agent, hideable: false },
    { id: 'prompt', header: 'Prompt', cell: (r) => <span className="text-[13px] text-foreground line-clamp-1">{r.prompt}</span>, sortable: true, sortValue: (r)=>r.prompt, searchValue: (r)=>r.prompt },
    { id: 'tokens', header: 'Tokens', cell: (r) => <span className="text-[13px] font-medium text-foreground">{r.tokens}</span>, sortable: true, sortValue: (r)=>r.tokens, align: 'right' },
    { id: 'status', header: 'Status', cell: (r) => <Badge variant={r.status==='success'?'success':'danger'}>{r.status}</Badge>, sortable: true, sortValue: (r)=>r.status },
  ], [])

  return (
    <PageLayout header={<PageHeader title="History" description="Past AI interactions and audit trail. Every call is logged to ai_interactions with tokens, cost and latency." breadcrumb={[{ label: 'AI Workspace' }, { label: 'History' }]} />}>
      <DataTable<Interaction> data={ROWS} columns={columns} keyField={(r)=>r.id} toolbar={{ search: { value: search, onValueChange: setSearch, placeholder: 'Search history…' }}} pagination={{ pageSize: 10 }} />
    </PageLayout>
  )
}
