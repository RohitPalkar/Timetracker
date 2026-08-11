import * as React from 'react'
import { Link } from 'react-router'
import { GitBranch } from 'lucide-react'
import { PageHeader } from '@/components/common/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/feedback/empty-state'
import { ProjectHealthBadge, ProjectStatusBadge } from '@/components/common/status-badge'
import { formatCurrency, formatDate } from '@/lib/formats'
import { useProjectWorkspace } from '../components/project-workspace-context'

/**
 * Workspace Sub Projects tab — routed at `/projects/:projectId/sub-projects`.
 * Lists the project's child projects with status, health, progress and budget,
 * each linking into its own sub-project workspace.
 */
export function ProjectSubProjectsPage() {
  const { project, subProjects, members } = useProjectWorkspace()

  const userMap = React.useMemo(
    () => new Map(members.map((member) => [member.userId, member.user.name])),
    [members],
  )
  const ownerName = (ids: string[]) =>
    ids.map((id) => userMap.get(id)).filter(Boolean).join(', ') || 'Unassigned'

  if (subProjects.length === 0) {
    return (
      <div className="flex w-full flex-col gap-5">
        <PageHeader title="Sub Projects" description={`Child projects of "${project.name}".`} />
        <div className="rounded-2xl border border-dashed border-border-strong bg-surface/60 p-8">
          <EmptyState
            icon={GitBranch}
            title="No sub projects"
            description="This project is flat — all work is tracked at the project level. Create sub projects to split delivery into scoped child projects."
          />
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-5">
      <PageHeader title="Sub Projects" description={`${subProjects.length} child projects under "${project.name}".`} />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {subProjects.map((sub) => (
          <Card key={sub.id}>
            <CardContent className="flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    to={`sub-projects/${sub.id}/overview`}
                    className="text-[15px] font-semibold text-foreground underline-offset-2 hover:underline"
                  >
                    {sub.name}
                  </Link>
                  <p className="text-[12px] text-muted-foreground">{sub.key}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <ProjectStatusBadge status={sub.status} />
                  <ProjectHealthBadge health={sub.health} />
                </div>
              </div>

              {sub.description && (
                <p className="line-clamp-2 text-[13px] text-muted-foreground">{sub.description}</p>
              )}

              <div className="flex items-center gap-3">
                <Progress value={sub.progress} className="flex-1" />
                <span className="w-9 shrink-0 text-right text-[12px] font-medium text-foreground">{sub.progress}%</span>
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[13px]">
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted-foreground">Owner</dt>
                  <dd className="truncate text-foreground">{ownerName(sub.ownerIds)}</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted-foreground">Budget</dt>
                  <dd className="text-foreground">{formatCurrency(sub.budget)}</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted-foreground">Dates</dt>
                  <dd className="text-foreground">{formatDate(sub.startDate)} – {formatDate(sub.endDate)}</dd>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <dt className="text-muted-foreground">Status</dt>
                  <dd>
                    <Badge variant="outline" className="text-[11px]">
                      {sub.spent > 0 ? `${formatCurrency(sub.spent)} spent` : 'No spend yet'}
                    </Badge>
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
