import * as React from 'react'
import { FileText, Folder, MoreHorizontal, Plus, Upload } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { PageLayout } from '@/components/common/page-layout'
import { DataTable, type DataTableColumn } from '@/components/tables/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

type DocRow = { id: string; name: string; folder: string; version: number; size: string; updatedAt: string; owner: string }

const DOCS: DocRow[] = [
  { id: 'doc-1', name: 'Sprint_14_Retro.pdf', folder: '/Projects/Core/Retros', version: 2, size: '1.2 MB', updatedAt: new Date().toISOString(), owner: 'Ravi Sharma' },
  { id: 'doc-2', name: 'API_Spec_v2.docx', folder: '/Projects/Core/Specs', version: 4, size: '3.4 MB', updatedAt: new Date(Date.now()-86400000).toISOString(), owner: 'Arjun Mehta' },
  { id: 'doc-3', name: 'UTEC_Architecture.png', folder: '/Projects/UTEC', version: 1, size: '2.8 MB', updatedAt: new Date(Date.now()-2*86400000).toISOString(), owner: 'Rohit Verma' },
  { id: 'doc-4', name: 'Budget_Q3.xlsx', folder: '/Finance', version: 3, size: '890 KB', updatedAt: new Date(Date.now()-3*86400000).toISOString(), owner: 'Aisha Patel' },
]

export function DocumentsPage() {
  const [search, setSearch] = React.useState('')
  const columns = React.useMemo<DataTableColumn<DocRow>[]>(() => [
    { id: 'name', header: 'Document', cell: (r) => <span className="flex items-center gap-2"><FileText className="size-4 text-muted-foreground" /><span><p className="text-[13px] font-medium text-foreground">{r.name}</p><p className="text-[11px] text-muted-foreground">{r.folder}</p></span></span>, sortable: true, sortValue: (r)=>r.name, searchValue: (r)=>[r.name, r.folder], hideable: false },
    { id: 'version', header: 'Version', cell: (r) => <Badge variant="neutral">v{r.version}</Badge>, sortable: true, sortValue: (r)=>r.version, align: 'center' },
    { id: 'size', header: 'Size', cell: (r) => <span className="text-[13px] text-foreground">{r.size}</span>, sortable: true, sortValue: (r)=>r.size, align: 'right' },
    { id: 'owner', header: 'Owner', cell: (r) => <span className="text-[13px] text-foreground">{r.owner}</span>, sortable: true, sortValue: (r)=>r.owner, searchValue: (r)=>r.owner },
    { id: 'updated', header: 'Updated', cell: (r) => <span className="text-[13px] text-muted-foreground">{new Date(r.updatedAt).toLocaleDateString()}</span>, sortable: true, sortValue: (r)=>r.updatedAt, align: 'right' },
    { id: 'actions', header: '', cell: (row) => <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onSelect={()=>toast.info(`Download ${row.name}`)}>Download</DropdownMenuItem><DropdownMenuItem onSelect={()=>toast.info('Share link')}>Share</DropdownMenuItem><DropdownMenuItem onSelect={()=>toast.info('Version history')}>Versions</DropdownMenuItem><DropdownMenuItem onSelect={()=>toast.info('ACL — manage access')}>Permissions</DropdownMenuItem></DropdownMenuContent></DropdownMenu>, align: 'right', hideable: false },
  ], [])

  return (
    <PageLayout header={<PageHeader title="Documents" description="Centralized document storage with folders, versioning and ACL. Files are stored via Supabase Storage." breadcrumb={[{ label: 'Documents' }]} actions={<><Button variant="outline" onClick={()=>toast.info('New folder — creates folder row.')}><Folder className="size-4" /> New folder</Button><Button onClick={()=>toast.info('Upload — wires to /documents upload + ACL.')}><Upload className="size-4" /> Upload</Button></>} />}>
      <Card><CardContent className="pt-4 flex flex-wrap gap-2 text-xs text-muted-foreground"><span className="inline-flex items-center gap-1.5"><Folder className="size-3.5" /> /Projects</span> <span>›</span> <span>Core</span> <span>›</span> <span>Retros, Specs</span> <span className="ml-auto">{DOCS.length} documents</span></CardContent></Card>
      <DataTable<DocRow> data={DOCS} columns={columns} keyField={(r)=>r.id} toolbar={{ search: { value: search, onValueChange: setSearch, placeholder: 'Search documents…' }}} pagination={{ pageSize: 10 }} empty={{ icon: FileText, title: 'No documents', description: 'Upload your first document.', action: { label: 'Upload', onClick: ()=>toast.info('Upload'), icon: Plus } }} />
    </PageLayout>
  )
}
