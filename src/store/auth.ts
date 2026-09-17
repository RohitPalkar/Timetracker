import { create } from 'zustand'
import type { AuthStatus, OtpRequestResult, AuthMeResponse } from '@/types/auth'
import type { StoredAuthSession } from '@/services/auth'
import type { PermissionKey, RoleKey } from '@/types/permission'
import { authService } from '@/services/auth'
import { PENDING_EMAIL_KEY, SESSION_LOAD_MS } from '@/constants'
import { hasPermission, hasRole } from '@/lib/permissions'

interface AuthState {
  // Raw persisted session (null when unauthenticated)
  authUser: StoredAuthSession | null
  // Derived identity — mirrors StoredAuthSession for convenience but authoritative
  user: StoredAuthSession['user'] | null
  organizations: StoredAuthSession['organizations']
  activeOrganization: StoredAuthSession['activeOrganization'] | null
  membership: StoredAuthSession['membership'] | null
  roles: RoleKey[]
  permissions: PermissionKey[]
  capabilities: PermissionKey[]

  // Lifecycle
  status: AuthStatus
  isLoading: boolean
  isAuthenticated: boolean
  initialized: boolean
  pendingEmail: string

  // Actions — public API matches future REST contracts
  initialize: () => Promise<void>
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string; code?: string }>
  requestOtp: (email: string) => Promise<OtpRequestResult>
  verifyOtp: (email: string, code: string) => Promise<{ ok: boolean; error?: string; code?: string }>
  resendOtp: (email: string) => Promise<OtpRequestResult>
  setActiveOrganization: (organizationId: string) => boolean
  refreshSession: () => Promise<AuthMeResponse | null>
  signOut: () => Promise<void>

  // Capability helpers (frontend UX only — not security boundary)
  can: (permission: PermissionKey | PermissionKey[]) => boolean
  hasRole: (role: RoleKey | RoleKey[]) => boolean
  hasAnyPermission: (permissions: PermissionKey[]) => boolean
  hasAllPermissions: (permissions: PermissionKey[]) => boolean
}

function toDerived(session: StoredAuthSession | null) {
  if (!session) {
    return {
      user: null,
      organizations: [] as StoredAuthSession['organizations'],
      activeOrganization: null,
      membership: null,
      roles: [] as RoleKey[],
      permissions: [] as PermissionKey[],
      capabilities: [] as PermissionKey[],
    }
  }
  return {
    user: session.user,
    organizations: session.organizations,
    activeOrganization: session.activeOrganization,
    membership: session.membership,
    roles: session.roles,
    permissions: session.permissions,
    capabilities: session.permissions,
  }
}

function readInitial(): { session: StoredAuthSession | null; pendingEmail: string } {
  const session = authService.getSession()
  const pendingEmail = typeof localStorage !== 'undefined' ? (localStorage.getItem(PENDING_EMAIL_KEY) ?? '') : ''
  return { session, pendingEmail }
}

const initial = readInitial()

