import * as React from 'react'
import type { AuthStatus, OtpRequestResult } from '@/types/auth'
import type { StoredSession } from '@/services/auth'
import { authService } from '@/services/auth'
import { PENDING_EMAIL_KEY, SESSION_LOAD_MS } from '@/constants'

interface AuthContextValue {
  /** The authenticated user session, or null when signed out. */
  authUser: StoredSession | null
  status: AuthStatus
  isAuthenticated: boolean
  /** Email that requested an OTP, kept across the login → verify steps. */
  pendingEmail: string
  requestOtp: (email: string) => Promise<OtpRequestResult>
  verifyOtp: (email: string, code: string) => Promise<{ ok: boolean; error?: string }>
  resendOtp: (email: string) => Promise<OtpRequestResult>
  signOut: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = React.useState<StoredSession | null>(null)
  const [pendingEmail, setPendingEmail] = React.useState<string>(() => localStorage.getItem(PENDING_EMAIL_KEY) ?? '')

  React.useEffect(() => {
    const stored = authService.getSession()
    if (stored) {
      setAuthUser(stored)
    }
  }, [])

  const requestOtp = React.useCallback(async (email: string) => {
    setPendingEmail(email)
    return authService.requestOtp(email)
  }, [])

  const verifyOtp = React.useCallback(
    async (email: string, code: string) => {
      const result = await authService.verifyOtp(email, code)
      if (!result.ok) return result
      const session = authService.getSession()
      setAuthUser(session)
      setPendingEmail('')
      return result
    },
    [],
  )

  const resendOtp = React.useCallback(
    async (email: string) => {
      setPendingEmail(email)
      return authService.resendOtp(email)
    },
    [],
  )

  const signOut = React.useCallback(async () => {
    await authService.signOut()
    setAuthUser(null)
  }, [])

  const value = React.useMemo<AuthContextValue>(
    () => ({
      authUser,
      status: authUser ? 'authenticated' : 'idle',
      isAuthenticated: Boolean(authUser),
      pendingEmail,
      requestOtp,
      verifyOtp,
      resendOtp,
      signOut,
    }),
    [authUser, pendingEmail, requestOtp, verifyOtp, resendOtp, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export { SESSION_LOAD_MS }