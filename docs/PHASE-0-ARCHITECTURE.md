# MyTracker v2 — Phase 0: Product Foundation

> Status: DRAFT — Awaiting Approval
> Author: Lead Product Architect
> Date: 2026-08-04

---

## 1. Product Information Architecture

### 1.1 Product Definition

MyTracker is an **Enterprise Delivery Platform**. It manages projects, people, time, and intelligence across an organization. It is not a single-purpose tool — it is a modular system where each business domain is an independent, self-contained module.

### 1.2 Module Map

```
MyTracker
│
├── Dashboard                         Global overview and metrics
│
├── Project Management                Project lifecycle
│   ├── Projects                      Project list, create, archive
│   └── Project Workspace             Per-project workspace (Level 2)
│       ├── Overview                  Project health, summary, activity
│       ├── Sub Projects              Child project breakdown
│       ├── Teams                     Project team composition
│       ├── Sprint Planning           Sprint creation and planning
│       ├── Board                     Kanban board (active sprint)
│       ├── Reports                   Project-level analytics
│       ├── Files                     Project document storage
│       └── Settings                  Project configuration
│
├── User & Organization               People and structure
│   ├── Employees                     Employee directory
│   ├── Teams                         Team creation and membership
│   ├── Departments                   Organizational units
│   ├── Roles                         Role definitions
│   └── Permissions                   Access control policies
│
├── Timesheet Management              Time tracking and approvals
│   ├── My Timesheet                  Individual time entry
│   ├── Team Timesheets               Manager view of team time
│   ├── Approvals                     Timesheet approval workflow
│   ├── Calendar                      Calendar visualization
│   └── Reports                       Time analytics and billing
│
├── AI Workspace                      AI-powered tooling
│   ├── Agents                        AI agent configuration
│   ├── Usage                         Token and cost tracking
│   ├── Prompt Library                Saved prompt templates
│   ├── Knowledge Base                RAG document store
│   └── History                       Interaction audit trail
│
├── Reports & Analytics               Cross-module analytics
│
├── Survey Management                 Team surveys and feedback
│
├── Documents                         Centralized document storage
│
├── Notifications                     Activity feed and preferences
│
├── Administration                    Global system config
│
└── Settings                          Workspace and user preferences
```

### 1.3 Entity Hierarchy

```
Organization
  └── Project
        ├── Sub Project
        │     ├── Epic
        │     │     └── Story
        │     │           ├── Task
        │     │           │     └── Subtask
        │     │           └── Bug
        │     ├── Sprint
        │     │     └── (contains Stories + Bugs)
        │     ├── Board
        │     │     └── (renders Sprint issues by status)
        │     └── Release
        │           └── (contains Stories + Bugs)
        ├── Team
        │     └── (contains Employees)
        └── Files
```

### 1.4 Data Ownership Rules

| Entity | Owned By | Scope |
|---|---|---|
| Organization | System | Global |
| Employee | Organization | Global |
| Team | Organization | Global |
| Department | Organization | Global |
| Role | Organization | Global |
| Permission | Organization | Global |
| Project | Organization | Global |
| Sub Project | Project | Scoped to project |
| Epic | Sub Project | Scoped to sub project |
| Story | Sub Project | Scoped to sub project |
| Task | Story | Scoped to story |
| Subtask | Task | Scoped to task |
| Bug | Sub Project | Scoped to sub project |
| Sprint | Sub Project | Scoped to sub project |
| Board | Sub Project | Scoped to sub project |
| Release | Sub Project | Scoped to sub project |
| Timesheet Entry | Employee | Scoped to employee |
| Survey | Organization | Global |
| Document | Organization or Project | Scoped |
| AI Agent | Organization | Global |
| Notification | Employee | Scoped to employee |

---

## 2. Navigation Architecture

### 2.1 Two-Level Navigation Principle

The application has exactly two navigation levels. They never mix.

**Level 1 — Application Navigation (Global Sidebar)**
Every authenticated user sees this. It provides access to all organization-wide modules. It is always present on desktop, slides in on mobile.

**Level 2 — Project Workspace Navigation (Workspace Sidebar)**
Only visible when a user is inside a specific project (`/projects/:projectId/*`). It provides access to project-scoped modules. It replaces or overlays the global sidebar context.

### 2.2 Global Sidebar Structure

