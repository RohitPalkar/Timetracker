import * as React from 'react'
import { useNavigate } from 'react-router'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/forms/text-field'
import { useAuth } from '@/store/auth'
import { APP_NAME, APP_TAGLINE, DEMO_SUPER_ADMIN_EMAIL } from '@/constants'
import { DEMO_PASSWORD } from '@/services/auth'

const loginSchema = z.object({
  email: z.string().min(1, 'Work email is required').email('Enter a valid work email address').transform((v) => v.trim().toLowerCase()),
  password: z.string().min(1, 'Password is required').min(6, 'Password must be at least 6 characters'),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [submitting, setSubmitting] = React.useState(false)
  const [serverError, setServerError] = React.useState<string | null>(null)
  const [showPassword, setShowPassword] = React.useState(false)

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: LoginValues) => {
    setSubmitting(true)
    setServerError(null)
    try {
      const result = await login(values.email, values.password)
      if (result.ok) {
        navigate('/dashboard', { replace: true })
      } else {
        const msg = result.error ?? 'Invalid email or password'
        // Show field error for auth failures
        if (msg.toLowerCase().includes('email') || msg.toLowerCase().includes('password') || msg.toLowerCase().includes('invalid')) {
          form.setError('password', { message: msg })
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
    form.setValue('password', DEMO_PASSWORD, { shouldValidate: true })
  }

  return (
    <div className="flex flex-col gap-6">
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
        <TextField
          name="password"
          control={form.control}
          label="Password"
          placeholder="••••••••"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          leftSlot={<Lock className="size-4" aria-hidden="true" />}
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="pointer-events-auto text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          }
        />

        {serverError && (
          <div className="rounded-xl border border-danger/20 bg-danger/5 px-3 py-2.5" role="alert">
            <p className="text-xs font-medium text-danger">{serverError}</p>
          </div>
        )}

        <Button type="submit" size="lg" className="mt-1 w-full" loading={submitting} disabled={submitting}>
          Log in
        </Button>
      </form>

      <div className="rounded-xl border border-dashed border-primary/30 bg-primary-soft/40 px-4 py-3">
        <p className="flex items-center justify-center gap-1.5 text-center text-xs text-primary">
          <ShieldCheck className="size-3.5 shrink-0" aria-hidden="true" />
          <span>
            Demo — <span className="font-mono font-semibold">{DEMO_SUPER_ADMIN_EMAIL}</span> · <span className="font-mono font-semibold">{DEMO_PASSWORD}</span>
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

      <p className="text-center text-xs text-muted-foreground">By continuing you agree to {APP_NAME}&apos;s terms of service.</p>
    </div>
  )
}
