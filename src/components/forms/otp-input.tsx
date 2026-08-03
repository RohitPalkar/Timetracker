import * as React from 'react'
import { cn } from '@/lib/utils'

export interface OtpInputProps {
  length?: number
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  error?: boolean
  className?: string
  autoFocus?: boolean
}

/** 6-digit OTP input with paste support and auto-advance. */
export function OtpInput({
  length = 6,
  value,
  onValueChange,
  disabled,
  error,
  className,
  autoFocus = true,
}: OtpInputProps) {
  const inputsRef = React.useRef<Array<HTMLInputElement | null>>([])
  const digits = React.useMemo(
    () => Array.from({ length }, (_, index) => value[index] ?? ''),
    [value, length],
  )

  const focusIndex = (index: number) => {
    const target = Math.max(0, Math.min(length - 1, index))
    inputsRef.current[target]?.focus()
    inputsRef.current[target]?.select()
  }

  const commit = (next: string[]) => {
    onValueChange(next.join(''))
  }

  const handleChange = (index: number, char: string) => {
    const digit = char.replace(/\D/g, '').slice(-1)
    const next = [...digits]
    next[index] = digit
    commit(next)
    if (digit) focusIndex(index + 1)
  }

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      event.preventDefault()
      const next = [...digits]
      if (next[index]) {
        next[index] = ''
        commit(next)
      } else if (index > 0) {
        next[index - 1] = ''
        commit(next)
        focusIndex(index - 1)
      }
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusIndex(index - 1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusIndex(index + 1)
    } else if (event.key === 'Home') {
      event.preventDefault()
      focusIndex(0)
    } else if (event.key === 'End') {
      event.preventDefault()
      focusIndex(length - 1)
    }
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    const pasted = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    if (!pasted) return
    const next = Array.from({ length }, (_, index) => pasted[index] ?? '')
    commit(next)
    focusIndex(Math.min(pasted.length, length - 1))
  }

  return (
    <div className={cn('flex items-center justify-between gap-2', className)} role="group" aria-label="One-time code">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(node) => {
            inputsRef.current[index] = node
          }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${index + 1}`}
          value={digit}
          disabled={disabled}
          autoFocus={autoFocus && index === 0}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          className={cn(
            'h-14 w-full max-w-14 rounded-xl border border-input bg-surface text-center text-xl font-semibold text-foreground shadow-xs transition-colors hover:border-border-strong focus-visible:border-primary/60 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-ring disabled:opacity-50',
            error && 'border-danger focus-visible:outline-danger',
          )}
        />
      ))}
    </div>
  )
}