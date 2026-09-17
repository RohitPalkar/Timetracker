import { createBrowserRouter, Navigate } from 'react-router'
import { AuthLayout } from '@/app/layouts/auth-layout'
import { DashboardLayout } from '@/app/layouts/dashboard-layout'
import { BlankLayout } from '@/app/layouts/blank-layout'
import { ProtectedRoute, PublicOnlyRoute } from '@/app/router/guards'
import { LoginPage } from '@/features/auth/login-page'
import { VerifyPage } from '@/features/auth/verify-page'
import { SessionPage } from '@/features/auth/session-page'
import { OrganizationSelectPage } from '@/features/auth/organization-select-page'
import { AccessDeniedPage } from '@/features/auth/access-denied-page'
import { DashboardPage } from '@/features/dashboard/dashboard-page'
import { ProjectsListPage } from '@/features/projects/pages/projects-list-page'
import { RequireProjectCreate } from '@/features/projects/components/require-project-create'
import { ProjectWorkspacePage } from '@/features/projects/pages/project-workspace-page'
import { ProjectWorkspaceOverviewPage } from '@/features/projects/pages/project-workspace-overview-page'
import { ProjectWorkspaceTeamsPage } from '@/features/projects/pages/project-workspace-teams-page'
import { ProjectSubProjectsPage } from '@/features/projects/pages/project-sub-projects-page'
import { SubProjectWorkspaceOverviewPage } from '@/features/projects/pages/sub-project-workspace-overview-page'
import { SubProjectWorkspacePage } from '@/features/projects/pages/sub-project-workspace-page'
import {
  WorkspaceBacklogPage,
  WorkspaceBoardPage,
  WorkspaceBugsPage,
  WorkspaceEpicsPage,
  WorkspaceReleasesPage,
  WorkspaceSprintsPage,
  WorkspaceStoriesPage,
} from '@/features/projects/pages/workspace-planning-adapters'
import {
  SubWorkspaceReportsPage,
  SubWorkspaceSettingsPage,
  SubWorkspaceTeamPage,
  WorkspaceFilesPage,
  WorkspaceReportsPage,
  WorkspaceSettingsPage,
} from '@/features/projects/pages/workspace-generic-pages'
import { NotFoundPage } from '@/features/not-found/not-found-page'
import { EmployeesPage } from '@/features/organization/employees-page'
import { TeamsOrgPage } from '@/features/organization/teams-org-page'
import { DepartmentsPage } from '@/features/organization/departments-page'
import { RolesPage } from '@/features/organization/roles-page'
import { PermissionsPage } from '@/features/organization/permissions-page'
import { MyTimesheetPage } from '@/features/timesheets/pages/my-timesheet-page'
import { TeamTimesheetsPage } from '@/features/timesheets/pages/team-timesheets-page'
import { TimesheetApprovalsPage } from '@/features/timesheets/pages/approvals-page'
import { TimesheetCalendarPage } from '@/features/timesheets/pages/calendar-page'
import { TimesheetReportsPage } from '@/features/timesheets/pages/reports-page'
import { AIAgentsPage } from '@/features/ai/pages/agents-page'
import { AIUsagePage } from '@/features/ai/pages/usage-page'
import { AIPromptsPage } from '@/features/ai/pages/prompts-page'
import { AIKnowledgePage } from '@/features/ai/pages/knowledge-page'
import { AIHistoryPage } from '@/features/ai/pages/history-page'
import { DocumentsPage } from '@/features/docs/documents-page'
import { SurveyPage } from '@/features/survey/survey-page'
import { NotificationsPage } from '@/features/notifications/notifications-page'
import { ReportsPage } from '@/features/reports/reports-page'
import { AdministrationPage } from '@/features/admin/admin-page'
import { SettingsPage } from '@/features/settings/settings-page'
import { ProfileSettingsPage } from '@/features/settings/profile-page'
import { HRMSOverviewPage } from '@/features/hrms/pages/hrms-overview-page'
import { AttendancePage } from '@/features/hrms/pages/attendance-page'
import { LeavePage } from '@/features/hrms/pages/leave-page'
import { HolidaysPage } from '@/features/hrms/pages/holidays-page'
import { HRDocumentsPage } from '@/features/hrms/pages/hr-documents-page'
import { AssetsPage } from '@/features/hrms/pages/assets-page'
import { HRRequestsPage } from '@/features/hrms/pages/requests-page'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <BlankLayout />,
    errorElement: <NotFoundPage />,
    children: [
      // ── Public — unauthenticated only ─────────────────────────────
      {
        element: <PublicOnlyRoute />,
        children: [
          {
            element: <AuthLayout />,
            children: [
              { path: '/login', element: <LoginPage /> },
              { path: '/verify', element: <VerifyPage /> },
            ],
          },
        ],
      },
      // ── Protected — authenticated only ────────────────────────────
      {
        element: <ProtectedRoute />,
        children: [
          // Session bootstrap & org selection — no sidebar, just AuthLayout
          { path: '/session', element: <SessionPage /> },
          {
            element: <AuthLayout />,
            children: [{ path: '/select-organization', element: <OrganizationSelectPage /> }],
          },
          // Top-level forbidden
          { path: '/403', element: <AccessDeniedPage /> },

          // Main shell
          {
            element: <DashboardLayout />,
            children: [
              // ── Overview ───────────────────────────────
              { path: '/dashboard', element: <DashboardPage /> },

              // ── Project Management ────────────────────
              { path: '/projects', element: <ProjectsListPage /> },
              {
                path: '/projects/new',
                element: (
                  <RequireProjectCreate>
                    <ProjectsListPage />
                  </RequireProjectCreate>
                ),
              },
              {
                path: '/projects/:projectId',
                element: <ProjectWorkspacePage />,
                children: [
                  { index: true, element: <Navigate to="./overview" replace /> },
                  { path: 'overview', element: <ProjectWorkspaceOverviewPage /> },
                  { path: 'backlog', element: <WorkspaceBacklogPage /> },
                  { path: 'epics', element: <WorkspaceEpicsPage /> },
                  { path: 'sprints', element: <WorkspaceSprintsPage /> },
                  { path: 'board', element: <WorkspaceBoardPage /> },
                  { path: 'stories', element: <WorkspaceStoriesPage /> },
                  { path: 'bugs', element: <WorkspaceBugsPage /> },
                  { path: 'releases', element: <WorkspaceReleasesPage /> },
                  { path: 'sub-projects', element: <ProjectSubProjectsPage /> },
                  { path: 'teams', element: <ProjectWorkspaceTeamsPage /> },
                  { path: 'reports', element: <WorkspaceReportsPage /> },
                  { path: 'files', element: <WorkspaceFilesPage /> },
                  { path: 'settings', element: <WorkspaceSettingsPage /> },
                  {
                    path: 'sub-projects/:subProjectId',
                    element: <SubProjectWorkspacePage />,
                    children: [
                      { index: true, element: <Navigate to="./overview" replace /> },
                      { path: 'overview', element: <SubProjectWorkspaceOverviewPage /> },
                      { path: 'backlog', element: <WorkspaceBacklogPage /> },
                      { path: 'epics', element: <WorkspaceEpicsPage /> },
                      { path: 'sprints', element: <WorkspaceSprintsPage /> },
                      { path: 'board', element: <WorkspaceBoardPage /> },
                      { path: 'releases', element: <WorkspaceReleasesPage /> },
                      { path: 'team', element: <SubWorkspaceTeamPage /> },
                      { path: 'reports', element: <SubWorkspaceReportsPage /> },
                      { path: 'settings', element: <SubWorkspaceSettingsPage /> },
                    ],
                  },
                ],
              },

              // ── User & Organization ───────────────────
              { path: '/employees', element: <EmployeesPage /> },
              { path: '/teams', element: <TeamsOrgPage /> },
              { path: '/departments', element: <DepartmentsPage /> },
              { path: '/roles', element: <RolesPage /> },
              { path: '/permissions', element: <PermissionsPage /> },

              // ── HRMS ────────────────────────────────────
              { path: '/hrms', element: <HRMSOverviewPage /> },
              { path: '/hrms/attendance', element: <AttendancePage /> },
              { path: '/hrms/leave', element: <LeavePage /> },
              { path: '/hrms/holidays', element: <HolidaysPage /> },
              { path: '/hrms/documents', element: <HRDocumentsPage /> },
              { path: '/hrms/assets', element: <AssetsPage /> },
              { path: '/hrms/requests', element: <HRRequestsPage /> },

              // ── Timesheet Management ──────────────────
              { path: '/timesheets/my', element: <MyTimesheetPage /> },
              { path: '/timesheets/team', element: <TeamTimesheetsPage /> },
              { path: '/timesheets/approvals', element: <TimesheetApprovalsPage /> },
              { path: '/timesheets/calendar', element: <TimesheetCalendarPage /> },
              { path: '/timesheets/reports', element: <TimesheetReportsPage /> },

              // ── AI Workspace ──────────────────────────
              { path: '/ai/agents', element: <AIAgentsPage /> },
              { path: '/ai/usage', element: <AIUsagePage /> },
              { path: '/ai/prompts', element: <AIPromptsPage /> },
              { path: '/ai/knowledge', element: <AIKnowledgePage /> },
              { path: '/ai/history', element: <AIHistoryPage /> },

              // ── Workspace ─────────────────────────────
              { path: '/reports', element: <ReportsPage /> },
              { path: '/survey', element: <SurveyPage /> },
              { path: '/documents', element: <DocumentsPage /> },
              { path: '/notifications', element: <NotificationsPage /> },

              // ── System ────────────────────────────────
              { path: '/admin', element: <AdministrationPage /> },
              { path: '/settings', element: <SettingsPage /> },
              { path: '/settings/profile', element: <ProfileSettingsPage /> },

              // Forbidden inside shell (permission guard fallback)
              { path: '/access-denied', element: <AccessDeniedPage /> },
            ],
          },
        ],
      },
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