export const useAuthStore = create<AuthState>((set, get) => ({
  authUser: initial.session,
  ...toDerived(initial.session),
  status: initial.session ? 'authenticated' : 'unauthenticated',
  isLoading: false,
  isAuthenticated: Boolean(initial.session),
  initialized: false,
  pendingEmail: initial.pendingEmail,

  initialize: async () => {
    set({ isLoading: true })
    // Simulate session validation latency (SESSION_LOAD_MS) while also
    // calling getMe for server-authoritative revalidation. If session is
    // expired, getMe returns null and we clear local state.
    const me = await authService.getMe()
    if (!me) {
      const cleared = authService.getSession()
      if (!cleared) {
        set({
          authUser: null,
          ...toDerived(null),
          status: 'unauthenticated',
          isLoading: false,
          isAuthenticated: false,
          initialized: true,
        })
        return
      }
      // getMe returned null but local session still present — treat as loading glitch
    }

    // Give UI a minimum loading shimmer so protected content doesn't flash
    await new Promise<void>((resolve) => setTimeout(resolve, SESSION_LOAD_MS))

    const session = authService.getSession()
    if (!session) {
      set({
        authUser: null,
        ...toDerived(null),
        status: 'unauthenticated',
        isLoading: false,
        isAuthenticated: false,
        initialized: true,
      })
      return
    }

    set({
      authUser: session,
      ...toDerived(session),
      status: 'authenticated',
      isLoading: false,
      isAuthenticated: true,
      initialized: true,
    })
  },

  login: async (email, password) => {
    const result = await authService.login(email, password)
    if (!result.ok) return result
    const session = authService.getSession()
    set({
      authUser: session,
      ...toDerived(session),
      status: 'authenticated',
      isAuthenticated: true,
      pendingEmail: '',
      isLoading: false,
      initialized: true,
    })
    return result
  },

  requestOtp: async (email) => {
    const trimmed = email.trim()
    set({ pendingEmail: trimmed })
    const result = await authService.requestOtp(trimmed)
    if (result.ok) {
      // Persist pendingEmail for OTP page reloads; authService already did
      set({ pendingEmail: trimmed })
    }
    return result
  },

  verifyOtp: async (email, code) => {
    const result = await authService.verifyOtp(email, code)
    if (!result.ok) return result
    const session = authService.getSession()
    set({
      authUser: session,
      ...toDerived(session),
      status: 'authenticated',
      isAuthenticated: true,
      pendingEmail: '',
      isLoading: false,
      initialized: true,
    })
    return result
  },

  resendOtp: async (email) => {
    const trimmed = email.trim()
    set({ pendingEmail: trimmed })
    return authService.resendOtp(trimmed)
  },

  setActiveOrganization: (organizationId) => {
    const ok = authService.setActiveOrganization(organizationId)
    if (!ok) return false
    const session = authService.getSession()
    set({
      authUser: session,
      ...toDerived(session),
    })
    return true
  },

  refreshSession: async () => {
    const me = await authService.getMe()
    if (!me) {
      set({
        authUser: null,
        ...toDerived(null),
        status: 'unauthenticated',
        isAuthenticated: false,
      })
      return null
    }
    const session = authService.getSession()
    set({
      authUser: session,
      ...toDerived(session),
      status: 'authenticated',
      isAuthenticated: true,
    })
    return me
  },

  signOut: async () => {
    await authService.signOut()
    localStorage.removeItem(PENDING_EMAIL_KEY)
    set({
      authUser: null,
      ...toDerived(null),
      status: 'unauthenticated',
      isAuthenticated: false,
      isLoading: false,
      pendingEmail: '',
    })
    // Clear query cache is handled by callers that have access to QueryClient.
    // We also proactively clear any legacy keys observers might keep.
    try {
      // Legacy persona store reset — keep demo persona in sync
      const { useDemoPersonaStore } = await import('./persona')
      useDemoPersonaStore.getState().resetPersona()
    } catch {
      // ignore
    }
  },

  can: (permission) => {
    const { permissions } = get()
    return hasPermission(permissions, permission)
  },

  hasRole: (role) => {
    const { roles } = get()
    return hasRole(roles, role)
  },

  hasAnyPermission: (permissions) => {
    const { permissions: mine } = get()
    return hasPermission(mine, permissions)
  },

  hasAllPermissions: (permissions) => {
    const { permissions: mine } = get()
    if (mine.includes('admin.all')) return true
    return permissions.every((p) => mine.includes(p))
  },
}))

/** Convenience hook — full auth state plus derived flags and helpers. */
export function useAuth() {
  const authUser = useAuthStore((s) => s.authUser)
  const user = useAuthStore((s) => s.user)
  const organizations = useAuthStore((s) => s.organizations)
  const activeOrganization = useAuthStore((s) => s.activeOrganization)
  const membership = useAuthStore((s) => s.membership)
  const roles = useAuthStore((s) => s.roles)
  const permissions = useAuthStore((s) => s.permissions)
  const capabilities = useAuthStore((s) => s.capabilities)
  const status = useAuthStore((s) => s.status)
  const isLoading = useAuthStore((s) => s.isLoading)
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const initialized = useAuthStore((s) => s.initialized)
  const pendingEmail = useAuthStore((s) => s.pendingEmail)
  const initialize = useAuthStore((s) => s.initialize)
  const login = useAuthStore((s) => s.login)
  const requestOtp = useAuthStore((s) => s.requestOtp)
  const verifyOtp = useAuthStore((s) => s.verifyOtp)
  const resendOtp = useAuthStore((s) => s.resendOtp)
  const setActiveOrganization = useAuthStore((s) => s.setActiveOrganization)
  const refreshSession = useAuthStore((s) => s.refreshSession)
  const signOut = useAuthStore((s) => s.signOut)
  const can = useAuthStore((s) => s.can)
  const hasRole = useAuthStore((s) => s.hasRole)

  return {
    authUser,
    user,
    organizations,
    activeOrganization,
    membership,
    roles,
    permissions,
    capabilities,
    status,
    isLoading,
    isAuthenticated,
    initialized,
    pendingEmail,
    initialize,
    login,
    requestOtp,
    verifyOtp,
    resendOtp,
    setActiveOrganization,
    refreshSession,
    signOut,
    can,
    hasRole,
  }
}

/** Capability helpers for non-hook contexts (e.g., router loaders). */
export function can(permission: PermissionKey | PermissionKey[]): boolean {
  return useAuthStore.getState().can(permission)
}

export { SESSION_LOAD_MS }
