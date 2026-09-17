import * as React from 'react'
import { useProjectWorkspace } from '../components/project-workspace-context'
import { usePlanning } from '@/store/planning'
import {
  PlanningBacklogPage,
  PlanningBoardPage,
  PlanningBugsPage,
  PlanningEpicsPage,
  PlanningReleasesPage,
  PlanningSprintsPage,
  PlanningStoriesPage,
} from '@/features/planning/pages/planning-pages'

function useSyncPlanningProject() {
  const { project } = useProjectWorkspace()
  const setProjectId = usePlanning((s) => s.setProjectId)
  React.useEffect(() => {
    setProjectId(project.id)
    return () => setProjectId(null)
  }, [project.id, setProjectId])
}

export function WorkspaceSprintsPage() {
  useSyncPlanningProject()
  return <PlanningSprintsPage />
}
export function WorkspaceBoardPage() {
  useSyncPlanningProject()
  return <PlanningBoardPage />
}
export function WorkspaceBacklogPage() {
  useSyncPlanningProject()
  return <PlanningBacklogPage />
}
export function WorkspaceEpicsPage() {
  useSyncPlanningProject()
  return <PlanningEpicsPage />
}
export function WorkspaceStoriesPage() {
  useSyncPlanningProject()
  return <PlanningStoriesPage />
}
export function WorkspaceBugsPage() {
  useSyncPlanningProject()
  return <PlanningBugsPage />
}
export function WorkspaceReleasesPage() {
  useSyncPlanningProject()
  return <PlanningReleasesPage />
}
