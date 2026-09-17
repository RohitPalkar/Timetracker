import { ApiError } from '../../lib/errors.js'

// Simple aggregation — in real DB would read attendance/timers/timesheets/work
// For this slice, return deterministic mock scoped to auth context

function dayStart(offsetDays = 0): string {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toISOString().slice(0,10)
}

export async function getDashboard(auth: { user: { id: string; email: string }; organization: { id: string }; roles: string[]; permissions: string[] }) {
  // Permission gating — if dashboard.view not present and not admin.all, forbid
  const perms = auth.permissions
  if (!perms.includes('admin.all') && !perms.includes('dashboard.view')) {
    throw new ApiError('Forbidden', 403, 'FORBIDDEN')
  }

  const isSuper = perms.includes('admin.all') || auth.roles.includes('super_admin')
  const scope = isSuper ? 'organization' : auth.roles.includes('hr_admin') ? 'workforce' : auth.roles.includes('project_manager') ? 'portfolio' : auth.roles.includes('team_lead') ? 'team' : 'personal'

  // Determine context type
  // Attendance: mock present today
  const now = new Date()
  const checkIn = '09:32'
  const workingMinutes = 272

  return {
    currentState: {
      attendance: { status: 'present', checkIn, checkOut: null, workingMinutes, exceptionLabel: null },
      workingTime: { minutes: workingMinutes, targetMinutes: 480 },
      timer: {
        id: 'timer-1',
        workItemKey: 'EFA-142',
        projectName: 'UTEC',
        subProjectName: 'EFA',
        activity: 'Development',
        startedAt: new Date(Date.now() - 37*60_000).toISOString(),
        elapsedMinutes: 37,
      },
      loggedTime: { minutes: 60, entriesCount: 12, targetMinutes: 480 },
      timesheet: { status: 'draft', week: { totalMinutes: 2300, byProject: [{ projectName: 'UTEC', minutes: 720 }] }, entriesCount: 12 },
    },
    work: {
      scope,
      summary: scope === 'personal' ? { inProgress: 5, dueToday: 2, overdue: 1, blocked: 1 } : scope === 'organization' ? { employees: 13, activeProjects: 5, needingAttention: 2 } : { count: 12 },
      items: [
        { key: 'EFA-142', title: 'Implement timesheet approval workflow', projectId: 'prj-utec', status: 'in_progress' },
        { key: 'EFA-143', title: 'Holiday calendar per location', projectId: 'prj-utec', status: 'todo' },
      ],
    },
    attention: [
      { id: 'ac-1', type: 'attendance', severity: 'medium', title: 'Check-in required', description: 'You are marked present since 09:32 — working 4h 32m', action: { label: 'View attendance', href: '/dashboard' }, priority: 'medium' },
      { id: 'ac-2', type: 'timesheet', severity: 'high', title: 'Timesheet missing', description: 'Weekly timesheet draft — 12 entries · 38.5h', action: { label: 'Open My Timesheet', href: '/timesheets/my' }, priority: 'high' },
      { id: 'ac-3', type: 'approval', severity: 'high', title: '2 approvals pending', description: 'Leave + Timesheet require your review', action: { label: 'View approvals', href: '/timesheets/approvals' }, priority: 'high' },
    ].map(a => ({ id: a.id, type: a.type, title: a.title, description: a.description, ctaLabel: a.action.label, href: a.action.href, priority: a.priority })),
    context: {
      type: scope,
      metrics: scope === 'organization' ? [
        { label: 'Active Projects', value: 5 },
        { label: 'Projects Needing Attention', value: 2 },
        { label: 'Employees', value: 13 },
      ] : scope === 'personal' ? [
        { label: 'Weekly Time', value: '38h 20m', hint: 'of 40h' },
        { label: 'Quality', value: '2 critical open' },
      ] : [
        { label: 'Team Attendance', value: '14/16' },
      ]
    },
    meta: { organizationId: auth.organization.id, generatedAt: new Date().toISOString(), scope },
  }
}