```
MyTracker                          Brand logo + app name
│
├── Overview                       (non-collapsible group)
│   └── Dashboard
│
├── Project Management             (collapsible group)
│   └── Projects
│
├── User & Organization            (collapsible group)
│   ├── Employees
│   ├── Teams
│   ├── Departments
│   ├── Roles
│   └── Permissions
│
├── Timesheet Management           (collapsible group)
│   ├── My Timesheet
│   ├── Team Timesheets
│   ├── Approvals
│   ├── Calendar
│   └── Reports
│
├── AI Workspace                   (collapsible group)
│   ├── Agents
│   ├── Usage
│   ├── Prompt Library
│   ├── Knowledge Base
│   └── History
│
├── Workspace                      (collapsible group)
│   ├── Reports & Analytics
│   ├── Survey
│   ├── Documents
│   └── Notifications
│
└── System                         (non-collapsible group)
    ├── Administration
    ├── Settings
    └── Profile
```

### 2.3 Workspace Sidebar Structure

```
← Back to Projects                Link back to /projects
│
Project Name                      Project context indicator
│
├── Overview
├── Sub Projects
├── Teams
├── Sprint Planning
├── Board
├── Reports
├── Files
└── Settings
```

### 2.4 Sidebar States

**Expanded (Desktop)**
- Width: 272px
- Shows group labels, item labels, and icons
- Collapsible groups show chevron indicator
- Active item highlighted with accent background

**Collapsed (Desktop)**
- Width: 76px
- Shows only icons
- Group labels hidden
- Item labels hidden
- Collapsed state persisted in `localStorage` under `mytracker.sidebar`
- Brand shows icon only (tooltip on hover)

**Mobile**
- Hidden by default
- Slides in from left as a Sheet (Radix Dialog)
- Full 272px width, never collapsed
- Closes on navigation
- Backdrop overlay

### 2.5 Active State Detection

```
exact match:  /dashboard           → only /dashboard is active
prefix match: /projects            → /projects, /projects/new, /projects/:id are active
exact match:  /settings            → only /settings is active
exact match:  /settings/profile    → only /settings/profile is active
```

The `end` flag on `NavItem` controls this. `end: true` = exact match. `end: false/undefined` = prefix match.

### 2.6 Breadcrumb Strategy

Breadcrumbs are derived from the route hierarchy, not hardcoded.

**Global module:**
```
Home > Dashboard
Home > Timesheets > My Timesheet
Home > User & Organization > Employees
```

**Project workspace:**
```
Home > Projects > [Project Name] > Board
Home > Projects > [Project Name] > Sprint Planning > [Sprint Name]
```

**Rule:** The breadcrumb always starts with "Home" (links to `/dashboard`). The last segment is never linked (current page). Intermediate segments are linked.

### 2.7 Mobile Navigation

- Global sidebar: Sheet from left, triggered by hamburger in Header
- Workspace sidebar: Same Sheet pattern, different content
- Header remains fixed at top (72px height)
- Bottom navigation bar is NOT used — this is an enterprise tool, not a consumer app

### 2.8 Responsive Breakpoints

| Breakpoint | Sidebar | Header | Content |
|---|---|---|---|
| < `lg` (1024px) | Hidden (Sheet) | Hamburger menu | Full width |
| >= `lg` | Visible (expanded or collapsed) | Brand + search | Max 1600px |

### 2.9 Navigation State

| State | Storage | Key |
|---|---|---|
| Sidebar collapsed | localStorage | `mytracker.sidebar` |
| Mobile sidebar open | React state | Component-local |
| Active route | React Router | `useLocation().pathname` |
| Command palette open | Zustand | `useCommandPalette` |
| Current project context | URL params | `:projectId` |

---

## 3. Complete Route Tree

### 3.1 Public Routes

```
/login                           AuthLayout → LoginPage
/verify                          AuthLayout → VerifyPage
/session                         SessionPage
```

### 3.2 Protected Routes (Level 1 — Global)

```
/                                → redirect to /dashboard
/dashboard                       DashboardLayout → DashboardPage

/projects                        DashboardLayout → ProjectsListPage
/projects/new                    DashboardLayout → ProjectsListPage (create mode)
/projects/:projectId             DashboardLayout → WorkspaceLayout → WorkspacePage

/employees                       DashboardLayout → EmployeesPage
/teams                           DashboardLayout → TeamsPage
/departments                     DashboardLayout → DepartmentsPage
/roles                           DashboardLayout → RolesPage
/permissions                     DashboardLayout → PermissionsPage

/timesheets/my                   DashboardLayout → MyTimesheetPage
/timesheets/team                 DashboardLayout → TeamTimesheetsPage
/timesheets/approvals            DashboardLayout → TimesheetApprovalsPage
/timesheets/calendar             DashboardLayout → TimesheetCalendarPage
/timesheets/reports              DashboardLayout → TimesheetReportsPage

/ai/agents                       DashboardLayout → AIAgentsPage
/ai/usage                        DashboardLayout → AIUsagePage
/ai/prompts                      DashboardLayout → AIPromptsPage
/ai/knowledge                    DashboardLayout → AIKnowledgePage
/ai/history                      DashboardLayout → AIHistoryPage

/reports                         DashboardLayout → ReportsAnalyticsPage
/survey                          DashboardLayout → SurveyManagementPage
/documents                       DashboardLayout → DocumentsPage
/notifications                   DashboardLayout → NotificationsPage

/admin                           DashboardLayout → AdministrationPage
/settings                        DashboardLayout → SettingsPage
/settings/profile                DashboardLayout → ProfileSettingsPage
```

