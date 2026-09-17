import { BarChart3, FileText, Folder, Settings2 } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { PageLayout } from '@/components/common/page-layout'
import { EmptyState } from '@/components/feedback/empty-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useProjectWorkspace } from '../components/project-workspace-context'
import { formatCurrency, formatDate } from '@/lib/formats'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useProjectTeams } from '../project-queries'

export function WorkspaceReportsPage() {
  const { project } = useProjectWorkspace()
  const spentPct = project.budget > 0 ? Math.round((project.spent / project.budget) * 100) : 0
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">Reports — {project.name}</h2>
        <p className="text-sm text-muted-foreground">Delivery, quality and cost reports scoped to this project. Aggregates are derived from sprints, stories and timesheets.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle className="text-sm">Budget</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{formatCurrency(project.budget)}</p><p className="text-xs text-muted-foreground">{formatCurrency(project.spent)} spent • {spentPct}%</p><Progress value={spentPct} className="mt-2 h-2" /></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Progress</CardTitle></CardHeader><CardContent><p className="text-2xl font-semibold">{project.progress}%</p><Progress value={project.progress} className="mt-2 h-2" /></CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Timeline</CardTitle></CardHeader><CardContent><p className="text-sm">{formatDate(project.startDate)} → {formatDate(project.endDate)}</p><Badge variant="neutral" className="mt-2">{project.status}</Badge></CardContent></Card>
      </div>
      <div className="rounded-2xl border border-dashed border-border-strong bg-surface/60 p-8">
        <EmptyState icon={BarChart3} title="Detailed charts" description="Velocity, burndown and quality trends render here when sprint and story data is wired to the reporting views. Use the dashboard for org-wide aggregates today." />
      </div>
    </div>
  )
}

export function WorkspaceFilesPage() {
  const { project } = useProjectWorkspace()
  return (
    <PageLayout header={<PageHeader title={`Files — ${project.name}`} description="Project documents, folders and access control. Stored via Supabase Storage in production." />}>
      <div className="rounded-2xl border border-dashed border-border-strong bg-surface/60 p-8">
        <EmptyState icon={Folder} title="No documents yet" description="Upload files, create folders and manage versions. ACL is enforced per project/sub-project." action={{ label: 'Upload file', onClick: () => {}, icon: Folder }} />
      </div>
    </PageLayout>
  )
}

export function WorkspaceSettingsPage() {
  const { project } = useProjectWorkspace()
  return (
    <PageLayout header={<PageHeader title={`Settings — ${project.name}`} description="Project configuration, members and integrations." />}>
      <div className="grid gap-4 md:grid-cols-2">
        <Card><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Settings2 className="size-4" /> General</CardTitle></CardHeader><CardContent className="text-sm text-muted-foreground">Name, key, client, dates and budget are editable via the header edit action. Extend this panel with notifications, integrations and retention policies.</CardContent></Card>
        <Card><CardHeader><CardTitle className="text-sm">Danger zone</CardTitle></CardHeader><CardContent><Button variant="outline" className="text-danger">Archive project</Button><p className="mt-2 text-xs text-muted-foreground">Archived projects are hidden from active views but preserved.</p></CardContent></Card>
      </div>
    </PageLayout>
  )
}

export function SubWorkspaceTeamPage() {
  const { project } = useProjectWorkspace()
  // sub-project context is not directly available here; this is shown under /sub-projects/:id/team
  // Reuse team list filtered by sub-project would need subProjectId — show project teams as fallback with hint
  const { data: teams } = useProjectTeams(project.id)
  return (
    <PageLayout header={<PageHeader title={`Team — ${project.name}`} description="Members and teams scoped to this sub-project. Teams are independent and may span multiple sub-projects." />}>
      {teams && teams.length > 0 ? (
        <div className="grid gap-3 md:grid-cols-2">
          {teams.slice(0, 6).map((t) => (
            <Card key={t.id}><CardHeader><CardTitle className="text-sm">{t.name}</CardTitle></CardHeader><CardContent className="text-xs text-muted-foreground">{t.memberIds.length} members • {t.type}</CardContent></Card>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border-strong bg-surface/60 p-8">
          <EmptyState icon={FileText} title="Team context" description="Sub-project team roster is derived from team_sub_projects associations. Share teams across EFA/UTLITE-style sub-projects when needed." />
        </div>
      )}
    </PageLayout>
  )
}

export function SubWorkspaceReportsPage() {
  return <WorkspaceReportsPage />
}
export function SubWorkspaceSettingsPage() {
  return <WorkspaceSettingsPage />
}
