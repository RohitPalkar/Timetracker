import { getSupabaseAnon, getSupabaseService, isSupabaseEnabled } from '../../db/client.js'
import { mockStoreOtp, mockVerifyOtp, MOCK_ORG, MOCK_USER, MOCK_MEMBERSHIP, MOCK_PERMISSIONS, MOCK_ROLES } from '../../db/mock.js'
import { env } from '../../config/env.js'
import { ApiError } from '../../lib/errors.js'

const OTP_TTL_MIN = 10

export async function requestOtp(email: string): Promise<{ ok: boolean }> {
  const normalized = email.trim().toLowerCase()
  if (!normalized) throw new ApiError('Email is required', 400, 'VALIDATION_ERROR')
  // Demo gate — only super admin provisioned in mock mode
  if (!isSupabaseEnabled() && env.demoAuthFallback) {
    if (normalized !== 'demo@mytracker.local') throw new ApiError('No account found for this email. Use demo@mytracker.local.', 404, 'USER_NOT_FOUND')
    mockStoreOtp(normalized, '123456')
    return { ok: true }
  }
  if (!isSupabaseEnabled()) throw new ApiError('Auth not configured', 500, 'INTERNAL_ERROR')
  const anon = getSupabaseAnon()!
  const { error } = await anon.auth.signInWithOtp({ email: normalized, options: { shouldCreateUser: false } })
  if (error) throw new ApiError(error.message, 400, 'INVALID_OTP')
  return { ok: true }
}

export async function verifyOtp(email: string, code: string): Promise<{ access_token: string; refresh_token: string; user: { id: string; email: string } }> {
  const normalized = email.trim().toLowerCase()
  const digits = code.replace(/\D/g, '')
  if (!digits || digits.length !== 6) throw new ApiError('Enter the full 6-digit code.', 400, 'VALIDATION_ERROR')

  if (!isSupabaseEnabled() && env.demoAuthFallback) {
    if (normalized !== 'demo@mytracker.local') throw new ApiError('No account found for this email.', 404, 'USER_NOT_FOUND')
    const res = mockVerifyOtp(normalized, digits)
    if (!res.ok) throw new ApiError(res.error!, 400, res.codeErr!)
    // Token format mock:email:timestamp — avoids dot issues in email
    return { access_token: `mock:${normalized}:${Date.now()}`, refresh_token: 'mock-refresh', user: { id: MOCK_USER.auth_user_id, email: normalized } }
  }

  if (!isSupabaseEnabled()) throw new ApiError('Auth not configured', 500, 'INTERNAL_ERROR')
  const anon = getSupabaseAnon()!
  const { data, error } = await anon.auth.verifyOtp({ email: normalized, token: digits, type: 'email' })
  if (error || !data.session) throw new ApiError(error?.message ?? 'Invalid OTP', 400, 'INVALID_OTP')
  return { access_token: data.session.access_token, refresh_token: data.session.refresh_token, user: { id: data.user!.id, email: normalized } }
}

export async function loginWithPassword(email: string, password: string): Promise<{ access_token: string; refresh_token: string; user: { id: string; email: string } }> {
  const normalized = email.trim().toLowerCase()
  if (!normalized || !password) throw new ApiError('Email and password are required', 400, 'VALIDATION_ERROR')

  if (!isSupabaseEnabled() && env.demoAuthFallback) {
    // Mock password check — demo@mytracker.local / Demo123456!
    if (normalized !== 'demo@mytracker.local') throw new ApiError('Invalid email or password', 401, 'AUTH_INVALID')
    if (password !== 'Demo123456!') throw new ApiError('Invalid email or password', 401, 'AUTH_INVALID')
    return { access_token: `mock:${normalized}:${Date.now()}`, refresh_token: 'mock-refresh', user: { id: MOCK_USER.auth_user_id, email: normalized } }
  }

  if (!isSupabaseEnabled()) throw new ApiError('Auth not configured', 500, 'INTERNAL_ERROR')
  const anon = getSupabaseAnon()!
  const { data, error } = await anon.auth.signInWithPassword({ email: normalized, password })
  if (error || !data.session) throw new ApiError(error?.message ?? 'Invalid email or password', 401, 'AUTH_INVALID')
  return { access_token: data.session.access_token, refresh_token: data.session.refresh_token, user: { id: data.user.id, email: normalized } }
}