### 3.3 Protected Routes (Level 2 — Project Workspace)

```
/projects/:projectId/overview           WorkspaceLayout → WorkspaceOverviewPage
/projects/:projectId/sub-projects      WorkspaceLayout → SubProjectsPage
/projects/:projectId/teams             WorkspaceLayout → WorkspaceTeamsPage
/projects/:projectId/sprint-planning   WorkspaceLayout → SprintPlanningPage
/projects/:projectId/board             WorkspaceLayout → BoardPage
/projects/:projectId/reports           WorkspaceLayout → WorkspaceReportsPage
/projects/:projectId/files             WorkspaceLayout → WorkspaceFilesPage
/projects/:projectId/settings          WorkspaceLayout → WorkspaceSettingsPage
```

### 3.4 Error Routes

```
*                                  NotFoundPage
```

### 3.5 Future Route Expansion Points

Sub Project routes (Phase 2+):
```
/projects/:projectId/sub-projects/:subProjectId/backlog
/projects/:projectId/sub-projects/:subProjectId/sprints
/projects/:projectId/sub-projects/:subProjectId/board
/projects/:projectId/sub-projects/:subProjectId/releases
```

---

## 4. Layout Hierarchy

### 4.1 Layout Tree

```
BlankLayout                         Root shell
  └── Outlet + CommandPalette

AuthLayout                          Login/verify centered card
  └── Outlet

DashboardLayout                     Level 1 application shell
  ├── Sidebar (global)
  ├── MobileSheet (sidebar variant)
  ├── Header
  └── Outlet

WorkspaceLayout                     Level 2 project shell (nested inside DashboardLayout)
  ├── WorkspaceSidebar (project-scoped)
  ├── WorkspaceHeader (project context + breadcrumb)
  └── Outlet
```

### 4.2 Layout Responsibilities

| Layout | Responsibility | Contains |
|---|---|---|
| `BlankLayout` | Root shell, global command palette | Outlet, CommandPalette |
| `AuthLayout` | Authentication UI | Centered card, brand, Outlet |
| `DashboardLayout` | Level 1 application shell | Sidebar, Header, Outlet |
| `WorkspaceLayout` | Level 2 project shell | WorkspaceSidebar, WorkspaceHeader, Outlet |

### 4.3 DashboardLayout Composition

```
┌──────────────────────────────────────────────────────┐
│ Sidebar (272px / 76px)  │  Header (72px)             │
│                         │────────────────────────────│
│                         │                            │
│                         │  Content (max-w 1600px)    │
│                         │                            │
│                         │                            │
│                         │                            │
└──────────────────────────────────────────────────────┘
```

### 4.4 WorkspaceLayout Composition

```
┌──────────────────────────────────────────────────────┐
│ WorkspaceSidebar (240px) │  WorkspaceHeader           │
│                         │────────────────────────────│
│                         │                            │
│                         │  Content                   │
│                         │                            │
│                         │                            │
└──────────────────────────────────────────────────────┘
```

The WorkspaceLayout is rendered inside the DashboardLayout's Outlet. The global sidebar is replaced visually by the workspace sidebar. The global Header is replaced by the workspace header.

### 4.5 PageLayout (Reusable Content Layout)

Every feature page uses `PageLayout` internally:

```
PageLayout
  ├── header (PageHeader: title + description + breadcrumb + actions)
  ├── filters (optional: filter bar)
  ├── content (main area)
  ├── sidebar (optional: right panel, 320px)
  └── footer (optional)
```

---

## 5. Module Boundaries

### 5.1 Application Modules

| Module | Route Prefix | Ownership | Key Entities |
|---|---|---|---|
| Dashboard | `/dashboard` | Global | Metrics, charts, recent activity |
| Project Management | `/projects` | Global | Project, ProjectMember |
| User & Organization | `/employees`, `/teams`, etc. | Global | Employee, Team, Department, Role |
| Timesheet Management | `/timesheets/*` | Global | TimeEntry, Timesheet, Approval |
| AI Workspace | `/ai/*` | Global | Agent, Prompt, KnowledgeDoc |
| Reports & Analytics | `/reports` | Global | Cross-module analytics |
| Survey Management | `/survey` | Global | Survey, Response |
| Documents | `/documents` | Global | Document, Folder |
| Notifications | `/notifications` | Global | Notification, Preference |
| Administration | `/admin` | Global | System config, billing |
| Settings | `/settings` | Global | Workspace prefs, user prefs |

