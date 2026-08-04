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
import { ProjectDetailPage } from '@/features/projects/pages/project-detail-page'
import { NotFoundPage } from '@/features/not-found/not-found-page'
import {
  AdminDesignationsPage,
  AdminRolesPage,
  AdminUsersPage,
  PeoplePage,
  ProfileSettingsPage,
  ReportsPage,
  SettingsPage,
  TimesheetsPage,
  WorkspaceBacklogPage,
  WorkspaceBoardPage,
  WorkspaceEpicsPage,
  WorkspaceReleasesPage,
  WorkspaceSprintsPage,
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
              { path: '/dashboard', element: <DashboardPage /> },
              { path: '/projects', element: <ProjectsListPage /> },
              { path: '/projects/:projectId', element: <ProjectDetailPage /> },
              { path: '/people', element: <PeoplePage /> },
              { path: '/timesheets', element: <TimesheetsPage /> },
              { path: '/reports', element: <ReportsPage /> },
              { path: '/workspace/board', element: <WorkspaceBoardPage /> },
              { path: '/workspace/backlog', element: <WorkspaceBacklogPage /> },
              { path: '/workspace/sprints', element: <WorkspaceSprintsPage /> },
              { path: '/workspace/epics', element: <WorkspaceEpicsPage /> },
              { path: '/workspace/releases', element: <WorkspaceReleasesPage /> },
              { path: '/administration/users', element: <AdminUsersPage /> },
              { path: '/administration/roles', element: <AdminRolesPage /> },
              { path: '/administration/designations', element: <AdminDesignationsPage /> },
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