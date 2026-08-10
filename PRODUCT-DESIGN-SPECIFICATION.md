# MyTracker v2 — Product Design Specification

> Status: DRAFT — Awaiting Approval
> Version: 1.0
> Date: 2026-08-04

---

## 1. Product Overview

### 1.1 Product Vision

MyTracker is an **Enterprise Delivery Platform** that unifies project management, time tracking, team organization, and AI-powered tooling into a single cohesive product. It serves as the operational backbone for delivery organizations — replacing the fragmented stack of Jira + Clockify + Notion + spreadsheet reports with one integrated system.

MyTracker is not a Jira clone. It is a multi-module platform where each business domain (projects, people, time, intelligence) is an independent, self-contained module that shares a unified design system, navigation architecture, and permission model.

### 1.2 Product Goals

| Goal | Description |
|---|---|
| **Modularity** | Each business module is independently developed, tested, and deployed |
| **Scalability** | Architecture supports adding new modules without modifying existing ones |
| **Discoverability** | Users find what they need in ≤ 3 clicks from any screen |
| **Consistency** | Every screen follows the same page template, spacing, and interaction patterns |
| **Performance** | Page transitions < 200ms, initial load < 2s, no unnecessary re-renders |
| **Accessibility** | WCAG 2.1 AA compliance across all screens |

### 1.3 Target Users

| User Type | Description |
|---|---|
| **Delivery Managers** | Oversee multiple projects, track health, manage capacity |
| **Project Managers** | Own single projects, plan sprints, manage backlogs |
| **Team Leads** | Manage team allocation, review work, approve timesheets |
| **Developers** | Execute stories, log time, update board status |
| **QA Engineers** | Test deliverables, report bugs, verify fixes |
| **Business Analysts** | Gather requirements, write stories, manage epics |
| **HR Administrators** | Manage employees, teams, departments, roles |
| **Finance Teams** | Track billable hours, approve timesheets, view reports |
| **Executives** | View dashboards, analytics, organizational health |

### 1.4 Personas

**Priya — Delivery Manager**
- Manages 5+ projects simultaneously
- Needs: Cross-project health view, timesheet approvals, resource allocation
- Pain: Switching between Jira, Excel, and Clockify
- Goal: Single dashboard showing all project health, team utilization, and delivery velocity

**Rahul — Project Manager**
- Owns 2 projects, each with 3-4 sub projects
- Needs: Sprint planning, backlog management, board view, release tracking
- Pain: Manual sprint capacity calculations, scattered reports
- Goal: One workspace per project with everything scoped

**Anita — Developer**
- Works on 1-2 sub projects at a time
- Needs: Board view, story details, time logging, sprint context
- Pain: Too many tools, unclear priorities
- Goal: Clean board view with clear next task, easy time entry

**Vikram — HR Admin**
- Manages 200+ employees across departments
- Needs: Employee directory, team management, role assignment
- Pain: No centralized people directory
- Goal: One place to manage all organizational structure

### 1.5 Primary Use Cases

| # | Use Case | Persona | Frequency |
|---|---|---|---|
| 1 | View project health dashboard | Delivery Manager | Daily |
| 2 | Create and plan a sprint | Project Manager | Bi-weekly |
| 3 | Move story across board columns | Developer | Daily |
| 4 | Log time against a story | Developer | Daily |
| 5 | Approve team timesheets | Team Lead | Weekly |
| 6 | Create a new project | Project Manager | Monthly |
| 7 | Add employee to organization | HR Admin | Weekly |
| 8 | Generate delivery report | Delivery Manager | Weekly |
| 9 | Report a bug | QA Engineer | Daily |
| 10 | View organizational analytics | Executive | Weekly |

### 1.6 User Journey

```
Login (Email → OTP)
    ↓
Dashboard (Welcome, metrics, recent activity)
    ↓
Navigate to module (sidebar)
    ↓
For Project Manager:
    Projects → Select Project → Workspace
        → Sprint Planning → Create Sprint
        → Backlog → Groom Stories
        → Board → Move Cards
        → Reports → View Velocity
    ↓
For Developer:
    Board → Pick Story → Update Status
    Timesheet → Log Hours
    ↓
For HR:
    Employees → Add/Manage
    Teams → Compose
    Departments → Structure
```

---

## 2. Product Information Architecture

### 2.1 Full Hierarchy

```
MyTracker
│
├── Dashboard                             Global overview
│
├── Project Management                    Project lifecycle
│   ├── Projects                          Project list + CRUD
│   └── Project Workspace                 Per-project (Level 2)
│       ├── Overview                      Health, summary, activity
│       ├── Sub Projects                  Child project breakdown
│       ├── Teams                         Project team composition
│       ├── Sprint Planning               Sprint creation + planning
│       ├── Board                         Kanban board (active sprint)
│       ├── Reports                       Project analytics
│       ├── Files                         Project documents
│       └── Settings                      Project configuration
│
├── User & Organization                   People structure
│   ├── Employees                         Directory + profiles
│   ├── Teams                             Team composition
│   ├── Departments                       Org units
│   ├── Roles                             Role definitions
│   └── Permissions                       Access control
│
├── Timesheet Management                  Time tracking
│   ├── My Timesheet                      Individual entry
│   ├── Team Timesheets                   Manager view
│   ├── Approvals                         Approval workflow
│   ├── Calendar                          Calendar view
│   └── Reports                           Time analytics
│
├── AI Workspace                          AI tooling
│   ├── Agents                            Agent config
│   ├── Usage                             Token tracking
│   ├── Prompt Library                    Templates
│   ├── Knowledge Base                    RAG store
│   └── History                           Audit trail
│
├── Reports & Analytics                   Cross-module
├── Survey Management                     Feedback
├── Documents                             File storage
├── Notifications                         Activity feed
├── Administration                        System config
└── Settings                              Preferences
```

### 2.2 Module-to-Screen Mapping

| Module | Screens |
|---|---|
| Dashboard | Dashboard |
| Project Management | Projects List, Projects New, Workspace (8 sub-screens) |
| User & Organization | Employees, Teams, Departments, Roles, Permissions |
| Timesheet Management | My Timesheet, Team Timesheets, Approvals, Calendar, Reports |
| AI Workspace | Agents, Usage, Prompts, Knowledge, History |
| Reports & Analytics | Reports Dashboard |
| Survey Management | Survey List, Survey Builder, Responses |
| Documents | Document List, Folder View |
| Notifications | Notification Feed, Preferences |
| Administration | System Settings, Billing, Audit Log |
| Settings | Workspace Settings, Profile, Integrations |