### 5.2 Project Workspace Modules

| Module | Route Suffix | Ownership | Key Entities |
|---|---|---|---|
| Overview | `/overview` | Project | Summary, health, activity |
| Sub Projects | `/sub-projects` | Project | SubProject |
| Teams | `/teams` | Project | ProjectTeam, ProjectMember |
| Sprint Planning | `/sprint-planning` | Sub Project | Sprint, PlanningSession |
| Board | `/board` | Sub Project | Issue (rendered by status) |
| Reports | `/reports` | Project | Project analytics |
| Files | `/files` | Project | ProjectFile |
| Settings | `/settings` | Project | ProjectConfig |

### 5.3 Responsibility Rules

1. **Global modules never reference project-scoped data directly.** They operate on organization-wide entities.
2. **Workspace modules never access organization-wide state.** They operate only on the current project context.
3. **The project ID is always in the URL.** Workspace modules read it from `useParams()`.
4. **No module imports from another feature's `components/` directory.** Only shared `components/` are cross-feature.

---

## 6. Workspace Boundaries

### 6.1 What Lives Where

| Entity | Global or Workspace | Reason |
|---|---|---|
| Employee | Global | Employees exist across projects |
| Team | Global | Teams are organizational, not project-scoped |
| Department | Global | Organizational structure |
| Role | Global | System-wide RBAC |
| Project | Global (list) + Workspace (detail) | Listed globally, managed in workspace |
| Sub Project | Workspace | Belongs to a project |
| Epic | Workspace (via Sub Project) | Belongs to a sub project |
| Story | Workspace (via Sub Project) | Belongs to a sub project |
| Task | Workspace (via Story) | Belongs to a story |
| Subtask | Workspace (via Task) | Belongs to a task |
| Bug | Workspace (via Sub Project) | Belongs to a sub project |
| Sprint | Workspace (via Sub Project) | Belongs to a sub project |
| Board | Workspace (via Sub Project) | Renders sub project issues |
| Release | Workspace (via Sub Project) | Belongs to a sub project |
| Timesheet | Global (entry) + Workspace (view) | Entries are personal, views can be project-scoped |
| Document | Global or Project | Depends on scope |
| Notification | Global | Cross-cutting concern |

### 6.2 Context Propagation

When a user navigates to `/projects/:projectId/board`:

1. `DashboardLayout` renders (global sidebar, header)
2. Route matches `/projects/:projectId/*`
3. `WorkspaceLayout` renders inside Outlet
4. `WorkspaceLayout` reads `projectId` from params
5. `WorkspaceLayout` fetches project metadata
6. `WorkspaceSidebar` renders with project context
7. `BoardPage` renders inside WorkspaceLayout's Outlet
8. `BoardPage` reads `projectId` from params (or workspace context)

### 6.3 Workspace Navigation Handoff

The global sidebar highlights "Projects" when any `/projects/*` route is active. The workspace sidebar takes over visual navigation within the project scope. The Header changes to show project context (project name, back link).

---

## 7. Permission Matrix

### 7.1 Role Definitions

| Role Key | Label | Scope |
|---|---|---|
| `super_admin` | Super Admin | System-wide, all permissions |
| `org_admin` | Organization Admin | Organization-wide |
| `project_manager` | Project Manager | Assigned projects |
| `delivery_manager` | Delivery Manager | Multiple projects |
| `team_lead` | Team Lead | Team scope |
| `employee` | Employee | Self + assigned work |
| `hr` | HR | People and organization |
| `finance` | Finance | Billing and timesheets |

### 7.2 Permission Keys

```
dashboard.view
projects.view / projects.create / projects.edit / projects.archive
workspace.view / workspace.manage
stories.view / stories.create / stories.edit / stories.assign
bugs.view / bugs.create / bugs.edit
timesheets.view_own / timesheets.view_all / timesheets.submit / timesheets.approve
reports.view / reports.export
users.view / users.manage
roles.manage
settings.view / settings.manage
admin.all
```

### 7.3 Module × Role Permission Matrix

