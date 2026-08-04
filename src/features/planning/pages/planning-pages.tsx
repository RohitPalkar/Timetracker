import { Boxes, Bug, CalendarClock, Layers, ListChecks, SquareKanban, Target } from 'lucide-react'
import { usePlanning } from '@/store/planning'
import { PlanningLayout } from '../planning-layout'
import { EmptyPlanningState } from '../components/empty-planning-state'

const BREADCRUMB = [{ label: 'Planning' }]

/** Shared demo status/priority filters to exercise the Planning filter bar. */
function PlanningFilters() {
  const setFilter = usePlanning((state) => state.setFilter)
  const filters = usePlanning((state) => state.filters)
  return (
    <>
      <select
        value={filters.status ?? ''}
        onChange={(event) => setFilter('status', event.target.value || undefined)}
        className="h-9 rounded-xl border border-input bg-surface px-2.5 text-[13px] text-foreground outline-none"
        aria-label="Status"
      >
        <option value="">Status</option>
        <option value="todo">Todo</option>
        <option value="in_progress">In progress</option>
        <option value="in_review">In review</option>
        <option value="qa">QA</option>
        <option value="done">Done</option>
      </select>
      <select
        value={filters.priority ?? ''}
        onChange={(event) => setFilter('priority', event.target.value || undefined)}
        className="h-9 rounded-xl border border-input bg-surface px-2.5 text-[13px] text-foreground outline-none"
        aria-label="Priority"
      >
        <option value="">Priority</option>
        <option value="highest">Highest</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
        <option value="lowest">Lowest</option>
      </select>
    </>
  )
}

export function PlanningBacklogPage() {
  return (
    <PlanningLayout
      title="Backlog"
      description="Prioritize and refine stories, tasks, and bugs before sprint planning."
      breadcrumb={[...BREADCRUMB, { label: 'Backlog' }]}
      filters={<PlanningFilters />}
    >
      <EmptyPlanningState
        icon={ListChecks}
        title="Backlog is empty"
        description="Backlog ships with the Stories module. Story creation, ordering, and sprint assignment land in the next phase."
      />
    </PlanningLayout>
  )
}

export function PlanningBoardPage() {
  return (
    <PlanningLayout
      title="Board"
      description="Drag-and-drop kanban board for the active sprint."
      breadcrumb={[...BREADCRUMB, { label: 'Board' }]}
      filters={<PlanningFilters />}
    >
      <EmptyPlanningState
        icon={SquareKanban}
        title="Board is empty"
        description="The kanban board ships with the Sprints module. Column workflows and drag-and-drop land in the next phase."
      />
    </PlanningLayout>
  )
}

export function PlanningSprintsPage() {
  return (
    <PlanningLayout
      title="Sprints"
      description="Plan, start, and close sprints with capacity and velocity."
      breadcrumb={[...BREADCRUMB, { label: 'Sprints' }]}
    >
      <EmptyPlanningState
        icon={CalendarClock}
        title="No sprints yet"
        description="Sprint planning, capacity tracking, and burndown land in the next phase."
      />
    </PlanningLayout>
  )
}

export function PlanningStoriesPage() {
  return (
    <PlanningLayout
      title="Stories"
      description="Create and groom stories, tasks, and subtasks."
      breadcrumb={[...BREADCRUMB, { label: 'Stories' }]}
      filters={<PlanningFilters />}
    >
      <EmptyPlanningState
        icon={Target}
        title="No stories yet"
        description="Story creation, estimates, acceptance criteria, and comments land in the next phase."
      />
    </PlanningLayout>
  )
}

export function PlanningBugsPage() {
  return (
    <PlanningLayout
      title="Bugs"
      description="Track, triage, and resolve defects."
      breadcrumb={[...BREADCRUMB, { label: 'Bugs' }]}
      filters={<PlanningFilters />}
    >
      <EmptyPlanningState
        icon={Bug}
        title="No bugs yet"
        description="Bug triage, severity tracking, and the QA workflow land in the next phase."
      />
    </PlanningLayout>
  )
}

export function PlanningEpicsPage() {
  return (
    <PlanningLayout
      title="Epics"
      description="Group large bodies of work spanning multiple sprints."
      breadcrumb={[...BREADCRUMB, { label: 'Epics' }]}
    >
      <EmptyPlanningState
        icon={Layers}
        title="No epics yet"
        description="Epic portfolios, progress rollups, and dependency views land in the next phase."
      />
    </PlanningLayout>
  )
}

export function PlanningReleasesPage() {
  return (
    <PlanningLayout
      title="Releases"
      description="Plan releases and track version scope."
      breadcrumb={[...BREADCRUMB, { label: 'Releases' }]}
    >
      <EmptyPlanningState
        icon={Boxes}
        title="No releases yet"
        description="Release planning, version scope, and readiness checks land in the next phase."
      />
    </PlanningLayout>
  )
}