---

## 3. Navigation

### 3.1 Global Sidebar

The global sidebar is the primary navigation surface. It is always present on desktop and slides in on mobile.

**Structure:**
```
Brand (logo + name + org)
│
├── Overview (non-collapsible)
│   └── Dashboard
│
├── Project Management (collapsible)
│   └── Projects
│
├── User & Organization (collapsible)
│   ├── Employees
│   ├── Teams
│   ├── Departments
│   ├── Roles
│   └── Permissions
│
├── Timesheet Management (collapsible)
│   ├── My Timesheet
│   ├── Team Timesheets
│   ├── Approvals
│   ├── Calendar
│   └── Reports
│
├── AI Workspace (collapsible)
│   ├── Agents
│   ├── Usage
│   ├── Prompt Library
│   ├── Knowledge Base
│   └── History
│
├── Workspace (collapsible)
│   ├── Reports & Analytics
│   ├── Survey
│   ├── Documents
│   └── Notifications
│
└── System (non-collapsible)
    ├── Administration
    ├── Settings
    └── Profile
```

**States:**

| State | Width | Behavior |
|---|---|---|
| Expanded | 272px | Full labels, icons, group headers, chevron toggles |
| Collapsed | 76px | Icons only, tooltips on hover, no group labels |
| Mobile | 272px | Sheet from left, backdrop overlay, closes on nav |

**Active State:**
- Exact match when `end: true` (e.g., `/dashboard`)
- Prefix match when `end: false` (e.g., `/projects` matches `/projects/new`)
- Active item: `bg-sidebar-accent text-sidebar-accent-foreground`
- Inactive item: `text-sidebar-muted hover:bg-sidebar-accent/60`

**Collapsed State Persistence:** `localStorage` key `mytracker.sidebar` with values `collapsed` or `expanded`.

### 3.2 Workspace Navigation

When inside a project workspace (`/projects/:projectId/*`), the global sidebar is replaced by the workspace sidebar.

**Structure:**
```
← Back to Projects              Link to /projects
│
Project Name                    Current project context
│
├── Overview                    /projects/:id/overview
├── Sub Projects                /projects/:id/sub-projects
├── Teams                       /projects/:id/teams
├── Sprint Planning             /projects/:id/sprint-planning
├── Board                       /projects/:id/board
├── Reports                     /projects/:id/reports
├── Files                       /projects/:id/files
└── Settings                    /projects/:id/settings
```

**Width:** 240px (narrower than global sidebar — workspace has fewer items).

**Behavior:**
- Replaces the global sidebar visually (both cannot be visible simultaneously)
- The Header changes to show project context
- Active state follows the same rules as global sidebar
- No collapse toggle — workspace sidebar is always expanded

### 3.3 Breadcrumbs

Breadcrumbs appear in `PageHeader` above the page title.

**Rules:**
1. Always start with "Home" (links to `/dashboard`)
2. Last segment is never linked (current page)
3. Intermediate segments are linked
4. Segments derive from the route hierarchy

**Examples:**
```
Home > Dashboard
Home > Projects > My Project > Board
Home > Timesheets > My Timesheet
Home > User & Organization > Employees
Home > Projects > My Project > Sprint Planning > Sprint 12
```

**Component:** `Breadcrumb` in `components/navigation/breadcrumb.tsx`

### 3.4 Back Navigation

| Context | Back Target |
|---|---|
| `/projects/:id/board` | `/projects/:id` |
| `/projects/:id` | `/projects` |
| `/timesheets/my` | `/dashboard` |
| `/settings/profile` | `/settings` |
| Any sub-page | Parent route |

### 3.5 Context Navigation

The Header provides contextual navigation:
- **Global:** Brand logo → `/dashboard`, search (Cmd+K), notifications bell, quick-create, user menu
- **Workspace:** Project name badge, back arrow, search, notifications, quick-create, user menu

### 3.6 Mobile Navigation

- Global sidebar: Sheet from left, hamburger trigger in Header
- Workspace sidebar: Same Sheet pattern, different content
- Header: Fixed top, 72px height, hamburger + brand + notifications
- No bottom tab bar — this is an enterprise tool

### 3.7 Navigation States

| State | Storage | Mechanism |
|---|---|---|
| Sidebar collapsed | localStorage | `mytracker.sidebar` |
| Mobile sidebar open | React state | Component-local |
| Active route | React Router | `useLocation().pathname` |
| Command palette | Zustand | `useCommandPalette` |
| Current project | URL params | `:projectId` |
| Workspace context | Zustand | `useWorkspaceStore` |

### 3.8 Navigation Permissions

Each `NavItem` can accept an optional `permission: PermissionKey` field. Items are hidden when the user lacks the required permission.

```
NavItem {
  label: string
  to: string
  icon: LucideIcon
  badge?: number
  disabled?: boolean
  end?: boolean
  permission?: PermissionKey     // ← new field
}
```

Sidebar rendering checks `hasPermission(userPermissions, item.permission)` before rendering each item.

---

## 4. Project Workspace

### 4.1 Workspace Hierarchy

```
Project
  ├── Overview
  ├── Sub Projects
  │     ├── Backlog
  │     ├── Sprints
  │     ├── Board
  │     ├── Releases
  │     ├── Stories
  │     ├── Epics
  │     └── Bugs
  ├── Teams
  ├── Sprint Planning
  ├── Board
  ├── Reports
  ├── Files
  └── Settings
```

### 4.2 Workspace Responsibilities

The workspace is a self-contained shell for a single project. It:

1. Reads `projectId` from URL params
2. Fetches project metadata (name, status, members)
3. Provides project context to all child routes
4. Renders its own sidebar and header
5. Never accesses organization-wide state directly

### 4.3 Workspace Navigation

The workspace sidebar shows project-scoped modules only. It does NOT show:
- Dashboard
- Employees
- Departments
- Timesheets
- AI Workspace
- Any organization-level module

### 4.4 Workspace Layout

```
┌──────────────────────────────────────────────────────────┐
│ WorkspaceSidebar (240px)  │  WorkspaceHeader              │
│                          │───────────────────────────────│
│  ← Back to Projects      │  breadcrumb                   │
│                          │                               │
│  Project Name            │  Content                      │
│                          │                               │
│  □ Overview              │                               │
│  □ Sub Projects          │                               │
│  □ Teams                 │                               │
│  □ Sprint Planning       │                               │
│  □ Board                 │                               │
│  □ Reports               │                               │
│  □ Files                 │                               │
│  □ Settings              │                               │
└──────────────────────────────────────────────────────────┘
```