| Module | Super Admin | Org Admin | Project Manager | Delivery Manager | Team Lead | Employee | HR | Finance |
|---|---|---|---|---|---|---|---|---|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Projects (list) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Projects (create) | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Projects (edit) | ✓ | ✓ | ✓(own) | ✓(own) | ✗ | ✗ | ✗ | ✗ |
| Project Workspace | ✓ | ✓ | ✓(assigned) | ✓(assigned) | ✓(team) | ✓(assigned) | ✗ | ✗ |
| Sub Projects | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Sprint Planning | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Board | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Employees | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| Teams | ✓ | ✓ | ✗ | ✗ | ✓(team) | ✗ | ✓ | ✗ |
| Departments | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| Roles | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ |
| Permissions | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| My Timesheet | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Team Timesheets | ✓ | ✓ | ✓(team) | ✓(team) | ✓(team) | ✗ | ✓ | ✓ |
| Approvals | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✗ |
| AI Workspace | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Reports | ✓ | ✓ | ✓ | ✓ | ✓(team) | ✗ | ✓ | ✓ |
| Survey | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Documents | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Notifications | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Administration | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Settings | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓(partial) | ✗ |

### 7.4 Permission Implementation Rules

1. **Never hardcode role names in components.** Components receive `userPermissions: PermissionKey[]` and call `hasPermission()`.
2. **Route guards check permissions.** `ProtectedRoute` checks auth. A future `PermissionGuard` checks `PermissionKey`.
3. **Sidebar items accept an optional `permission` field.** Items are hidden if the user lacks the required permission.
4. **API services include permission headers.** The backend enforces permissions independently.
5. **`admin.all` bypasses all checks.** This is the super admin escape hatch.

---

## 8. Folder Structure

### 8.1 Target Structure

```
src/
├── app/
│   ├── App.tsx
│   ├── layouts/
│   │   ├── blank-layout.tsx
│   │   ├── auth-layout.tsx
│   │   ├── dashboard-layout.tsx
│   │   └── workspace-layout.tsx
│   ├── providers/
│   │   ├── app-providers.tsx
│   │   └── query-provider.tsx
│   └── router/
│       ├── router.tsx
│       ├── guards.tsx
│       └── route-config.ts
│
├── components/
│   ├── ui/                         Design system primitives (Radix)
│   ├── common/                     Shared application components
│   ├── layout/                     Layout primitives (sidebar, header)
│   ├── navigation/                 Navigation components (breadcrumb, sidebar-nav)
│   ├── feedback/                   Feedback components (empty, error, loading)
│   ├── forms/                      Form field components
│   └── tables/                     Table components
│
├── config/
│   ├── navigation.ts               Global sidebar nav config
│   ├── workspace-navigation.ts     Workspace sidebar nav config
│   ├── colors.ts
│   ├── motion.ts
│   ├── radius.ts
│   ├── shadow.ts
│   ├── spacing.ts
│   └── typography.ts
│
├── constants/
│   └── index.ts
│
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── pages/
│   │
│   ├── dashboard/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── pages/
│   │
│   ├── projects/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types.ts
│   │   └── pages/
│   │       ├── projects-list-page.tsx
│   │       └── projects-new-page.tsx
│   │
│   ├── workspace/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types.ts
│   │   └── pages/
│   │       ├── workspace-overview-page.tsx
│   │       ├── sub-projects-page.tsx
│   │       ├── workspace-teams-page.tsx
│   │       ├── sprint-planning-page.tsx
│   │       ├── board-page.tsx
│   │       ├── workspace-reports-page.tsx
│   │       ├── workspace-files-page.tsx
│   │       └── workspace-settings-page.tsx
│   │
│   ├── organization/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── pages/
│   │       ├── employees-page.tsx
│   │       ├── teams-page.tsx
│   │       ├── departments-page.tsx
│   │       ├── roles-page.tsx
│   │       └── permissions-page.tsx
│   │
│   ├── timesheets/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── pages/
│   │       ├── my-timesheet-page.tsx
│   │       ├── team-timesheets-page.tsx
│   │       ├── approvals-page.tsx
│   │       ├── calendar-page.tsx
│   │       └── timesheet-reports-page.tsx
│   │
│   ├── ai-workspace/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── pages/
│   │       ├── agents-page.tsx
│   │       ├── usage-page.tsx
│   │       ├── prompts-page.tsx
│   │       ├── knowledge-page.tsx
│   │       └── history-page.tsx
│   │
│   ├── reports/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── pages/
│   │
│   ├── survey/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── pages/
│   │
│   ├── documents/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── pages/
│   │
│   ├── notifications/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── pages/
│   │
│   ├── admin/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── pages/
│   │
│   └── settings/
│       ├── components/
│       ├── hooks/
│       ├── services/
│       └── pages/
│
├── hooks/
│   ├── use-permissions.ts
│   ├── use-breakpoint.ts
│   └── use-local-storage.ts
│
├── lib/
│   ├── utils.ts
│   ├── dates.ts
│   ├── formats.ts
│   └── permissions.ts
│
├── services/
│   ├── http.ts
│   ├── mock-store.ts
│   └── index.ts
│
├── store/
│   ├── auth.ts
│   ├── command-palette.ts
│   ├── navigation.ts
│   └── workspace.ts
│
├── styles/
│   └── globals.css
│
└── types/
    ├── index.ts
    ├── agile.ts
    ├── api.ts
    ├── auth.ts
    ├── collaboration.ts
    ├── permission.ts
    ├── planning.ts
    ├── timesheet.ts
    └── workspace.ts
```