export async function resolveMe(accessToken: string) {
  // Mock mode: token is mock:email:ts
  if (!isSupabaseEnabled() && accessToken.startsWith('mock:')) {
    const parts = accessToken.split(':')
    const email = parts[1]
    if (email !== 'demo@mytracker.local') throw new ApiError('User not found', 404, 'USER_NOT_FOUND')
    return {
      user: { id: MOCK_USER.id, email: MOCK_USER.email, name: MOCK_USER.display_name },
      organizations: [{ id: MOCK_ORG.id, name: MOCK_ORG.name, slug: MOCK_ORG.slug }],
      activeOrganization: { id: MOCK_ORG.id, name: MOCK_ORG.name, slug: MOCK_ORG.slug },
      membership: { id: MOCK_MEMBERSHIP.id, status: 'active' },
      roles: [...MOCK_ROLES],
      permissions: [...MOCK_PERMISSIONS],
      capabilities: [...MOCK_PERMISSIONS],
    }
  }

  if (!isSupabaseEnabled()) throw new ApiError('Auth not configured', 500, 'INTERNAL_ERROR')
  const service = getSupabaseService()!
  const anon = getSupabaseAnon()!

  // Validate token via supabase auth
  const { data: userData, error: userErr } = await anon.auth.getUser(accessToken)
  if (userErr || !userData.user) throw new ApiError('Invalid or expired session', 401, 'AUTH_INVALID')

  const authUserId = userData.user.id
  const email = userData.user.email ?? ''

  // Resolve MyTracker user
  const { data: appUser, error: appErr } = await service.from('users').select('*').eq('auth_user_id', authUserId).single()
  if (appErr || !appUser) throw new ApiError('User not found', 404, 'USER_NOT_FOUND')

  // Memberships
  const { data: memberships, error: memErr } = await service.from('organization_memberships').select('id, organization_id, status, organizations(id,name,slug)').eq('user_id', appUser.id).eq('status','active')
  if (memErr) throw new ApiError('Failed to load memberships', 500, 'INTERNAL_ERROR')
  if (!memberships || memberships.length === 0) throw new ApiError('No active organization membership', 403, 'ORGANIZATION_NOT_FOUND')

  // For now pick first membership as active; FE can later request active org switch via header
  const active = memberships[0] as any
  const organizations = memberships.map((m: any) => ({ id: m.organizations.id, name: m.organizations.name, slug: m.organizations.slug }))

  // Resolve roles/permissions via membership_roles -> roles -> role_permissions -> permissions
  const { data: mrs } = await service.from('membership_roles').select('role_id').eq('membership_id', active.id)
  const roleIds = (mrs ?? []).map((r: any) => r.role_id)
  let roles: string[] = []
  let permissions: string[] = []
  if (roleIds.length) {
    const { data: rolesData } = await service.from('roles').select('key').in('id', roleIds)
    roles = (rolesData ?? []).map((r: any) => r.key)
    const { data: rps } = await service.from('role_permissions').select('permission_id').in('role_id', roleIds)
    const permIds = (rps ?? []).map((r: any) => r.permission_id)
    if (permIds.length) {
      const { data: perms } = await service.from('permissions').select('key').in('id', permIds)
      permissions = (perms ?? []).map((p: any) => p.key)
      // Expand admin.all wildcard client will interpret
    }
  }

  return {
    user: { id: appUser.id, email: appUser.email, name: appUser.display_name ?? `${appUser.first_name} ${appUser.last_name}`.trim() },
    organizations,
    activeOrganization: { id: active.organizations.id, name: active.organizations.name, slug: active.organizations.slug },
    membership: { id: active.id, status: active.status },
    roles,
    permissions,
    capabilities: permissions,
  }
}
