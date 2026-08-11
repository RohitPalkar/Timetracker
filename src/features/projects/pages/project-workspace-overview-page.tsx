import * as React from 'react'
import { Link } from 'react-router'
import { BookOpenText, Boxes, CalendarClock, SquareKanban } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PageHeader } from '@/components/common/page-header'
import { ProjectSummaryCard, BudgetCard } from '../components/project-summary-card'
import { ProjectTimeline } from '../components/project-timeline'
import { ProjectActivityCard } from '../components/project-activity'
import { ProjectModulePlaceholder } from '../components/project-module-placeholder'
import { useProjectWorkspace } from '../components/project-workspace-context'
import { useUserDirectory } from '../project-queries'

/**
 * Default workspace screen — routed at `/projects/:projectId/overview`.
 * Real data composition of summary, budget, timeline and activity, all sourced
 * from the workspace context populated by `RequireProjectAccess`.
 */
export function ProjectWorkspaceOverviewPage() {
  const { project, members, subProjects, teams, milestones, activity } = useProjectWorkspace()
  const { users } = useUserDirectory()

  const userMap = React.useMemo(() => new Map(users.map((user) => [user.id, user])), [users])
  const actorName = React.useCallback(
    (actorId?: string) => (actorId ? (userMap.get(actorId)?.name ?? 'System') : 'System'),
    [userMap],
  )

  const managerIds = project.managerIds.length > 0 ? project.managerIds : [project.ownerId]
  const managerName =
    managerIds.map((id) => userMap.get(id)?.name).filter(Boolean).join(', ') || 'Unassigned'
  const businessAnalystName = project.businessAnalystId ? userMap.get(project.businessAnalystId)?.name : undefined

  return (
    <div className="flex w-full flex-col gap-5">
      <PageHeader title="Overview" description={`Health, progress and activity for "${project.name}".`} />
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ProjectSummaryCard
            project={project}
            managerName={managerName}
            businessAnalystName={businessAnalystName}
            memberCount={members.length}
          />
          <div className="flex flex-col gap-4 lg:col-span-2">
            <BudgetCard project={project} />
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Timeline</CardTitle>
              </CardHeader>
              <CardContent className="pt-1">
                <ProjectTimeline milestones={milestones} limit={4} />
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ProjectActivityCard activity={activity} actorName={actorName} limit={6} className="lg:col-span-2" />
          <div className="flex flex-col gap-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Sub Projects</CardTitle>
              </CardHeader>
              <CardContent className="pt-1">
                {subProjects.length === 0 ? (
                  <p className="text-[13px] text-muted-foreground">No sub projects — this is a simple project.</p>
                ) : (
                  <ul className="flex flex-col gap-2">
                    {subProjects.slice(0, 4).map((sub) => (
                      <li key={sub.id}>
                        <Link
                          to={`sub-projects/${sub.id}/overview`}
                          className="text-[13px] font-medium text-foreground underline-offset-2 hover:underline"
                        >
                          {sub.name}
                        </Link>
                      </li>
                    ))}
                    {subProjects.length > 4 && (
                      <li>
                        <Link to="sub-projects" className="text-[13px] text-primary hover:underline">
                          + {subProjects.length - 4} more
                        </Link>
                      </li>
                    )}
                  </ul>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Delivery Teams</CardTitle>
              </CardHeader>
              <CardContent className="pt-1">
                {teams.length === 0 ? (
                  <p className="text-[13px] text-muted-foreground">No delivery teams assigned yet.</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {teams.map((team) => (
                      <span
                        key={team.id}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium"
                      >
                        <Boxes className="h-3.5 w-3.5 text-muted-foreground" />
                        {team.name}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <ProjectModulePlaceholder icon={SquareKanban} label="Board" description="Kanban board for the active sprint. Ships with the Workspace module." />
            <ProjectModulePlaceholder icon={BookOpenText} label="Stories" description="Product backlog and story lifecycle." />
            <ProjectModulePlaceholder icon={CalendarClock} label="Sprints" description="Plan, start and close sprints." />
          </div>
        </div>
      </div>
    </div>
  )
}
