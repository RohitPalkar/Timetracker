import * as React from 'react'
import { Zap, BarChart3 } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { PageLayout } from '@/components/common/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { DataTable, type DataTableColumn } from '@/components/tables/data-table'

type UsageRow = { id: string; date: string; agent: string; tokens: number; cost: number }

const ROWS: UsageRow[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `u-${i}`, date: new Date(Date.now() - i*86_400_000).toISOString().slice(0,10), agent: i%2===0 ? 'Standup Helper' : 'QA Bot', tokens: 8000 + i*1200, cost: 0.12 + i*0.02,
}))

export function AIUsagePage() {
  const [search, setSearch] = React.useState('')
  const totalTokens = ROWS.reduce((a,b)=>a+b.tokens,0)
  const totalCost = ROWS.reduce((a,b)=>a+b.cost,0)

  const columns = React.useMemo<DataTableColumn<UsageRow>[]>(() => [
    { id: 'date', header: 'Date', cell: (r) => <span className="text-[13px] text-foreground">{r.date}</span>, sortable: true, sortValue: (r)=>r.date },
    { id: 'agent', header: 'Agent', cell: (r) => <span className="text-[13px] text-foreground">{r.agent}</span>, sortable: true, sortValue: (r)=>r.agent, searchValue: (r)=>r.agent, hideable: false },
    { id: 'tokens', header: 'Tokens', cell: (r) => <span className="text-[13px] font-medium text-foreground">{r.tokens.toLocaleString()}</span>, sortable: true, sortValue: (r)=>r.tokens, align: 'right' },
    { id: 'cost', header: 'Cost', cell: (r) => <span className="text-[13px] text-foreground">${r.cost.toFixed(2)}</span>, sortable: true, sortValue: (r)=>r.cost, align: 'right' },
  ], [])

  return (
    <PageLayout header={<PageHeader title="Usage" description="Track AI token consumption and cost. Daily ledger is derived from ai_usage_ledger and ai_interactions." breadcrumb={[{ label: 'AI Workspace' }, { label: 'Usage' }]} />}>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Zap className="size-4" /> MTD tokens</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{totalTokens.toLocaleString()}</p><Progress value={68} className="mt-2 h-2" /></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">MTD cost</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">${totalCost.toFixed(2)}</p><p className="text-xs text-muted-foreground">Across {ROWS.length} days</p></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="size-4" /> Avg daily</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{Math.round(totalTokens/ROWS.length).toLocaleString()} tokens</p></CardContent></Card>
      </div>
      <DataTable<UsageRow> data={ROWS} columns={columns} keyField={(r)=>r.id} toolbar={{ search: { value: search, onValueChange: setSearch, placeholder: 'Search usage…' }}} pagination={{ pageSize: 10 }} />
    </PageLayout>
  )
}
