import * as React from 'react'
import { useNavigate, useParams } from 'react-router'
import {
  BookOpenText,
  CalendarClock,
  ClipboardList,
  GanttChartSquare,
  ListChecks,
  SquareKanban,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PageHeader } from '@/components/common/page-header'
import { Breadcrumb } from '@/components/navigation/breadcrumb'
import { PageLayout } from '@/components/common/page-layout'
import { ErrorState } from '@/components/feedback/error-state'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { toast } from 'sonner'
import { ProjectHeader } from '../components/project-header'
import { ProjectSummaryCard, BudgetCard } from '../components/project-summary-card'
import { ProjectTimeline } from '../components/project-timeline'
import { ProjectActivityCard } from '../components/project-activity'
import { TeamMembers } from '../components/team-members'
import { ProjectCalendar } from '../components/project-calendar'
import { ProjectSettings } from '../components/project-settings'
import { ProjectModulePlaceholder } from '../components/project-module-placeholder'
import { ProjectFormDrawer } from '../components/project-form-drawer'
import { useProjectDetail, useProjectMutations, useUserDirectory } from '../project-queries'
import { rosterMemberIds } from '../project-form-utils'
import type { ProjectMemberRole } from '@/types'

export function ProjectDetailPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const detailQuery = useProjectDetail(projectId)
  const { users } = useUserDirectory()
  const mutations = useProjectMutations()

  const [tab, setTab] = React.useState('overview')
  const [editOpen, setEditOpen] = React.useState(false)
  const [confirmArchive, setConfirmArchive] = React.useState(false)

  const userMap = React.useMemo(() => new Map(users.map((user) => [user.id, user])), [users])

  const actorName = React.useCallback(
    (actorId?: string) => (actorId ? (userMap.get(actorId)?.name ?? 'System') : 'System'),
    [userMap],
  )

  if (detailQuery.isLoading) return <ProjectDetailSkeleton />
  if (detailQuery.isError || !detailQuery.data)
    return (
      <PageLayout
        header={
          <PageHeader
            title="Project not found"
            description="We could not load this project."
            breadcrumb={[{ label: 'Projects', to: '/projects' }, { label: 'Details' }]}
          />
        }
      >
        <ErrorState
          title="Could not load project"
          description={detailQuery.error instanceof Error ? detailQuery.error.message : 'Something went wrong.'}
          onRetry={() => detailQuery.refetch()}
        />
      </PageLayout>
    )

  const { project, members, milestones, activity } = detailQuery.data
  const managerName =
    (project.managerIds.length > 0 ? project.managerIds.map((id) => userMap.get(id)?.name).filter(Boolean).join(', ') : undefined) ??
    userMap.get(project.ownerId)?.name ??
    'Unassigned'
  const businessAnalystName = project.businessAnalystId ? userMap.get(project.businessAnalystId)?.name : undefined

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href)
    toast.success('Project link copied')
  }

  const handleMemberAdd = (input: { userId: string; role: ProjectMemberRole; capacity: number }) => {
    mutations.addMember.mutate(
      { projectId: project.id, input },
      { onSuccess: () => toast.success('Team member added'), onError: (error) => toast.error(error instanceof Error ? error.message : 'Could not add member') },
    )
  }

  const handleMemberRemove = (userId: string) => {
    mutations.removeMember.mutate(
      { projectId: project.id, userId },
      { onSuccess: () => toast.success('Team member removed'), onError: (error) => toast.error(error instanceof Error ? error.message : 'Could not remove member') },
    )
  }

  const handleRoleChange = (userId: string, role: ProjectMemberRole) => {
    mutations.updateMember.mutate(
      { projectId: project.id, userId, patch: { role } },
      { onSuccess: () => toast.success('Role updated'), onError: (error) => toast.error(error instanceof Error ? error.message : 'Could not update role') },
    )
  }

  const handleArchive = () => {
    mutations.archive.mutate(project.id, {
      onSuccess: () => {
        toast.success(`Project "${project.name}" archived`)
        setConfirmArchive(false)
      },
      onError: (error) => toast.error(error instanceof Error ? error.message : 'Could not archive project'),
    })
  }

  return (
    <PageLayout
      header={<Breadcrumb items={[{ label: 'Projects', to: '/projects' }, { label: project.name }]} />}
    >
      <ProjectHeader
        project={project}
        managerName={managerName}
        onEdit={() => setEditOpen(true)}
        onAddMember={() => setTab('members')}
        onArchive={() => setConfirmArchive(true)}
        onCopyLink={() => void copyLink()}
      />

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
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
                <ProjectModulePlaceholder icon={SquareKanban} label="Board" description="Kanban board for the active sprint. Ships with the Workspace module." />
                <ProjectModulePlaceholder icon={BookOpenText} label="Stories" description="Product backlog and story lifecycle." />
                <ProjectModulePlaceholder icon={CalendarClock} label="Sprints" description="Plan, start and close sprints." />
                <ProjectModulePlaceholder icon={ClipboardList} label="Weekly status" description="RAG status and blockers." />
                <ProjectModulePlaceholder icon={ListChecks} label="Checklist" description="Milestone approval checklists." />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="members">
          <TeamMembers
            members={members}
            users={users}
            onAdd={handleMemberAdd}
            onRemove={handleMemberRemove}
            onRoleChange={handleRoleChange}
          />
        </TabsContent>

        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Milestones</CardTitle>
            </CardHeader>
            <CardContent className="pt-1">
              <ProjectTimeline milestones={milestones} />
            </CardContent>
          </Card>
          <p className="mt-3 flex items-center gap-2 text-[13px] text-muted-foreground">
            <GanttChartSquare className="size-4" aria-hidden="true" />
            A Gantt view of this timeline is planned for a later phase.
          </p>
        </TabsContent>

        <TabsContent value="calendar">
          <ProjectCalendar project={project} milestones={milestones} />
        </TabsContent>

        <TabsContent value="settings">
          <ProjectSettings project={project} members={members} users={users} onDeleted={() => navigate('/projects')} />
        </TabsContent>
      </Tabs>

      <ProjectFormDrawer
        open={editOpen}
        onOpenChange={setEditOpen}
        project={project}
        memberUserIds={rosterMemberIds(members)}
        users={users}
      />

      <ConfirmDialog
        open={confirmArchive}
        onOpenChange={setConfirmArchive}
        title="Archive project?"
        description={`"${project.name}" will be archived and hidden from active views.`}
        confirmLabel="Archive"
        loading={mutations.archive.isPending}
        onConfirm={handleArchive}
      />
    </PageLayout>
  )
}

function ProjectDetailSkeleton() {
  return (
    <PageLayout
      header={
        <PageHeader
          title="Project"
          description="Loading project details…"
          breadcrumb={[{ label: 'Projects', to: '/projects' }, { label: 'Details' }]}
        />
      }
    >
      <div className="flex flex-col gap-6">
        <Skeleton className="h-24 w-full rounded-2xl" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Skeleton className="h-64 rounded-2xl" />
          <div className="flex flex-col gap-4 lg:col-span-2">
            <Skeleton className="h-40 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
          </div>
        </div>
      </div>
    </PageLayout>
  )
}