---

## 9. Feature Structure

### 9.1 Feature Module Contract

Every feature module follows this internal structure:

```
features/<module>/
├── components/        UI components specific to this module
│   └── *.tsx
├── hooks/             Custom hooks specific to this module
│   └── use-*.ts
├── services/          API service functions specific to this module
│   └── *.ts
├── types.ts           TypeScript types specific to this module
└── pages/             Page components (route targets)
    └── *-page.tsx
```

### 9.2 Feature Isolation Rules

1. **Features import from `components/` (shared) but never from other `features/*/components/`.**
2. **Features import from `lib/` (shared utilities) freely.**
3. **Features import from `store/` (global state) freely.**
4. **Features import from `types/` (shared types) freely.**
5. **Features import from `services/` (shared HTTP client) but define their own service functions internally.**
6. **Features never import from `@/features/planning/`** — that module is deprecated and will be replaced by `workspace/`.

### 9.3 Existing Feature Migration

| Current | Target | Action |
|---|---|---|
| `features/planning/` | `features/workspace/` | Deprecate, rebuild |
| `features/projects/` | `features/projects/` + `features/workspace/` | Split |
| `features/placeholder/` | Individual feature modules | Replace |
| `features/auth/` | `features/auth/` | Keep |
| `features/dashboard/` | `features/dashboard/` | Keep |
| `features/not-found/` | `features/not-found/` | Keep |

---

## 10. Zustand Store Plan

### 10.1 Store Inventory

| Store | File | Purpose | Scope |
|---|---|---|---|
| `useAuthStore` | `store/auth.ts` | Authentication state, user session | Global |
| `useCommandPalette` | `store/command-palette.ts` | Cmd+K palette open/close | Global |
| `useNavigationStore` | `store/navigation.ts` | Sidebar collapsed state, mobile open | Global |
| `useWorkspaceStore` | `store/workspace.ts` | Current project context, sub project, sprint | Workspace |

### 10.2 Store Definitions

**useAuthStore**
```typescript
interface AuthState {
  authUser: User | null
  isAuthenticated: boolean
  login: (email: string) => Promise<void>
  verify: (otp: string) => Promise<void>
  logout: () => void
}
```

**useCommandPalette**
```typescript
interface CommandPaletteState {
  open: boolean
  setOpen: (open: boolean) => void
}
```

**useNavigationStore**
```typescript
interface NavigationState {
  collapsed: boolean
  mobileOpen: boolean
  toggleCollapsed: () => void
  setMobileOpen: (open: boolean) => void
}
```

**useWorkspaceStore**
```typescript
interface WorkspaceState {
  projectId: string | null
  projectName: string | null
  subProjectId: string | null
  sprintId: string | null
  setProjectContext: (id: string, name: string) => void
  setSubProject: (id: string | null) => void
  setSprint: (id: string | null) => void
  clearContext: () => void
}
```

### 10.3 Store Rules

1. **No feature-specific state in global stores.** Feature state belongs in feature hooks or URL params.
2. **URL is the source of truth for navigation state.** Stores do not duplicate route info.
3. **Workspace store only active inside workspace routes.** It clears on离开.
4. **Auth store persists to localStorage.** Other stores are session-scoped.

---

## 11. Repository Structure

### 11.1 Top-Level Files

```
Timetracker/
├── .github/                    GitHub Actions, templates
├── public/                     Static assets
├── src/                        Application source
├── .gitignore
├── .oxlintrc.json              Linter config
├── index.html                  Vite entry HTML
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
└── README.md
```

### 11.2 Conventions

- **Single branch strategy:** `main` for production, feature branches for development
- **Commit messages:** Conventional Commits (`feat:`, `fix:`, `refactor:`, `chore:`)
- **No monorepo:** Single application in a single repository
- **No code splitting by route:** Vite handles chunking automatically
- **Path aliases:** `@/` maps to `src/`

---

## 12. Shared Component Inventory

### 12.1 UI Primitives (`components/ui/`)

These are Radix-based, unstyled-by-default building blocks. Never modify their API surface.

```
accordion          alert-dialog      alert             avatar
badge              banner            button            card
checkbox           collapsible       command           dialog
dropdown-menu      input             label             multi-select
pagination         popover           progress          radio-group
scroll-area        select            separator         sheet
skeleton           sonner            switch            table
tabs               textarea          tooltip
```

