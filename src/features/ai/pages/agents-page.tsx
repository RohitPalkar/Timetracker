import * as React from 'react'
import { Bot, Plus, Zap } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { PageLayout } from '@/components/common/page-layout'
import { DataTable, type DataTableColumn } from '@/components/tables/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

type Agent = { id: string; name: string; model: string; status: 'active' | 'draft' | 'archived'; tokens: number; updatedAt: string }

const AGENTS: Agent[] = [
  { id: 'ag-1', name: 'Standup Helper', model: 'gpt-4o', status: 'active', tokens: 124000, updatedAt: new Date().toISOString() },
  { id: 'ag-2', name: 'QA Bot', model: 'claude-3', status: 'active', tokens: 89000, updatedAt: new Date(Date.now() - 86_400_000).toISOString() },
  { id: 'ag-3', name: 'Docs Search', model: 'gpt-4o-mini', status: 'draft', tokens: 12000, updatedAt: new Date(Date.now() - 2*86_400_000).toISOString() },
]

export function AIAgentsPage() {
  const [search, setSearch] = React.useState('')
  const columns = React.useMemo<DataTableColumn<Agent>[]>(() => [
    { id: 'agent', header: 'Agent', cell: (r) => <span className="flex items-center gap-2"><span className="flex size-8 items-center justify-center rounded-xl bg-primary-soft text-brand-700"><Bot className="size-4" /></span><span className="text-[13px] font-medium text-foreground">{r.name}</span></span>, sortable: true, sortValue: (r) => r.name, searchValue: (r) => r.name, hideable: false },
    { id: 'model', header: 'Model', cell: (r) => <Badge variant="neutral">{r.model}</Badge>, sortable: true, sortValue: (r) => r.model },
    { id: 'tokens', header: 'Tokens', cell: (r) => <span className="text-[13px] font-medium text-foreground">{r.tokens.toLocaleString()}</span>, sortable: true, sortValue: (r) => r.tokens, align: 'right' },
    { id: 'status', header: 'Status', cell: (r) => <Badge variant={r.status === 'active' ? 'success' : r.status === 'draft' ? 'warning' : 'neutral'}>{r.status}</Badge>, sortable: true, sortValue: (r) => r.status },
  ], [])

  return (
    <PageLayout header={<PageHeader title="Agents" description="Configure and manage AI agents for your workspace. Each agent has a model, prompt guardrails and knowledge scope." breadcrumb={[{ label: 'AI Workspace' }, { label: 'Agents' }]} actions={<Button onClick={() => toast.info('Agent builder — connect AI service to create.')}><Plus className="size-4" /> New agent</Button>} />}>
      <div className="grid gap-3 md:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Zap className="size-4" /> Active agents</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{AGENTS.filter((a)=>a.status==='active').length}</p><p className="text-xs text-muted-foreground">{AGENTS.length} total</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Tokens (MTD)</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{(AGENTS.reduce((a,b)=>a+b.tokens,0)/1000).toFixed(0)}k</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Avg per agent</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{Math.round(AGENTS.reduce((a,b)=>a+b.tokens,0)/AGENTS.length).toLocaleString()}</p></CardContent></Card>
      </div>
      <DataTable<Agent> data={AGENTS} columns={columns} keyField={(r)=>r.id} toolbar={{ search: { value: search, onValueChange: setSearch, placeholder: 'Search agents…' }}} pagination={{ pageSize: 10 }} />
    </PageLayout>
  )
}