### 4.5 Workspace Context

The workspace context is stored in `useWorkspaceStore`:

```typescript
interface WorkspaceContext {
  projectId: string
  projectName: string
  projectKey: string
  subProjectId?: string
  sprintId?: string
}
```

This context is populated when `WorkspaceLayout` mounts and cleared when the user leaves the workspace.

---

## 5. Design System

### 5.1 Typography

**Font Family:**
- Primary: Geist Variable, Inter Variable, system sans-serif
- Monospace: Geist Mono Variable, SF Mono, monospace

**Type Scale:**

| Token | Size | Line Height | Weight | Usage |
|---|---|---|---|---|
| h1 | 40px | 48px | 600 | Page titles (rare) |
| h2 | 32px | 40px | 600 | Section headers |
| h3 | 24px | 32px | 600 | Card titles, major headings |
| h4 | 20px | 28px | 600 | Sub-section headers |
| body | 16px | 24px | 400 | Default body text |
| caption | 14px | 20px | 400 | Secondary text, descriptions |
| label | 12px | 16px | 500 | Labels, badges, nav items |
| small | 11px | 16px | 400 | Timestamps, fine print |

**Page Title:** `text-xl font-semibold` on mobile, `text-[26px] leading-8 font-semibold` on sm+.

### 5.2 Spacing

8-point spacing scale:

| Token | Value | Usage |
|---|---|---|
| 0 | 0px | — |
| 1 | 4px | Tight gaps (icon-text) |
| 2 | 8px | Small gaps |
| 3 | 12px | Default inner padding |
| 4 | 16px | Standard gaps |
| 5 | 20px | Medium gaps |
| 6 | 24px | Section gaps, card padding |
| 8 | 32px | Large gaps |
| 10 | 40px | Section separators |
| 12 | 48px | Major spacing |
| 16 | 64px | Page-level spacing |

**Page padding:** `px-4 py-6` mobile, `lg:px-6 lg:py-8` desktop.

**Content max-width:** 1600px.

### 5.3 Grid

- **Dashboard:** `grid-cols-1 sm:grid-cols-2 xl:grid-cols-4` for metric cards
- **Dashboard charts:** `grid-cols-1 2xl:grid-cols-3`
- **Table pages:** Full width, no grid constraint
- **Card layouts:** `grid-cols-1 gap-4 lg:grid-cols-3`
- **Form layouts:** `grid-cols-1 gap-4 sm:grid-cols-2`

### 5.4 Cards

- Border radius: `rounded-2xl` (16px)
- Border: `border border-border`
- Background: `bg-surface`
- Shadow: `shadow-xs`
- Padding: `p-5` (metric cards), `p-6` (content cards)
- Hover: No hover effect on static cards. Interactive cards get `hover:shadow-md` transition.

### 5.5 Tables

- Component: `DataTable` wrapping TanStack Table
- Border: `border border-border rounded-2xl`
- Header: `bg-surface-muted text-[13px] font-medium text-muted-foreground`
- Row: `border-b border-border last:border-0`
- Row hover: `hover:bg-surface-muted/60`
- Row click: `cursor-pointer` with `onRowClick` handler
- Cell padding: `px-4 py-3`
- Cell text: `text-[13px]`
- Selection: Checkbox column, sticky header
- Pagination: 10 rows default, selectable
- Empty state: Icon + title + description + action button
- Loading state: Skeleton rows

### 5.6 Buttons

| Variant | Usage | Style |
|---|---|---|
| Default | Primary actions | `bg-primary text-primary-foreground` |
| Destructive | Dangerous actions | `bg-danger text-white` |
| Outline | Secondary actions | `border border-border bg-surface` |
| Secondary | Tertiary actions | `bg-secondary text-secondary-foreground` |
| Ghost | Minimal actions | `hover:bg-surface-muted` |
| Link | Inline links | `text-brand-600 underline` |

| Size | Height | Padding | Font |
|---|---|---|---|
| Default | 40px | `px-4 py-2` | 13px |
| Sm | 32px | `px-3 py-1.5` | 13px |
| Lg | 48px | `px-6 py-3` | 14px |
| Icon-sm | 32px | — | — |
| Icon | 40px | — | — |

Border radius: `rounded-xl` (12px).

### 5.7 Forms

- Input height: 36px (`h-9`)
- Input border: `border border-input`
- Input radius: `rounded-xl`
- Input padding: `px-3`
- Input font: `text-[13px]`
- Focus: `outline-2 outline-ring`
- Label: `text-[13px] font-medium text-foreground`
- Helper text: `text-[12px] text-muted-foreground`
- Error: `text-[12px] text-danger`
- Required indicator: Red asterisk
- Field gap: `gap-2` (vertical)
- Form gap: `gap-4` (between fields)
- Form layout: Single column mobile, 2 columns desktop for complex forms

### 5.8 Badges

| Variant | Usage | Style |
|---|---|---|
| Default | General | `bg-secondary text-secondary-foreground` |
| Primary | Emphasis | `bg-primary-soft text-brand-700` |
| Success | Positive | `bg-success-soft text-success-foreground` |
| Warning | Caution | `bg-warning-soft text-warning-foreground` |
| Danger | Negative | `bg-danger-soft text-danger-foreground` |
| Info | Informational | `bg-info-soft text-info-foreground` |
| Neutral | Subtle | `bg-surface-muted text-muted-foreground` |

Border radius: `rounded-full`.
Font: `text-[11px] font-medium`.
Padding: `px-1.5 py-0.5` (inline), `px-2.5 py-1` (standalone).

### 5.9 Status

Status badges use a dot indicator:

| Status | Tone | Dot Color |
|---|---|---|
| Active / Done / Healthy | success | Green |
| In Progress / On Track | info | Blue |
| In Review / QA / Warning | warning | Yellow |
| Critical / Blocked / Error | danger | Red |
| Planned / Todo / Neutral | neutral | Gray |

### 5.10 Priority

| Priority | Badge Variant | Label |
|---|---|---|
| Highest | danger | Highest |
| High | warning | High |
| Medium | info | Medium |
| Low | neutral | Low |
| Lowest | surface | Lowest |

### 5.11 Drawers

- Width: 480px (default), 640px (large)
- Position: Right side
- Border radius: `rounded-l-2xl`
- Overlay: `bg-black/40`
- Close: X button top-right, click overlay, Escape key
- Animation: Slide from right, 220ms ease-out
- Content: Scrollable, padded `p-6`

### 5.12 Dialogs

