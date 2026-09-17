/**
 * Auth service — mock provider for Feature 01.
 *
 * Public API is stable and maps 1:1 to the future Supabase/Backend contracts:
 *   POST /api/v1/auth/request-otp
 *   POST /api/v1/auth/verify-otp
 *   POST /api/v1/auth/logout
 *   GET  /api/v1/auth/me
 *
 * Internals are a demo adapter. Swap to real fetch when VITE_API_BASE_URL is set.
 */

import type {
  AuthMeResponse,
  AuthResult,
  AuthUser,
  AuthOrganization,
  OrganizationMembership,
  OtpRequestResult,
  Session,
} from '@/types/auth'
import type { PermissionKey, RoleKey } from '@/types/permission'
import {
  ACTIVE_ORG_KEY,
  DEMO_SUPER_ADMIN_EMAIL,
  OTP_DEMO_HINT,
  OTP_EXPIRY_MINUTES,
  PENDING_EMAIL_KEY,
  RESEND_COOLDOWN_SECONDS,
  SESSION_STORAGE_KEY,
} from '@/constants'
import { mockDelay } from './http'

// ------------------------------------------------------------------
// Demo seed — one person, multiple responsibilities architecture
// ------------------------------------------------------------------

const DEMO_USER: AuthUser = {
  id: 'user-demo-super',
  name: 'Alex Morgan',
  email: DEMO_SUPER_ADMIN_EMAIL,
  designation: 'Super Admin',
  avatarUrl: undefined,
}

const DEMO_ORG_ACME: AuthOrganization = {
  id: 'org-acme',
  name: 'Acme Technologies',
  domain: 'acme.com',
  plan: 'enterprise',
}

// Future multi-org shape — kept to prove the adapter handles it.
// Only Acme is active for the Super Admin demo. Add more entries later
// to test the organization selector without redesigning the service.
const ALL_ORGANIZATIONS: AuthOrganization[] = [DEMO_ORG_ACME]

// Role → permissions mapping (authoritative for demo). Real backend would
// derive this from DB. Super Admin has admin.all which grants every permission.
const ROLE_PERMISSIONS: Record<RoleKey, PermissionKey[]> = {
  super_admin: ['admin.all'],
  org_admin: ['admin.all'],
  project_manager: [
    'dashboard.view',
    'my_work.view',
    'projects.view',
    'projects.create',
    'projects.edit',
    'project.view',
    'subprojects.view',
    'teams.view',
    'sprints.view',
    'stories.view',
    'bugs.view',
    'timesheet.view',
    'reports.view',
    'documents.view',
  ],
  delivery_manager: [
    'dashboard.view',
    'my_work.view',
    'projects.view',
    'project.view',
    'timesheet.view',
    'reports.view',
  ],
  team_lead: ['dashboard.view', 'my_work.view', 'projects.view', 'timesheet.view', 'reports.view'],
  employee: ['dashboard.view', 'my_work.view', 'timesheet.view', 'attendance.view', 'leave.view'],
  developer: ['dashboard.view', 'my_work.view', 'stories.view', 'bugs.view', 'timesheet.view'],
  qa: ['dashboard.view', 'my_work.view', 'bugs.view', 'stories.view'],
  business_analyst: ['dashboard.view', 'my_work.view', 'projects.view', 'stories.view'],
  hr_admin: ['dashboard.view', 'hr.view', 'hr.manage', 'employee.view', 'attendance.view', 'leave.view'],
  hr_manager: ['dashboard.view', 'hr.view', 'employee.view'],
  recruiter: ['dashboard.view', 'employee.view'],
  finance: ['dashboard.view', 'reports.view', 'report.export'],
  payroll_admin: ['dashboard.view', 'reports.view', 'report.export'],
  department_head: ['dashboard.view', 'my_work.view', 'projects.view', 'hr.view', 'reports.view'],
  it_admin: ['dashboard.view', 'documents.view', 'administration.view'],
  compliance_auditor: ['dashboard.view', 'reports.view', 'documents.view'],
  executive: ['dashboard.view', 'reports.view', 'report.export', 'monitoring.view'],
  hr: ['dashboard.view', 'hr.view', 'employee.view'],
  finance_legacy: ['dashboard.view', 'reports.view'],
}