### 12.2 Common Components (`components/common/`)

Application-level shared components. Used across multiple features.

```
command-palette     Cmd+K global search
confirm-dialog      Confirmation modal
drawer              Side drawer (alternative to sheet)
metric-card         Dashboard metric card
modal               Generic modal wrapper
month-calendar      Month calendar grid
notifications-drawer Notification side panel
page-header         Title + breadcrumb + actions
page-layout         Reusable page structure
priority-badge      Priority indicator
quick-create        Header quick-create dropdown
search-box          Search input with Cmd+K hint
stat-card           Statistics card
status-badge        Status indicator
tag                 Generic tag
user-avatar         User avatar with initials
user-chip           User name + avatar chip
```

### 12.3 Layout Components (`components/layout/`)

```
header              Top header bar (search, notifications, user menu, hamburger)
sidebar             Global sidebar (brand, nav, footer, collapse toggle)
```

### 12.4 Navigation Components (`components/navigation/`)

```
breadcrumb          Breadcrumb navigation
kbd                 Keyboard shortcut badge
sidebar-nav         NavGroup / NavItem rendering + active state
```

### 12.5 Feedback Components (`components/feedback/`)

```
empty-state         Empty state with icon + message
error-state         Error state with retry
loading-state       Loading spinner / skeleton
```

### 12.6 Form Components (`components/forms/`)

```
date-field          Date input with picker
file-field          File upload
form-field          Generic form field wrapper
multi-select-field  Multi-select dropdown
otp-input           OTP verification input
rich-text-editor    Tiptap rich text editor
rich-text-field     Rich text form field wrapper
select-field        Single select dropdown
switch-field        Toggle switch
text-field          Text input
textarea-field      Textarea input
```

### 12.7 Table Components (`components/tables/`)

```
data-table          TanStack Table wrapper with sort, filter, pagination, selection
```

---

## 13. Business Component Inventory

### 13.1 Components to Rebuild (from `features/planning/`)

These components will be migrated to `features/workspace/` with updated APIs:

```
assignee-avatar-group    Assignee avatars with add
filter-bar               Shared filter controls
issue-type-badge         Issue type indicator
priority-badge           Priority indicator (already in shared)
project-selector         Project scope selector
sprint-selector          Sprint scope selector
story-points-badge       Story points indicator
story-status-badge       Story status indicator
```

### 13.2 Components to Rebuild (from `features/projects/`)

These components will be split between `features/projects/` (global) and `features/workspace/` (project-scoped):

```
project-form             Create/edit project form
project-form-drawer      Drawer wrapper for project form
project-header           Project detail header
project-member-card      Team member card
project-settings         Project settings panel
project-summary-card     Project summary + budget
project-timeline         Milestone timeline
team-members             Team management panel
project-activity         Activity feed
project-calendar         Calendar view
project-module-placeholder  Phase placeholder
```

### 13.3 New Business Components Needed

**Workspace Module:**
```
workspace-header         Project name + breadcrumb + actions
workspace-sidebar        Project-scoped navigation
sub-project-card         Sub project summary card
sub-project-form         Create/edit sub project
sprint-card              Sprint summary card
sprint-form              Create/edit sprint
sprint-board             Kanban board renderer
board-column             Single board column
board-card               Draggable issue card
epic-card                Epic summary card
story-card               Story summary card
bug-card                 Bug summary card
release-card             Release summary card
release-form             Create/edit release
```

**Timesheet Module:**
```
timesheet-grid           Weekly timesheet entry grid
timesheet-row            Single day row
timesheet-cell           Hour entry cell
timesheet-approval-card  Approval request card
```

**AI Module:**
```
agent-card               AI agent configuration card
prompt-card              Prompt template card
knowledge-card           Knowledge base document card
usage-chart              Token usage chart
```

---

## 14. Future Integration Points

### 14.1 API Integration

| Service | Current State | Future |
|---|---|---|
| HTTP Client | `services/http.ts` (mock) | Replace with real fetch/axios |
| Auth | `services/auth.ts` (mock) | JWT + refresh token |
| All services | `services/*.ts` (mock-store) | REST API endpoints |
| Realtime | None | WebSocket for live board, notifications |

### 14.2 Authentication Flow

```
Login (email) → OTP verification → JWT token → Auth store → Route guard
```

### 14.3 Role-Based Access Control

```
Login → Fetch user + roles + permissions → Auth store → PermissionGuard → UI elements
```

### 14.4 Project Context Flow

```
/projects (list) → Click project → /projects/:projectId
  → WorkspaceLayout mounts
  → Fetch project metadata
  → useWorkspaceStore.setProjectContext(id, name)
  → WorkspaceSidebar renders
  → Sub-routes render inside WorkspaceLayout
```

