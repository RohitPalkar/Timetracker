import * as React from 'react'
import { useNavigate } from 'react-router'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/forms/text-field'
import { useAuth } from '@/store/auth'
import { APP_NAME, APP_TAGLINE, DEMO_SUPER_ADMIN_EMAIL, OTP_DEMO_HINT } from '@/constants'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Work email is required')
    .email('Enter a valid work email address')
    .transform((v) => v.trim().toLowerCase()),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const { requestOtp } = useAuth()
  const [submitting, setSubmitting] = React.useState(false)
  const [serverError, setServerError] = React.useState<string | null>(null)

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (values: LoginValues) => {
    setSubmitting(true)
    setServerError(null)
    try {
      const result = await requestOtp(values.email)
      if (result.ok) {
        navigate('/verify')
      } else {
        // Keep email, show server error inline on field
        const msg = result.error ?? 'Could not send the code. Please try again.'
        if (msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('email')) {
          form.setError('email', { message: msg })
        } else {
          setServerError(msg)
        }
      }
    } catch {
      setServerError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const fillDemo = () => {
    form.setValue('email', DEMO_SUPER_ADMIN_EMAIL, { shouldValidate: true })
    form.setFocus('email')
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Branding — spec §5/7: MyTracker + positioning, no persona selector */}
      <div className="text-center">
        <h2 className="text-[22px] font-semibold tracking-tight text-foreground">{APP_NAME}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{APP_TAGLINE}</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <TextField
          name="email"
          control={form.control}
          label="Work email"
          placeholder="you@company.com"
          type="email"
          autoComplete="email"
          autoFocus
          leftSlot={<Mail className="size-4" aria-hidden="true" />}
        />

        {serverError && (
          <div className="rounded-xl border border-danger/20 bg-danger/5 px-3 py-2.5" role="alert">
            <p className="text-xs font-medium text-danger">{serverError}</p>
          </div>
        )}

        <Button type="submit" size="lg" className="mt-1 w-full" loading={submitting} disabled={submitting}>
          Continue
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          We&apos;ll send a 6-digit code to verify your email.
        </p>
      </form>

      {/* Demo hint — isolated to demo env, not cluttering primary flow */}
      <div className="rounded-xl border border-dashed border-primary/30 bg-primary-soft/40 px-4 py-3">
        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-primary">
          <ShieldCheck className="size-3.5 shrink-0" aria-hidden="true" />
          <span>
            Demo — use <span className="font-mono font-semibold">{DEMO_SUPER_ADMIN_EMAIL}</span> · OTP{' '}
            <span className="font-mono font-semibold">{OTP_DEMO_HINT}</span>
          </span>
        </p>
        <button
          type="button"
          onClick={fillDemo}
          className="mx-auto mt-2 block text-xs font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
        >
          Fill demo credentials
        </button>
      </div>

      <p className="text-center text-xs text-muted-foreground">
        By continuing you agree to {APP_NAME}&apos;s terms of service.
      </p>
    </div>
  )
}
