import * as React from 'react'
import { useNavigate } from 'react-router'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/forms/text-field'
import { useAuth } from '@/app/providers/auth-provider'

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const navigate = useNavigate()
  const { requestOtp } = useAuth()
  const [submitting, setSubmitting] = React.useState(false)

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (values: LoginValues) => {
    setSubmitting(true)
    try {
      await requestOtp(values.email)
      navigate('/verify')
    } catch {
      form.setError('email', { message: 'Could not send the code. Please try again.' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">Welcome back</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your work email and we'll send you a one-time code.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <TextField
          name="email"
          control={form.control}
          label="Work email"
          placeholder="you@acme.com"
          type="email"
          autoComplete="email"
          autoFocus
          leftSlot={<Mail className="size-4" aria-hidden="true" />}
        />

        <Button type="submit" size="lg" className="mt-1 w-full" loading={submitting}>
          Send code
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground">
        By continuing you agree to {`MyTracker`}'s terms of service.
      </p>
    </div>
  )
}