- Width: 480px (default), 640px (large)
- Border radius: `rounded-2xl`
- Overlay: `bg-black/40`
- Close: X button, click overlay, Escape key
- Animation: Fade + scale, 220ms ease-out
- Content: Padded `p-6`
- Actions: Right-aligned, Cancel + Confirm buttons

### 5.13 Motion

| Token | Duration | Usage |
|---|---|---|
| fast | 180ms | Hover states, color transitions |
| base | 220ms | Panel open/close, drawer slide |
| slow | 320ms | Complex animations, page transitions |

Easing: `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out) for all transitions.

### 5.14 Elevation

| Level | Shadow | Usage |
|---|---|---|
| xs | `0 1px 2px rgb(17 24 39 / 0.04)` | Cards at rest |
| sm | `0 1px 2px ... 0 1px 3px ...` | Cards with subtle lift |
| md | `0 2px 4px ... 0 4px 12px ...` | Dropdowns, popovers |
| lg | `0 4px 8px ... 0 8px 24px ...` | Dialogs, sheets |
| xl | `0 8px 16px ... 0 16px 40px ...` | Modals, overlays |

### 5.15 Color Usage

| Color | Usage |
|---|---|
| `--primary` (#f97316) | Primary buttons, active sidebar item, brand accent |
| `--primary-soft` | Primary badge backgrounds, selection highlights |
| `--success` | Positive status, completion indicators |
| `--warning` | Caution status, pending indicators |
| `--danger` | Destructive actions, error states, critical status |
| `--info` | Informational status, links |
| `--muted-foreground` | Secondary text, descriptions, timestamps |
| `--border` | Card borders, table rows, separators |
| `--border-strong` | Input borders, emphasis borders |
| `--surface` | Card backgrounds, input backgrounds |
| `--surface-muted` | Table header, hover states, subtle backgrounds |
| `--background` | Page background |

### 5.16 Responsive Rules

| Breakpoint | Sidebar | Header | Content | Grid |
|---|---|---|---|---|
| < 640px (sm) | Hidden | Compact | Full width, px-4 | 1 col |
| 640-1024px (md) | Hidden | Full | Full width, px-4 | 2 col |
| >= 1024px (lg) | Visible | Full | Max 1600px, px-6 | 3-4 col |
| >= 1280px (xl) | Visible | Full | Max 1600px, px-6 | 4 col |
| >= 1536px (2xl) | Visible | Full | Max 1600px, px-6 | 4 col + sidebar |

### 5.17 Accessibility Rules

1. All interactive elements must have visible focus indicators
2. All images must have alt text
3. All form fields must have labels
4. Color contrast ratio >= 4.5:1 for text
5. All modals must trap focus
6. All navigation must be keyboard accessible
7. ARIA labels on icon-only buttons
8. `aria-current="page"` on active nav items
9. Live regions for dynamic content updates
10. Skip navigation link for keyboard users

---

## 6. Page Template

Every screen in the application follows the same page template.

### 6.1 Template Structure

```
PageLayout
├── Header
│   ├── Breadcrumb
│   ├── Title
│   ├── Description
│   └── Actions (primary + secondary)
│
├── Filters (optional)
│   └── Filter bar with dropdowns, date pickers, search
│
├── Content
│   ├── Primary content area (flex-1)
│   └── Sidebar (optional, 320px, xl+)
│
└── Footer (optional)
    └── Pagination, summary, or bulk actions
