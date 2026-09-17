import * as React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Bell, CheckCheck } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { PageLayout } from '@/components/common/page-layout'
import { DataTable, type DataTableColumn } from '@/components/tables/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { notificationService } from '@/services/notification'
import type { AppNotification } from '@/types/collaboration'
import { toast } from 'sonner'
import { formatRelative } from '@/lib/formats'

export function NotificationsPage() {
  const qc = useQueryClient()
  const [filter, setFilter] = React.useState<'all' | 'unread'>('all')
  const [search, setSearch] = React.useState('')

  const query = useQuery({ queryKey: ['notifications'], queryFn: () => notificationService.list() })

  const markAll = useMutation({
    mutationFn: () => notificationService.markAllRead(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['notifications'] }); toast.success('All marked read') },
  })
  const markOne = useMutation({
    mutationFn: (id: string) => notificationService.markRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const items = React.useMemo(() => {
    const all = query.data ?? []
    if (filter === 'unread') return all.filter((n) => !n.read)
    return all
  }, [query.data, filter])

  const columns = React.useMemo<DataTableColumn<AppNotification>[]>(() => [
    { id: 'title', header: 'Notification', cell: (r) => <span className={!r.read ? 'text-foreground font-medium' : 'text-muted-foreground'}><span className="text-[13px]">{r.title}</span><span className="block text-[11px] text-muted-foreground line-clamp-1">{r.body}</span></span>, sortable: true, sortValue: (r)=>r.title, searchValue: (r)=>[r.title, r.body], hideable: false },
    { id: 'type', header: 'Type', cell: (r) => <Badge variant="neutral" className="text-[11px]">{r.type}</Badge>, sortable: true, sortValue: (r)=>r.type },
    { id: 'time', header: 'Time', cell: (r) => <span className="text-[13px] text-muted-foreground">{formatRelative(r.createdAt)}</span>, sortable: true, sortValue: (r)=>r.createdAt, align: 'right' },
    { id: 'read', header: 'State', cell: (r) => r.read ? <Badge variant="neutral">Read</Badge> : <Badge variant="info">Unread</Badge>, sortable: true, sortValue: (r)=>r.read ? 1 : 0 },
    { id: 'actions', header: '', cell: (row) => !row.read ? <Button variant="ghost" size="sm" className="h-7" onClick={() => markOne.mutate(row.id)}>Mark read</Button> : <span className="text-xs text-muted-foreground">—</span>, align: 'right', hideable: false },
  ], [markOne])

  return (
    <PageLayout header={<PageHeader title="Notifications" description="Inbox, read/unread, deep links, mentions and preferences. Notifications are scoped to recipient user." breadcrumb={[{ label: 'Notifications' }]} actions={<Button variant="outline" onClick={() => markAll.mutate()} loading={markAll.isPending}><CheckCheck className="size-4" /> Mark all read</Button>} />}>
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList><TabsTrigger value="all">All ({query.data?.length ?? 0})</TabsTrigger><TabsTrigger value="unread">Unread ({query.data?.filter((n)=>!n.read).length ?? 0})</TabsTrigger></TabsList>
      </Tabs>
      <DataTable<AppNotification> data={items} columns={columns} keyField={(r)=>r.id} loading={query.isLoading} toolbar={{ search: { value: search, onValueChange: setSearch, placeholder: 'Search notifications…' }}} pagination={{ pageSize: 12 }} empty={{ icon: Bell, title: filter==='unread' ? 'No unread notifications' : 'No notifications', description: 'Assignment, approval and system notifications appear here.' }} />
    </PageLayout>
  )
}
