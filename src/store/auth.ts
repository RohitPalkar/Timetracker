import { create } from 'zustand'
import type { AuthStatus, OtpRequestResult } from '@/types/auth'
import type { StoredSession } from '@/services/auth'
import { authService } from '@/services/auth'
import { PENDING_EMAIL_KEY, SESSION_LOAD_MS } from '@/constants'

interface AuthState {
  authUser: StoredSession | null
  pendingEmail: string
  requestOtp: (email: string) => Promise<OtpRequestResult>
  verifyOtp: (email: string, code: string) => Promise<{ ok: boolean; error?: string }>
  resendOtp: (email: string) => Promise<OtpRequestResult>
  signOut: () => Promise<void>
}

/**
 * Session + pending-email store. Delegates persistence to the auth repository.
 * Derive `isAuthenticated` / `status` with the selector helpers below.
 */
export const useAuthStore = create<AuthState>((set) => ({
  authUser: authService.getSession(),
  pendingEmail: localStorage.getItem(PENDING_EMAIL_KEY) ?? '',

  requestOtp: async (email) => {
    set({ pendingEmail: email })
    return authService.requestOtp(email)
  },

  verifyOtp: async (email, code) => {
    const result = await authService.verifyOtp(email, code)
    if (!result.ok) return result
    set({ authUser: authService.getSession(), pendingEmail: '' })
    return result
  },

  resendOtp: async (email) => {
    set({ pendingEmail: email })
    return authService.resendOtp(email)
  },

  signOut: async () => {
    await authService.signOut()
    set({ authUser: null })
  },
}))

/** Convenience hook — full auth state plus derived flags. */
export function useAuth() {
  const authUser = useAuthStore((state) => state.authUser)
  const pendingEmail = useAuthStore((state) => state.pendingEmail)
  const requestOtp = useAuthStore((state) => state.requestOtp)
  const verifyOtp = useAuthStore((state) => state.verifyOtp)
  const resendOtp = useAuthStore((state) => state.resendOtp)
  const signOut = useAuthStore((state) => state.signOut)

  const status: AuthStatus = authUser ? 'authenticated' : 'idle'
  return { authUser, status, isAuthenticated: Boolean(authUser), pendingEmail, requestOtp, verifyOtp, resendOtp, signOut }
}

export { SESSION_LOAD_MS }