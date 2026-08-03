export interface Session {
  userId: string
  email: string
  expiresAt: string
}

export type AuthStatus = 'idle' | 'requesting' | 'verifying' | 'loading' | 'authenticated'

export interface OtpRequestResult {
  ok: boolean
  resendIn: number
  hint?: string
}

export type AuthResult = { ok: true } | { ok: false; error: string }

export interface AuthUser {
  id: string
  name: string
  email: string
  roleId: string
  avatarUrl?: string
  designation: string
}
