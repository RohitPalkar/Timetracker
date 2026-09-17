import * as React from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowLeft, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OtpInput } from '@/components/forms/otp-input'
import { useAuth } from '@/store/auth'
import { OTP_DEMO_HINT, OTP_LENGTH, RESEND_COOLDOWN_SECONDS } from '@/constants'
import { cn } from '@/lib/utils'

export function VerifyPage() {
  const navigate = useNavigate()
  const { pendingEmail, verifyOtp, resendOtp } = useAuth()
  const [code, setCode] = React.useState('')
  const [cooldown, setCooldown] = React.useState(0)
  const [error, setError] = React.useState<string | null>(null)
  const [errorCode, setErrorCode] = React.useState<string | null>(null)
  const [verifying, setVerifying] = React.useState(false)
  const [resending, setResending] = React.useState(false)
  const [hint, setHint] = React.useState<string | null>(null)

  const email = pendingEmail?.trim() ?? ''

  React.useEffect(() => {
    if (!email) {
      navigate('/login', { replace: true })
    }
  }, [email, navigate])

  React.useEffect(() => {
    if (cooldown <= 0) return
    const timer = window.setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [cooldown])

  const getErrorMessage = (err: string | undefined, code?: string): string => {
    if (code === 'OTP_EXPIRED') return 'This code has expired. Please request a new code.'
    if (code === 'TOO_MANY_ATTEMPTS') return 'Too many attempts. Please request a new code.'
    if (code === 'OTP_NOT_FOUND') return 'Code expired or not requested. Please request a new code.'
    return err ?? 'Verification failed. Please try again.'
  }

  const handleVerify = async () => {
    if (code.replace(/\D/g, '').length < OTP_LENGTH) {
      setError(`Enter the full ${OTP_LENGTH}-digit code.`)
      setErrorCode('INVALID_FORMAT')
      return
    }
    setVerifying(true)
    setError(null)
    setErrorCode(null)
    try {
      const result = await verifyOtp(email, code)
      if (result.ok) {
        navigate('/session', { replace: true })
      } else {
        setError(getErrorMessage(result.error, result.code))
        setErrorCode(result.code ?? null)
        // Clear code only on invalid/expired so user can retry quickly
        if (result.code !== 'INVALID_FORMAT') setCode('')
      }
    } catch {
      setError('Network error. Please check your connection and try again.')
      setErrorCode('NETWORK')
    } finally {
      setVerifying(false)
    }
  }

  const handleResend = async () => {
    if (cooldown > 0) return
    setResending(true)
    setError(null)
    setErrorCode(null)
    try {
      const result = await resendOtp(email)
      if (result.ok) {
        setCooldown(result.resendIn ?? RESEND_COOLDOWN_SECONDS)
        setHint(result.hint ?? null)
      } else {
        setError(result.error ?? 'Could not resend the code. Please try again.')
        if (result.error?.toLowerCase().includes('not found')) {
          // Email no longer valid — send back to login
          navigate('/login', { replace: true })
        }
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setResending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && code.length === OTP_LENGTH && !verifying) {
      e.preventDefault()
      void handleVerify()
    }
  }

  // Hint for demo — mirrors login hint but only after resend or on first load
  const showDemoHint = hint ?? OTP_DEMO_HINT

  return (
    <div className="flex flex-col gap-6" onKeyDown={handleKeyDown}>
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Verify your email</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          We sent a verification code to <span className="font-medium text-foreground">{email || 'your email'}</span>.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-muted-foreground" id="otp-label">
          6-digit code
        </label>
        <OtpInput
          value={code}
          onValueChange={(value) => {
            // Only allow digits, cap at OTP_LENGTH
            const digits = value.replace(/\D/g, '').slice(0, OTP_LENGTH)
            setCode(digits)
            setError(null)
            setErrorCode(null)
          }}
          error={Boolean(error)}
          disabled={verifying}
        />
        <span className="sr-only" aria-live="polite">
          {error ? `Error: ${error}` : ''}
        </span>
        {error ? (
          <p className="text-xs font-medium text-danger" role="alert" aria-live="polite">
            {error}
            {errorCode === 'OTP_EXPIRED' || errorCode === 'TOO_MANY_ATTEMPTS' ? (
              <span>
                {' '}
                <button
                  type="button"
                  onClick={handleResend}
                  className="underline underline-offset-4 hover:text-danger/80 focus-visible:outline-2 focus-visible:outline-ring"
                >
                  Resend code
                </button>
              </span>
            ) : null}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">Enter the 6-digit code. It expires in 10 minutes.</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Button
          size="lg"
          className="w-full"
          onClick={handleVerify}
          loading={verifying}
          disabled={code.replace(/\D/g, '').length !== OTP_LENGTH || verifying}
          aria-label="Verify and continue"
        >
          Verify &amp; continue
        </Button>

        <div className="flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleResend}
            disabled={cooldown > 0 || resending}
            className="flex-1 text-muted-foreground"
            aria-live="polite"
          >
            {resending ? 'Sending…' : cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
          </Button>
          <span className="text-xs text-border">·</span>
          <Button variant="ghost" size="sm" className="flex-1 text-muted-foreground" asChild>
            <Link to="/login" aria-label="Change email and return to login">
              Change email
            </Link>
          </Button>
        </div>
      </div>

      {showDemoHint && (
        <div className="rounded-xl border border-dashed border-primary/40 bg-primary-soft/50 px-4 py-3 text-center">
          <p className="inline-flex items-center justify-center gap-1.5 text-xs text-primary">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            Demo code — <span className="font-mono font-semibold">{showDemoHint}</span>
          </p>
        </div>
      )}

      <Link
        to="/login"
        className={cn(
          'inline-flex items-center justify-center gap-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground',
        )}
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Use a different email
      </Link>
    </div>
  )
}