### 14.5 Realtime Integration Points

- Board updates (drag-drop, status changes)
- Notification delivery
- Timesheet approvals
- Sprint status changes
- Comment activity

### 14.6 Export Integration Points

- Timesheet CSV/Excel export
- Project report PDF export
- Sprint report export
- Analytics dashboard export

---

## 15. Development Sequence

### 15.1 Phase 0 — Foundation (Current)

**Goal:** Freeze architecture, clean codebase, prepare for feature development.

| Step | Task | Status |
|---|---|---|
| 0.1 | Document product architecture | ✓ This document |
| 0.2 | Refactor navigation config | ✓ Done |
| 0.3 | Refactor router | ✓ Done |
| 0.4 | Create workspace placeholder | ✓ Done |
| 0.5 | Add missing module placeholders | ✓ Done |
| 0.6 | Clean up planning module references | Pending |
| 0.7 | Create WorkspaceLayout | Pending |
| 0.8 | Create workspace navigation config | Pending |
| 0.9 | Refactor Zustand stores | Pending |
| 0.10 | Update permission types | Pending |

### 15.2 Phase 1 — Core Modules

**Goal:** Build the primary business modules.

| Step | Task | Depends On |
|---|---|---|
| 1.1 | Dashboard (real data) | 0.x |
| 1.2 | Projects list (real data) | 0.x |
| 1.3 | Project workspace shell | 0.x |
| 1.4 | Sub Projects CRUD | 1.3 |
| 1.5 | Teams (project-scoped) | 1.3 |
| 1.6 | Employee directory | 0.x |
| 1.7 | Timesheet entry | 0.x |

### 15.3 Phase 2 — Planning Modules

**Goal:** Build the sprint planning and board features inside workspace.

| Step | Task | Depends On |
|---|---|---|
| 2.1 | Sprint Planning | 1.4 |
| 2.2 | Backlog management | 2.1 |
| 2.3 | Board (Kanban) | 2.1 |
| 2.4 | Story CRUD | 2.2 |
| 2.5 | Bug tracking | 2.2 |
| 2.6 | Epic management | 2.2 |
| 2.7 | Release management | 2.2 |

### 15.4 Phase 3 — Supporting Modules

**Goal:** Complete the remaining global modules.

| Step | Task | Depends On |
|---|---|---|
| 3.1 | Reports & Analytics | 1.x |
| 3.2 | Survey Management | 0.x |
| 3.3 | Documents | 0.x |
| 3.4 | Notifications | 0.x |
| 3.5 | Administration | 0.x |
| 3.6 | Settings | 0.x |

### 15.5 Phase 4 — Intelligence

**Goal:** Build AI Workspace.

| Step | Task | Depends On |
|---|---|---|
| 4.1 | AI Agents | 0.x |
| 4.2 | Prompt Library | 4.1 |
| 4.3 | Knowledge Base | 4.1 |
| 4.4 | Usage tracking | 4.1 |
| 4.5 | History | 4.1 |

### 15.6 Phase 5 — Polish

**Goal:** Production readiness.

| Step | Task | Depends On |
|---|---|---|
| 5.1 | Permission enforcement | All |
| 5.2 | API integration | All |
| 5.3 | Realtime | All |
| 5.4 | Performance optimization | All |
| 5.5 | Accessibility audit | All |
| 5.6 | Mobile responsiveness audit | All |

---

## Appendix A: Current File Inventory

### Files to Keep (67 shared components + 8 types + 4 lib + 7 config + 3 store + 14 services)

All `components/ui/*`, `components/common/*`, `components/feedback/*`, `components/forms/*`, `components/tables/*`, `components/navigation/*`, `components/layout/*`, `components/charts/*`.

### Files to Migrate

| From | To | Action |
|---|---|---|
| `features/planning/*` | `features/workspace/*` | Deprecate, rebuild |
| `features/projects/project-detail-page.tsx` | `features/workspace/pages/` | Replace with workspace |
| `features/projects/components/*` | Split: `projects/` + `workspace/` | Refactor |
| `features/placeholder/modules.tsx` | Individual feature modules | Delete |

### Files to Create

| File | Purpose |
|---|---|
| `app/layouts/workspace-layout.tsx` | Level 2 workspace shell |
| `config/workspace-navigation.ts` | Workspace sidebar config |
| `store/navigation.ts` | Sidebar state (extracted from dashboard-layout) |
| `store/workspace.ts` | Project context state |
| `types/workspace.ts` | Workspace-specific types |
| `features/workspace/**` | All workspace pages and components |

---

*End of Phase 0 documentation. Awaiting approval before proceeding to implementation.*
