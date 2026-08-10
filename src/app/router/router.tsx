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
import { ProjectWorkspacePlaceholderPage } from '@/features/projects/pages/project-workspace-placeholder-page'
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
                  { path: 'sub-projects', element: <ProjectWorkspacePlaceholderPage navId="sub-projects" /> },
                  { path: 'teams', element: <ProjectWorkspacePlaceholderPage navId="teams" /> },
                  { path: 'sprint-planning', element: <ProjectWorkspacePlaceholderPage navId="sprint-planning" /> },
                  { path: 'board', element: <ProjectWorkspacePlaceholderPage navId="board" /> },
                  { path: 'reports', element: <ProjectWorkspacePlaceholderPage navId="reports" /> },
                  { path: 'files', element: <ProjectWorkspacePlaceholderPage navId="files" /> },
                  { path: 'settings', element: <ProjectWorkspacePlaceholderPage navId="settings" /> },
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
