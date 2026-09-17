import { Layers, Bug, CheckSquare, Rocket } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { MyWorkPayload, MyWorkItem } from '@/types/dashboard'
import { useNavigate } from 'react-router'

function WorkList({ title, icon: Icon, items, empty }: { title: string; icon: React.ComponentType<{ className?: string }>; items: MyWorkItem[]; empty: string }) {
  const navigate = useNavigate()
  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Icon className="size-4" /> {title} <Badge variant="neutral" className="ml-auto">{items.length}</Badge></CardTitle></CardHeader>
      <CardContent className="grid gap-2">
        {items.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border-strong bg-surface/60 px-3 py-6 text-center text-sm text-muted-foreground">{empty}</p>
        ) : (
          items.slice(0, 4).map((item) => (
            <button key={item.id} onClick={() => navigate(`/projects/${item.projectId}`)} className="flex items-center gap-2 rounded-xl border border-border bg-surface-subtle px-3 py-2 text-left transition-colors hover:bg-surface">
              <Badge variant="neutral" className="font-mono text-[11px]">{item.key}</Badge>
              <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-foreground">{item.title}</span>
              <Badge variant={item.priority === 'high' || item.priority === 'critical' ? 'danger' : item.priority === 'medium' ? 'warning' : 'neutral'} className="capitalize text-[11px]">{item.priority}</Badge>
            </button>
          ))
        )}
        {items.length > 4 && <p className="text-center text-xs text-muted-foreground">+{items.length - 4} more</p>}
      </CardContent>
    </Card>
  )
}

export function MyWorkGroup({ data, loading }: { data: MyWorkPayload; loading?: boolean }) {
  if (loading) return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><Skeleton className="h-40" /><Skeleton className="h-40" /><Skeleton className="h-40" /><Skeleton className="h-40" /></div>
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold tracking-tight text-foreground">My Work</h2>
        {data.sprint && <Badge variant="info" className="gap-1"><Rocket className="size-3" /> {data.sprint.name} • {data.sprint.projectName}</Badge>}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WorkList title="Stories" icon={Layers} items={data.stories} empty="No stories currently assigned to you." />
        <WorkList title="Bugs" icon={Bug} items={data.bugs} empty="No bugs currently assigned to you." />
        <WorkList title="Tasks" icon={CheckSquare} items={data.tasks} empty="No tasks currently assigned to you." />
        <Card>
          <CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm"><Rocket className="size-4" /> Current Sprint</CardTitle></CardHeader>
          <CardContent className="grid gap-2">
            {data.sprint ? (
              <>
                <p className="text-sm font-medium text-foreground">{data.sprint.name}</p>
                <p className="text-xs text-muted-foreground">{data.sprint.projectName} • {new Date(data.sprint.startDate).toLocaleDateString()} → {new Date(data.sprint.endDate).toLocaleDateString()}</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-xl bg-surface-subtle px-2 py-2"><p className="text-lg font-semibold">{data.sprint.assigned}</p><p className="text-[11px] text-muted-foreground">Assigned</p></div>
                  <div className="rounded-xl bg-success-soft px-2 py-2"><p className="text-lg font-semibold text-success-foreground">{data.sprint.completed}</p><p className="text-[11px] text-muted-foreground">Completed</p></div>
                  <div className="rounded-xl bg-warning-soft px-2 py-2"><p className="text-lg font-semibold text-warning-foreground">{data.sprint.remaining}</p><p className="text-[11px] text-muted-foreground">Remaining</p></div>
                </div>
                <Button size="sm" variant="outline" className="h-7 w-full" onClick={() => (window.location.href = `/projects/${data.sprint?.id ? 'prj-utec' : 'prj-core'}`)}>Open sprint workspace</Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No active sprint.</p>
            )}
          </CardContent>
        </Card>
      </div>
      <p className="text-[11px] text-muted-foreground">Click any item → navigate to canonical story/bug/task detail (validates access before navigation).</p>
    </div>
  )
}
