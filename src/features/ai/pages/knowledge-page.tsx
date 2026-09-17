import * as React from 'react'
import { BookOpen, FileText, Plus, Upload } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { PageLayout } from '@/components/common/page-layout'
import { DataTable, type DataTableColumn } from '@/components/tables/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

type Doc = { id: string; title: string; chunks: number; updatedAt: string; status: 'indexed' | 'processing' | 'failed' }

const DOCS: Doc[] = [
  { id: 'k1', title: 'Product Handbook.pdf', chunks: 42, updatedAt: new Date().toISOString(), status: 'indexed' },
  { id: 'k2', title: 'API Reference.md', chunks: 18, updatedAt: new Date(Date.now()-86400000).toISOString(), status: 'indexed' },
  { id: 'k3', title: 'Sprint Notes.docx', chunks: 7, updatedAt: new Date(Date.now()-2*86400000).toISOString(), status: 'processing' },
]

export function AIKnowledgePage() {
  const [search, setSearch] = React.useState('')
  const columns = React.useMemo<DataTableColumn<Doc>[]>(() => [
    { id: 'title', header: 'Document', cell: (r) => <span className="flex items-center gap-2"><FileText className="size-4 text-muted-foreground" /><span className="text-[13px] font-medium text-foreground">{r.title}</span></span>, sortable: true, sortValue: (r)=>r.title, searchValue: (r)=>r.title, hideable: false },
    { id: 'chunks', header: 'Chunks', cell: (r) => <span className="text-[13px] text-foreground">{r.chunks}</span>, sortable: true, sortValue: (r)=>r.chunks, align: 'right' },
    { id: 'status', header: 'Status', cell: (r) => <Badge variant={r.status==='indexed'?'success':r.status==='processing'?'warning':'danger'}>{r.status}</Badge>, sortable: true, sortValue: (r)=>r.status },
    { id: 'updated', header: 'Updated', cell: (r) => <span className="text-[13px] text-muted-foreground">{new Date(r.updatedAt).toLocaleDateString()}</span>, sortable: true, sortValue: (r)=>r.updatedAt, align: 'right' },
  ], [])

  return (
    <PageLayout header={<PageHeader title="Knowledge Base" description="Documents and context for AI retrieval. Docs are chunked (1536-dim vectors) into ai_knowledge_chunks for RAG." breadcrumb={[{ label: 'AI Workspace' }, { label: 'Knowledge Base' }]} actions={<Button onClick={()=>toast.info('Upload — wires to Supabase Storage + chunker.')}><Upload className="size-4" /> Upload</Button>} />}>
      <Card><CardContent className="pt-6 flex items-center gap-3 text-sm text-muted-foreground"><BookOpen className="size-5" />{DOCS.reduce((a,b)=>a+b.chunks,0)} chunks indexed across {DOCS.length} documents.</CardContent></Card>
      <DataTable<Doc> data={DOCS} columns={columns} keyField={(r)=>r.id} toolbar={{ search: { value: search, onValueChange: setSearch, placeholder: 'Search documents…' }}} pagination={{ pageSize: 10 }} empty={{ icon: BookOpen, title: 'No documents yet', description: 'Upload docs to power retrieval.', action: { label: 'Upload', onClick: ()=>toast.info('Upload'), icon: Plus } }} />
    </PageLayout>
  )
}
