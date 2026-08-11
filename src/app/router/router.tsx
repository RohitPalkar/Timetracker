import { createBrowserRouter, Navigate } from 'react-router'
import { AuthLayout } from '@/app/layouts/auth-layout'
import { DashboardLayout } from '@/app/layouts/dashboard-layout'
import { BlankLayout } from '@/app/layouts/blank-layout'
import { ProtectedRoute, PublicOnlyRoute } from '@/app/router/guards'
import { LoginPage } from '@/features/auth/login-page'
import { VerifyPage } from '@/features/auth/verify-page'
import { SessionPage } from '@/features/auth/session-page'
import { DashboardPage } from '@/features/dashboard/dashboard-page'
import { ProjectsListPage } from '@/features/projects/pages/projects-list-page'
import { RequireProjectCreate } from '@/features/projects/components/require-project-create'
import { ProjectWorkspacePage } from '@/features/projects/pages/project-workspace-page'
import { ProjectWorkspaceOverviewPage } from '@/features/projects/pages/project-workspace-overview-page'
import { ProjectWorkspaceTeamsPage } from '@/features/projects/pages/project-workspace-teams-page'
import { ProjectSubProjectsPage } from '@/features/projects/pages/project-sub-projects-page'
import { SubProjectWorkspaceOverviewPage } from '@/features/projects/pages/sub-project-workspace-overview-page'
import { ProjectWorkspacePlaceholderPage } from '@/features/projects/pages/project-workspace-placeholder-page'
import { SubProjectWorkspacePage } from '@/features/projects/pages/sub-project-workspace-page'
import { SubProjectWorkspacePlaceholderPage } from '@/features/projects/pages/sub-project-workspace-placeholder-page'
import { NotFoundPage } from '@/features/not-found/not-found-page'
import {
  AdministrationPage,
  AIAgentsPage,
  AIHistoryPage,
  AIKnowledgePage,
  AIPromptsPage,
  AIUsagePage,
  DepartmentsPage,
  DocumentsPage,
  EmployeesPage,
  MyTimesheetPage,
  NotificationsPage,
  ProfileSettingsPage,
  PermissionsPage,
  ReportsPage,
  RolesPage,
  SettingsPage,
  SurveyPage,
  TeamsPage,
  TeamTimesheetsPage,
  TimesheetApprovalsPage,
  TimesheetCalendarPage,
  TimesheetReportsPage,
} from '@/features/placeholder/modules'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <BlankLayout />,
    errorElement: <NotFoundPage />,
    children: [
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
          { path: '/session', element: <SessionPage /> },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
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
                  { path: 'backlog', element: <ProjectWorkspacePlaceholderPage navId="backlog" /> },
                  { path: 'epics', element: <ProjectWorkspacePlaceholderPage navId="epics" /> },
                  { path: 'sprints', element: <ProjectWorkspacePlaceholderPage navId="sprints" /> },
                  { path: 'board', element: <ProjectWorkspacePlaceholderPage navId="board" /> },
                  { path: 'releases', element: <ProjectWorkspacePlaceholderPage navId="releases" /> },
                  { path: 'sub-projects', element: <ProjectSubProjectsPage /> },
                  { path: 'teams', element: <ProjectWorkspaceTeamsPage /> },
                  { path: 'reports', element: <ProjectWorkspacePlaceholderPage navId="reports" /> },
                  { path: 'files', element: <ProjectWorkspacePlaceholderPage navId="files" /> },
                  { path: 'settings', element: <ProjectWorkspacePlaceholderPage navId="settings" /> },
                  {
                    path: 'sub-projects/:subProjectId',
                    element: <SubProjectWorkspacePage />,
                    children: [
                      { index: true, element: <Navigate to="./overview" replace /> },
                      { path: 'overview', element: <SubProjectWorkspaceOverviewPage /> },
                      { path: 'backlog', element: <SubProjectWorkspacePlaceholderPage navId="backlog" /> },
                      { path: 'epics', element: <SubProjectWorkspacePlaceholderPage navId="epics" /> },
                      { path: 'sprints', element: <SubProjectWorkspacePlaceholderPage navId="sprints" /> },
                      { path: 'board', element: <SubProjectWorkspacePlaceholderPage navId="board" /> },
                      { path: 'releases', element: <SubProjectWorkspacePlaceholderPage navId="releases" /> },
                      { path: 'team', element: <SubProjectWorkspacePlaceholderPage navId="team" /> },
                      { path: 'reports', element: <SubProjectWorkspacePlaceholderPage navId="reports" /> },
                      { path: 'settings', element: <SubProjectWorkspacePlaceholderPage navId="settings" /> },
                    ],
                  },
                ],
              },

              // ── User & Organization ───────────────────
              { path: '/employees', element: <EmployeesPage /> },
              { path: '/teams', element: <TeamsPage /> },
              { path: '/departments', element: <DepartmentsPage /> },
              { path: '/roles', element: <RolesPage /> },
              { path: '/permissions', element: <PermissionsPage /> },

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
            ],
          },
        ],
      },
      { path: '/', element: <Navigate to="/dashboard" replace /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