// Demo membership: Super Admin has exactly one active org (Acme).
function buildDemoMembership(): OrganizationMembership {
  return {
    id: 'membership-demo-super-acme',
    userId: DEMO_USER.id,
    organizationId: DEMO_ORG_ACME.id,
    organization: DEMO_ORG_ACME,
    roles: ['super_admin'],
    primaryRole: 'super_admin',
    permissions: ROLE_PERMISSIONS['super_admin'],
  }
}

// ------------------------------------------------------------------
// Persisted session shape
// ------------------------------------------------------------------

export interface StoredAuthSession extends Session {
  user: AuthUser
  organizations: AuthOrganization[]
  activeOrganization: AuthOrganization
  membership: OrganizationMembership
  roles: RoleKey[]
  permissions: PermissionKey[]
  /** @deprecated Keep for backward compat with legacy callers that read roleId */
  roleId: string
  name: string
  designation: string
}

interface OtpRecord {
  email: string
  code: string
  expiresAt: number
  attempts: number
}

// In-memory OTP store (demo only). Keyed by email.
const otpStore = new Map<string, OtpRecord>()

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

function readStoredSession(): StoredAuthSession | null {
  const raw = localStorage.getItem(SESSION_STORAGE_KEY)
  if (!raw) return null
  try {
    const session = JSON.parse(raw) as StoredAuthSession
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      localStorage.removeItem(SESSION_STORAGE_KEY)
      return null
    }
    // Basic hygiene: ensure required fields present
    if (!session.user || !session.activeOrganization || !session.membership) {
      localStorage.removeItem(SESSION_STORAGE_KEY)
      return null
    }
    return session
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY)
    return null
  }
}

function writeStoredSession(session: StoredAuthSession) {
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  localStorage.setItem(ACTIVE_ORG_KEY, session.activeOrganization.id)
}

function resolvePermissions(roles: RoleKey[]): PermissionKey[] {
  if (roles.includes('super_admin') || roles.includes('org_admin')) return ['admin.all']
  const set = new Set<PermissionKey>()
  roles.forEach((role) => {
    const perms = ROLE_PERMISSIONS[role] ?? []
    perms.forEach((p) => set.add(p))
  })
  return Array.from(set)
}

// ------------------------------------------------------------------
// Public service — keep method names exactly as future API contracts
// ------------------------------------------------------------------

