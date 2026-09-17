import type { PermissionKey, RoleKey } from './permission'

// ------------------------------------------------------------------
// Core identity — one person, many responsibilities
// ------------------------------------------------------------------

export interface AuthUser {
  id: string
  name: string
  email: string
  avatarUrl?: string
  designation: string
}

export interface AuthOrganization {
  id: string
  name: string
  logoUrl?: string
  domain?: string
  plan?: string
}

export interface OrganizationMembership {
  id: string
  userId: string
  organizationId: string
  organization: AuthOrganization
  roles: RoleKey[]
  primaryRole: RoleKey
  permissions: PermissionKey[]
}

export interface Session {
  userId: string
  email: string
  expiresAt: string
}

// ------------------------------------------------------------------
// Auth state machine
// ------------------------------------------------------------------

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated'

export type OtpState = 'idle' | 'requesting' | 'otp_required' | 'verifying' | 'success' | 'error'

export interface OtpRequestResult {
  ok: boolean
  resendIn: number
  hint?: string
  error?: string
}

export type AuthResult = { ok: true } | { ok: false; error: string; code?: string }

export interface AuthMeResponse {
  user: AuthUser
  organizations: Array<{
    id: string
    name: string
    membership: {
      id: string
      roles: RoleKey[]
      primaryRole: RoleKey
    }
  }>
  activeOrganization: AuthOrganization | null
  permissions: PermissionKey[]
  capabilities: PermissionKey[]
}

// ------------------------------------------------------------------
// Capability helpers — the single source for permission checks
// ------------------------------------------------------------------

export type Capability = PermissionKey

export interface AuthContext {
  user: AuthUser | null
  organizations: AuthOrganization[]
  activeOrganization: AuthOrganization | null
  membership: OrganizationMembership | null
  roles: RoleKey[]
  permissions: PermissionKey[]
  capabilities: PermissionKey[]
}