```

### 6.2 Header

- **Breadcrumb:** Above title, `text-[13px]`
- **Title:** `text-xl font-semibold` (mobile), `text-[26px] leading-8 font-semibold` (sm+)
- **Description:** `text-sm text-muted-foreground`, max-width `max-w-2xl`
- **Actions:** Right-aligned, flex-wrap with gap-2
- **Eyebrow:** Optional label above title (e.g., project key, status badge)

### 6.3 Primary Action

- One primary action per page (e.g., "New Project", "Create Sprint")
- Rendered as `<Button>` in the actions area
- Uses default variant (filled, brand color)
- Always paired with a `+` icon when creating

### 6.4 Secondary Actions

- Outline or ghost variant buttons
- Placed after the primary action
- Examples: "Export", "Filter", "Settings"

### 6.5 Filters

- Rendered in a rounded card: `rounded-2xl border border-border bg-surface p-3`
- Horizontal layout with flex-wrap
- Each filter: label + select/input
- "Clear filters" button appears when any filter is active
- Filters reset pagination to page 1

### 6.6 Content

- Default: Single column, full width
- With sidebar: Flex row on xl+, sidebar `w-80` on right
- Wide mode: Full width, no max-width constraint

### 6.7 Pagination

- Component: `Pagination` from `components/ui/pagination`
- Position: Below table or at page footer
- Shows: Page X of Y, per-page selector, page numbers
- Default: 10 rows per page

### 6.8 Drawer

- Used for: Create/edit forms, detail views
- Opens from right side
- Contains form with Save/Cancel actions
- Closes on successful save with toast notification

### 6.9 Dialogs

- Used for: Confirmations, warnings, irreversible actions
- Always has title, description, cancel button, confirm button
- Destructive dialogs use red confirm button
- Loading state on confirm button during async operations

---

## 7. Component Architecture

### 7.1 Component Tiers

```
Tier 1: Design System Components
    components/ui/*
    Primitives, unstyled, Radix-based
    
Tier 2: Shared Application Components
    components/common/*
    Reusable across all features
    
Tier 3: Layout Components
    components/layout/*
    Application shell (sidebar, header)
    
Tier 4: Navigation Components
    components/navigation/*
    Breadcrumbs, sidebar nav, keyboard shortcuts
    
Tier 5: Feature Components
    features/*/components/*
    Module-specific, not shared
    
Tier 6: Workspace Components
    features/workspace/components/*
    Project-scoped components
```

### 7.2 Import Rules

```
Tier 1 ← Can be imported by any tier
Tier 2 ← Can be imported by Tier 3-6
Tier 3 ← Only used by layouts
Tier 4 ← Only used by layouts
Tier 5 ← Cannot import from other Tier 5 (cross-feature)
Tier 6 ← Cannot import from other Tier 6 (cross-workspace)
```

### 7.3 Design System Components (Tier 1)

30 primitives in `components/ui/`:

```
accordion, alert-dialog, alert, avatar, badge, banner,
button, card, checkbox, collapsible, command, dialog,
dropdown-menu, input, label, multi-select, pagination,
popover, progress, radio-group, scroll-area, select,
separator, sheet, skeleton, sonner, switch, table,
tabs, textarea, tooltip
```

### 7.4 Shared Application Components (Tier 2)

17 components in `components/common/`:

```
command-palette      confirm-dialog      drawer
metric-card          modal               month-calendar
notifications-drawer page-header         page-layout
priority-badge       quick-create        search-box
stat-card            status-badge        tag
user-avatar          user-chip
```

### 7.5 Layout Components (Tier 3)

```
header              Top bar (search, notifications, user menu)
sidebar             Global sidebar (brand, nav, footer, collapse)
```

### 7.6 Navigation Components (Tier 4)

```
breadcrumb          Breadcrumb navigation
kbd                 Keyboard shortcut badge
sidebar-nav         NavGroup / NavItem rendering
```

### 7.7 Feature Components (Tier 5)

Each feature module owns its components:

```
features/projects/components/
features/workspace/components/
features/organization/components/
features/timesheets/components/
features/ai-workspace/components/
features/reports/components/
features/survey/components/
features/documents/components/
features/notifications/components/
features/admin/components/
features/settings/components/
```

### 7.8 Reusable Component Patterns

| Pattern | Component | Usage |
|---|---|---|
| Data display | `DataTable` | Any list/table view |
| Card layout | `Card` + `CardContent` | Summary cards, info panels |
| Form layout | `PageLayout` + form fields | Create/edit screens |
| Detail drawer | `Drawer` + form | Quick edit without page navigation |
| Confirm action | `ConfirmDialog` | Delete, archive, destructive |
| Empty state | `EmptyState` | No data yet |
| Error state | `ErrorState` | Load failure with retry |
| Loading state | `Skeleton` | Content loading |

---

## 8. Data Architecture

### 8.1 Layer Overview

```
UI Layer (Components)
    ↓ uses
Hooks Layer (Custom hooks)
    ↓ uses
Services Layer (API calls)
    ↓ uses
Types Layer (TypeScript types)
    ↑ uses
Mock Layer (Development data)
```

### 8.2 Repositories

Each feature module defines a repository pattern:

```
features/<module>/
├── services/
│   ├── <module>.ts          Service functions (API calls)
│   └── <module>-queries.ts  TanStack Query hooks
```

### 8.3 Hooks

| Hook | Purpose | Scope |
|---|---|---|
| `useProjects(filters)` | Fetch project list | Global |
| `useProjectDetail(id)` | Fetch single project | Global |
| `useProjectMutations()` | Create/update/delete project | Global |
| `useSprintMutations()` | Sprint CRUD | Workspace |
| `useStoryMutations()` | Story CRUD | Workspace |
| `useBugMutations()` | Bug CRUD | Workspace |
| `usePlanningProjects()` | Projects for planning selector | Workspace |
| `usePlanningSprints(projectId)` | Sprints for selector | Workspace |
| `usePlanningUsers()` | Users for assignment | Workspace |
| `usePlanningEpics(projectId)` | Epics for selector | Workspace |
| `usePermissions()` | Current user permissions | Global |
| `useBreakpoint()` | Current responsive breakpoint | Global |

### 8.4 Services

| Service | File | Purpose |
|---|---|---|
| `http` | `services/http.ts` | HTTP client (fetch wrapper) |
| `auth` | `services/auth.ts` | Login, verify, session |
| `user` | `services/user.ts` | User CRUD |
| `project` | `services/project.ts` | Project CRUD |
| `story` | `services/story.ts` | Story CRUD |
| `bug` | `services/bug.ts` | Bug CRUD |
| `sprint` | `services/sprint.ts` | Sprint CRUD |
| `epic` | `services/epic.ts` | Epic CRUD |
| `release` | `services/release.ts` | Release CRUD |
| `dashboard` | `services/dashboard.ts` | Dashboard data |
| `notification` | `services/notification.ts` | Notifications |
| `mock-store` | `services/mock-store.ts` | In-memory mock data |

### 8.5 Stores

| Store | File | State |
|---|---|---|
| `useAuthStore` | `store/auth.ts` | Auth user, login/logout |
| `useCommandPalette` | `store/command-palette.ts` | Palette open/close |
| `useNavigationStore` | `store/navigation.ts` | Sidebar collapsed, mobile open |
| `useWorkspaceStore` | `store/workspace.ts` | Project context, sub project, sprint |

### 8.6 Types

| File | Contents |
|---|---|
| `types/index.ts` | User, Organization, Project, ProjectMember, Milestone, Release, Checklist, WeeklyStatus, Risk, Dependency |
| `types/agile.ts` | Sprint, Story, Bug, Epic, Subtask, StoryStatus, StoryPriority, BugWorkflowStatus |
| `types/api.ts` | API response wrappers, pagination |
| `types/auth.ts` | Auth session, OTP |
| `types/collaboration.ts` | Comment, Attachment |
| `types/permission.ts` | RoleKey, PermissionKey, Permission, Role |
| `types/planning.ts` | Issue, IssueType, Release, TimeLog (re-exports from agile) |
| `types/timesheet.ts` | TimeEntry, Timesheet |
| `types/workspace.ts` | WorkspaceContext, SubProject (new) |

### 8.7 Entities

| Entity | Key Fields | Relationships |
|---|---|---|
| User | id, name, email, roleId, department, status | belongs to Organization |
| Organization | id, name, plan, timezone | has many Users, Projects |
| Project | id, key, name, status, health, ownerId | belongs to Organization, has many SubProjects |
| SubProject | id, name, projectId | belongs to Project, has many Sprints, Stories, Bugs |
| Epic | id, key, name, projectId, subProjectId | belongs to SubProject |
| Story | id, key, title, status, priority, points, subProjectId | belongs to SubProject, has many Tasks, Bugs |
| Task | id, title, done, storyId | belongs to Story |
| Subtask | id, title, done, taskId | belongs to Task |
| Bug | id, key, title, severity, status, subProjectId | belongs to SubProject |
| Sprint | id, name, status, startDate, endDate, subProjectId | belongs to SubProject |
| Release | id, key, name, version, status, subProjectId | belongs to SubProject |
| TimeEntry | id, userId, entityType, entityId, hours, date | belongs to User |
| Team | id, name, memberIds | belongs to Organization |
| Department | id, name | belongs to Organization |
| Role | id, key, name, permissions | belongs to Organization |

### 8.8 Mock Data

Mock data lives in `mocks/data/` and provides realistic development data:

| File | Entities |
|---|---|
| `users.ts` | 15-20 sample users |
| `projects.ts` | 5-8 sample projects |
| `agile.ts` | Stories, bugs, epics |
| `sprints.ts` | Sprint data |
| `planning.ts` | Releases, time logs |
| `dashboard.ts` | Dashboard metrics, velocity |

### 8.9 API-Ready Structure

All services are structured for easy migration from mock to real API:

```typescript
// Current: Mock
export const projectService = {
  list: async (filters) => mockStore.getProjects(filters),
  get: async (id) => mockStore.getProject(id),
  create: async (input) => mockStore.createProject(input),
}

// Future: Real API
export const projectService = {
  list: async (filters) => http.get('/api/projects', { params: filters }),
  get: async (id) => http.get(`/api/projects/${id}`),
  create: async (input) => http.post('/api/projects', input),
}
```

---

## 9. Role System

### 9.1 Role Definitions

| Role | Key | Scope | Description |
|---|---|---|---|
| Super Admin | `super_admin` | System | Full system access |
| Organization Admin | `org_admin` | Organization | Manages org settings, users, billing |
| Project Manager | `project_manager` | Assigned projects | Plans sprints, manages backlogs |
| Business Analyst | `business_analyst` | Assigned projects | Writes stories, manages requirements |
| Developer | `developer` | Assigned projects | Executes stories, logs time |
| QA | `qa` | Assigned projects | Tests deliverables, reports bugs |
| HR | `hr` | Organization | Manages employees, teams, departments |
| Finance | `finance` | Organization | Views timesheets, tracks billing |
| Viewer | `viewer` | Read-only | Views dashboards, reports |

### 9.2 Navigation Access by Role

| Module | Super Admin | Org Admin | PM | BA | Dev | QA | HR | Finance | Viewer |
|---|---|---|---|---|---|---|---|---|---|
| Dashboard | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Projects | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ | ✓ |
| Employees | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ |
| Teams | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ |
| Departments | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✓ |
| Roles | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ |
| Permissions | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| My Timesheet | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Team Timesheets | ✓ | ✓ | ✓(team) | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ |
| Approvals | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ |
| AI Workspace | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Reports | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Survey | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✓ |
| Documents | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Notifications | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ |
| Administration | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Settings | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓(partial) | ✗ | ✗ |

### 9.3 Feature Access by Role

| Feature | Super Admin | Org Admin | PM | BA | Dev | QA | HR | Finance | Viewer |
|---|---|---|---|---|---|---|---|---|---|
| Create project | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Edit project | ✓ | ✓ | ✓(own) | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Delete project | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Manage sub projects | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Sprint planning | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Board (view) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✓ |
| Board (move cards) | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Create story | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ |
| Edit story | ✓ | ✓ | ✓ | ✓ | ✓(own) | ✗ | ✗ | ✗ | ✗ |
| Create bug | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Log time | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Approve timesheet | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ |
| Manage employees | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ |
| Manage roles | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ |
| System settings | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |

### 9.4 Permission Implementation

1. **Auth store** holds `userPermissions: PermissionKey[]`
2. **`hasPermission(userPermissions, required)`** checks access
3. **Sidebar** filters items by `permission` field
4. **Route guards** check `PermissionKey` before rendering
5. **Components** check permissions for action buttons
6. **`admin.all`** bypasses all checks (super admin)

---

## 10. Project Structure

### 10.1 Complete Folder Structure

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
│   ├── ui/                         (30 primitives)
│   ├── common/                     (17 shared)
│   ├── layout/                     (2: header, sidebar)
│   ├── navigation/                 (3: breadcrumb, kbd, sidebar-nav)
│   ├── feedback/                   (3: empty, error, loading)
│   ├── forms/                      (11 field components)
│   ├── tables/                     (1: data-table)
│   └── charts/                     (1: chart-card)
│
├── config/
│   ├── navigation.ts
│   ├── workspace-navigation.ts
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
│   │   ├── pages/
│   │   │   ├── login-page.tsx
│   │   │   ├── verify-page.tsx
│   │   │   └── session-page.tsx
│   │   └── services/
│   │
│   ├── dashboard/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   │   └── dashboard-page.tsx
│   │   └── services/
│   │
│   ├── projects/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   │   ├── projects-list-page.tsx
│   │   │   └── projects-new-page.tsx
│   │   ├── services/
│   │   └── types.ts
│   │
│   ├── workspace/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   │   ├── workspace-overview-page.tsx
│   │   │   ├── sub-projects-page.tsx
│   │   │   ├── workspace-teams-page.tsx
│   │   │   ├── sprint-planning-page.tsx
│   │   │   ├── board-page.tsx
│   │   │   ├── workspace-reports-page.tsx
│   │   │   ├── workspace-files-page.tsx
│   │   │   └── workspace-settings-page.tsx
│   │   ├── services/
│   │   └── types.ts
│   │
│   ├── organization/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   │   ├── employees-page.tsx
│   │   │   ├── teams-page.tsx
│   │   │   ├── departments-page.tsx
│   │   │   ├── roles-page.tsx
│   │   │   └── permissions-page.tsx
│   │   └── services/
│   │
│   ├── timesheets/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   │   ├── my-timesheet-page.tsx
│   │   │   ├── team-timesheets-page.tsx
│   │   │   ├── approvals-page.tsx
│   │   │   ├── calendar-page.tsx
│   │   │   └── timesheet-reports-page.tsx
│   │   └── services/
│   │
│   ├── ai-workspace/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   │   ├── agents-page.tsx
│   │   │   ├── usage-page.tsx
│   │   │   ├── prompts-page.tsx
│   │   │   ├── knowledge-page.tsx
│   │   │   └── history-page.tsx
│   │   └── services/
│   │
│   ├── reports/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   │   └── reports-analytics-page.tsx
│   │   └── services/
│   │
│   ├── survey/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   │   └── survey-management-page.tsx
│   │   └── services/
│   │
│   ├── documents/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   │   └── documents-page.tsx
│   │   └── services/
│   │
│   ├── notifications/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   │   └── notifications-page.tsx
│   │   └── services/
│   │
│   ├── admin/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   │   └── administration-page.tsx
│   │   └── services/
│   │
│   └── settings/
│       ├── components/
│       ├── hooks/
│       ├── pages/
│       │   ├── settings-page.tsx
│       │   └── profile-settings-page.tsx
│       └── services/
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
├── mocks/
│   └── data/
│       ├── agile.ts
│       ├── dashboard.ts
│       ├── index.ts
│       ├── planning.ts
│       ├── projects.ts
│       ├── sprints.ts
│       └── users.ts
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
├── types/
│   ├── index.ts
│   ├── agile.ts
│   ├── api.ts
│   ├── auth.ts
│   ├── collaboration.ts
│   ├── permission.ts
│   ├── planning.ts
│   ├── timesheet.ts
│   └── workspace.ts
│
└── main.tsx
```

---

## 11. Routes

### 11.1 Complete Route Tree

```
/                                           → redirect → /dashboard
/login                                      AuthLayout → LoginPage
/verify                                     AuthLayout → VerifyPage
/session                                    SessionPage

── Protected Routes ──────────────────────────────────────

/dashboard                                  DashboardLayout → DashboardPage

/projects                                   DashboardLayout → ProjectsListPage
/projects/new                               DashboardLayout → ProjectsNewPage

/projects/:projectId                        DashboardLayout → WorkspaceLayout → WorkspaceOverviewPage
/projects/:projectId/overview               WorkspaceLayout → WorkspaceOverviewPage
/projects/:projectId/sub-projects           WorkspaceLayout → SubProjectsPage
/projects/:projectId/teams                  WorkspaceLayout → WorkspaceTeamsPage
/projects/:projectId/sprint-planning        WorkspaceLayout → SprintPlanningPage
/projects/:projectId/board                  WorkspaceLayout → BoardPage
/projects/:projectId/reports                WorkspaceLayout → WorkspaceReportsPage
/projects/:projectId/files                  WorkspaceLayout → WorkspaceFilesPage
/projects/:projectId/settings               WorkspaceLayout → WorkspaceSettingsPage

/employees                                  DashboardLayout → EmployeesPage
/teams                                      DashboardLayout → TeamsPage
/departments                                DashboardLayout → DepartmentsPage
/roles                                      DashboardLayout → RolesPage
/permissions                                DashboardLayout → PermissionsPage

/timesheets/my                              DashboardLayout → MyTimesheetPage
/timesheets/team                            DashboardLayout → TeamTimesheetsPage
/timesheets/approvals                       DashboardLayout → TimesheetApprovalsPage
/timesheets/calendar                        DashboardLayout → TimesheetCalendarPage
/timesheets/reports                         DashboardLayout → TimesheetReportsPage

/ai/agents                                  DashboardLayout → AIAgentsPage
/ai/usage                                   DashboardLayout → AIUsagePage
/ai/prompts                                 DashboardLayout → AIPromptsPage
/ai/knowledge                               DashboardLayout → AIKnowledgePage
/ai/history                                 DashboardLayout → AIHistoryPage

/reports                                    DashboardLayout → ReportsAnalyticsPage
/survey                                     DashboardLayout → SurveyManagementPage
/documents                                  DashboardLayout → DocumentsPage
/notifications                              DashboardLayout → NotificationsPage

/admin                                      DashboardLayout → AdministrationPage
/settings                                   DashboardLayout → SettingsPage
/settings/profile                           DashboardLayout → ProfileSettingsPage

── Error Routes ──────────────────────────────────────────

*                                           NotFoundPage
```

### 11.2 Route Parameters

| Parameter | Type | Used In |
|---|---|---|
| `:projectId` | string (UUID) | `/projects/:projectId/*` |
| `:subProjectId` | string (UUID) | Future: `/projects/:projectId/sub-projects/:subProjectId/*` |
| `:sprintId` | string (UUID) | Future: query param or nested route |

---

## 12. Screen Inventory

### 12.1 Complete Screen List

| # | Module | Sub Module | Screen | Route | Purpose | Priority | Dependencies |
|---|---|---|---|---|---|---|---|
| 1 | Auth | — | Login | `/login` | Email entry | P0 | — |
| 2 | Auth | — | Verify | `/verify` | OTP verification | P0 | 1 |
| 3 | Auth | — | Session | `/session` | Session management | P0 | — |
| 4 | Dashboard | — | Dashboard | `/dashboard` | Global overview, metrics | P0 | — |
| 5 | Projects | — | Projects List | `/projects` | All projects table | P0 | — |
| 6 | Projects | — | Projects New | `/projects/new` | Create project | P0 | 5 |
| 7 | Workspace | Overview | Workspace Overview | `/projects/:id/overview` | Project health, summary | P1 | 5 |
| 8 | Workspace | Sub Projects | Sub Projects | `/projects/:id/sub-projects` | Child projects | P1 | 5 |
| 9 | Workspace | Teams | Workspace Teams | `/projects/:id/teams` | Project team | P1 | 5 |
| 10 | Workspace | Sprint Planning | Sprint Planning | `/projects/:id/sprint-planning` | Create/manage sprints | P1 | 8 |
| 11 | Workspace | Board | Board | `/projects/:id/board` | Kanban board | P1 | 10 |
| 12 | Workspace | Reports | Workspace Reports | `/projects/:id/reports` | Project analytics | P2 | 5 |
| 13 | Workspace | Files | Workspace Files | `/projects/:id/files` | Project files | P2 | 5 |
| 14 | Workspace | Settings | Workspace Settings | `/projects/:id/settings` | Project config | P2 | 5 |
| 15 | Organization | — | Employees | `/employees` | Employee directory | P1 | — |
| 16 | Organization | — | Teams | `/teams` | Team management | P1 | — |
| 17 | Organization | — | Departments | `/departments` | Department structure | P1 | — |
| 18 | Organization | — | Roles | `/roles` | Role definitions | P1 | — |
| 19 | Organization | — | Permissions | `/permissions` | Access control | P1 | 18 |
| 20 | Timesheets | My Timesheet | My Timesheet | `/timesheets/my` | Individual time entry | P1 | — |
| 21 | Timesheets | Team | Team Timesheets | `/timesheets/team` | Manager team view | P1 | 20 |
| 22 | Timesheets | Approvals | Approvals | `/timesheets/approvals` | Approval workflow | P1 | 21 |
| 23 | Timesheets | Calendar | Calendar | `/timesheets/calendar` | Calendar visualization | P2 | 20 |
| 24 | Timesheets | Reports | Timesheet Reports | `/timesheets/reports` | Time analytics | P2 | 20 |
| 25 | AI Workspace | Agents | Agents | `/ai/agents` | Agent configuration | P2 | — |
| 26 | AI Workspace | Usage | Usage | `/ai/usage` | Token tracking | P2 | — |
| 27 | AI Workspace | Prompts | Prompt Library | `/ai/prompts` | Prompt templates | P2 | — |
| 28 | AI Workspace | Knowledge | Knowledge Base | `/ai/knowledge` | RAG documents | P2 | — |
| 29 | AI Workspace | History | History | `/ai/history` | Interaction audit | P2 | — |
| 30 | Reports | — | Reports & Analytics | `/reports` | Cross-module analytics | P2 | — |
| 31 | Survey | — | Survey Management | `/survey` | Survey builder + responses | P2 | — |
| 32 | Documents | — | Documents | `/documents` | File storage | P2 | — |
| 33 | Notifications | — | Notifications | `/notifications` | Activity feed | P2 | — |
| 34 | Admin | — | Administration | `/admin` | System config | P2 | — |
| 35 | Settings | — | Settings | `/settings` | Workspace preferences | P1 | — |
| 36 | Settings | Profile | Profile | `/settings/profile` | User profile | P1 | — |
| 37 | — | — | Not Found | `*` | 404 page | P0 | — |

### 12.2 Priority Legend

| Priority | Description |
|---|---|
| P0 | Must have for launch — blocks everything |
| P1 | Core feature — needed for MVP |
| P2 | Important — can launch without, add in Phase 2 |

---

## 13. Implementation Order

### 13.1 Phase 0 — Foundation (Current)

```
0.1  Product Design Specification (this document)
0.2  Navigation refactor (done)
0.3  Router refactor (done)
0.4  Workspace placeholder (done)
0.5  Placeholder modules (done)
0.6  WorkspaceLayout creation
0.7  Workspace navigation config
0.8  Navigation store extraction
0.9  Workspace store creation
0.10 Permission type updates
```

### 13.2 Phase 1 — Core Modules

```
1.1  Dashboard (real data, metrics, charts)
1.2  Projects List (real data, filters, table)
1.3  Projects New (create form)
1.4  Workspace shell (layout + context)
1.5  Workspace Overview
1.6  Employees (directory, CRUD)
1.7  My Timesheet (entry grid)
1.8  Settings (workspace prefs)
1.9  Profile (user prefs)
```

### 13.3 Phase 2 — Planning Modules

```
2.1  Sub Projects (list + CRUD)
2.2  Workspace Teams (member management)
2.3  Sprint Planning (create/manage sprints)
2.4  Backlog (story list, grooming)
2.5  Board (kanban, drag-drop)
2.6  Story CRUD (create, edit, detail)
2.7  Bug tracking (create, edit, detail)
2.8  Epic management (create, edit)
2.9  Release management (create, edit)
```

### 13.4 Phase 3 — Supporting Modules

```
3.1  Team Timesheets (manager view)
3.2  Approvals (workflow)
3.3  Timesheet Calendar
3.4  Timesheet Reports
3.5  Reports & Analytics (cross-module)
3.6  Teams (global)
3.7  Departments
3.8  Roles
3.9  Permissions
3.10 Notifications
3.11 Documents
```

### 13.5 Phase 4 — Intelligence

```
4.1  AI Agents
4.2  Prompt Library
4.3  Knowledge Base
4.4  Usage Tracking
4.5  AI History
4.6  Survey Management
```

### 13.6 Phase 5 — Polish

```
5.1  Permission enforcement across all screens
5.2  API integration (replace mocks)
5.3  Realtime (WebSocket for board, notifications)
5.4  Performance optimization
5.5  Accessibility audit (WCAG 2.1 AA)
5.6  Mobile responsiveness audit
5.7  Loading state consistency
5.8  Error handling consistency
```

---

## 14. Definition of Done

Every screen must satisfy all criteria before considered complete.

### 14.1 Accessibility

- [ ] All interactive elements have visible focus indicators
- [ ] All images have meaningful alt text
- [ ] All form fields have associated labels
- [ ] Color contrast >= 4.5:1 for normal text
- [ ] Color contrast >= 3:1 for large text
- [ ] All modals trap focus correctly
- [ ] All navigation is keyboard accessible
- [ ] Icon-only buttons have `aria-label`
- [ ] Active nav item has `aria-current="page"`
- [ ] Dynamic content uses ARIA live regions

### 14.2 Responsive

- [ ] Works on 320px width (minimum)
- [ ] Works on 375px width (iPhone SE)
- [ ] Works on 768px width (iPad)
- [ ] Works on 1024px width (laptop)
- [ ] Works on 1440px width (desktop)
- [ ] Works on 1920px width (large desktop)
- [ ] Sidebar collapses on mobile
- [ ] Tables scroll horizontally on mobile
- [ ] Forms stack vertically on mobile
- [ ] No horizontal overflow at any breakpoint

### 14.3 Loading States

- [ ] Skeleton shown during data fetch
- [ ] Skeleton matches content layout
- [ ] Loading indicator on async actions (buttons)
- [ ] No layout shift when content loads
- [ ] Progressive loading for complex pages

### 14.4 Empty States

- [ ] Meaningful icon displayed
- [ ] Clear title explaining what goes here
- [ ] Helpful description guiding next action
- [ ] Action button when user can create something
- [ ] Different message for filtered vs unfiltered empty

### 14.5 Error States

- [ ] Error icon displayed
- [ ] Clear error message (not technical jargon)
- [ ] Retry button when error is recoverable
- [ ] Fallback UI when component fails
- [ ] Toast notification for action failures

### 14.6 Animations

- [ ] All transitions use design system duration tokens
- [ ] No animation longer than 320ms
- [ ] All transitions use ease-out easing
- [ ] Hover states on interactive elements (180ms)
- [ ] Panel/drawer open/close animations (220ms)
- [ ] No janky animations (60fps)
- [ ] Respect `prefers-reduced-motion`

### 14.7 Spacing

- [ ] Page padding follows responsive rules
- [ ] Section gaps use design system tokens
- [ ] Card padding consistent across screens
- [ ] Form field gaps consistent
- [ ] No custom spacing values

### 14.8 Design System

- [ ] Uses design system color tokens (no hardcoded colors)
- [ ] Uses design system typography scale
- [ ] Uses design system border radius
- [ ] Uses design system shadow scale
- [ ] Uses design system component variants
- [ ] No custom button styles
- [ ] No custom input styles
- [ ] No custom badge styles

### 14.9 Code Quality

- [ ] TypeScript strict mode — no `any` types
- [ ] No lint errors
- [ ] No console warnings
- [ ] All components have proper TypeScript interfaces
- [ ] All event handlers are properly typed
- [ ] No unused imports
- [ ] No unused variables
- [ ] Consistent file naming (kebab-case)
- [ ] Consistent component naming (PascalCase)

### 14.10 Performance

- [ ] No unnecessary re-renders (React DevTools verified)
- [ ] Memoization where needed (useMemo, useCallback)
- [ ] Lazy loading for route components
- [ ] Image optimization (WebP, lazy loading)
- [ ] No large bundle imports (check bundle analyzer)
- [ ] Virtual scrolling for large lists (> 100 items)

---

*End of Product Design Specification. Awaiting approval before proceeding to implementation.*
