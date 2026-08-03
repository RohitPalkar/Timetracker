import * as React from 'react'
import { Link, useNavigate } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OtpInput } from '@/components/forms/otp-input'
import { useAuth } from '@/app/providers/auth-provider'
import { RESEND_COOLDOWN_SECONDS } from '@/constants'
import { cn } from '@/lib/utils'

export function VerifyPage() {
  const navigate = useNavigate()
  const { pendingEmail, verifyOtp, resendOtp } = useAuth()
  const [code, setCode] = React.useState('')
  const [cooldown, setCooldown] = React.useState(0)
  const [error, setError] = React.useState<string | null>(null)
  const [verifying, setVerifying] = React.useState(false)
  const [hint, setHint] = React.useState<string | null>(null)

  const email = pendingEmail

  React.useEffect(() => {
    if (!email) {
      navigate('/login', { replace: true })
    }
  }, [email, navigate])

  React.useEffect(() => {
    if (cooldown <= 0) return
    const timer = window.setTimeout(() => setCooldown((current) => current - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [cooldown])

  const handleVerify = async () => {
    if (code.length < 6) {
      setError('Enter the full 6-digit code.')
      return
    }
    setVerifying(true)
    setError(null)
    const result = await verifyOtp(email, code)
    if (result.ok) {
      navigate('/session', { replace: true })
    } else {
      setError(result.error ?? 'Verification failed.')
      setCode('')
    }
    setVerifying(false)
  }

  const handleResend = async () => {
    const result = await resendOtp(email)
    setCooldown(result.resendIn ?? RESEND_COOLDOWN_SECONDS)
    setHint(result.hint ?? null)
    setError(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Check your email</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter the 6-digit code sent to{' '}
          <span className="font-medium text-foreground">{email}</span>.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <OtpInput
          value={code}
          onValueChange={(value) => {
            setCode(value)
            setError(null)
          }}
          error={Boolean(error)}
          disabled={verifying}
        />
        {error && (
          <p className="text-xs font-medium text-danger" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Button size="lg" className="w-full" onClick={handleVerify} loading={verifying} disabled={code.length !== 6}>
          Verify and continue
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleResend}
          disabled={cooldown > 0}
          className="w-full text-muted-foreground"
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
        </Button>
      </div>

      {hint && (
        <div className="rounded-xl border border-dashed border-primary/40 bg-primary-soft/50 px-4 py-3 text-center">
          <p className="text-xs text-primary">
            Demo hint — your code is <span className="font-mono font-semibold">{hint}</span>
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