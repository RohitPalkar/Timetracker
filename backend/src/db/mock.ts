// In-memory mock for dev when Supabase not configured — deterministic
export const MOCK_ORG = {
  id: 'org-acme',
  name: 'Acme Technologies',
  slug: 'acme-technologies',
  status: 'active',
}

export const MOCK_USER = {
  id: 'user-demo-super',
  auth_user_id: 'auth-demo-super',
  email: 'demo@mytracker.local',
  first_name: 'Alex',
  last_name: 'Morgan',
  display_name: 'Alex Morgan',
  designation: 'Super Admin',
  avatar_url: null,
  status: 'active',
}

export const MOCK_MEMBERSHIP = {
  id: 'membership-demo-super-acme',
  organization_id: MOCK_ORG.id,
  user_id: MOCK_USER.id,
  status: 'active',
}

export const MOCK_ROLES = ['super_admin'] as const
export const MOCK_PERMISSIONS = ['admin.all'] as const

// Mock OTP store
const otpStore = new Map<string, { code: string; expiresAt: number; attempts: number }>()
export function mockStoreOtp(email: string, code: string, ttlMs = 10 * 60 * 1000) {
  otpStore.set(email.toLowerCase(), { code, expiresAt: Date.now() + ttlMs, attempts: 0 })
}
export function mockVerifyOtp(email: string, code: string): { ok: boolean; error?: string; codeErr?: string } {
  const rec = otpStore.get(email.toLowerCase())
  if (!rec) return { ok: false, error: 'Code expired or not requested. Please request a new code.', codeErr: 'OTP_EXPIRED' }
  if (Date.now() > rec.expiresAt) { otpStore.delete(email.toLowerCase()); return { ok: false, error: 'Code has expired. Please request a new code.', codeErr: 'OTP_EXPIRED' } }
  if (rec.attempts >= 5) return { ok: false, error: 'Too many attempts. Please request a new code.', codeErr: 'TOO_MANY_ATTEMPTS' }
  if (code !== rec.code) { rec.attempts++; return { ok: false, error: `That code is not correct. ${5 - rec.attempts} attempts remaining.`, codeErr: 'INVALID_OTP' } }
  otpStore.delete(email.toLowerCase())
  return { ok: true }
}