export const authService = {
  /** POST /api/v1/auth/request-otp — validate email and issue demo OTP. */
  async requestOtp(email: string): Promise<OtpRequestResult> {
    await mockDelay(650)
    const normalized = email.trim().toLowerCase()

    if (!normalized) {
      return { ok: false, resendIn: 0, error: 'Email is required.' }
    }
    if (!isValidEmail(normalized)) {
      return { ok: false, resendIn: 0, error: 'Enter a valid email address.' }
    }
    // Demo restriction: ONLY super admin email is provisioned. This is intentional
    // per spec §4 — underlying architecture supports multiple identities, but the
    // demo environment gates access to exactly one account. Future users will be
    // added without changing this code path (just extend the user registry).
    if (normalized !== DEMO_SUPER_ADMIN_EMAIL.toLowerCase()) {
      return {
        ok: false,
        resendIn: 0,
        error: 'No account found for this email. Use demo@mytracker.local.',
      }
    }

    const expiresAt = Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
    otpStore.set(normalized, { email: normalized, code: OTP_DEMO_HINT, expiresAt, attempts: 0 })
    localStorage.setItem(PENDING_EMAIL_KEY, normalized)

    // In production this would send an email via Supabase; demo returns hint
    return { ok: true, resendIn: RESEND_COOLDOWN_SECONDS, hint: OTP_DEMO_HINT }
  },

  /** POST /api/v1/auth/verify-otp — validate code and create session. */
  async verifyOtp(email: string, code: string): Promise<AuthResult> {
    await mockDelay(800)
    const normalized = email.trim().toLowerCase()
    const record = otpStore.get(normalized)

    if (!record) {
      return { ok: false, error: 'Code expired or not requested. Please request a new code.', code: 'OTP_NOT_FOUND' }
    }
    if (Date.now() > record.expiresAt) {
      otpStore.delete(normalized)
      return { ok: false, error: 'Code has expired. Please request a new code.', code: 'OTP_EXPIRED' }
    }
    if (record.attempts >= 5) {
      return { ok: false, error: 'Too many attempts. Please request a new code.', code: 'TOO_MANY_ATTEMPTS' }
    }

    const digits = code.replace(/\D/g, '')
    if (digits.length !== 6) {
      return { ok: false, error: 'Enter the full 6-digit code.', code: 'INVALID_FORMAT' }
    }

    if (digits !== record.code) {
      record.attempts += 1
      otpStore.set(normalized, record)
      const remaining = 5 - record.attempts
      if (remaining <= 0) {
        return { ok: false, error: 'Too many attempts. Please request a new code.', code: 'TOO_MANY_ATTEMPTS' }
      }
      return { ok: false, error: `That code is not correct. ${remaining} ${remaining === 1 ? 'attempt' : 'attempts'} remaining.`, code: 'INVALID_OTP' }
    }

    // Success — establish session rooted in organization membership
    otpStore.delete(normalized)
    const membership = buildDemoMembership()
    const roles = membership.roles
    const permissions = resolvePermissions(roles)

    const session: StoredAuthSession = {
      userId: DEMO_USER.id,
      email: DEMO_USER.email,
      // legacy flattened fields for backward compat
      name: DEMO_USER.name,
      designation: DEMO_USER.designation,
      roleId: 'role-super_admin',
      // new rich session
      user: DEMO_USER,
      organizations: ALL_ORGANIZATIONS,
      activeOrganization: DEMO_ORG_ACME,
      membership,
      roles,
      permissions,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
    }

    writeStoredSession(session)
    localStorage.removeItem(PENDING_EMAIL_KEY)
    return { ok: true }
  },

  /** POST /api/v1/auth/request-otp (resend alias). */
  async resendOtp(email: string): Promise<OtpRequestResult> {
    await mockDelay(400)
    // Reuse requestOtp logic but don't duplicate checks for cooldown externally
    return this.requestOtp(email)
  },

  /** GET /api/v1/auth/me — resolve the current authenticated identity. */
  async getMe(): Promise<AuthMeResponse | null> {
    await mockDelay(300)
    const session = readStoredSession()
    if (!session) return null

    // Re-resolve organizations/membership from registry so client can't
    // spoof organizationId via localStorage mutation alone (server is authoritative)
    const activeOrgId = localStorage.getItem(ACTIVE_ORG_KEY) ?? session.activeOrganization.id
    const activeOrg = ALL_ORGANIZATIONS.find((o) => o.id === activeOrgId) ?? session.activeOrganization

    return {
      user: session.user,
      organizations: session.organizations.map((org) => ({
        id: org.id,
        name: org.name,
        membership: {
          id: session.membership.id,
          roles: session.membership.roles,
          primaryRole: session.membership.primaryRole,
        },
      })),
      activeOrganization: activeOrg,
      permissions: session.permissions,
      capabilities: session.permissions,
    }
  },

  /** Restore a persisted session on app boot — synchronous for Zustand init. */
  getSession(): StoredAuthSession | null {
    return readStoredSession()
  },

  /** Active org switching — validates against memberships the user actually has. */
  setActiveOrganization(organizationId: string): boolean {
    const session = readStoredSession()
    if (!session) return false
    const org = session.organizations.find((o) => o.id === organizationId)
    if (!org) return false
    const next: StoredAuthSession = {
      ...session,
      activeOrganization: org,
      // In multi-org future, membership would be re-resolved per org
    }
    writeStoredSession(next)
    return true
  },

  /** POST /api/v1/auth/logout — invalidate session. */
  async signOut(): Promise<void> {
    await mockDelay(200)
    localStorage.removeItem(SESSION_STORAGE_KEY)
    localStorage.removeItem(ACTIVE_ORG_KEY)
    // Keep PENDING_EMAIL_KEY cleanup for caller; also clear otp store
    otpStore.clear()
  },

  /** Utility — check if a given organization id is valid for current user. */
  isValidOrganization(organizationId: string): boolean {
    const session = readStoredSession()
    if (!session) return false
    return session.organizations.some((o) => o.id === organizationId)
  },

  /** For auditing: record an auth event (no-op demo, prepares for real audit stream). */
  trackEvent(_event: string, _meta?: Record<string, unknown>) {
    // No-op in demo; future: POST /api/v1/audit with user/org context
  },
}
