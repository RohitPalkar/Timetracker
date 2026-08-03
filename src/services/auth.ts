/**
 * Auth service — implemented with a mock provider for Phase 1.
 * Replace internals with real OTP endpoints later; the public API stays.
 */
import type { AuthResult, OtpRequestResult, Session } from '@/types/auth'
import {
  OTP_DEMO_HINT,
  PENDING_EMAIL_KEY,
  RESEND_COOLDOWN_SECONDS,
  SESSION_STORAGE_KEY,
} from '@/constants'
import { mockDelay } from './http'

interface StoredSession extends Session {
  name: string
  designation: string
  roleId: string
}

function readStoredSession(): StoredSession | null {
  const raw = localStorage.getItem(SESSION_STORAGE_KEY)
  if (!raw) return null
  try {
    const session = JSON.parse(raw) as StoredSession
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      localStorage.removeItem(SESSION_STORAGE_KEY)
      return null
    }
    return session
  } catch {
    return null
  }
}

export const authService = {
  /** Step 1 — request an OTP for the given email. */
  async requestOtp(email: string): Promise<OtpRequestResult> {
    await mockDelay(650)
    localStorage.setItem(PENDING_EMAIL_KEY, email)
    return { ok: true, resendIn: RESEND_COOLDOWN_SECONDS, hint: OTP_DEMO_HINT }
  },

  /** Step 2 — verify the OTP and establish a session. */
  async verifyOtp(email: string, code: string): Promise<AuthResult> {
    await mockDelay(800)
    if (code !== OTP_DEMO_HINT) {
      return { ok: false, error: 'That code is not correct. Please try again.' }
    }
    const session: StoredSession = {
      userId: 'u-demo',
      email,
      name: 'Demo User',
      designation: 'Delivery Manager',
      roleId: 'role-delivery',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
    }
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
    localStorage.removeItem(PENDING_EMAIL_KEY)
    return { ok: true }
  },

  /** Resend OTP — returns the new cooldown window. */
  async resendOtp(email: string): Promise<OtpRequestResult> {
    await mockDelay(400)
    localStorage.setItem(PENDING_EMAIL_KEY, email)
    return { ok: true, resendIn: RESEND_COOLDOWN_SECONDS, hint: OTP_DEMO_HINT }
  },

  /** Restore a persisted session on app boot. */
  getSession(): StoredSession | null {
    return readStoredSession()
  },

  async signOut(): Promise<void> {
    await mockDelay(200)
    localStorage.removeItem(SESSION_STORAGE_KEY)
  },
}

export type { StoredSession }
